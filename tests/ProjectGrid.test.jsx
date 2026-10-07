import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectGrid, { ProjectCard } from '../src/components/ProjectGrid';
import repos from '../src/data/repos.json';

describe('ProjectGrid Component', () => {
  it('renders section headers for Featured Projects and MCP Ecosystem', () => {
    render(<ProjectGrid onProjectHover={() => {}} />);
    expect(screen.getByText('Featured Projects')).toBeInTheDocument();
    expect(screen.getByText('MCP Ecosystem')).toBeInTheDocument();
  });

  it('renders cards for each repository with descriptions and links', () => {
    render(<ProjectGrid onProjectHover={() => {}} />);
    const firstRepo = repos[0];
    expect(screen.getAllByText(firstRepo.name).length).toBeGreaterThan(0);
  });

  it('calls onProjectHover callback on mouse enter and leave', () => {
    const handleHover = vi.fn();
    render(<ProjectGrid onProjectHover={handleHover} />);

    const firstRepo = repos[0];
    const cardTitle = screen.getAllByText(firstRepo.name)[0];
    const card = cardTitle.closest('.glass-card');

    fireEvent.mouseEnter(card);
    expect(handleHover).toHaveBeenCalledWith(expect.objectContaining({ name: firstRepo.name }));

    fireEvent.mouseLeave(card);
    expect(handleHover).toHaveBeenCalledWith(null);
  });

  it('renders external homepage link when repository defines a homepage', () => {
    render(<ProjectGrid onProjectHover={() => {}} />);
    const reposWithHomepage = repos.filter(r => r.homepage);
    if (reposWithHomepage.length > 0) {
      const demoLinks = screen.getAllByTitle('Live Site / Demo');
      expect(demoLinks.length).toBeGreaterThan(0);
      expect(demoLinks[0]).toHaveAttribute('href', reposWithHomepage[0].homepage);
    }
  });

  it('renders repository topic pills and release tags when present', () => {
    render(<ProjectGrid onProjectHover={() => {}} />);
    const reposWithTopics = repos.filter(r => r.repositoryTopics && r.repositoryTopics.length > 0);
    if (reposWithTopics.length > 0) {
      const firstTopicName = reposWithTopics[0].repositoryTopics[0].name;
      expect(screen.getAllByText(firstTopicName).length).toBeGreaterThan(0);
    }

    const reposWithRelease = repos.filter(r => r.latestRelease);
    if (reposWithRelease.length > 0) {
      expect(screen.getAllByText(reposWithRelease[0].latestRelease.tagName).length).toBeGreaterThan(0);
    }
  });

  describe('ProjectCard Component (Isolated Branch Coverage)', () => {
    it('handles fallback URL, missing description, no topics, and no release', () => {
      const handleHover = vi.fn();
      const minimalRepo = {
        name: 'minimal-project',
        url: null,
        description: null,
        homepage: null,
        repositoryTopics: null,
        latestRelease: null,
        stargazerCount: 0,
        updatedAt: '2026-01-01T00:00:00Z'
      };

      render(<ProjectCard repo={minimalRepo} index={0} onHover={handleHover} />);

      // Fallback GitHub link
      const githubLink = screen.getByTitle('GitHub Repository');
      expect(githubLink).toHaveAttribute('href', 'https://github.com/jxoesneon/minimal-project');

      // Fallback description
      expect(screen.getByText('No description available.')).toBeInTheDocument();

      // No live site link
      expect(screen.queryByTitle('Live Site / Demo')).not.toBeInTheDocument();

      // Hover interactions
      const card = githubLink.closest('.glass-card');
      fireEvent.mouseEnter(card);
      expect(handleHover).toHaveBeenCalledWith(minimalRepo);

      fireEvent.mouseLeave(card);
      expect(handleHover).toHaveBeenCalledWith(null);
    });

    it('handles empty topics array and explicitly empty repository URL', () => {
      const emptyTopicsRepo = {
        name: 'custom-url-project',
        url: 'https://custom-url.com',
        description: 'Custom description',
        homepage: 'https://demo.custom.com',
        repositoryTopics: [],
        latestRelease: { tagName: 'v1.0.0' },
        stargazerCount: 42,
        updatedAt: '2026-02-01T00:00:00Z'
      };

      render(<ProjectCard repo={emptyTopicsRepo} index={1} onHover={() => {}} />);

      const githubLink = screen.getByTitle('GitHub Repository');
      expect(githubLink).toHaveAttribute('href', 'https://custom-url.com');

      const demoLink = screen.getByTitle('Live Site / Demo');
      expect(demoLink).toHaveAttribute('href', 'https://demo.custom.com');

      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });
});
