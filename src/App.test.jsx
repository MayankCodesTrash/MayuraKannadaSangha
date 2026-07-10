import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import App from './App.jsx';

describe('App routing', () => {
  it('renders the hero welcome text on the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
    // "Mayura Kannada Sangha" appears in both the hero title and the footer
    // name, each split across <span> elements to highlight the M/K/S
    // initials, so match on full text content rather than a plain string.
    expect(
      screen.getAllByText(
        (_, element) => element.tagName === 'P' && element.textContent === 'Mayura Kannada Sangha'
      )
    ).toHaveLength(2);
  });

  it.each([
    ['/culture', 'Our Culture and Values'],
    ['/team', 'Team'],
    ['/contact', 'Contact'],
  ])('renders a placeholder heading for %s', (path, heading) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('renders the Events page with upcoming and past events', () => {
    render(
      <MemoryRouter initialEntries={['/events']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Up-Coming Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Past Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sponsorship Opportunities' })).toBeInTheDocument();
  });

  it('renders the Gallery overview heading', () => {
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument();
  });
});
