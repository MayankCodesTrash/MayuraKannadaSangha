import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer.jsx';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe('Footer', () => {
  it('renders a wave divider svg', () => {
    const { container } = renderFooter();
    expect(container.querySelector('.wave-divider svg')).toBeInTheDocument();
  });

  it('renders all six nav links', () => {
    renderFooter();
    ['Home', 'Events', 'Gallery', 'Our Culture and Values', 'Team', 'Contact'].forEach(
      (label) => {
        expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
      }
    );
  });

  it('renders the association name, location, email, and non-profit line', () => {
    renderFooter();
    // "Mayura Kannada Sangha" is split across <span> elements to highlight
    // the M/K/S initials, so match on the paragraph's full text content.
    expect(
      screen.getByText(
        (_, element) => element.tagName === 'P' && element.textContent === 'Mayura Kannada Sangha'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Central Iowa')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'mksdsm2024@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:mksdsm2024@gmail.com'
    );
    expect(
      screen.getByText('A Registered, Non-Profit, Tax-Exempt 501(C)(3) Organization')
    ).toBeInTheDocument();
  });

  it('renders an Instagram follow link that opens in a new tab', () => {
    renderFooter();
    const link = screen.getByRole('link', { name: /follow us on instagram/i });
    expect(link).toHaveAttribute('href', 'https://www.instagram.com/MayuraKannadaSangha/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
