import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ImageCarousel from './ImageCarousel.jsx';

const images = [
  'https://example.com/a.jpg',
  'https://example.com/b.jpg',
  'https://example.com/c.jpg',
];

describe('ImageCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the first image and one dot per image', () => {
    const { container } = render(<ImageCarousel images={images} interval={1000} />);
    expect(container.querySelector('img').src).toBe(images[0]);
    expect(container.querySelectorAll('.carousel__dot')).toHaveLength(images.length);
  });

  it('auto-advances to the next image after the interval elapses', () => {
    const { container } = render(<ImageCarousel images={images} interval={1000} />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.querySelector('img').src).toBe(images[1]);
  });

  it('wraps around to the first image after the last one', () => {
    const { container } = render(<ImageCarousel images={images} interval={1000} />);
    act(() => {
      vi.advanceTimersByTime(1000 * images.length);
    });
    expect(container.querySelector('img').src).toBe(images[0]);
  });

  it('jumps to a specific image when its dot is clicked', () => {
    const { container } = render(<ImageCarousel images={images} interval={1000} />);
    const dots = screen.getAllByRole('button');
    fireEvent.click(dots[2]);
    expect(container.querySelector('img').src).toBe(images[2]);
  });

  it('pauses auto-advance while the mouse is hovering the carousel', () => {
    const { container } = render(<ImageCarousel images={images} interval={1000} />);
    fireEvent.mouseEnter(container.querySelector('.carousel'));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(container.querySelector('img').src).toBe(images[0]);
  });
});
