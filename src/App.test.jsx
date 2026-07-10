import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

describe('App routing', () => {
  it('renders the hero welcome text on the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Mayura Kannada Sangha')).toBeInTheDocument();
  });

  it.each([
    ['/events', 'Events'],
    ['/gallery', 'Gallery'],
    ['/culture', 'Our Culture and Values'],
    ['/team', 'Team'],
    ['/contact', 'Contact'],
  ])('renders a placeholder heading for %s', (path, heading) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
