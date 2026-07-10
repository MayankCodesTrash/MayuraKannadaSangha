import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Gallery from './Gallery.jsx';

const CATEGORIES = [
  {
    id: 'community-service',
    title: 'Community Service',
    images: Array.from({ length: 12 }, (_, i) => ({ url: `https://example.com/cs-${i}.jpg`, storagePath: null })),
  },
  {
    id: 'mks-rajyotsava',
    title: 'MKS Rajyotsava',
    images: Array.from({ length: 5 }, (_, i) => ({ url: `https://example.com/raj-${i}.jpg`, storagePath: null })),
  },
];

function snapshotFrom(categories) {
  return { docs: categories.map(({ id, ...data }) => ({ id, data: () => data })) };
}

function renderGallery() {
  vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
    callback(snapshotFrom(CATEGORIES));
    return () => {};
  });
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Gallery />
      </AuthProvider>
    </MemoryRouter>
  );
}

function bentoGrid(container) {
  return container.querySelector('.gallery-bento');
}

describe('Gallery', () => {
  it("renders a cover tile for every category using each category's first image", () => {
    renderGallery();
    CATEGORIES.forEach((category) => {
      const tile = screen.getByRole('button', { name: category.title });
      const img = within(tile).getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('src', category.images[0].url);
    });
  });

  it('opens a category into its own bento grid and can navigate back', () => {
    const { container } = renderGallery();

    fireEvent.click(screen.getByRole('button', { name: 'MKS Rajyotsava' }));

    expect(screen.getByRole('heading', { name: 'MKS Rajyotsava' })).toBeInTheDocument();
    const category = CATEGORIES.find((entry) => entry.id === 'mks-rajyotsava');
    expect(within(bentoGrid(container)).getAllByRole('img')).toHaveLength(category.images.length);

    fireEvent.click(screen.getByRole('button', { name: /Back to Gallery/ }));
    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument();
  });

  it('opens the lightbox when an image in a category is clicked and steps through images', () => {
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
