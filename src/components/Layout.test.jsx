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
    expect(screen.getAllByText(/Mayura Kannada Sangha/)).toHaveLength(2);
  });
});
