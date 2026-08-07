import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SponsorshipSection from './SponsorshipSection.jsx';

describe('SponsorshipSection', () => {
  it('renders the heading, description, and a More Info link to the sponsorship PDF', () => {
    render(<SponsorshipSection />);
    expect(screen.getByRole('heading', { name: 'Sponsorship Opportunities' })).toBeInTheDocument();
    expect(screen.getByText(/learn more about the 2026 Dasara sponsorship/)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'More Info' });
    expect(link).toHaveAttribute('href', '/MKS%20Dasara%202026%20Sponsorship_0727_v1.0.pdf');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders a layered transition-in wave', () => {
    const { container } = render(<SponsorshipSection />);
    // 3 layers for the incoming orange wave
    expect(container.querySelectorAll('.wave-divider svg')).toHaveLength(3);
  });
});
