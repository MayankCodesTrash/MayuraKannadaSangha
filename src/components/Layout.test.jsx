import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout.jsx';

describe('Layout', () => {
  it('renders nav, children, and footer', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>page content</div>
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByAltText('Mayura Kannada Sangha logo')).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
    // "Mayura Kannada Sangha" is split across <span> elements in the footer
    // name to highlight the M/K/S initials, so match on full text content.
    expect(
      screen.getByText(
        (_, element) => element.tagName === 'P' && element.textContent === 'Mayura Kannada Sangha'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/© \d{4} Mayura Kannada Sangha, Central Iowa/)).toBeInTheDocument();
  });
});
