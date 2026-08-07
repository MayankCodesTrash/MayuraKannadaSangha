import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContributionSection from './ContributionSection.jsx';

describe('ContributionSection', () => {
  it('renders the prompt for non-business monetary contributions', () => {
    render(<ContributionSection />);
    expect(
      screen.getByText(/If you don't own a business, and would like to make a monetary contribution/)
    ).toBeInTheDocument();
  });

  it('opens the Zelle payment popup when the link is clicked, and closes it', async () => {
    render(<ContributionSection />);
    expect(screen.queryByText(/We bank with Veridian/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'please click here!' }));

    expect(screen.getByText(/We bank with Veridian/)).toBeInTheDocument();
    expect(screen.queryByText(/D\.A\.T\.A\./i)).not.toBeInTheDocument();
    const emailLinks = screen.getAllByText('mksdsm2024@gmail.com');
    expect(emailLinks.length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByText(/We bank with Veridian/)).not.toBeInTheDocument()
    );
  });
});
