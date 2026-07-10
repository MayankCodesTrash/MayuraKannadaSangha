import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useAuth } from './AuthContext.jsx';

vi.mock('./AuthContext.jsx', () => ({ useAuth: vi.fn() }));

function renderWithRoute(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin/login" element={<div>Login Page</div>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <div>Dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('renders nothing while auth state is loading', () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: null, loading: true });
    const { container } = renderWithRoute('/admin');
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects to /admin/login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: null, loading: false });
    renderWithRoute('/admin');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      currentUser: { email: 'admin@mayurakannadasangha.org' },
      loading: false,
    });
    renderWithRoute('/admin');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
