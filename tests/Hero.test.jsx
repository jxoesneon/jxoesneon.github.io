import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Hero from '../src/components/Hero';

describe('Hero Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initial intro and greeting', () => {
    render(<Hero />);
    expect(screen.getByText("Hi, I'm")).toBeInTheDocument();
    expect(screen.getByText("Decentralized Systems & AI")).toBeInTheDocument();
  });

  it('renders call to action buttons with correct links', () => {
    render(<Hero />);
    const githubBtn = screen.getByRole('link', { name: /github profile/i });
    expect(githubBtn).toHaveAttribute('href', 'https://github.com/jxoesneon');

    const contactBtn = screen.getByRole('link', { name: /get in touch/i });
    expect(contactBtn).toHaveAttribute('href', 'mailto:rj.joseeduardo@gmail.com');

    const sponsorBtn = screen.getByRole('link', { name: /sponsor/i });
    expect(sponsorBtn).toHaveAttribute('href', 'https://github.com/sponsors/jxoesneon');
  });

  it('cycles name and taglines on intervals', async () => {
    render(<Hero />);
    expect(screen.getByText('jxoesneon')).toBeInTheDocument();

    // Advance timer asynchronously for name toggle (4000ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(screen.getByText('Jose Eduardo Rojas Jimenez')).toBeInTheDocument();

    // Advance timer asynchronously for tagline rotation (5000ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(
      screen.getByText(/Pioneering decentralized infrastructure with IPFS/i)
    ).toBeInTheDocument();
  });
});
