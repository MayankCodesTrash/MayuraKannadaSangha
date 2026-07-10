import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Footer from './Footer.jsx';

function renderFooter() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Footer />
      </AuthProvider>
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

  it('shows an Admin Sign In link when logged out', () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });
    renderFooter();
    expect(screen.getByRole('link', { name: 'Admin Sign In' })).toHaveAttribute('href', '/admin/login');
    expect(screen.queryByRole('link', { name: 'Admin Dashboard' })).not.toBeInTheDocument();
  });

  it('shows an Admin Dashboard link and Log Out button when logged in', () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback({ email: 'admin@mayurakannadasangha.org' });
      return () => {};
    });
    renderFooter();
    expect(screen.getByRole('link', { name: 'Admin Dashboard' })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('button', { name: 'Log Out' })).toBeInTheDocument();
  });
});
