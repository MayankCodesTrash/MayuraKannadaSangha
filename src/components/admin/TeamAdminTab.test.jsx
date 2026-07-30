import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  subscribeToTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadTeamPhoto,
} from '../../data/teamRepo.js';
import TeamAdminTab from './TeamAdminTab.jsx';

vi.mock('./ImageCropModal.jsx', () => ({
  default: ({ onCropComplete }) => (
    <button type="button" onClick={() => onCropComplete(new Blob(['x'], { type: 'image/jpeg' }))}>
      Save Crop
    </button>
  ),
}));

vi.mock('../../data/teamRepo.js', () => ({
  subscribeToTeam: vi.fn(() => () => {}),
  createTeamMember: vi.fn(() => Promise.resolve('new-member-id')),
  updateTeamMember: vi.fn(() => Promise.resolve()),
  deleteTeamMember: vi.fn(() => Promise.resolve()),
  uploadTeamPhoto: vi.fn(() =>
    Promise.resolve({ image: 'https://example.com/photo.jpg', storagePath: 'team/photo.jpg' })
  ),
}));

const SAMPLE_MEMBER = {
  id: 'member-1',
  name: 'Arun Kumar',
  role: 'President',
  order: 0,
  image: 'https://example.com/arun.jpg',
  storagePath: 'team/arun.jpg',
};

beforeEach(() => {
  vi.mocked(subscribeToTeam).mockClear().mockImplementation((onChange) => {
    onChange([SAMPLE_MEMBER]);
    return () => {};
  });
  vi.mocked(createTeamMember).mockClear().mockResolvedValue('new-member-id');
  vi.mocked(updateTeamMember).mockClear().mockResolvedValue();
  vi.mocked(deleteTeamMember).mockClear().mockResolvedValue();
  vi.mocked(uploadTeamPhoto).mockClear();
  window.confirm = vi.fn(() => true);
});

describe('TeamAdminTab', () => {
  it('lists team members from Firestore with their role', () => {
    render(<TeamAdminTab />);
    expect(screen.getByText('Arun Kumar')).toBeInTheDocument();
    expect(screen.getByText('President')).toBeInTheDocument();
  });

  it('creates a new team member with a name, role, and photo', async () => {
    render(<TeamAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Team Member' }));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Member' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'Secretary' } });

    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Photo'), { target: { files: [file] } });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Crop' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Save Crop' }));

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Save Crop' })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(createTeamMember).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Member',
          role: 'Secretary',
          image: 'https://example.com/photo.jpg',
          storagePath: 'team/photo.jpg',
        })
      )
    );
  });

  it('pre-fills the form when editing an existing member', () => {
    render(<TeamAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Name')).toHaveValue('Arun Kumar');
    expect(screen.getByLabelText('Role')).toHaveValue('President');
  });

  it('deletes a team member after confirmation', async () => {
    render(<TeamAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteTeamMember).toHaveBeenCalledWith('member-1'));
  });
});
