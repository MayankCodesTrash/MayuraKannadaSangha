import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LogoBanner from './LogoBanner.jsx';

describe('LogoBanner', () => {
  it('renders the full-width Mayura Kannada Sangha banner image', () => {
    render(<LogoBanner />);
    expect(screen.getByAltText('Mayura Kannada Sangha')).toHaveAttribute(
      'src',
      '/videos/Mayura Kannada Sangha.png'
    );
  });
});
