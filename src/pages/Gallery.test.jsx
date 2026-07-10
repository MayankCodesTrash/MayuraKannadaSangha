import { describe, it, expect } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Gallery from './Gallery.jsx';
import { GALLERY_SECTIONS } from '../data/gallerySections.js';

function renderGallery() {
  return render(
    <MemoryRouter>
      <Gallery />
    </MemoryRouter>
  );
}

function bentoGrid(container) {
  return container.querySelector('.gallery-bento');
}

describe('Gallery', () => {
  it("renders a cover tile for every section using each section's first image", () => {
    renderGallery();
    GALLERY_SECTIONS.forEach((section) => {
      const tile = screen.getByRole('button', { name: section.title });
      const img = within(tile).getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('src', section.images[0]);
    });
  });

  it('opens a section into its own bento grid and can navigate back', () => {
    const { container } = renderGallery();

    fireEvent.click(screen.getByRole('button', { name: 'MKS Rajyotsava' }));

    expect(screen.getByRole('heading', { name: 'MKS Rajyotsava' })).toBeInTheDocument();
    const section = GALLERY_SECTIONS.find((entry) => entry.id === 'mks-rajyotsava');
    expect(within(bentoGrid(container)).getAllByRole('img')).toHaveLength(section.images.length);

    fireEvent.click(screen.getByRole('button', { name: /Back to Gallery/ }));
    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument();
  });

  it('opens the lightbox when an image in a section is clicked and steps through images', () => {
    const { container } = renderGallery();

    fireEvent.click(screen.getByRole('button', { name: 'Community Service' }));
    const images = within(bentoGrid(container)).getAllByRole('img');
    fireEvent.click(images[0]);

    expect(screen.getByText('1 / 12')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(screen.getByText('2 / 12')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(screen.getByText('1 / 12')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('1 / 12')).not.toBeInTheDocument();
  });
});
