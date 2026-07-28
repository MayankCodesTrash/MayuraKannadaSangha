import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';

const ADMIN_EMAIL = 'admin@mayurakannadasangha.org';
const ADMIN_USERNAME = 'admin';

// The actual password is verified by Firebase Auth (server-side), not by this
// file — changing this constant alone does nothing. To change the real
// password, set the Firebase user's password to match this value in the
// Firebase console: Authentication -> Users -> admin@mayurakannadasangha.org
// -> Reset password. Keeping this constant in sync is just a convenience so
// the current password is documented in one place.
const ADMIN_PASSWORD = 'MayuraAdminKarnataka772';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(username, password) {
    if (username.trim().toLowerCase() !== ADMIN_USERNAME) {
      throw new Error('Invalid username or password');
    }
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
  }

  function logout() {
    return signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
