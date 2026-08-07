import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  subscribeToSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  uploadSponsorPhoto,
} from '../../data/sponsorsRepo.js';
import { subscribeToSettings, updateSettings } from '../../data/settingsRepo.js';
import SponsorsAdminTab from './SponsorsAdminTab.jsx';

vi.mock('../../data/sponsorsRepo.js', () => ({
  subscribeToSponsors: vi.fn(() => () => {}),
  createSponsor: vi.fn(() => Promise.resolve('new-sponsor-id')),
  updateSponsor: vi.fn(() => Promise.resolve()),
  deleteSponsor: vi.fn(() => Promise.resolve()),
  uploadSponsorPhoto: vi.fn(() =>
    Promise.resolve({ image: 'https://example.com/logo.jpg', storagePath: 'sponsors/logo.jpg' })
  ),
}));

vi.mock('../../data/settingsRepo.js', () => ({
  subscribeToSettings: vi.fn((onChange) => {
    onChange({ sponsorsSectionVisible: true });
    return () => {};
  }),
  updateSettings: vi.fn(() => Promise.resolve()),
}));

const SAMPLE_SPONSOR = {
  id: 'sponsor-1',
  name: 'Acme Corp',
  tier: 'gold',
  order: 0,
  image: 'https://example.com/acme.jpg',
  storagePath: 'sponsors/acme.jpg',
};

const SAMPLE_SPONSOR_2 = {
  id: 'sponsor-2',
  name: 'Beta Inc',
  tier: 'gold',
  order: 1,
  image: 'https://example.com/beta.jpg',
  storagePath: 'sponsors/beta.jpg',
};

beforeEach(() => {
  vi.mocked(subscribeToSponsors).mockClear().mockImplementation((onChange) => {
    onChange([SAMPLE_SPONSOR]);
    return () => {};
  });
  vi.mocked(createSponsor).mockClear().mockResolvedValue('new-sponsor-id');
  vi.mocked(updateSponsor).mockClear().mockResolvedValue();
  vi.mocked(deleteSponsor).mockClear().mockResolvedValue();
  vi.mocked(uploadSponsorPhoto).mockClear();
  vi.mocked(subscribeToSettings)
    .mockClear()
    .mockImplementation((onChange) => {
      onChange({ sponsorsSectionVisible: true });
      return () => {};
    });
  vi.mocked(updateSettings).mockClear().mockResolvedValue();
  window.confirm = vi.fn(() => true);
});

describe('SponsorsAdminTab', () => {
  it('lists sponsors from Firestore with their tier', () => {
    render(<SponsorsAdminTab />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('gold')).toBeInTheDocument();
  });

  it('creates a new sponsor with a name, tier, and photo', async () => {
    render(<SponsorsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Sponsor' }));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Sponsor' } });
    fireEvent.change(screen.getByLabelText('Tier'), { target: { value: 'platinum' } });

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Photo'), { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(createSponsor).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Sponsor',
          tier: 'platinum',
          image: 'https://example.com/logo.jpg',
          storagePath: 'sponsors/logo.jpg',
        })
      )
    );
    await waitFor(() => expect(uploadSponsorPhoto).toHaveBeenCalledWith(file));
  });

  it('pre-fills the form when editing an existing sponsor', () => {
    render(<SponsorsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Name')).toHaveValue('Acme Corp');
    expect(screen.getByLabelText('Tier')).toHaveValue('gold');
  });

  it('deletes a sponsor after confirmation', async () => {
    render(<SponsorsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteSponsor).toHaveBeenCalledWith('sponsor-1'));
  });

  it('toggles the sponsors section visibility setting', async () => {
    render(<SponsorsAdminTab />);
    const checkbox = screen.getByRole('checkbox', {
      name: 'Show "Our Sponsors" section on the Sponsors page',
    });
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    await waitFor(() =>
      expect(updateSettings).toHaveBeenCalledWith({ sponsorsSectionVisible: false })
    );
  });

  it('swaps order when moving a sponsor down within its tier', async () => {
    vi.mocked(subscribeToSponsors).mockImplementation((onChange) => {
      onChange([SAMPLE_SPONSOR, SAMPLE_SPONSOR_2]);
      return () => {};
    });

    render(<SponsorsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Move Acme Corp down' }));

    await waitFor(() => {
      expect(updateSponsor).toHaveBeenCalledWith('sponsor-1', { order: 1 });
      expect(updateSponsor).toHaveBeenCalledWith('sponsor-2', { order: 0 });
    });
  });
});
