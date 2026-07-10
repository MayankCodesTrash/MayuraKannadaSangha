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
    // "Mayura Kannada Sangha" appears in both the hero title and the footer name
    expect(screen.getAllByText('Mayura Kannada Sangha')).toHaveLength(2);
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
