import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERNAME = 'jxoesneon';
const OUTPUT_PATH = path.join(__dirname, '../src/data/repos.json');

// Ignored repos that shouldn't appear in portfolio cards
const IGNORED_REPOS = new Set(['jxoesneon', '.github', 'jxoesneon.github.io']);

async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (res.status === 403 || res.status === 429) {
        console.warn(`Rate limited on ${url}, skipping...`);
        return null;
      }
      if (res.status === 404) {
        return null; // Not found (e.g. no release)
      }
      if (i === retries - 1) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    } catch (e) {
      if (i === retries - 1) throw e;
    }
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  return null;
}

async function fetchRepos() {
  console.log('Fetching latest repositories from GitHub...');
  try {
    const headers = {
      'User-Agent': 'Portfolio-Auto-Fetcher',
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // Support GITHUB_TOKEN, VITE_GITHUB_TOKEN, or GH_PAT
    const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || process.env.GH_PAT;
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const res = await fetchWithRetry(
      `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`,
      { headers }
    );
    
    if (!res) {
      console.log('Using existing repos.json due to rate limits or API issues.');
      return;
    }
    
    const rawRepos = await res.json();
    if (!Array.isArray(rawRepos)) {
      console.warn('Unexpected GitHub API response:', rawRepos);
      return;
    }

    // Filter out profile readme, internal config, website itself, and uncurated forks
    const filtered = rawRepos.filter(repo => {
      if (IGNORED_REPOS.has(repo.name)) return false;
      const isMcp = repo.topics?.some(t => t.toLowerCase().includes('mcp'));
      // Keep own repositories, plus any forks that are specifically MCP or portfolio related
      if (repo.fork && !isMcp) return false;
      return true;
    });

    console.log(`Discovered ${filtered.length} candidate projects. Fetching release metadata...`);

    // Cache existing release info to prevent losing it on API rate limits
    const existingReleases = new Map();
    try {
      const existingData = JSON.parse(await fs.readFile(OUTPUT_PATH, 'utf8'));
      if (Array.isArray(existingData)) {
        existingData.forEach(r => {
          if (r.name && r.latestRelease) existingReleases.set(r.name, r.latestRelease);
        });
      }
    } catch {
      // Ignored if file does not exist yet
    }

    // Fetch releases in controlled batches of 5 to avoid bursts
    const batchSize = 5;
    const formattedRepos = [];

    for (let i = 0; i < filtered.length; i += batchSize) {
      const batch = filtered.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(async (repo) => {
        let latestRelease = null;
        try {
          const releaseRes = await fetchWithRetry(
            `https://api.github.com/repos/${USERNAME}/${repo.name}/releases/latest`,
            { headers },
            1
          );
          if (releaseRes) {
            const release = await releaseRes.json();
            if (release && release.tag_name) {
              latestRelease = {
                name: release.name || release.tag_name,
                tagName: release.tag_name,
                url: release.html_url,
                publishedAt: release.published_at
              };
            }
          }
        } catch {
          // Release fetch is best-effort
        }

        // If rate limited or unavailable, keep existing cached release if available
        if (!latestRelease && existingReleases.has(repo.name)) {
          latestRelease = existingReleases.get(repo.name);
        }

        return {
          name: repo.name,
          description: repo.description,
          stargazerCount: repo.stargazers_count,
          updatedAt: repo.updated_at,
          homepage: repo.homepage || null,
          language: repo.language || null,
          url: repo.html_url,
          repositoryTopics: (repo.topics && repo.topics.length > 0) ? repo.topics.map(t => ({ name: t })) : null,
          latestRelease
        };
      }));
      formattedRepos.push(...results);
    }

    // Sort by updatedAt descending
    formattedRepos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    await fs.writeFile(OUTPUT_PATH, JSON.stringify(formattedRepos, null, 2));
    console.log(`Successfully updated ${formattedRepos.length} repos to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Failed to fetch repos:', error.message);
    console.log('Continuing with existing data...');
  }
}

fetchRepos();
