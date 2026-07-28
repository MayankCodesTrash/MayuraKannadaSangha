import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePhotoHighlights from './HomePhotoHighlights.jsx';
import { GALLERY_IMAGES } from '../data/galleryImages.js';

describe('HomePhotoHighlights', () => {
  it('renders a capped set of gallery photos with a link to the full gallery', () => {
    render(
      <MemoryRouter>
        <HomePhotoHighlights />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Photo Highlights' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(6);
    expect(screen.getAllByRole('img')[0]).toHaveAttribute('src', GALLERY_IMAGES[0]);
    expect(screen.getByRole('link', { name: 'View Full Gallery' })).toHaveAttribute(
      'href',
      '/gallery'
    );
  });
});
