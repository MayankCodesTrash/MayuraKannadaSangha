import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroVideo from './HeroVideo.jsx';

describe('HeroVideo', () => {
  it('renders the video element and every hero text line, centered', () => {
    const { container } = render(<HeroVideo />);
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
      expect(screen.getByText(line)).toBeInTheDocument();
    });
  });
});
