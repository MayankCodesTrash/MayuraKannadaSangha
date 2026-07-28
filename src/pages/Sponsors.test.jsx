import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Sponsors from './Sponsors.jsx';

function renderSponsors() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Sponsors />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Sponsors page', () => {
  it('renders the sponsorship opportunities section and the Our Sponsors tier heading', () => {
    renderSponsors();
    expect(screen.getByRole('heading', { name: 'Sponsorship Opportunities' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Our Sponsors' })).toBeInTheDocument();
  });

  it('renders empty placeholder slots for each of the gold, silver, and bronze tiers', () => {
    const { container } = renderSponsors();
    expect(screen.getByRole('heading', { name: 'Gold Sponsors' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Silver Sponsors' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bronze Sponsors' })).toBeInTheDocument();

    ['gold', 'silver', 'bronze'].forEach((tier) => {
      const tierSection = container.querySelector(`.sponsors-tiers__tier--${tier}`);
      expect(tierSection).not.toBeNull();
      expect(tierSection.querySelectorAll('.sponsors-tiers__placeholder')).toHaveLength(3);
    });
  });
});
