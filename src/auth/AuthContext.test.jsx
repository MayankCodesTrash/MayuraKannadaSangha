import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { AuthProvider, useAuth } from './AuthContext.jsx';

function TestConsumer() {
  const { currentUser, login, logout } = useAuth();
  const [error, setError] = useState('');

  async function handleLogin(username, password) {
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <span data-testid="user">{currentUser ? currentUser.email : 'none'}</span>
      <span data-testid="error">{error}</span>
      <button onClick={() => handleLogin('nobody', 'secret')}>bad-login</button>
      <button onClick={() => handleLogin('Admin', 'secret123')}>good-login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderConsumer() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.mocked(onAuthStateChanged).mockReset();
  vi.mocked(signInWithEmailAndPassword).mockReset();
  vi.mocked(signOut).mockReset();
  vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
    callback(null);
    return () => {};
  });
});

describe('AuthProvider / useAuth', () => {
  it('exposes the current Firebase user reported by onAuthStateChanged', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback({ email: 'admin@mayurakannadasangha.org' });
      return () => {};
    });

    renderConsumer();

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('admin@mayurakannadasangha.org')
    );
  });

  it('rejects login when the username is not "admin" without calling Firebase', async () => {
    renderConsumer();
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByText('bad-login'));

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid username or password')
    );
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('signs in with the fixed admin email when the username is "admin" (case-insensitive)', async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: { email: 'admin@mayurakannadasangha.org' } });
    renderConsumer();
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByText('good-login'));

    await waitFor(() =>
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'admin@mayurakannadasangha.org',
        'secret123'
      )
    );
  });

  it('logs out via Firebase signOut', async () => {
    vi.mocked(signOut).mockResolvedValue();
    renderConsumer();
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(signOut).toHaveBeenCalled());
  });
});
