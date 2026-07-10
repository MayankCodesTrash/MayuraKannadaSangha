import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer.jsx';

describe('Footer', () => {
  it('renders the association name and a wave divider svg', () => {
    const { container } = render(<Footer />);
    expect(screen.getAllByText(/Mayura Kannada Sangha/)).toHaveLength(2);
    expect(container.querySelector('.wave-divider svg')).toBeInTheDocument();
  });
});
