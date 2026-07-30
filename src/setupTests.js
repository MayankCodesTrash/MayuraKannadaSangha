import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.IntersectionObserver = MockIntersectionObserver;

if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return () => {};
  }),
  signInWithEmailAndPassword: vi.fn(() => Promise.reject(new Error('not mocked'))),
  signOut: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(() => () => {}),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  arrayUnion: vi.fn((...items) => ({ __op: 'arrayUnion', items })),
  arrayRemove: vi.fn((item) => ({ __op: 'arrayRemove', item })),
}));
