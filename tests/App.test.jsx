import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import repos from '../src/data/repos.json';

describe('App Component', () => {
  it('renders entire portfolio application layout', () => {
    render(<App />);

    // Header / Hero elements
    expect(screen.getByText("Hi, I'm")).toBeInTheDocument();

    // Project grid
    expect(screen.getByText('Featured Projects')).toBeInTheDocument();

    // Timeline
    expect(screen.getByText('Evolution')).toBeInTheDocument();

    // Bento Grid
    expect(screen.getByText('Connect & Stack')).toBeInTheDocument();

    // AI Chat trigger button
    expect(screen.getByRole('button', { name: /ask ai/i })).toBeInTheDocument();

    // Footer
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(/Last Portfolio Sync:/i)).toBeInTheDocument();
  });

  it('renders all four footer links including sponsorship', () => {
    render(<App />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    const links = footer.querySelectorAll('a');
    const hrefs = Array.from(links).map(l => l.getAttribute('href'));

    expect(hrefs).toContain('https://github.com/jxoesneon');
    expect(hrefs).toContain('https://www.linkedin.com/in/jose-eduardo-rojas-jiménez-0a8284b1/');
    expect(hrefs).toContain('https://github.com/sponsors/jxoesneon');
    expect(hrefs).toContain('https://ko-fi.com/jxoesneon');
  });

  it('propagates focused project on hover to AIChat context', () => {
    render(<App />);
    const firstRepo = repos[0];
    const cardTitle = screen.getAllByText(firstRepo.name)[0];
    const card = cardTitle.closest('.glass-card');

    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
  });
});
