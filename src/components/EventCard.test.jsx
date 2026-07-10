import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EventCard from './EventCard.jsx';

const baseEvent = {
  id: 'test-event',
  day: '27',
  month: 'September',
  year: '2025',
  title: 'Dasara Mahotsava 2025',
  time: '2pm-7pm',
  location: 'Franklin Junior High- 4801 Franklin Ave, Des Moines, IA, 50310',
  image: 'https://example.com/photo.jpg',
};

describe('EventCard', () => {
  it('renders the event details', () => {
    render(<EventCard event={{ ...baseEvent, buttons: [] }} />);
    expect(screen.getByText('27')).toBeInTheDocument();
    expect(screen.getByText('September')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dasara Mahotsava 2025' })).toBeInTheDocument();
    expect(screen.getByText('2pm-7pm')).toBeInTheDocument();
    expect(screen.getByText(baseEvent.location)).toBeInTheDocument();
  });

  it('renders up to 3 buttons, each opening in a new tab', () => {
    const buttons = [
      { label: 'Tickets', url: 'https://example.com/tickets' },
      { label: 'Performance Registration', url: 'https://example.com/register' },
      { label: 'Volunteer', url: 'https://example.com/volunteer' },
    ];
    render(<EventCard event={{ ...baseEvent, buttons }} />);

    buttons.forEach(({ label, url }) => {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('href', url);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders no buttons when the event has none', () => {
    render(<EventCard event={{ ...baseEvent, buttons: [] }} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
