import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EventCard from './EventCard.jsx';

const event = {
  id: 'test-event',
  day: '27',
  month: 'September',
  year: '2025',
  title: 'Dasara Mahotsava 2025',
  time: '2pm-7pm',
  location: 'Franklin Junior High- 4801 Franklin Ave, Des Moines, IA, 50310',
  image: 'https://example.com/photo.jpg',
  ctaLabel: 'Tickets',
  ctaHref: 'https://www.zeffy.com/en-US/ticketing/mks-dasara-mahotsava--2025',
};

describe('EventCard', () => {
  it('renders the event details and a CTA link that opens in a new tab', () => {
    render(<EventCard event={event} />);
    expect(screen.getByText('27')).toBeInTheDocument();
    expect(screen.getByText('September')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dasara Mahotsava 2025' })).toBeInTheDocument();
    expect(screen.getByText('2pm-7pm')).toBeInTheDocument();
    expect(screen.getByText(event.location)).toBeInTheDocument();

    const cta = screen.getByRole('link', { name: 'Tickets' });
    expect(cta).toHaveAttribute('href', event.ctaHref);
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
