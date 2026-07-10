import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Events from './Events.jsx';

function snapshotFrom(events) {
  return { docs: events.map(({ id, ...data }) => ({ id, data: () => data })) };
}

function renderEvents() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Events />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Events page', () => {
  it('splits live events into upcoming and past sections by status', () => {
    vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
      callback(
        snapshotFrom([
          {
            id: 'evt-1',
            title: 'Dasara Mahotsava 2025',
            day: '27',
            month: 'September',
            year: '2025',
            time: '2pm-7pm',
            location: 'Franklin Junior High',
            image: 'https://example.com/dasara.jpg',
            status: 'upcoming',
            buttons: [{ label: 'Tickets', url: 'https://example.com/tickets' }],
          },
          {
            id: 'evt-2',
            title: 'Clay Ganesha Workshop',
            day: '23',
            month: 'August',
            year: '2025',
            time: '',
            location: 'Urbandale Library, IA',
            image: 'https://example.com/ganesha.jpg',
            status: 'past',
            buttons: [],
          },
        ])
      );
      return () => {};
    });

    renderEvents();

    expect(screen.getByRole('heading', { name: 'Up-Coming Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dasara Mahotsava 2025' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tickets' })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Past Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Clay Ganesha Workshop' })).toBeInTheDocument();
    expect(screen.getByText('August 23, 2025')).toBeInTheDocument();
  });

  it('renders empty sections gracefully when there are no events yet', () => {
    vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
      callback(snapshotFrom([]));
      return () => {};
    });

    renderEvents();

    expect(screen.getByRole('heading', { name: 'Up-Coming Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Past Events' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });
});
