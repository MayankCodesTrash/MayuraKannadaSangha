import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './NavBar.jsx';

describe('NavBar', () => {
  it('renders the logo and all six section links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );
    expect(screen.getByAltText('Mayura Kannada Sangha logo')).toBeInTheDocument();
    ['Home', 'Events', 'Gallery', 'Our Culture and Values', 'Team', 'Contact'].forEach(
      (label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
    );
  });
});
