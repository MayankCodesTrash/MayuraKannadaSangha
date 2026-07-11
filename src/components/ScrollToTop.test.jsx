import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';

function NavigateButton({ to }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      Go
    </button>
  );
}

function renderWithRoutes() {
  return render(
    <MemoryRouter initialEntries={['/a']}>
      <ScrollToTop />
      <Routes>
        <Route path="/a" element={<NavigateButton to="/b" />} />
        <Route path="/b" element={<div>Page B</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.scrollTo = vi.fn();
});

describe('ScrollToTop', () => {
  it('scrolls to the top on initial render', () => {
    renderWithRoutes();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('scrolls to the top again when the route changes', () => {
    renderWithRoutes();
    window.scrollTo.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'Go' }));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
