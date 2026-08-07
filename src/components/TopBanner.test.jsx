import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TopBanner from './TopBanner.jsx';

describe('TopBanner', () => {
  it('renders the full non-profit status text', () => {
    render(<TopBanner />);
    expect(
      screen.getByText('A Registered, Non-Profit, Tax-Exempt 501(c)(3) Organization')
    ).toBeInTheDocument();
  });

  it('links Become a Member and Become a Sponsor to their Zeffy pages', () => {
    render(<TopBanner />);

    const memberLink = screen.getByRole('link', { name: 'Become a Member' });
    expect(memberLink).toHaveAttribute(
      'href',
      'https://www.zeffy.com/en-US/ticketing/mayura-kannada-sangha-annual-membership-registration--2026'
    );
    expect(memberLink).toHaveAttribute('target', '_blank');
    expect(memberLink).toHaveAttribute('rel', 'noopener noreferrer');

    const sponsorLink = screen.getByRole('link', { name: 'Become a Sponsor' });
    expect(sponsorLink).toHaveAttribute(
      'href',
      'https://www.zeffy.com/en-US/donation-form/mayura-kannada-sangha-sponsorships--2026'
    );
    expect(sponsorLink).toHaveAttribute('target', '_blank');
    expect(sponsorLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
