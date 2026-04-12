import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERNAME = 'jxoesneon';
const OUTPUT_PATH = path.join(__dirname, '../src/data/repos.json');

async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (res.status === 403 || res.status === 429) {
        console.warn(`Rate limited on ${url}, skipping...`);
        return null; // Rate limited
      }
      if (res.status === 404) {
        return null; // Not found (e.g., no releases)
      }
      if (i === retries - 1) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    } catch (e) {
      if (i === retries - 1) throw e;
    }
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
}

async function fetchRepos() {
  console.log('Fetching latest repositories from GitHub...');
  try {
    const headers = {
      'User-Agent': 'Portfolio-Auto-Fetcher',
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // Support either GITHUB_TOKEN or VITE_GITHUB_TOKEN
    const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const res = await fetchWithRetry(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=12`, { headers });
    
    if (!res) {
      console.log('Using existing repos.json due to rate limits or API issues.');
      return;
    }
    
    const repos = await res.json();
    
    const formattedRepos = await Promise.all(repos.map(async (repo) => {
      let latestRelease = null;
      
      const releaseRes = await fetchWithRetry(`https://api.github.com/repos/${USERNAME}/${repo.name}/releases/latest`, { headers }, 1);
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

      return {
        name: repo.name,
        description: repo.description,
        stargazerCount: repo.stargazers_count,
        updatedAt: repo.updated_at,
        repositoryTopics: (repo.topics && repo.topics.length > 0) ? repo.topics.map(t => ({ name: t })) : null,
        latestRelease
      };
    }));

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
