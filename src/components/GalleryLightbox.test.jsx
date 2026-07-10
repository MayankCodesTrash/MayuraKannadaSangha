import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GalleryLightbox from './GalleryLightbox.jsx';

const images = [
  'https://example.com/one.jpg',
  'https://example.com/two.jpg',
  'https://example.com/three.jpg',
];

function renderLightbox(overrides = {}) {
  const onClose = vi.fn();
  const onPrev = vi.fn();
  const onNext = vi.fn();
  render(
    <GalleryLightbox
      images={images}
      index={0}
      title="Community Service"
      onClose={onClose}
      onPrev={onPrev}
      onNext={onNext}
      {...overrides}
    />
  );
  return { onClose, onPrev, onNext };
}

describe('GalleryLightbox', () => {
  it('renders the current image and a counter', () => {
    renderLightbox({ index: 1 });
    expect(screen.getByRole('img', { name: 'Community Service' })).toHaveAttribute(
      'src',
      images[1]
    );
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('calls onPrev and onNext when the nav buttons are clicked', () => {
    const { onPrev, onNext } = renderLightbox();
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop or close button is clicked', () => {
    const { onClose } = renderLightbox();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when the image itself is clicked', () => {
    const { onClose } = renderLightbox();
    fireEvent.click(screen.getByRole('img', { name: 'Community Service' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('responds to Escape, ArrowLeft, and ArrowRight keys', () => {
    const { onClose, onPrev, onNext } = renderLightbox();
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('download', () => {
    let createObjectURL;
    let revokeObjectURL;

    beforeEach(() => {
      createObjectURL = vi.fn(() => 'blob:mock-url');
      revokeObjectURL = vi.fn();
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;
      global.fetch = vi.fn(() =>
        Promise.resolve({ blob: () => Promise.resolve(new Blob(['data'])) })
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('fetches the image and triggers a blob download', async () => {
      renderLightbox();
      fireEvent.click(screen.getByRole('button', { name: 'Download' }));

      await waitFor(() => expect(createObjectURL).toHaveBeenCalled());
      expect(global.fetch).toHaveBeenCalledWith(images[0]);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
