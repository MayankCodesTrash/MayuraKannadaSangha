import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero.jsx';

describe('Hero', () => {
  it('renders the scroll-scrubbed video and every hero text line, centered', () => {
    const { container } = render(<Hero />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video.querySelector('source').getAttribute('src')).toBe('/videos/0709.mp4');

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
