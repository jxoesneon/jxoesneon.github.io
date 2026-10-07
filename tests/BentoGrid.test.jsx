import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BentoGrid from '../src/components/BentoGrid';

describe('BentoGrid Component', () => {
  it('renders section title and collaboration card', () => {
    render(<BentoGrid />);
    expect(screen.getByText('Connect & Stack')).toBeInTheDocument();
    expect(screen.getByText("Let's Collaborate")).toBeInTheDocument();
  });

  it('renders social and contact links', () => {
    render(<BentoGrid />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map(l => l.getAttribute('href'));

    expect(hrefs).toContain('https://github.com/jxoesneon');
    expect(hrefs).toContain('https://www.linkedin.com/in/jose-eduardo-rojas-jiménez-0a8284b1/');
    expect(hrefs).toContain('mailto:rj.joseeduardo@gmail.com');
  });

  it('renders tech stack icons and indicators', () => {
    render(<BentoGrid />);
    expect(screen.getByText('Tech Stack')).toBeInTheDocument();
    expect(screen.getByTitle('React')).toBeInTheDocument();
    expect(screen.getByTitle('Vite')).toBeInTheDocument();
    expect(screen.getByTitle('Flutter')).toBeInTheDocument();
    expect(screen.getByTitle('Python')).toBeInTheDocument();
    expect(screen.getByTitle('Docker')).toBeInTheDocument();
    expect(screen.getByTitle('TensorFlow')).toBeInTheDocument();
  });

  it('renders location and status badges', () => {
    render(<BentoGrid />);
    expect(screen.getByText('Costa Rica')).toBeInTheDocument();
    expect(screen.getByText('UTC-6 (CST)')).toBeInTheDocument();
    expect(screen.getByText('Open to Work')).toBeInTheDocument();
    expect(screen.getByText('Full Stack / AI Engineer')).toBeInTheDocument();
  });

  it('renders support and sponsorship card with links', () => {
    render(<BentoGrid />);
    expect(screen.getByText('Support Open Source')).toBeInTheDocument();
    const sponsorsLink = screen.getByRole('link', { name: /github sponsors/i });
    expect(sponsorsLink).toHaveAttribute('href', 'https://github.com/sponsors/jxoesneon');

    const kofiLink = screen.getByRole('link', { name: /support on ko-fi/i });
    expect(kofiLink).toHaveAttribute('href', 'https://ko-fi.com/jxoesneon');
  });
});
