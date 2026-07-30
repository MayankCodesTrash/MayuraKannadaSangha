import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { seedLegacyData } from '../utils/seedLegacyData.js';
import AdminDashboard from './AdminDashboard.jsx';

const mockLogout = vi.fn();

vi.mock('../auth/AuthContext.jsx', () => ({ useAuth: () => ({ logout: mockLogout }) }));
vi.mock('../utils/seedLegacyData.js', () => ({ seedLegacyData: vi.fn(() => Promise.resolve()) }));
vi.mock('../components/admin/EventsAdminTab.jsx', () => ({
  default: () => <div>Events Tab Content</div>,
}));
vi.mock('../components/admin/SponsorsAdminTab.jsx', () => ({
  default: () => <div>Sponsors Tab Content</div>,
}));
vi.mock('../components/admin/GalleryAdminTab.jsx', () => ({
  default: () => <div>Gallery Tab Content</div>,
}));
vi.mock('../components/admin/TeamAdminTab.jsx', () => ({
  default: () => <div>Team Tab Content</div>,
}));

beforeEach(() => {
  mockLogout.mockClear();
  vi.mocked(seedLegacyData).mockClear().mockResolvedValue({ skipped: [] });
  window.confirm = vi.fn(() => true);
});

describe('AdminDashboard', () => {
  it('shows the Events tab by default', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Events Tab Content')).toBeInTheDocument();
  });

  it('switches to the Sponsors tab', () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Sponsors' }));
    expect(screen.getByText('Sponsors Tab Content')).toBeInTheDocument();
    expect(screen.queryByText('Events Tab Content')).not.toBeInTheDocument();
  });

  it('switches to the Gallery tab', () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Gallery' }));
    expect(screen.getByText('Gallery Tab Content')).toBeInTheDocument();
    expect(screen.queryByText('Events Tab Content')).not.toBeInTheDocument();
  });

  it('switches to the Team tab', () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Team' }));
    expect(screen.getByText('Team Tab Content')).toBeInTheDocument();
    expect(screen.queryByText('Events Tab Content')).not.toBeInTheDocument();
  });

  it('logs out when Log Out is clicked', () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('imports legacy data after confirmation', async () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Import Legacy Data (one-time)' }));

    await waitFor(() => expect(seedLegacyData).toHaveBeenCalled());
    expect(screen.getByText('Legacy data imported successfully.')).toBeInTheDocument();
  });

  it('reports which collections were skipped because they already had data', async () => {
    vi.mocked(seedLegacyData).mockResolvedValue({ skipped: ['events (already has data)'] });
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Import Legacy Data (one-time)' }));

    await waitFor(() =>
      expect(
        screen.getByText('Imported what was missing. Skipped (already had data): events (already has data).')
      ).toBeInTheDocument()
    );
  });
});
