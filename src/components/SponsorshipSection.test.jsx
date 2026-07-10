import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SponsorshipSection from './SponsorshipSection.jsx';

describe('SponsorshipSection', () => {
  it('renders the heading, description, and a More Info link to the sponsorship PDF', () => {
    render(<SponsorshipSection />);
    expect(screen.getByRole('heading', { name: 'Sponsorship Opportunities' })).toBeInTheDocument();
    expect(screen.getByText(/learn more about the 2025 Dasara sponsorship/)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'More Info' });
    expect(link).toHaveAttribute(
      'href',
      'https://storage.googleapis.com/production-websitebuilder-v1-0-7/287/1991287/3q88gokE/b749f84296c4495688265864b222c5dc?fileName=043D207E-9024-4FE5-941E-36BE22A10E8C.pdf'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders two wave dividers (transition in and out)', () => {
    const { container } = render(<SponsorshipSection />);
    expect(container.querySelectorAll('.wave-divider svg')).toHaveLength(2);
  });
});
