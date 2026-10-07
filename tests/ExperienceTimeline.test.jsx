import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExperienceTimeline from '../src/components/ExperienceTimeline';
import experienceData from '../src/data/experience.json';

describe('ExperienceTimeline Component', () => {
  it('renders section title', () => {
    render(<ExperienceTimeline />);
    expect(screen.getByText('Evolution')).toBeInTheDocument();
  });

  it('renders all career items from experience data', () => {
    render(<ExperienceTimeline />);
    experienceData.forEach(item => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.company)).toBeInTheDocument();
      expect(screen.getByText(item.year)).toBeInTheDocument();
    });
  });
});
