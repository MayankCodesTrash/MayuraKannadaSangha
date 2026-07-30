import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import App from './App.jsx';

describe('App routing', () => {
  it('renders the hero welcome text on the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getAllByText(
        (_, element) => element.tagName === 'P' && element.textContent === 'Mayura Kannada Sangha'
      )
    ).toHaveLength(2);
  });

  it('renders the Culture & Values page', () => {
    render(
      <MemoryRouter initialEntries={['/culture']}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: 'Mayura Kannada Sangha – Central Iowa' })
    ).toBeInTheDocument();
  });

  it('renders the Team page', () => {
    render(
      <MemoryRouter initialEntries={['/team']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: '2026 Office Bearers' })).toBeInTheDocument();
  });

  it('renders the Sponsors page with sponsorship info and gold/silver/bronze tiers', () => {
    render(
      <MemoryRouter initialEntries={['/events']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Up-Coming Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Past Events' })).toBeInTheDocument();
  });

  it('renders the Sponsors page with sponsorship info and gold/silver/bronze tiers', () => {
    render(
      <MemoryRouter initialEntries={['/sponsors']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Sponsorship Opportunities' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Our Sponsors' })).toBeInTheDocument();
  });

  it('renders the Gallery overview heading', () => {
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument();
  });

  it('shows the admin login form on /admin/login', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Admin Sign In' })).toBeInTheDocument();
  });

  it('redirects /admin to the login page when logged out', () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Admin Sign In' })).toBeInTheDocument();
  });

  it('shows the dashboard at /admin when logged in', () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback({ email: 'admin@mayurakannadasangha.org' });
      return () => {};
    });
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Admin Dashboard' })).toBeInTheDocument();
  });
});
