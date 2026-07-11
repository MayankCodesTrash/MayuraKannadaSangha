import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  subscribeToCategories,
  createCategory,
  renameCategory,
  addImagesToCategory,
  removeImageFromCategory,
  deleteCategory,
} from '../../data/galleryRepo.js';
import GalleryAdminTab from './GalleryAdminTab.jsx';

vi.mock('../../data/galleryRepo.js', () => ({
  subscribeToCategories: vi.fn(() => () => {}),
  createCategory: vi.fn(() => Promise.resolve('new-cat-id')),
  renameCategory: vi.fn(() => Promise.resolve()),
  addImagesToCategory: vi.fn(() => Promise.resolve()),
  removeImageFromCategory: vi.fn(() => Promise.resolve()),
  deleteCategory: vi.fn(() => Promise.resolve()),
}));

const SAMPLE_CATEGORY = {
  id: 'cat-1',
  title: 'Community Service',
  images: [
    { url: 'https://example.com/a.jpg', storagePath: 'gallery/cat-1/a.jpg' },
    { url: 'https://example.com/b.jpg', storagePath: 'gallery/cat-1/b.jpg' },
  ],
};

beforeEach(() => {
  vi.mocked(subscribeToCategories).mockClear().mockImplementation((onChange) => {
    onChange([SAMPLE_CATEGORY]);
    return () => {};
  });
  vi.mocked(createCategory).mockClear().mockResolvedValue('new-cat-id');
  vi.mocked(renameCategory).mockClear().mockResolvedValue();
  vi.mocked(addImagesToCategory).mockClear().mockResolvedValue();
  vi.mocked(removeImageFromCategory).mockClear().mockResolvedValue();
  vi.mocked(deleteCategory).mockClear().mockResolvedValue();
  window.confirm = vi.fn(() => true);
});

describe('GalleryAdminTab', () => {
  it('lists categories with their image counts', () => {
    render(<GalleryAdminTab />);
    expect(screen.getByText('Community Service')).toBeInTheDocument();
    expect(screen.getByText('2 images')).toBeInTheDocument();
  });

  it('creates a category with a title and uploaded files', async () => {
    render(<GalleryAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Category' }));

    fireEvent.change(screen.getByLabelText('Category Title'), { target: { value: 'Picnics' } });
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Images'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(createCategory).toHaveBeenCalledWith('Picnics', [file]));
  });

  it('renames a category from the edit view', async () => {
    render(<GalleryAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    fireEvent.change(screen.getByLabelText('Rename'), { target: { value: 'Community Outreach' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Name' }));

    await waitFor(() => expect(renameCategory).toHaveBeenCalledWith('cat-1', 'Community Outreach'));
  });

  it('removes an image from the edit view after confirmation', async () => {
    render(<GalleryAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const [firstRemove] = screen.getAllByRole('button', { name: 'Remove' });
    fireEvent.click(firstRemove);

    await waitFor(() =>
      expect(removeImageFromCategory).toHaveBeenCalledWith('cat-1', SAMPLE_CATEGORY.images[0])
    );
  });

  it('deletes a category after confirmation', async () => {
    render(<GalleryAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteCategory).toHaveBeenCalledWith('cat-1'));
  });

  it('shows an error message when creating a category with an unconfigured upload fails', async () => {
    vi.mocked(createCategory).mockRejectedValue(
      new Error('Image uploads are not connected yet.')
    );
    render(<GalleryAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Category' }));

    fireEvent.change(screen.getByLabelText('Category Title'), { target: { value: 'Picnics' } });
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Images'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(screen.getByText('Image uploads are not connected yet.')).toBeInTheDocument()
    );
  });
});
