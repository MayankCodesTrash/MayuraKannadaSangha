import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext.jsx';
import { subscribeToSponsors } from '../data/sponsorsRepo.js';
import Sponsors from './Sponsors.jsx';

vi.mock('../data/sponsorsRepo.js', () => ({
  subscribeToSponsors: vi.fn(() => () => {}),
}));

function renderSponsors() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Sponsors />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(subscribeToSponsors).mockClear().mockImplementation((onChange) => {
    onChange([]);
    return () => {};
  });
});

describe('Sponsors page', () => {
  it('renders the sponsorship opportunities section and the Our Sponsors tier heading', () => {
    renderSponsors();
    expect(screen.getByRole('heading', { name: 'Sponsorship Opportunities' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Our Sponsors' })).toBeInTheDocument();
  });

  it('renders empty placeholder slots for each of the platinum, gold, silver, and bronze tiers', () => {
    const { container } = renderSponsors();
    expect(screen.getByRole('heading', { name: 'Platinum Sponsors' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gold Sponsors' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Silver Sponsors' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bronze Sponsors' })).toBeInTheDocument();

    ['platinum', 'gold', 'silver', 'bronze'].forEach((tier) => {
      const tierSection = container.querySelector(`.sponsors-tiers__tier--${tier}`);
      expect(tierSection).not.toBeNull();
      expect(tierSection.querySelectorAll('.sponsors-tiers__placeholder')).toHaveLength(3);
    });
  });

  it('renders a real sponsor photo instead of placeholders once one exists for a tier', () => {
    vi.mocked(subscribeToSponsors).mockImplementation((onChange) => {
      onChange([{ id: 's1', name: 'Acme Corp', tier: 'gold', image: 'https://example.com/acme.jpg' }]);
      return () => {};
    });

    const { container } = renderSponsors();
    const goldTier = container.querySelector('.sponsors-tiers__tier--gold');
    expect(goldTier.querySelectorAll('.sponsors-tiers__placeholder')).toHaveLength(2);

    const photo = screen.getByAltText('Acme Corp');
    expect(photo).toHaveAttribute('src', 'https://example.com/acme.jpg');
    expect(photo).toHaveClass('sponsors-tiers__photo');
  });
});
