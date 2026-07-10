import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import {
  subscribeToEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
} from '../../data/eventsRepo.js';
import EventsAdminTab from './EventsAdminTab.jsx';

vi.mock('../../data/eventsRepo.js', () => ({
  subscribeToEvents: vi.fn(() => () => {}),
  createEvent: vi.fn(() => Promise.resolve('new-evt-id')),
  updateEvent: vi.fn(() => Promise.resolve()),
  deleteEvent: vi.fn(() => Promise.resolve()),
  uploadEventImage: vi.fn(() => Promise.resolve({ image: 'https://example.com/img.jpg', storagePath: 'events/new-evt-id/img.jpg' })),
}));

const SAMPLE_EVENT = {
  id: 'evt-1',
  title: 'Dasara Mahotsava 2025',
  day: '27',
  month: 'September',
  year: '2025',
  time: '2pm-7pm',
  location: 'Franklin Junior High',
  image: 'https://example.com/dasara.jpg',
  storagePath: 'events/evt-1/dasara.jpg',
  status: 'upcoming',
  buttons: [{ label: 'Tickets', url: 'https://example.com/tickets' }],
};

beforeEach(() => {
  vi.mocked(subscribeToEvents).mockClear().mockImplementation((onChange) => {
    onChange([SAMPLE_EVENT]);
    return () => {};
  });
  vi.mocked(createEvent).mockClear().mockResolvedValue('new-evt-id');
  vi.mocked(updateEvent).mockClear().mockResolvedValue();
  vi.mocked(deleteEvent).mockClear().mockResolvedValue();
  vi.mocked(uploadEventImage).mockClear();
  window.confirm = vi.fn(() => true);
});

describe('EventsAdminTab', () => {
  it('lists events from Firestore', () => {
    render(<EventsAdminTab />);
    expect(screen.getByText('Dasara Mahotsava 2025')).toBeInTheDocument();
    expect(screen.getByText('upcoming')).toBeInTheDocument();
  });

  it('creates a new event with a title, required fields, and one button', async () => {
    render(<EventsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Event' }));

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Summer Picnic' } });
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '9' } });
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: 'August' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2026' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Polk City, IA' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Button' }));
    fireEvent.change(screen.getByLabelText('Button 1 label'), { target: { value: 'RSVP' } });
    fireEvent.change(screen.getByLabelText('Button 1 URL'), { target: { value: 'https://example.com/rsvp' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Summer Picnic',
          day: '9',
          month: 'August',
          year: '2026',
          location: 'Polk City, IA',
          status: 'upcoming',
          buttons: [{ label: 'RSVP', url: 'https://example.com/rsvp' }],
        })
      )
    );
  });

  it('caps the button editor at 3 buttons', () => {
    render(<EventsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Event' }));

    fireEvent.click(screen.getByRole('button', { name: 'Add Button' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add Button' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add Button' }));

    expect(screen.queryByRole('button', { name: 'Add Button' })).not.toBeInTheDocument();
  });

  it('pre-fills the form when editing an existing event', () => {
    render(<EventsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Title')).toHaveValue('Dasara Mahotsava 2025');
    expect(screen.getByLabelText('Button 1 label')).toHaveValue('Tickets');
  });

  it('deletes an event after confirmation', async () => {
    render(<EventsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteEvent).toHaveBeenCalledWith('evt-1', 'events/evt-1/dasara.jpg'));
  });
});
