import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PastEventCard from './PastEventCard.jsx';

const event = {
  id: 'test-past-event',
  date: 'August 23, 2025',
  title: 'Clay Ganesha Workshop',
  location: 'Urbandale Library, IA',
  image: 'https://example.com/photo.jpg',
};

describe('PastEventCard', () => {
  it('renders the date, title, and location', () => {
    render(<PastEventCard event={event} />);
    expect(screen.getByText('August 23, 2025')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Clay Ganesha Workshop' })).toBeInTheDocument();
    expect(screen.getByText('Urbandale Library, IA')).toBeInTheDocument();
  });
});
