import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Layout from './Layout.jsx';

describe('Layout', () => {
  it('renders nav, children, and footer', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Layout>
            <div>page content</div>
          </Layout>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByAltText('Mayura Kannada Sangha logo')).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) => element.tagName === 'P' && element.textContent === 'Mayura Kannada Sangha'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/© \d{4} Mayura Kannada Sangha, Central Iowa/)).toBeInTheDocument();
  });
});
