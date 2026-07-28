import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TopBanner from './TopBanner.jsx';

describe('TopBanner', () => {
  it('renders the full non-profit status text', () => {
    render(<TopBanner />);
    expect(
      screen.getByText('A Registered, Non-Profit, Tax-Exempt 501(c)(3) Organization')
    ).toBeInTheDocument();
  });
});
