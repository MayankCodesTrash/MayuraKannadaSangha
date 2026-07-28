import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import HomeEventsPreview from './HomeEventsPreview.jsx';

function snapshotFrom(events) {
  return { docs: events.map(({ id, ...data }) => ({ id, data: () => data })) };
}

describe('HomeEventsPreview', () => {
  it('shows only upcoming events, capped at 3, with a link to the full events page', () => {
    vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
      callback(
        snapshotFrom([
          { id: 'evt-1', title: 'Dasara', status: 'upcoming', day: '1', month: 'Jan', year: '2026', time: '', location: '', image: '' },
          { id: 'evt-2', title: 'Ugadi', status: 'upcoming', day: '2', month: 'Feb', year: '2026', time: '', location: '', image: '' },
          { id: 'evt-3', title: 'Ganesha', status: 'upcoming', day: '3', month: 'Mar', year: '2026', time: '', location: '', image: '' },
          { id: 'evt-4', title: 'Diwali', status: 'upcoming', day: '4', month: 'Apr', year: '2026', time: '', location: '', image: '' },
          { id: 'evt-5', title: 'Old Event', status: 'past', day: '5', month: 'May', year: '2025', time: '', location: '', image: '' },
        ])
      );
      return () => {};
    });

    render(
      <MemoryRouter>
        <HomeEventsPreview />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Upcoming Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dasara' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ugadi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ganesha' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Diwali' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Old Event' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See All Events' })).toHaveAttribute('href', '/events');
  });

  it('shows an empty-state message when there are no upcoming events', () => {
    vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
      callback(snapshotFrom([]));
      return () => {};
    });

    render(
      <MemoryRouter>
        <HomeEventsPreview />
      </MemoryRouter>
    );

    expect(screen.getByText('No upcoming events right now — check back soon.')).toBeInTheDocument();
  });
});
