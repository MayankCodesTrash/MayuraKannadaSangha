import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero.jsx';
import { GALLERY_IMAGES } from '../data/galleryImages.js';

describe('Hero', () => {
  it('renders a background photo slide and every welcome line', () => {
    const { container } = render(<Hero />);
    const slide = container.querySelector('.hero__slide');
    expect(slide).toBeInTheDocument();
    expect(slide).toHaveAttribute('src', GALLERY_IMAGES[0]);

    [
      'Welcome to',
      'Mayura Kannada Sangha',
      'Central Iowa',
      'ಮಯೂರ ಕನ್ನಡ ಸಂಘ',
      'ಸೆಂಟ್ರಲ್ ಅಯೋವಾ',
    ].forEach((line) => {
      expect(
        screen.getByText((_, element) => element.tagName === 'P' && element.textContent === line)
      ).toBeInTheDocument();
    });
  });
});
