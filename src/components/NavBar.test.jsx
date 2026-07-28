import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './NavBar.jsx';

describe('NavBar', () => {
  it('renders the logo and all seven section links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );
    expect(screen.getByAltText('Mayura Kannada Sangha logo')).toBeInTheDocument();
    ['Home', 'Events', 'Our Sponsors', 'Gallery', 'Our Culture and Values', 'Team', 'Contact'].forEach(
      (label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
    );
  });

  it('opens and closes the mobile menu via the hamburger toggle', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Close navigation menu' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation menu' }));

    const closeButton = screen.getByRole('button', { name: 'Close navigation menu' });
    expect(closeButton).toBeInTheDocument();

    const mobileMenu = within(closeButton.closest('.navbar__mobile-menu'));
    ['Home', 'Events', 'Our Sponsors', 'Gallery', 'Our Culture and Values', 'Team', 'Contact'].forEach(
      (label) => {
        expect(mobileMenu.getByText(label)).toBeInTheDocument();
      }
    );

    fireEvent.click(mobileMenu.getByText('Events'));

    expect(screen.queryByRole('button', { name: 'Close navigation menu' })).not.toBeInTheDocument();
  });
});
