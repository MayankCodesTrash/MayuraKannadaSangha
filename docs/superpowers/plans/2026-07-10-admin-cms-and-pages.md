# Admin CMS, Firebase Backend, and New Content Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move events and gallery content from static data files to a Firebase-backed CMS editable by a single admin, and complete the Culture & Values, Team, and Contact pages.

**Architecture:** Vite/React static site (unchanged) adds a Firebase client SDK layer (Firestore + Storage + Auth) so admin edits made through a new `/admin` dashboard are read live by the public Events and Gallery pages via `onSnapshot`. No custom server/API code is added anywhere.

**Tech Stack:** React 18, react-router-dom v6, framer-motion, Firebase JS SDK v10 (`firebase` npm package), `@emailjs/browser`, Vitest + Testing Library.

## Global Constraints

- No custom backend/server code — Firebase client SDK (Auth, Firestore, Storage) and EmailJS only, both called directly from the browser.
- Firebase project `kannadasangha-83770`; config values are not secrets and are committed directly in `src/firebase.js`.
- Single fixed admin account. Login UI shows username `Admin` / a password; internally this maps to Firebase Auth email `admin@mayurakannadasangha.org`.
- Firestore/Storage security rules: public read, write requires `request.auth != null`.
- Events support 0–3 custom buttons (`{ label, url }`), stacked vertically on the card.
- Admin marks an event's status (`upcoming` or `past`) manually — no automatic date-based classification.
- Gallery category/event images are uploaded directly from the admin's device to Firebase Storage — no URL-paste option in the admin UI.
- Kannada translation toggle applies only to the Culture & Values page, not site-wide.
- EmailJS is wired but left unconfigured (empty `serviceId`/`templateId`/`publicKey`); the Contact page must degrade gracefully (no crash) until real values are supplied.
- Follow existing code conventions: colocated `Component.css` + `Component.test.jsx` per component/page, `framer-motion` scroll-in animations (`initial`/`whileInView`/`viewport`/`transition`) matching Events/Gallery pages, `KolamPattern` decoration on page sections, CSS custom properties from `src/index.css` (`--color-yellow`, `--color-orange`, `--color-text-dark`, `--font-display`, `--font-kannada`, etc.).

---

### Task 1: Install dependencies, add Firebase config, and add global Firebase test mocks

**Files:**
- Modify: `package.json`
- Create: `src/firebase.js`
- Modify: `src/setupTests.js`

**Interfaces:**
- Produces: `src/firebase.js` exports `auth`, `db`, `storage` (initialized Firebase Auth/Firestore/Storage instances) — every later task that talks to Firebase imports from here.
- Produces: global Vitest mocks for `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage` so no test file needs its own boilerplate mock of the SDK's `get*` functions; individual test files still `vi.mock` and customize specific named exports (e.g. `onSnapshot`, `signInWithEmailAndPassword`) as needed.

- [ ] **Step 1: Install `firebase` and `@emailjs/browser`**

Run: `npm install firebase @emailjs/browser`
Expected: both packages added to `package.json` `dependencies` and `package-lock.json` updated.

- [ ] **Step 2: Create the Firebase config module**

Create `src/firebase.js`:

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD320kEy8HqhxaQxvR95jGvxBi0HlElos4',
  authDomain: 'kannadasangha-83770.firebaseapp.com',
  projectId: 'kannadasangha-83770',
  storageBucket: 'kannadasangha-83770.firebasestorage.app',
  messagingSenderId: '342235429903',
  appId: '1:342235429903:web:f6d2845cf57a108fe1777a',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

- [ ] **Step 3: Add global Firebase SDK mocks to the test setup file**

Replace the full contents of `src/setupTests.js` with:

```js
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.IntersectionObserver = MockIntersectionObserver;

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

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(() => ({})),
  uploadBytes: vi.fn(() => Promise.resolve()),
  getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/mock-image.jpg')),
  deleteObject: vi.fn(() => Promise.resolve()),
}));
```

- [ ] **Step 4: Verify the existing test suite still passes with the new setup file**

Run: `npm test`
Expected: all existing tests still PASS (this step only adds mocks; nothing imports `firebase.js` yet, so behavior is unchanged).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/firebase.js src/setupTests.js
git commit -m "Add Firebase config and global Firebase test mocks"
```

---

### Task 2: Auth context (login/logout backed by Firebase Auth)

**Files:**
- Create: `src/auth/AuthContext.jsx`
- Test: `src/auth/AuthContext.test.jsx`

**Interfaces:**
- Consumes: `auth` from `src/firebase.js` (Task 1).
- Produces: `AuthProvider` component and `useAuth()` hook returning `{ currentUser, loading, login(username, password), logout() }`. `login` rejects with `Error('Invalid username or password')` if `username` (case-insensitive, trimmed) isn't `"admin"`, otherwise calls Firebase `signInWithEmailAndPassword(auth, 'admin@mayurakannadasangha.org', password)`. `logout` calls Firebase `signOut(auth)`. Later tasks (ProtectedRoute, Footer, AdminLogin, AdminDashboard) all import `useAuth` from this file.

- [ ] **Step 1: Write the failing test**

Create `src/auth/AuthContext.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/auth/AuthContext.test.jsx`
Expected: FAIL with a module-not-found error for `./AuthContext.jsx`.

- [ ] **Step 3: Write the implementation**

Create `src/auth/AuthContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';

const ADMIN_EMAIL = 'admin@mayurakannadasangha.org';

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
    if (username.trim().toLowerCase() !== 'admin') {
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/auth/AuthContext.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/auth/AuthContext.jsx src/auth/AuthContext.test.jsx
git commit -m "Add Firebase-backed auth context with fixed admin login"
```

---

### Task 3: Protected route guard for `/admin`

**Files:**
- Create: `src/auth/ProtectedRoute.jsx`
- Test: `src/auth/ProtectedRoute.test.jsx`

**Interfaces:**
- Consumes: `useAuth()` from `src/auth/AuthContext.jsx` (Task 2), returning `{ currentUser, loading }`.
- Produces: `ProtectedRoute` component (`children` prop) — renders nothing while `loading`, redirects to `/admin/login` when `currentUser` is falsy, otherwise renders `children`. Used by `App.jsx` (Task 14) to wrap `/admin`.

- [ ] **Step 1: Write the failing test**

Create `src/auth/ProtectedRoute.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/auth/ProtectedRoute.test.jsx`
Expected: FAIL with a module-not-found error for `./ProtectedRoute.jsx`.

- [ ] **Step 3: Write the implementation**

Create `src/auth/ProtectedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/auth/ProtectedRoute.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/auth/ProtectedRoute.jsx src/auth/ProtectedRoute.test.jsx
git commit -m "Add ProtectedRoute guard for admin routes"
```

---

### Task 4: Events Firestore/Storage repository

**Files:**
- Create: `src/data/eventsRepo.js`
- Test: `src/data/eventsRepo.test.js`

**Interfaces:**
- Consumes: `db`, `storage` from `src/firebase.js` (Task 1).
- Produces:
  - `subscribeToEvents(onChange)` → calls `onChange(events)` with `events` = array of `{ id, ...docData }`; returns the Firestore unsubscribe function. Used by `Events.jsx` (Task 8) and `EventsAdminTab.jsx` (Task 12).
  - `uploadEventImage(eventId, file)` → `Promise<{ image: string, storagePath: string }>`. Used by `EventsAdminTab.jsx`.
  - `createEvent(eventData)` → `Promise<string>` (new doc id). `eventData` shape: `{ title, day, month, year, time, location, status, image, storagePath, buttons }` where `buttons` is an array of `{ label, url }` (0–3 entries).
  - `updateEvent(eventId, eventData)` → `Promise<void>`, partial update.
  - `deleteEvent(eventId, storagePath)` → `Promise<void>`; deletes the Firestore doc, and also deletes the Storage object at `storagePath` if `storagePath` is truthy.

- [ ] **Step 1: Write the failing test**

Create `src/data/eventsRepo.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  subscribeToEvents,
  uploadEventImage,
  createEvent,
  updateEvent,
  deleteEvent,
} from './eventsRepo.js';

beforeEach(() => {
  vi.mocked(collection).mockClear().mockReturnValue('events-collection-ref');
  vi.mocked(doc).mockClear().mockReturnValue('event-doc-ref');
  vi.mocked(addDoc).mockClear();
  vi.mocked(updateDoc).mockClear();
  vi.mocked(deleteDoc).mockClear();
  vi.mocked(onSnapshot).mockClear();
  vi.mocked(ref).mockClear().mockReturnValue('storage-ref');
  vi.mocked(uploadBytes).mockClear();
  vi.mocked(getDownloadURL).mockClear();
  vi.mocked(deleteObject).mockClear();
});

describe('eventsRepo', () => {
  it('subscribeToEvents maps snapshot docs to plain event objects with id', () => {
    const handler = vi.fn();
    let capturedCallback;
    vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
      capturedCallback = callback;
      return 'unsubscribe-fn';
    });

    const unsubscribe = subscribeToEvents(handler);
    capturedCallback({
      docs: [
        { id: 'evt-1', data: () => ({ title: 'Dasara' }) },
        { id: 'evt-2', data: () => ({ title: 'Picnic' }) },
      ],
    });

    expect(handler).toHaveBeenCalledWith([
      { id: 'evt-1', title: 'Dasara' },
      { id: 'evt-2', title: 'Picnic' },
    ]);
    expect(unsubscribe).toBe('unsubscribe-fn');
  });

  it('uploadEventImage uploads the file to storage and returns its url and path', async () => {
    vi.mocked(getDownloadURL).mockResolvedValue('https://example.com/photo.jpg');
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    const result = await uploadEventImage('evt-1', file);

    expect(ref).toHaveBeenCalledWith(expect.anything(), 'events/evt-1/photo.jpg');
    expect(uploadBytes).toHaveBeenCalledWith('storage-ref', file);
    expect(result).toEqual({ image: 'https://example.com/photo.jpg', storagePath: 'events/evt-1/photo.jpg' });
  });

  it('createEvent adds a document to the events collection and returns its id', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-evt-id' });

    const id = await createEvent({ title: 'New Event', buttons: [] });

    expect(collection).toHaveBeenCalledWith(expect.anything(), 'events');
    expect(addDoc).toHaveBeenCalledWith(
      'events-collection-ref',
      expect.objectContaining({ title: 'New Event', buttons: [] })
    );
    expect(id).toBe('new-evt-id');
  });

  it('updateEvent updates the given event document', async () => {
    await updateEvent('evt-1', { title: 'Updated' });
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'events', 'evt-1');
    expect(updateDoc).toHaveBeenCalledWith('event-doc-ref', { title: 'Updated' });
  });

  it('deleteEvent deletes the document and its storage image when a storagePath is given', async () => {
    await deleteEvent('evt-1', 'events/evt-1/photo.jpg');
    expect(deleteDoc).toHaveBeenCalledWith('event-doc-ref');
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'events/evt-1/photo.jpg');
    expect(deleteObject).toHaveBeenCalledWith('storage-ref');
  });

  it('deleteEvent skips storage deletion when there is no storagePath', async () => {
    await deleteEvent('evt-1', null);
    expect(deleteDoc).toHaveBeenCalled();
    expect(deleteObject).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/eventsRepo.test.js`
Expected: FAIL with a module-not-found error for `./eventsRepo.js`.

- [ ] **Step 3: Write the implementation**

Create `src/data/eventsRepo.js`:

```js
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase.js';

const EVENTS_COLLECTION = 'events';

export function subscribeToEvents(onChange) {
  return onSnapshot(collection(db, EVENTS_COLLECTION), (snapshot) => {
    const events = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    onChange(events);
  });
}

export async function uploadEventImage(eventId, file) {
  const storagePath = `events/${eventId}/${file.name}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const image = await getDownloadURL(storageRef);
  return { image, storagePath };
}

export async function createEvent(eventData) {
  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
  return docRef.id;
}

export async function updateEvent(eventId, eventData) {
  await updateDoc(doc(db, EVENTS_COLLECTION, eventId), eventData);
}

export async function deleteEvent(eventId, storagePath) {
  await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
  if (storagePath) {
    await deleteObject(ref(storage, storagePath));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/eventsRepo.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/eventsRepo.js src/data/eventsRepo.test.js
git commit -m "Add Firestore/Storage repository for events"
```

---

### Task 5: Gallery category Firestore/Storage repository

**Files:**
- Create: `src/data/galleryRepo.js`
- Test: `src/data/galleryRepo.test.js`

**Interfaces:**
- Consumes: `db`, `storage` from `src/firebase.js` (Task 1).
- Produces:
  - `subscribeToCategories(onChange)` → same pattern as `subscribeToEvents`; category shape `{ id, title, images: [{ url, storagePath }] }`. Used by `Gallery.jsx` (Task 9) and `GalleryAdminTab.jsx` (Task 13).
  - `createCategory(title, files)` → uploads each `File` to Storage, creates the category doc with the resulting `images` array, returns `Promise<string>` (new doc id).
  - `createCategoryFromUrls(title, imageUrls)` → creates a category doc directly from an array of existing URL strings (`storagePath: null` for each), no upload. Used by the seed script (Task 6) to migrate the current hardcoded gallery data without re-uploading it.
  - `renameCategory(categoryId, title)` → `Promise<void>`.
  - `addImagesToCategory(categoryId, files)` → uploads each `File`, appends to the doc's `images` array via `arrayUnion`.
  - `removeImageFromCategory(categoryId, image)` → removes `image` (`{ url, storagePath }`) from the doc's `images` array via `arrayRemove`, and deletes the Storage object if `image.storagePath` is set.
  - `deleteCategory(categoryId, images)` → deletes the category doc and every Storage object referenced in `images` that has a `storagePath`.

- [ ] **Step 1: Write the failing test**

Create `src/data/galleryRepo.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  subscribeToCategories,
  createCategory,
  createCategoryFromUrls,
  renameCategory,
  addImagesToCategory,
  removeImageFromCategory,
  deleteCategory,
} from './galleryRepo.js';

beforeEach(() => {
  vi.mocked(collection).mockClear().mockReturnValue('categories-collection-ref');
  vi.mocked(doc).mockClear().mockReturnValue('category-doc-ref');
  vi.mocked(addDoc).mockClear();
  vi.mocked(updateDoc).mockClear();
  vi.mocked(deleteDoc).mockClear();
  vi.mocked(onSnapshot).mockClear();
  vi.mocked(arrayUnion).mockClear();
  vi.mocked(arrayRemove).mockClear();
  vi.mocked(ref).mockClear().mockReturnValue('storage-ref');
  vi.mocked(uploadBytes).mockClear();
  vi.mocked(getDownloadURL).mockClear();
  vi.mocked(deleteObject).mockClear();
});

describe('galleryRepo', () => {
  it('subscribeToCategories maps snapshot docs to plain category objects with id', () => {
    const handler = vi.fn();
    let capturedCallback;
    vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
      capturedCallback = callback;
      return 'unsubscribe-fn';
    });

    const unsubscribe = subscribeToCategories(handler);
    capturedCallback({
      docs: [{ id: 'cat-1', data: () => ({ title: 'Dasara', images: [] }) }],
    });

    expect(handler).toHaveBeenCalledWith([{ id: 'cat-1', title: 'Dasara', images: [] }]);
    expect(unsubscribe).toBe('unsubscribe-fn');
  });

  it('createCategory uploads every file and creates a doc with the resulting images', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-cat-id' });
    vi.mocked(getDownloadURL)
      .mockResolvedValueOnce('https://example.com/a.jpg')
      .mockResolvedValueOnce('https://example.com/b.jpg');
    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ];

    const id = await createCategory('Picnics', files);

    expect(uploadBytes).toHaveBeenCalledTimes(2);
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', {
      title: 'Picnics',
      images: [
        { url: 'https://example.com/a.jpg', storagePath: 'gallery/new-cat-id/a.jpg' },
        { url: 'https://example.com/b.jpg', storagePath: 'gallery/new-cat-id/b.jpg' },
      ],
    });
    expect(id).toBe('new-cat-id');
  });

  it('createCategoryFromUrls creates a doc directly from existing URLs with no storagePath', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'legacy-cat-id' });

    const id = await createCategoryFromUrls('Dasara 2024', ['https://example.com/x.jpg']);

    expect(uploadBytes).not.toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalledWith('categories-collection-ref', {
      title: 'Dasara 2024',
      images: [{ url: 'https://example.com/x.jpg', storagePath: null }],
    });
    expect(id).toBe('legacy-cat-id');
  });

  it('renameCategory updates the title field', async () => {
    await renameCategory('cat-1', 'New Title');
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'galleryCategories', 'cat-1');
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', { title: 'New Title' });
  });

  it('addImagesToCategory uploads files and appends them with arrayUnion', async () => {
    vi.mocked(getDownloadURL).mockResolvedValue('https://example.com/c.jpg');
    vi.mocked(arrayUnion).mockReturnValue('array-union-result');
    const files = [new File(['c'], 'c.jpg', { type: 'image/jpeg' })];

    await addImagesToCategory('cat-1', files);

    expect(uploadBytes).toHaveBeenCalledTimes(1);
    expect(arrayUnion).toHaveBeenCalledWith({
      url: 'https://example.com/c.jpg',
      storagePath: 'gallery/cat-1/c.jpg',
    });
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', { images: 'array-union-result' });
  });

  it('removeImageFromCategory removes the image and deletes its storage object', async () => {
    vi.mocked(arrayRemove).mockReturnValue('array-remove-result');
    const image = { url: 'https://example.com/c.jpg', storagePath: 'gallery/cat-1/c.jpg' };

    await removeImageFromCategory('cat-1', image);

    expect(arrayRemove).toHaveBeenCalledWith(image);
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', { images: 'array-remove-result' });
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'gallery/cat-1/c.jpg');
    expect(deleteObject).toHaveBeenCalledWith('storage-ref');
  });

  it('deleteCategory deletes the doc and every image with a storagePath', async () => {
    const images = [
      { url: 'https://example.com/a.jpg', storagePath: 'gallery/cat-1/a.jpg' },
      { url: 'https://example.com/b.jpg', storagePath: null },
    ];

    await deleteCategory('cat-1', images);

    expect(deleteDoc).toHaveBeenCalledWith('category-doc-ref');
    expect(deleteObject).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'gallery/cat-1/a.jpg');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/galleryRepo.test.js`
Expected: FAIL with a module-not-found error for `./galleryRepo.js`.

- [ ] **Step 3: Write the implementation**

Create `src/data/galleryRepo.js`:

```js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase.js';

const CATEGORIES_COLLECTION = 'galleryCategories';

export function subscribeToCategories(onChange) {
  return onSnapshot(collection(db, CATEGORIES_COLLECTION), (snapshot) => {
    const categories = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    onChange(categories);
  });
}

async function uploadCategoryImage(categoryId, file) {
  const storagePath = `gallery/${categoryId}/${file.name}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, storagePath };
}

export async function createCategory(title, files) {
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), { title, images: [] });
  const images = [];
  for (const file of files) {
    images.push(await uploadCategoryImage(docRef.id, file));
  }
  await updateDoc(doc(db, CATEGORIES_COLLECTION, docRef.id), { title, images });
  return docRef.id;
}

export async function createCategoryFromUrls(title, imageUrls) {
  const images = imageUrls.map((url) => ({ url, storagePath: null }));
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), { title, images });
  return docRef.id;
}

export async function renameCategory(categoryId, title) {
  await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), { title });
}

export async function addImagesToCategory(categoryId, files) {
  const images = [];
  for (const file of files) {
    images.push(await uploadCategoryImage(categoryId, file));
  }
  await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), { images: arrayUnion(...images) });
}

export async function removeImageFromCategory(categoryId, image) {
  await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), { images: arrayRemove(image) });
  if (image.storagePath) {
    await deleteObject(ref(storage, image.storagePath));
  }
}

export async function deleteCategory(categoryId, images = []) {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
  for (const image of images) {
    if (image.storagePath) {
      await deleteObject(ref(storage, image.storagePath));
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/galleryRepo.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/galleryRepo.js src/data/galleryRepo.test.js
git commit -m "Add Firestore/Storage repository for gallery categories"
```

---

### Task 6: Legacy data seed utility

**Files:**
- Create: `src/utils/seedLegacyData.js`
- Test: `src/utils/seedLegacyData.test.js`

**Interfaces:**
- Consumes: `UPCOMING_EVENTS` (`src/data/upcomingEvents.js`), `PAST_EVENTS` (`src/data/pastEvents.js`), `GALLERY_SECTIONS` (`src/data/gallerySections.js`) — all pre-existing, unmodified. `createEvent` (Task 4). `createCategoryFromUrls` (Task 5).
- Produces: `seedLegacyData()` → `Promise<void>`, called from the "Import Legacy Data" button in `AdminDashboard.jsx` (Task 14).

- [ ] **Step 1: Write the failing test**

Create `src/utils/seedLegacyData.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEvent } from '../data/eventsRepo.js';
import { createCategoryFromUrls } from '../data/galleryRepo.js';
import { UPCOMING_EVENTS } from '../data/upcomingEvents.js';
import { PAST_EVENTS } from '../data/pastEvents.js';
import { GALLERY_SECTIONS } from '../data/gallerySections.js';
import { seedLegacyData } from './seedLegacyData.js';

vi.mock('../data/eventsRepo.js', () => ({ createEvent: vi.fn(() => Promise.resolve('evt-id')) }));
vi.mock('../data/galleryRepo.js', () => ({
  createCategoryFromUrls: vi.fn(() => Promise.resolve('cat-id')),
}));

beforeEach(() => {
  vi.mocked(createEvent).mockClear();
  vi.mocked(createCategoryFromUrls).mockClear();
});

describe('seedLegacyData', () => {
  it('creates one event per upcoming and past legacy event', async () => {
    await seedLegacyData();
    expect(createEvent).toHaveBeenCalledTimes(UPCOMING_EVENTS.length + PAST_EVENTS.length);
  });

  it('creates upcoming events with status "upcoming" and a buttons array from ctaLabel/ctaHref', async () => {
    await seedLegacyData();
    const firstUpcoming = UPCOMING_EVENTS[0];
    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: firstUpcoming.title,
        status: 'upcoming',
        image: firstUpcoming.image,
        storagePath: null,
        buttons: [{ label: firstUpcoming.ctaLabel, url: firstUpcoming.ctaHref }],
      })
    );
  });

  it('creates past events with status "past" and no buttons', async () => {
    await seedLegacyData();
    const firstPast = PAST_EVENTS[0];
    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: firstPast.title,
        status: 'past',
        image: firstPast.image,
        storagePath: null,
        buttons: [],
      })
    );
  });

  it('creates one gallery category per legacy gallery section, from its existing image URLs', async () => {
    await seedLegacyData();
    expect(createCategoryFromUrls).toHaveBeenCalledTimes(GALLERY_SECTIONS.length);
    const firstSection = GALLERY_SECTIONS[0];
    expect(createCategoryFromUrls).toHaveBeenCalledWith(firstSection.title, firstSection.images);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/seedLegacyData.test.js`
Expected: FAIL with a module-not-found error for `./seedLegacyData.js`.

- [ ] **Step 3: Write the implementation**

Create `src/utils/seedLegacyData.js`:

```js
import { UPCOMING_EVENTS } from '../data/upcomingEvents.js';
import { PAST_EVENTS } from '../data/pastEvents.js';
import { GALLERY_SECTIONS } from '../data/gallerySections.js';
import { createEvent } from '../data/eventsRepo.js';
import { createCategoryFromUrls } from '../data/galleryRepo.js';

function toButtons(event) {
  return event.ctaLabel && event.ctaHref ? [{ label: event.ctaLabel, url: event.ctaHref }] : [];
}

function parsePastEventDate(dateString) {
  const [month, dayWithComma, year] = dateString.split(' ');
  return { month, day: dayWithComma.replace(',', ''), year };
}

export async function seedLegacyData() {
  for (const event of UPCOMING_EVENTS) {
    await createEvent({
      title: event.title,
      day: event.day,
      month: event.month,
      year: event.year,
      time: event.time,
      location: event.location,
      image: event.image,
      storagePath: null,
      status: 'upcoming',
      buttons: toButtons(event),
    });
  }

  for (const event of PAST_EVENTS) {
    const { month, day, year } = parsePastEventDate(event.date);
    await createEvent({
      title: event.title,
      day,
      month,
      year,
      time: '',
      location: event.location,
      image: event.image,
      storagePath: null,
      status: 'past',
      buttons: [],
    });
  }

  for (const section of GALLERY_SECTIONS) {
    await createCategoryFromUrls(section.title, section.images);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/seedLegacyData.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/seedLegacyData.js src/utils/seedLegacyData.test.js
git commit -m "Add one-time legacy data seed utility for Firestore migration"
```

---

### Task 7: EventCard — support up to 3 custom buttons

**Files:**
- Modify: `src/components/EventCard.jsx`
- Modify: `src/components/EventCard.css`
- Modify: `src/components/EventCard.test.jsx`

**Interfaces:**
- Consumes: `event.buttons` — array of 0–3 `{ label, url }` objects (replaces the old single `ctaLabel`/`ctaHref` props). `event.image` (unchanged field name).
- Produces: renders each button as a link stacked vertically under the event details; renders nothing in that slot when `buttons` is empty/undefined. Consumed by `Events.jsx` (Task 8).

- [ ] **Step 1: Update the test to the new `buttons` shape and expect a stacked, capped list**

Replace `src/components/EventCard.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/EventCard.test.jsx`
Expected: FAIL — the "renders up to 3 buttons" test fails because `EventCard` still renders a single `ctaLabel`/`ctaHref` link, not `event.buttons`.

- [ ] **Step 3: Update the implementation**

Replace `src/components/EventCard.jsx`:

```jsx
import { motion } from 'framer-motion';
import './EventCard.css';

function EventCard({ event, index = 0 }) {
  return (
    <motion.div
      className="event-card"
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.15 }}
    >
      <div className="event-card__image-wrap">
        <img src={event.image} alt={event.title} className="event-card__image" loading="lazy" />
        <div className="event-card__image-scrim" />
        <h3 className="event-card__image-title">{event.title}</h3>
      </div>
      <div className="event-card__body">
        <div className="event-card__date">
          <span className="event-card__day">{event.day}</span>
          <span className="event-card__month">{event.month}</span>
          <span className="event-card__year">{event.year}</span>
        </div>
        <div className="event-card__details">
          <p className="event-card__time">{event.time}</p>
          <p className="event-card__label">Location</p>
          <p className="event-card__location">{event.location}</p>
          {event.buttons && event.buttons.length > 0 && (
            <div className="event-card__buttons">
              {event.buttons.map((button) => (
                <a
                  key={button.url}
                  className="event-card__cta"
                  href={button.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {button.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default EventCard;
```

- [ ] **Step 4: Update the CSS for a stacked button list**

In `src/components/EventCard.css`, replace the `.event-card__cta` and `.event-card__cta:hover` rules with:

```css
.event-card__buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.event-card__cta {
  display: inline-block;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: var(--color-orange-dark);
  text-decoration: none;
  font-weight: 700;
  padding: 11px 26px;
  border-radius: 999px;
  transition: background 0.2s, transform 0.2s;
}

.event-card__cta:hover {
  background: var(--color-orange);
  color: var(--color-text-light);
  transform: translateY(-1px);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/EventCard.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/EventCard.jsx src/components/EventCard.css src/components/EventCard.test.jsx
git commit -m "EventCard: support up to 3 stacked custom buttons"
```

---

### Task 8: Events page — live Firestore data

**Files:**
- Modify: `src/pages/Events.jsx`
- Create: `src/pages/Events.test.jsx`

**Interfaces:**
- Consumes: `subscribeToEvents` from `src/data/eventsRepo.js` (Task 4). `EventCard` (Task 7, expects `event.buttons`). `PastEventCard` (unchanged, expects `event.image`, `event.date`, `event.title`, `event.location`).
- Produces: `Events` page component, unchanged public export, now data-driven. No other file consumes this directly (routed from `App.jsx`, Task 14).

- [ ] **Step 1: Write the failing test**

Create `src/pages/Events.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Events from './Events.jsx';

function snapshotFrom(events) {
  return { docs: events.map(({ id, ...data }) => ({ id, data: () => data })) };
}

function renderEvents() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Events />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Events page', () => {
  it('splits live events into upcoming and past sections by status', () => {
    vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
      callback(
        snapshotFrom([
          {
            id: 'evt-1',
            title: 'Dasara Mahotsava 2025',
            day: '27',
            month: 'September',
            year: '2025',
            time: '2pm-7pm',
            location: 'Franklin Junior High',
            image: 'https://example.com/dasara.jpg',
            status: 'upcoming',
            buttons: [{ label: 'Tickets', url: 'https://example.com/tickets' }],
          },
          {
            id: 'evt-2',
            title: 'Clay Ganesha Workshop',
            day: '23',
            month: 'August',
            year: '2025',
            time: '',
            location: 'Urbandale Library, IA',
            image: 'https://example.com/ganesha.jpg',
            status: 'past',
            buttons: [],
          },
        ])
      );
      return () => {};
    });

    renderEvents();

    expect(screen.getByRole('heading', { name: 'Up-Coming Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dasara Mahotsava 2025' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tickets' })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Past Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Clay Ganesha Workshop' })).toBeInTheDocument();
    expect(screen.getByText('August 23, 2025')).toBeInTheDocument();
  });

  it('renders empty sections gracefully when there are no events yet', () => {
    vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
      callback(snapshotFrom([]));
      return () => {};
    });

    renderEvents();

    expect(screen.getByRole('heading', { name: 'Up-Coming Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Past Events' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Events.test.jsx`
Expected: FAIL — `Events.jsx` still imports the static `UPCOMING_EVENTS`/`PAST_EVENTS` arrays, so it never calls `onSnapshot`, and the mocked events never appear.

- [ ] **Step 3: Update the implementation**

Replace `src/pages/Events.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import EventCard from '../components/EventCard.jsx';
import SponsorshipSection from '../components/SponsorshipSection.jsx';
import PastEventCard from '../components/PastEventCard.jsx';
import { subscribeToEvents } from '../data/eventsRepo.js';
import './Events.css';

function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => subscribeToEvents(setEvents), []);

  const upcomingEvents = events.filter((event) => event.status === 'upcoming');
  const pastEvents = events.filter((event) => event.status === 'past');

  return (
    <Layout>
      <section className="events-page__section events-page__section--upcoming">
        <KolamPattern />
        <div className="events-page__inner">
          <motion.h1
            className="events-page__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Up-Coming Events
          </motion.h1>
          <div className="events-page__upcoming-list">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      </section>

      <SponsorshipSection />

      <section className="events-page__section">
        <KolamPattern />
        <div className="events-page__inner">
          <motion.h2
            className="events-page__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Past Events
          </motion.h2>
          <p className="events-page__subheading">
            Here are events that have previously been held.
          </p>
          <div className="events-page__past-list">
            {pastEvents.map((event, index) => (
              <PastEventCard
                key={event.id}
                event={{ ...event, date: `${event.month} ${event.day}, ${event.year}` }}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Events;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/Events.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Events.jsx src/pages/Events.test.jsx
git commit -m "Events page: read live data from Firestore instead of static files"
```

---

### Task 9: Gallery page — live Firestore data

**Files:**
- Modify: `src/pages/Gallery.jsx`
- Modify: `src/pages/Gallery.test.jsx`

**Interfaces:**
- Consumes: `subscribeToCategories` from `src/data/galleryRepo.js` (Task 5). `GalleryLightbox` (unchanged, expects `images` = array of URL strings).
- Produces: `Gallery` page component, unchanged public export, now data-driven; category `images` field is now an array of `{ url, storagePath }` objects instead of raw URL strings, so every place that read `images[i]` as a URL now reads `images[i].url`.

- [ ] **Step 1: Update the test to mock live category data instead of the static file**

Replace `src/pages/Gallery.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Gallery from './Gallery.jsx';

const CATEGORIES = [
  {
    id: 'community-service',
    title: 'Community Service',
    images: Array.from({ length: 12 }, (_, i) => ({ url: `https://example.com/cs-${i}.jpg`, storagePath: null })),
  },
  {
    id: 'mks-rajyotsava',
    title: 'MKS Rajyotsava',
    images: Array.from({ length: 5 }, (_, i) => ({ url: `https://example.com/raj-${i}.jpg`, storagePath: null })),
  },
];

function snapshotFrom(categories) {
  return { docs: categories.map(({ id, ...data }) => ({ id, data: () => data })) };
}

function renderGallery() {
  vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
    callback(snapshotFrom(CATEGORIES));
    return () => {};
  });
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Gallery />
      </AuthProvider>
    </MemoryRouter>
  );
}

function bentoGrid(container) {
  return container.querySelector('.gallery-bento');
}

describe('Gallery', () => {
  it("renders a cover tile for every category using each category's first image", () => {
    renderGallery();
    CATEGORIES.forEach((category) => {
      const tile = screen.getByRole('button', { name: category.title });
      const img = within(tile).getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('src', category.images[0].url);
    });
  });

  it('opens a category into its own bento grid and can navigate back', () => {
    const { container } = renderGallery();

    fireEvent.click(screen.getByRole('button', { name: 'MKS Rajyotsava' }));

    expect(screen.getByRole('heading', { name: 'MKS Rajyotsava' })).toBeInTheDocument();
    const category = CATEGORIES.find((entry) => entry.id === 'mks-rajyotsava');
    expect(within(bentoGrid(container)).getAllByRole('img')).toHaveLength(category.images.length);

    fireEvent.click(screen.getByRole('button', { name: /Back to Gallery/ }));
    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument();
  });

  it('opens the lightbox when an image in a category is clicked and steps through images', () => {
    const { container } = renderGallery();

    fireEvent.click(screen.getByRole('button', { name: 'Community Service' }));
    const images = within(bentoGrid(container)).getAllByRole('img');
    fireEvent.click(images[0]);

    expect(screen.getByText('1 / 12')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(screen.getByText('2 / 12')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(screen.getByText('1 / 12')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('1 / 12')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Gallery.test.jsx`
Expected: FAIL — `Gallery.jsx` still imports the static `GALLERY_SECTIONS` array, so it never calls `onSnapshot` and the mocked categories never appear.

- [ ] **Step 3: Update the implementation**

Replace `src/pages/Gallery.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import GalleryLightbox from '../components/GalleryLightbox.jsx';
import { subscribeToCategories } from '../data/galleryRepo.js';
import './Gallery.css';

function bentoSize(index) {
  const spot = index % 7;
  if (spot === 0) return 'large';
  if (spot === 3) return 'wide';
  return null;
}

function bentoClass(size) {
  return `gallery-bento__item${size ? ` gallery-bento__item--${size}` : ''}`;
}

function Gallery() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => subscribeToCategories(setCategories), []);

  const category = categories.find((entry) => entry.id === categoryId) ?? null;

  function openCategory(id) {
    setCategoryId(id);
    setLightboxIndex(null);
  }

  function closeCategory() {
    setCategoryId(null);
    setLightboxIndex(null);
  }

  function showPrev() {
    setLightboxIndex((current) => (current - 1 + category.images.length) % category.images.length);
  }

  function showNext() {
    setLightboxIndex((current) => (current + 1) % category.images.length);
  }

  return (
    <Layout>
      <section className="gallery-page">
        <KolamPattern />
        <div className="gallery-page__inner">
          {!category ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <h1 className="gallery-page__heading">Gallery</h1>
              <div className="gallery-bento">
                {categories.map((entry, index) => (
                  <button
                    type="button"
                    key={entry.id}
                    className={bentoClass(bentoSize(index))}
                    onClick={() => openCategory(entry.id)}
                    aria-label={entry.title}
                  >
                    <img src={entry.images[0]?.url} alt={entry.title} loading="lazy" />
                    <div className="gallery-bento__scrim" />
                    <h2 className="gallery-bento__title" aria-hidden="true">
                      {entry.title}
                    </h2>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <button type="button" className="gallery-page__back" onClick={closeCategory}>
                &#8592; Back to Gallery
              </button>
              <h1 className="gallery-page__heading">{category.title}</h1>
              <div className="gallery-bento">
                {category.images.map((image, index) => (
                  <button
                    type="button"
                    key={image.url}
                    className={bentoClass(bentoSize(index))}
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img src={image.url} alt={`${category.title} photo ${index + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {category && lightboxIndex !== null && (
        <GalleryLightbox
          images={category.images.map((image) => image.url)}
          index={lightboxIndex}
          title={category.title}
          onClose={() => setLightboxIndex(null)}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}
    </Layout>
  );
}

export default Gallery;
```

Note this drops the old `OVERVIEW_SIZES` constant (fixed sizing for exactly 5 hardcoded sections) in favor of reusing the same `bentoSize(index)` function used inside a category, since the number of categories is now dynamic.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/Gallery.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Gallery.jsx src/pages/Gallery.test.jsx
git commit -m "Gallery page: read live categories from Firestore instead of static files"
```

---

### Task 10: Footer — Admin Sign In / Dashboard link

**Files:**
- Modify: `src/components/Footer.jsx`
- Modify: `src/components/Footer.css`
- Modify: `src/components/Footer.test.jsx`

**Interfaces:**
- Consumes: `useAuth()` from `src/auth/AuthContext.jsx` (Task 2).
- Produces: no new exports; visual/behavioral change only (adds an admin link to the footer).

- [ ] **Step 1: Update the test for the new admin link**

Modify `src/components/Footer.test.jsx` — add the `AuthProvider` wrapper and a new test:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Footer from './Footer.jsx';

function renderFooter() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Footer />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Footer', () => {
  it('renders a wave divider svg', () => {
    const { container } = renderFooter();
    expect(container.querySelector('.wave-divider svg')).toBeInTheDocument();
  });

  it('renders all six nav links', () => {
    renderFooter();
    ['Home', 'Events', 'Gallery', 'Our Culture and Values', 'Team', 'Contact'].forEach(
      (label) => {
        expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
      }
    );
  });

  it('renders the association name, location, email, and non-profit line', () => {
    renderFooter();
    expect(
      screen.getByText(
        (_, element) => element.tagName === 'P' && element.textContent === 'Mayura Kannada Sangha'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Central Iowa')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'mksdsm2024@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:mksdsm2024@gmail.com'
    );
    expect(
      screen.getByText('A Registered, Non-Profit, Tax-Exempt 501(C)(3) Organization')
    ).toBeInTheDocument();
  });

  it('renders an Instagram follow link that opens in a new tab', () => {
    renderFooter();
    const link = screen.getByRole('link', { name: /follow us on instagram/i });
    expect(link).toHaveAttribute('href', 'https://www.instagram.com/MayuraKannadaSangha/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows an Admin Sign In link when logged out', () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });
    renderFooter();
    expect(screen.getByRole('link', { name: 'Admin Sign In' })).toHaveAttribute('href', '/admin/login');
    expect(screen.queryByRole('link', { name: 'Admin Dashboard' })).not.toBeInTheDocument();
  });

  it('shows an Admin Dashboard link and Log Out button when logged in', () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback({ email: 'admin@mayurakannadasangha.org' });
      return () => {};
    });
    renderFooter();
    expect(screen.getByRole('link', { name: 'Admin Dashboard' })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('button', { name: 'Log Out' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Footer.test.jsx`
Expected: FAIL — the two new "Admin" tests fail because `Footer.jsx` doesn't render an admin link yet; the earlier tests fail too, since `Footer` doesn't yet call `useAuth()` and so isn't affected by missing `AuthProvider` — they should still PASS unless `useAuth` is added prematurely. After Step 3 they must all PASS together.

- [ ] **Step 3: Update the implementation**

Replace `src/components/Footer.jsx`:

```jsx
import { Link } from 'react-router-dom';
import WaveDividerLayers from './WaveDividerLayers.jsx';
import { NAV_LINKS } from '../data/navLinks.js';
import { useAuth } from '../auth/AuthContext.jsx';
import './Footer.css';

const INSTAGRAM_URL = 'https://www.instagram.com/MayuraKannadaSangha/';

function Footer() {
  const { currentUser, logout } = useAuth();

  return (
    <footer className="footer">
      <WaveDividerLayers fill="var(--color-orange)" />
      <div className="footer__content">
        <ul className="footer__links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="footer__link">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="footer__name">
          <span className="mks-highlight">M</span>ayura{' '}
          <span className="mks-highlight">K</span>annada{' '}
          <span className="mks-highlight">S</span>angha
        </p>
        <p className="footer__location">Central Iowa</p>
        <a className="footer__email" href="mailto:mksdsm2024@gmail.com">
          mksdsm2024@gmail.com
        </a>
        <p className="footer__nonprofit">
          A Registered, Non-Profit, Tax-Exempt 501(C)(3) Organization
        </p>

        <a
          className="footer__instagram"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            className="footer__instagram-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
          </svg>
          Follow us on Instagram
        </a>

        <div className="footer__admin">
          {currentUser ? (
            <>
              <Link to="/admin" className="footer__admin-link">
                Admin Dashboard
              </Link>
              <button type="button" className="footer__admin-link" onClick={logout}>
                Log Out
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="footer__admin-link">
              Admin Sign In
            </Link>
          )}
        </div>

        <p className="footer__copyright">
          © {new Date().getFullYear()} Mayura Kannada Sangha, Central Iowa
        </p>
      </div>
    </footer>
  );
}

export default Footer;
```

- [ ] **Step 4: Add footer admin link styles**

Append to `src/components/Footer.css`:

```css
.footer__admin {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.footer__admin-link {
  background: none;
  border: none;
  color: var(--color-text-light);
  opacity: 0.7;
  font-size: 0.75rem;
  text-decoration: underline;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

.footer__admin-link:hover {
  opacity: 1;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/Footer.test.jsx`
Expected: PASS (6 tests).

- [ ] **Step 6: Update `Layout.test.jsx` to wrap with `AuthProvider`**

`src/components/Layout.jsx` renders `Footer`, which now calls `useAuth()`, so `Layout.test.jsx` needs an `AuthProvider` in its tree. Replace `src/components/Layout.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Layout from './Layout.jsx';

describe('Layout', () => {
  it('renders nav, children, and footer', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Layout>
            <div>page content</div>
          </Layout>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByAltText('Mayura Kannada Sangha logo')).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) => element.tagName === 'P' && element.textContent === 'Mayura Kannada Sangha'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/© \d{4} Mayura Kannada Sangha, Central Iowa/)).toBeInTheDocument();
  });
});
```

Run: `npx vitest run src/components/Layout.test.jsx`
Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git add src/components/Footer.jsx src/components/Footer.css src/components/Footer.test.jsx src/components/Layout.test.jsx
git commit -m "Footer: add Admin Sign In / Dashboard link"
```

---

### Task 11: Admin Login page

**Files:**
- Create: `src/pages/AdminLogin.jsx`
- Create: `src/pages/AdminLogin.css`
- Create: `src/pages/AdminLogin.test.jsx`

**Interfaces:**
- Consumes: `useAuth()` from `src/auth/AuthContext.jsx` (Task 2), specifically `login(username, password)`. `useNavigate` from `react-router-dom`.
- Produces: `AdminLogin` page component. Routed at `/admin/login` in `App.jsx` (Task 14).

- [ ] **Step 1: Write the failing test**

Create `src/pages/AdminLogin.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLogin from './AdminLogin.jsx';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../auth/AuthContext.jsx', () => ({ useAuth: () => ({ login: mockLogin }) }));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <AdminLogin />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockLogin.mockReset();
  mockNavigate.mockReset();
});

describe('AdminLogin', () => {
  it('renders a simple username/password form', () => {
    renderLogin();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('logs in and redirects to /admin on success', async () => {
    mockLogin.mockResolvedValue();
    renderLogin();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'Admin' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('Admin', 'secret123'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin'));
  });

  it('shows an error message and does not navigate when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid username or password'));
    renderLogin();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'nope' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() =>
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument()
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/AdminLogin.test.jsx`
Expected: FAIL with a module-not-found error for `./AdminLogin.jsx`.

- [ ] **Step 3: Write the implementation**

Create `src/pages/AdminLogin.jsx`:

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import './AdminLogin.css';

function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch {
      setError('Invalid username or password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__form" onSubmit={handleSubmit}>
        <h1>Admin Sign In</h1>

        <label htmlFor="admin-username">Username</label>
        <input
          id="admin-username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />

        {error && <p className="admin-login__error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
```

- [ ] **Step 4: Add minimal, plain styling**

Create `src/pages/AdminLogin.css`:

```css
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f2f2;
  font-family: system-ui, sans-serif;
}

.admin-login__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 280px;
  padding: 24px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.admin-login__form h1 {
  font-size: 1.1rem;
  margin: 0 0 12px;
}

.admin-login__form label {
  font-size: 0.85rem;
}

.admin-login__form input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.admin-login__form button {
  margin-top: 12px;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background: #333;
  color: #fff;
  cursor: pointer;
}

.admin-login__error {
  color: #b00020;
  font-size: 0.85rem;
  margin: 4px 0 0;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/pages/AdminLogin.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/pages/AdminLogin.jsx src/pages/AdminLogin.css src/pages/AdminLogin.test.jsx
git commit -m "Add plain admin login page"
```

---

### Task 12: Events admin tab (list, add/edit form with up to 3 buttons, delete)

**Files:**
- Create: `src/components/admin/EventsAdminTab.jsx`
- Create: `src/components/admin/EventsAdminTab.css`
- Create: `src/components/admin/EventsAdminTab.test.jsx`

**Interfaces:**
- Consumes: `subscribeToEvents`, `createEvent`, `updateEvent`, `deleteEvent`, `uploadEventImage` from `src/data/eventsRepo.js` (Task 4).
- Produces: `EventsAdminTab` component (no props). Rendered by `AdminDashboard.jsx` (Task 14).

- [ ] **Step 1: Write the failing test**

Create `src/components/admin/EventsAdminTab.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/admin/EventsAdminTab.test.jsx`
Expected: FAIL with a module-not-found error for `./EventsAdminTab.jsx`.

- [ ] **Step 3: Write the implementation**

Create `src/components/admin/EventsAdminTab.jsx`:

```jsx
import { useEffect, useState } from 'react';
import {
  subscribeToEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
} from '../../data/eventsRepo.js';
import './EventsAdminTab.css';

const EMPTY_FORM = {
  title: '',
  day: '',
  month: '',
  year: '',
  time: '',
  location: '',
  status: 'upcoming',
  image: '',
  storagePath: null,
  buttons: [],
};

function EventsAdminTab() {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeToEvents(setEvents), []);

  function startAdd() {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(event) {
    setForm({
      title: event.title ?? '',
      day: event.day ?? '',
      month: event.month ?? '',
      year: event.year ?? '',
      time: event.time ?? '',
      location: event.location ?? '',
      status: event.status ?? 'upcoming',
      image: event.image ?? '',
      storagePath: event.storagePath ?? null,
      buttons: event.buttons ?? [],
    });
    setImageFile(null);
    setEditingId(event.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateButton(index, field, value) {
    setForm((current) => ({
      ...current,
      buttons: current.buttons.map((button, i) =>
        i === index ? { ...button, [field]: value } : button
      ),
    }));
  }

  function addButton() {
    setForm((current) =>
      current.buttons.length >= 3
        ? current
        : { ...current, buttons: [...current.buttons, { label: '', url: '' }] }
    );
  }

  function removeButton(index) {
    setForm((current) => ({
      ...current,
      buttons: current.buttons.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const buttons = form.buttons.filter((button) => button.label && button.url);
      const baseFields = {
        title: form.title,
        day: form.day,
        month: form.month,
        year: form.year,
        time: form.time,
        location: form.location,
        status: form.status,
        buttons,
      };

      if (editingId) {
        let imageFields = { image: form.image, storagePath: form.storagePath };
        if (imageFile) {
          imageFields = await uploadEventImage(editingId, imageFile);
        }
        await updateEvent(editingId, { ...baseFields, ...imageFields });
      } else {
        const newId = await createEvent({ ...baseFields, image: '', storagePath: null });
        if (imageFile) {
          const imageFields = await uploadEventImage(newId, imageFile);
          await updateEvent(newId, imageFields);
        }
      }

      setShowForm(false);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event) {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    await deleteEvent(event.id, event.storagePath);
  }

  return (
    <div className="events-admin">
      <button type="button" className="events-admin__add" onClick={startAdd}>
        Add Event
      </button>

      <ul className="events-admin__list">
        {events.map((event) => (
          <li key={event.id} className="events-admin__row">
            <span className="events-admin__title">{event.title}</span>
            <span className="events-admin__status">{event.status}</span>
            <button type="button" onClick={() => startEdit(event)}>
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(event)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {showForm && (
        <form className="events-admin__form" onSubmit={handleSubmit}>
          <label htmlFor="event-title">Title</label>
          <input
            id="event-title"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
          />

          <label htmlFor="event-day">Day</label>
          <input
            id="event-day"
            value={form.day}
            onChange={(event) => updateField('day', event.target.value)}
            required
          />

          <label htmlFor="event-month">Month</label>
          <input
            id="event-month"
            value={form.month}
            onChange={(event) => updateField('month', event.target.value)}
            required
          />

          <label htmlFor="event-year">Year</label>
          <input
            id="event-year"
            value={form.year}
            onChange={(event) => updateField('year', event.target.value)}
            required
          />

          <label htmlFor="event-time">Time</label>
          <input
            id="event-time"
            value={form.time}
            onChange={(event) => updateField('time', event.target.value)}
          />

          <label htmlFor="event-location">Location</label>
          <input
            id="event-location"
            value={form.location}
            onChange={(event) => updateField('location', event.target.value)}
            required
          />

          <label htmlFor="event-status">Status</label>
          <select
            id="event-status"
            value={form.status}
            onChange={(event) => updateField('status', event.target.value)}
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>

          <label htmlFor="event-image">Image</label>
          <input
            id="event-image"
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files[0] ?? null)}
          />

          <fieldset className="events-admin__buttons">
            <legend>Buttons (up to 3)</legend>
            {form.buttons.map((button, index) => (
              <div key={index} className="events-admin__button-row">
                <input
                  aria-label={`Button ${index + 1} label`}
                  placeholder="Label"
                  value={button.label}
                  onChange={(event) => updateButton(index, 'label', event.target.value)}
                />
                <input
                  aria-label={`Button ${index + 1} URL`}
                  placeholder="URL"
                  value={button.url}
                  onChange={(event) => updateButton(index, 'url', event.target.value)}
                />
                <button type="button" onClick={() => removeButton(index)}>
                  Remove
                </button>
              </div>
            ))}
            {form.buttons.length < 3 && (
              <button type="button" onClick={addButton}>
                Add Button
              </button>
            )}
          </fieldset>

          <div className="events-admin__form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={cancelForm}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default EventsAdminTab;
```

- [ ] **Step 4: Add minimal, functional styling**

Create `src/components/admin/EventsAdminTab.css`:

```css
.events-admin {
  font-family: system-ui, sans-serif;
}

.events-admin__add {
  margin-bottom: 16px;
  padding: 8px 16px;
  cursor: pointer;
}

.events-admin__list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
}

.events-admin__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.events-admin__title {
  flex: 1;
  font-weight: 600;
}

.events-admin__status {
  text-transform: capitalize;
  color: #666;
  font-size: 0.85rem;
}

.events-admin__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 420px;
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.events-admin__form label {
  font-size: 0.85rem;
  font-weight: 600;
}

.events-admin__form input,
.events-admin__form select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.events-admin__buttons {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
}

.events-admin__button-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.events-admin__form-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/admin/EventsAdminTab.test.jsx`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/EventsAdminTab.jsx src/components/admin/EventsAdminTab.css src/components/admin/EventsAdminTab.test.jsx
git commit -m "Add events admin tab: list, add/edit with up to 3 buttons, delete"
```

---

### Task 13: Gallery admin tab (categories list, add/edit/delete, image upload)

**Files:**
- Create: `src/components/admin/GalleryAdminTab.jsx`
- Create: `src/components/admin/GalleryAdminTab.css`
- Create: `src/components/admin/GalleryAdminTab.test.jsx`

**Interfaces:**
- Consumes: `subscribeToCategories`, `createCategory`, `renameCategory`, `addImagesToCategory`, `removeImageFromCategory`, `deleteCategory` from `src/data/galleryRepo.js` (Task 5).
- Produces: `GalleryAdminTab` component (no props). Rendered by `AdminDashboard.jsx` (Task 14).

- [ ] **Step 1: Write the failing test**

Create `src/components/admin/GalleryAdminTab.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  subscribeToCategories,
  createCategory,
  renameCategory,
  addImagesToCategory,
  removeImageFromCategory,
  deleteCategory,
} from '../../data/galleryRepo.js';
import GalleryAdminTab from './GalleryAdminTab.jsx';

vi.mock('../../data/galleryRepo.js', () => ({
  subscribeToCategories: vi.fn(() => () => {}),
  createCategory: vi.fn(() => Promise.resolve('new-cat-id')),
  renameCategory: vi.fn(() => Promise.resolve()),
  addImagesToCategory: vi.fn(() => Promise.resolve()),
  removeImageFromCategory: vi.fn(() => Promise.resolve()),
  deleteCategory: vi.fn(() => Promise.resolve()),
}));

const SAMPLE_CATEGORY = {
  id: 'cat-1',
  title: 'Community Service',
  images: [
    { url: 'https://example.com/a.jpg', storagePath: 'gallery/cat-1/a.jpg' },
    { url: 'https://example.com/b.jpg', storagePath: 'gallery/cat-1/b.jpg' },
  ],
};

beforeEach(() => {
  vi.mocked(subscribeToCategories).mockClear().mockImplementation((onChange) => {
    onChange([SAMPLE_CATEGORY]);
    return () => {};
  });
  vi.mocked(createCategory).mockClear().mockResolvedValue('new-cat-id');
  vi.mocked(renameCategory).mockClear().mockResolvedValue();
  vi.mocked(addImagesToCategory).mockClear().mockResolvedValue();
  vi.mocked(removeImageFromCategory).mockClear().mockResolvedValue();
  vi.mocked(deleteCategory).mockClear().mockResolvedValue();
  window.confirm = vi.fn(() => true);
});

describe('GalleryAdminTab', () => {
  it('lists categories with their image counts', () => {
    render(<GalleryAdminTab />);
    expect(screen.getByText('Community Service')).toBeInTheDocument();
    expect(screen.getByText('2 images')).toBeInTheDocument();
  });

  it('creates a category with a title and uploaded files', async () => {
    render(<GalleryAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Category' }));

    fireEvent.change(screen.getByLabelText('Category Title'), { target: { value: 'Picnics' } });
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Images'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(createCategory).toHaveBeenCalledWith('Picnics', [file]));
  });

  it('renames a category from the edit view', async () => {
    render(<GalleryAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    fireEvent.change(screen.getByLabelText('Rename'), { target: { value: 'Community Outreach' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Name' }));

    await waitFor(() => expect(renameCategory).toHaveBeenCalledWith('cat-1', 'Community Outreach'));
  });

  it('removes an image from the edit view after confirmation', async () => {
    render(<GalleryAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const [firstRemove] = screen.getAllByRole('button', { name: 'Remove' });
    fireEvent.click(firstRemove);

    await waitFor(() =>
      expect(removeImageFromCategory).toHaveBeenCalledWith('cat-1', SAMPLE_CATEGORY.images[0])
    );
  });

  it('deletes a category after confirmation', async () => {
    render(<GalleryAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(deleteCategory).toHaveBeenCalledWith('cat-1', SAMPLE_CATEGORY.images)
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/admin/GalleryAdminTab.test.jsx`
Expected: FAIL with a module-not-found error for `./GalleryAdminTab.jsx`.

- [ ] **Step 3: Write the implementation**

Create `src/components/admin/GalleryAdminTab.jsx`:

```jsx
import { useEffect, useState } from 'react';
import {
  subscribeToCategories,
  createCategory,
  renameCategory,
  addImagesToCategory,
  removeImageFromCategory,
  deleteCategory,
} from '../../data/galleryRepo.js';
import './GalleryAdminTab.css';

function GalleryAdminTab() {
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [addFiles, setAddFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeToCategories(setCategories), []);

  async function handleAddCategory(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await createCategory(newTitle, newFiles);
      setNewTitle('');
      setNewFiles([]);
      setShowAddForm(false);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setRenameValue(category.title);
    setAddFiles([]);
  }

  async function handleRename(category) {
    if (renameValue !== category.title) {
      await renameCategory(category.id, renameValue);
    }
  }

  async function handleAddImages(category) {
    if (addFiles.length === 0) return;
    setSaving(true);
    try {
      await addImagesToCategory(category.id, addFiles);
      setAddFiles([]);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveImage(category, image) {
    if (!window.confirm('Remove this image?')) return;
    await removeImageFromCategory(category.id, image);
  }

  async function handleDeleteCategory(category) {
    if (!window.confirm(`Delete the "${category.title}" category and all its images?`)) return;
    await deleteCategory(category.id, category.images);
    setEditingId(null);
  }

  const editingCategory = categories.find((category) => category.id === editingId) ?? null;

  return (
    <div className="gallery-admin">
      <button type="button" onClick={() => setShowAddForm((current) => !current)}>
        Add Category
      </button>

      {showAddForm && (
        <form className="gallery-admin__add-form" onSubmit={handleAddCategory}>
          <label htmlFor="category-title">Category Title</label>
          <input
            id="category-title"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            required
          />
          <label htmlFor="category-images">Images</label>
          <input
            id="category-images"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setNewFiles(Array.from(event.target.files))}
          />
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Create'}
          </button>
        </form>
      )}

      <ul className="gallery-admin__list">
        {categories.map((category) => (
          <li key={category.id} className="gallery-admin__row">
            <span className="gallery-admin__title">{category.title}</span>
            <span className="gallery-admin__count">{category.images?.length ?? 0} images</span>
            <button type="button" onClick={() => startEdit(category)}>
              Edit
            </button>
            <button type="button" onClick={() => handleDeleteCategory(category)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {editingCategory && (
        <div className="gallery-admin__editor">
          <label htmlFor="rename-category">Rename</label>
          <input
            id="rename-category"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
          />
          <button type="button" onClick={() => handleRename(editingCategory)}>
            Save Name
          </button>

          <div className="gallery-admin__images">
            {editingCategory.images?.map((image) => (
              <div key={image.url} className="gallery-admin__image">
                <img src={image.url} alt="" />
                <button type="button" onClick={() => handleRemoveImage(editingCategory, image)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <label htmlFor="add-images">Add Images</label>
          <input
            id="add-images"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setAddFiles(Array.from(event.target.files))}
          />
          <button type="button" onClick={() => handleAddImages(editingCategory)} disabled={saving}>
            {saving ? 'Uploading…' : 'Upload'}
          </button>

          <button type="button" onClick={() => setEditingId(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default GalleryAdminTab;
```

- [ ] **Step 4: Add minimal, functional styling**

Create `src/components/admin/GalleryAdminTab.css`:

```css
.gallery-admin {
  font-family: system-ui, sans-serif;
}

.gallery-admin__add-form,
.gallery-admin__editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 420px;
  padding: 16px;
  margin: 16px 0;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.gallery-admin__list {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.gallery-admin__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.gallery-admin__title {
  flex: 1;
  font-weight: 600;
}

.gallery-admin__count {
  color: #666;
  font-size: 0.85rem;
}

.gallery-admin__images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gallery-admin__image {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.gallery-admin__image img {
  width: 96px;
  height: 72px;
  object-fit: cover;
  border-radius: 4px;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/admin/GalleryAdminTab.test.jsx`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/GalleryAdminTab.jsx src/components/admin/GalleryAdminTab.css src/components/admin/GalleryAdminTab.test.jsx
git commit -m "Add gallery admin tab: categories, add/edit/delete, image upload"
```

---

### Task 14: Admin Dashboard shell (Events/Gallery tabs, legacy data import)

**Files:**
- Create: `src/pages/AdminDashboard.jsx`
- Create: `src/pages/AdminDashboard.css`
- Create: `src/pages/AdminDashboard.test.jsx`

**Interfaces:**
- Consumes: `useAuth()` (Task 2), `EventsAdminTab` (Task 12), `GalleryAdminTab` (Task 13), `seedLegacyData` (Task 6).
- Produces: `AdminDashboard` page component. Routed at `/admin` (behind `ProtectedRoute`) in `App.jsx` by Task 18.

- [ ] **Step 1: Write the failing test for AdminDashboard**

Create `src/pages/AdminDashboard.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { seedLegacyData } from '../utils/seedLegacyData.js';
import AdminDashboard from './AdminDashboard.jsx';

const mockLogout = vi.fn();

vi.mock('../auth/AuthContext.jsx', () => ({ useAuth: () => ({ logout: mockLogout }) }));
vi.mock('../utils/seedLegacyData.js', () => ({ seedLegacyData: vi.fn(() => Promise.resolve()) }));
vi.mock('../components/admin/EventsAdminTab.jsx', () => ({
  default: () => <div>Events Tab Content</div>,
}));
vi.mock('../components/admin/GalleryAdminTab.jsx', () => ({
  default: () => <div>Gallery Tab Content</div>,
}));

beforeEach(() => {
  mockLogout.mockClear();
  vi.mocked(seedLegacyData).mockClear().mockResolvedValue();
  window.confirm = vi.fn(() => true);
});

describe('AdminDashboard', () => {
  it('shows the Events tab by default', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Events Tab Content')).toBeInTheDocument();
  });

  it('switches to the Gallery tab', () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Gallery' }));
    expect(screen.getByText('Gallery Tab Content')).toBeInTheDocument();
    expect(screen.queryByText('Events Tab Content')).not.toBeInTheDocument();
  });

  it('logs out when Log Out is clicked', () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('imports legacy data after confirmation', async () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Import Legacy Data (one-time)' }));

    await waitFor(() => expect(seedLegacyData).toHaveBeenCalled());
    expect(screen.getByText('Legacy data imported successfully.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/AdminDashboard.test.jsx`
Expected: FAIL with a module-not-found error for `./AdminDashboard.jsx`.

- [ ] **Step 3: Write the AdminDashboard implementation**

Create `src/pages/AdminDashboard.jsx`:

```jsx
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import EventsAdminTab from '../components/admin/EventsAdminTab.jsx';
import GalleryAdminTab from '../components/admin/GalleryAdminTab.jsx';
import { seedLegacyData } from '../utils/seedLegacyData.js';
import './AdminDashboard.css';

function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState('events');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  async function handleSeed() {
    if (
      !window.confirm(
        'Import the existing static events and gallery data into Firestore? Only run this once.'
      )
    ) {
      return;
    }
    setSeeding(true);
    setSeedMessage('');
    try {
      await seedLegacyData();
      setSeedMessage('Legacy data imported successfully.');
    } catch {
      setSeedMessage('Import failed. Check the console for details.');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <h1>Admin Dashboard</h1>
        <div className="admin-dashboard__header-actions">
          <button type="button" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Importing…' : 'Import Legacy Data (one-time)'}
          </button>
          <button type="button" onClick={logout}>
            Log Out
          </button>
        </div>
      </header>

      {seedMessage && <p className="admin-dashboard__seed-message">{seedMessage}</p>}

      <nav className="admin-dashboard__tabs">
        <button
          type="button"
          className={
            tab === 'events'
              ? 'admin-dashboard__tab admin-dashboard__tab--active'
              : 'admin-dashboard__tab'
          }
          onClick={() => setTab('events')}
        >
          Events
        </button>
        <button
          type="button"
          className={
            tab === 'gallery'
              ? 'admin-dashboard__tab admin-dashboard__tab--active'
              : 'admin-dashboard__tab'
          }
          onClick={() => setTab('gallery')}
        >
          Gallery
        </button>
      </nav>

      {tab === 'events' ? <EventsAdminTab /> : <GalleryAdminTab />}
    </div>
  );
}

export default AdminDashboard;
```

- [ ] **Step 4: Add minimal, functional styling**

Create `src/pages/AdminDashboard.css`:

```css
.admin-dashboard {
  min-height: 100vh;
  padding: 24px;
  font-family: system-ui, sans-serif;
  background: #f7f7f7;
}

.admin-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.admin-dashboard__header-actions {
  display: flex;
  gap: 8px;
}

.admin-dashboard__seed-message {
  margin: 0 0 16px;
  color: #333;
}

.admin-dashboard__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.admin-dashboard__tab {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.admin-dashboard__tab--active {
  background: #333;
  color: #fff;
  border-color: #333;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/pages/AdminDashboard.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/pages/AdminDashboard.jsx src/pages/AdminDashboard.css src/pages/AdminDashboard.test.jsx
git commit -m "Add admin dashboard shell with Events/Gallery tabs and legacy data import"
```

`App.jsx` is not wired to this dashboard yet — that happens in Task 18, after the Culture, Team, and Contact pages (Tasks 15–17) exist, since `App.jsx`'s final routes import all of them together.

---

### Task 15: Culture & Values page with Kannada toggle

**Files:**
- Create: `src/data/cultureContent.js`
- Create: `src/pages/Culture.jsx`
- Create: `src/pages/Culture.css`
- Create: `src/pages/Culture.test.jsx`

**Interfaces:**
- Produces: `CULTURE_CONTENT` (`{ en: {...}, kn: {...} }`, each with `heading`, `intro` (array of paragraph strings), `pillarsIntro`, `pillars` (array of `{ kannada, transliteration, description }`), `closing`). `Culture` page component, routed at `/culture` in Task 18.

- [ ] **Step 1: Write the content data module**

Create `src/data/cultureContent.js`:

```js
export const CULTURE_CONTENT = {
  en: {
    heading: 'Mayura Kannada Sangha – Central Iowa',
    intro: [
      'At Mayura Kannada Sangha, culture is not just a celebration—it is a way of life. Rooted in the timeless traditions of Karnataka, we embrace a cultural heritage that is rich, diverse, and deeply meaningful. From classical music and dance to folk arts, language, literature, and festivals, our Sangha serves as a bridge between generations, connecting the past to the present with pride and purpose.',
      'Our values are inspired by the essence of Kannada ethos—respect for elders, compassion in community, education through language, and unity in diversity. We strive to create a space where every member feels a sense of belonging, where children grow up understanding their roots, and where traditions are not only preserved but also lived with joy and relevance.',
    ],
    pillarsIntro: 'Through our activities, we promote:',
    pillars: [
      {
        kannada: 'ಸಂಸ್ಕಾರ',
        transliteration: 'Samskāra',
        description: 'Cultivating moral and cultural grounding in youth.',
      },
      {
        kannada: 'ಸಹಭಾಗ',
        transliteration: 'Sahabhāga',
        description: 'Encouraging inclusive participation across generations.',
      },
      {
        kannada: 'ಸಾಮೂಹಿಕ ಭಾವ',
        transliteration: 'Sāmudāyika Bhaava',
        description: 'Fostering community spirit and togetherness.',
      },
      {
        kannada: 'ಸಂಸ್ಕೃತಿಯ ಸಂರಕ್ಷಣೆ',
        transliteration: 'Samskr̥tiya Samrakṣaṇe',
        description: 'Protecting and passing on the essence of our Kannada heritage.',
      },
    ],
    closing:
      "We believe that when culture is celebrated as a collective value, it brings people closer—transcending age, profession, and background. Whether through a child's first Kannada song or a grandparent's story from their village, every voice here matters.",
  },
  kn: {
    heading: 'ಮಯೂರ ಕನ್ನಡ ಸಂಘ – ಸೆಂಟ್ರಲ್ ಐಯೋವಾ',
    intro: [
      'ಮಯೂರ ಕನ್ನಡ ಸಂಘದಲ್ಲಿ, ಸಂಸ್ಕೃತಿ ಕೇವಲ ಒಂದು ಆಚರಣೆಯಲ್ಲ—ಅದು ಒಂದು ಜೀವನ ವಿಧಾನ. ಕರ್ನಾಟಕದ ಶಾಶ್ವತ ಸಂಪ್ರದಾಯಗಳಲ್ಲಿ ಬೇರೂರಿರುವ ನಾವು, ಶ್ರೀಮಂತ, ವೈವಿಧ್ಯಮಯ ಮತ್ತು ಅರ್ಥಪೂರ್ಣ ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆಯನ್ನು ಅಪ್ಪಿಕೊಳ್ಳುತ್ತೇವೆ. ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತ ಮತ್ತು ನೃತ್ಯದಿಂದ ಹಿಡಿದು ಜಾನಪದ ಕಲೆಗಳು, ಭಾಷೆ, ಸಾಹಿತ್ಯ ಮತ್ತು ಹಬ್ಬಗಳವರೆಗೆ, ನಮ್ಮ ಸಂಘವು ತಲೆಮಾರುಗಳ ನಡುವೆ ಸೇತುವೆಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ, ಹೆಮ್ಮೆ ಮತ್ತು ಉದ್ದೇಶದೊಂದಿಗೆ ಗತಕಾಲವನ್ನು ವರ್ತಮಾನಕ್ಕೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ.',
      'ನಮ್ಮ ಮೌಲ್ಯಗಳು ಕನ್ನಡ ಸಂಸ್ಕೃತಿಯ ಆಶಯದಿಂದ ಪ್ರೇರಿತವಾಗಿವೆ—ಹಿರಿಯರ ಬಗ್ಗೆ ಗೌರವ, ಸಮುದಾಯದಲ್ಲಿ ಸಹಾನುಭೂತಿ, ಭಾಷೆಯ ಮೂಲಕ ಶಿಕ್ಷಣ, ಮತ್ತು ವೈವಿಧ್ಯದಲ್ಲಿ ಏಕತೆ. ಪ್ರತಿಯೊಬ್ಬ ಸದಸ್ಯರೂ ಸೇರಿದ ಭಾವನೆಯನ್ನು ಅನುಭವಿಸುವ, ಮಕ್ಕಳು ತಮ್ಮ ಬೇರುಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಾ ಬೆಳೆಯುವ, ಮತ್ತು ಸಂಪ್ರದಾಯಗಳನ್ನು ಸಂರಕ್ಷಿಸುವುದಲ್ಲದೆ ಸಂತೋಷ ಮತ್ತು ಪ್ರಸ್ತುತತೆಯೊಂದಿಗೆ ಬದುಕುವ ಸ್ಥಳವನ್ನು ಸೃಷ್ಟಿಸಲು ನಾವು ಶ್ರಮಿಸುತ್ತೇವೆ.',
    ],
    pillarsIntro: 'ನಮ್ಮ ಚಟುವಟಿಕೆಗಳ ಮೂಲಕ, ನಾವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಉತ್ತೇಜಿಸುತ್ತೇವೆ:',
    pillars: [
      {
        kannada: 'ಸಂಸ್ಕಾರ',
        transliteration: 'Samskāra',
        description: 'ಯುವಜನರಲ್ಲಿ ನೈತಿಕ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಬುನಾದಿಯನ್ನು ಬೆಳೆಸುವುದು.',
      },
      {
        kannada: 'ಸಹಭಾಗ',
        transliteration: 'Sahabhāga',
        description: 'ತಲೆಮಾರುಗಳಾದ್ಯಂತ ಎಲ್ಲರನ್ನೂ ಒಳಗೊಂಡ ಭಾಗವಹಿಸುವಿಕೆಯನ್ನು ಪ್ರೋತ್ಸಾಹಿಸುವುದು.',
      },
      {
        kannada: 'ಸಾಮೂಹಿಕ ಭಾವ',
        transliteration: 'Sāmudāyika Bhaava',
        description: 'ಸಮುದಾಯ ಮನೋಭಾವ ಮತ್ತು ಒಗ್ಗಟ್ಟನ್ನು ಪೋಷಿಸುವುದು.',
      },
      {
        kannada: 'ಸಂಸ್ಕೃತಿಯ ಸಂರಕ್ಷಣೆ',
        transliteration: 'Samskr̥tiya Samrakṣaṇe',
        description: 'ನಮ್ಮ ಕನ್ನಡ ಪರಂಪರೆಯ ಸಾರವನ್ನು ರಕ್ಷಿಸಿ ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ದಾಟಿಸುವುದು.',
      },
    ],
    closing:
      'ಸಂಸ್ಕೃತಿಯನ್ನು ಒಂದು ಸಾಮೂಹಿಕ ಮೌಲ್ಯವಾಗಿ ಆಚರಿಸಿದಾಗ, ಅದು ಜನರನ್ನು ಹತ್ತಿರ ತರುತ್ತದೆ—ವಯಸ್ಸು, ವೃತ್ತಿ ಮತ್ತು ಹಿನ್ನೆಲೆಯನ್ನು ಮೀರಿ ಎಂದು ನಾವು ನಂಬುತ್ತೇವೆ. ಮಗುವಿನ ಮೊದಲ ಕನ್ನಡ ಹಾಡಿನ ಮೂಲಕವಾಗಲಿ ಅಥವಾ ಅಜ್ಜಅಜ್ಜಿಯರ ಹಳ್ಳಿಯ ಕಥೆಯ ಮೂಲಕವಾಗಲಿ, ಇಲ್ಲಿ ಪ್ರತಿಯೊಂದು ಧ್ವನಿಯೂ ಮುಖ್ಯವಾಗಿದೆ.',
  },
};
```

- [ ] **Step 2: Write the failing test**

Create `src/pages/Culture.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Culture from './Culture.jsx';
import { CULTURE_CONTENT } from '../data/cultureContent.js';

function renderCulture() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Culture />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Culture page', () => {
  it('renders the English heading and all four pillar transliterations by default', () => {
    renderCulture();
    expect(
      screen.getByRole('heading', { name: 'Mayura Kannada Sangha – Central Iowa' })
    ).toBeInTheDocument();
    CULTURE_CONTENT.en.pillars.forEach((pillar) => {
      expect(screen.getByText(pillar.transliteration)).toBeInTheDocument();
    });
  });

  it('switches the heading and paragraphs to Kannada when the toggle is clicked', () => {
    renderCulture();
    fireEvent.click(screen.getByRole('button', { name: 'ಕನ್ನಡ' }));

    expect(
      screen.getByRole('heading', { name: CULTURE_CONTENT.kn.heading })
    ).toBeInTheDocument();
    expect(screen.getByText(CULTURE_CONTENT.kn.closing)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/pages/Culture.test.jsx`
Expected: FAIL with a module-not-found error for `./Culture.jsx`.

- [ ] **Step 4: Write the implementation**

Create `src/pages/Culture.jsx`:

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import { CULTURE_CONTENT } from '../data/cultureContent.js';
import './Culture.css';

function Culture() {
  const [language, setLanguage] = useState('en');
  const content = CULTURE_CONTENT[language];
  const langAttr = language === 'kn' ? 'kn' : 'en';

  return (
    <Layout>
      <section className="culture-page">
        <KolamPattern />
        <div className="culture-page__inner">
          <div className="culture-page__toggle">
            <button
              type="button"
              className={
                language === 'en'
                  ? 'culture-page__lang culture-page__lang--active'
                  : 'culture-page__lang'
              }
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={
                language === 'kn'
                  ? 'culture-page__lang culture-page__lang--active'
                  : 'culture-page__lang'
              }
              onClick={() => setLanguage('kn')}
              lang="kn"
            >
              ಕನ್ನಡ
            </button>
          </div>

          <motion.h1
            className="culture-page__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            lang={langAttr}
          >
            {content.heading}
          </motion.h1>

          {content.intro.map((paragraph, index) => (
            <motion.p
              key={index}
              className="culture-page__paragraph"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              lang={langAttr}
            >
              {paragraph}
            </motion.p>
          ))}

          <motion.h2
            className="culture-page__pillars-heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            lang={langAttr}
          >
            {content.pillarsIntro}
          </motion.h2>

          <div className="culture-page__pillars">
            {content.pillars.map((pillar, index) => (
              <motion.div
                key={pillar.transliteration}
                className="culture-page__pillar-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              >
                <span className="culture-page__pillar-kannada" lang="kn">
                  {pillar.kannada}
                </span>
                <h3 className="culture-page__pillar-title">{pillar.transliteration}</h3>
                <p className="culture-page__pillar-description" lang={langAttr}>
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="culture-page__paragraph culture-page__closing"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            lang={langAttr}
          >
            {content.closing}
          </motion.p>
        </div>
      </section>
    </Layout>
  );
}

export default Culture;
```

- [ ] **Step 5: Add page styling**

Create `src/pages/Culture.css`:

```css
.culture-page {
  background: var(--color-yellow);
  padding: calc(var(--nav-height) + 40px) 24px 100px;
}

.culture-page__inner {
  position: relative;
  z-index: 1;
  max-width: 860px;
  margin: 0 auto;
}

.culture-page__toggle {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.culture-page__lang {
  padding: 8px 20px;
  border-radius: 999px;
  border: 1px solid var(--color-orange-dark);
  background: rgba(255, 255, 255, 0.5);
  color: var(--color-orange-dark);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.culture-page__lang--active {
  background: var(--color-orange);
  color: var(--color-text-light);
}

.culture-page__heading {
  font-family: var(--font-display);
  text-align: center;
  font-size: 2.1rem;
  color: var(--color-text-dark);
  margin: 0 0 24px;
}

.culture-page__paragraph {
  line-height: 1.7;
  margin: 0 0 20px;
  color: var(--color-text-dark);
}

.culture-page__pillars-heading {
  font-family: var(--font-display);
  text-align: center;
  font-size: 1.4rem;
  margin: 40px 0 24px;
  color: var(--color-text-dark);
}

.culture-page__pillars {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.culture-page__pillar-card {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.culture-page__pillar-kannada {
  display: block;
  font-family: var(--font-kannada);
  font-size: 1.6rem;
  color: var(--color-orange-dark);
  margin-bottom: 8px;
}

.culture-page__pillar-title {
  font-family: var(--font-display);
  margin: 0 0 8px;
}

.culture-page__pillar-description {
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

.culture-page__closing {
  font-style: italic;
  text-align: center;
}

@media (max-width: 640px) {
  .culture-page__pillars {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/pages/Culture.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/data/cultureContent.js src/pages/Culture.jsx src/pages/Culture.css src/pages/Culture.test.jsx
git commit -m "Add Culture & Values page with English/Kannada toggle"
```

---

### Task 16: Team page with role icons

**Files:**
- Create: `src/components/icons/RoleIcons.jsx`
- Create: `src/pages/Team.jsx`
- Create: `src/pages/Team.css`
- Create: `src/pages/Team.test.jsx`

**Interfaces:**
- Produces: `GavelIcon`, `QuillIcon`, `CoinIcon`, `ChairIcon` (no-prop inline SVG components) from `RoleIcons.jsx`. `Team` page component, routed at `/team` in Task 18.

- [ ] **Step 1: Write the role icons**

Create `src/components/icons/RoleIcons.jsx`:

```jsx
export function GavelIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="15" width="9" height="3" rx="1" transform="rotate(-45 2 15)" fill="currentColor" />
      <rect
        x="10"
        y="2"
        width="9"
        height="5"
        rx="1"
        transform="rotate(45 10 2)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <line x1="14" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function QuillIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4c-6 0-12 4-14 12l-2 4 4-2C16 16 20 10 20 4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="10" y1="14" x2="4" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">
        ₹
      </text>
    </svg>
  );
}

export function ChairIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 3v10M18 3v10M6 13h12M6 13l-2 8M18 13l2 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Write the failing test**

Create `src/pages/Team.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Team from './Team.jsx';

function renderTeam() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Team />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Team page', () => {
  it('renders the heading and a mailto contact link', () => {
    renderTeam();
    expect(screen.getByRole('heading', { name: '2026 Office Bearers' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'mksdsm2024@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:mksdsm2024@gmail.com'
    );
  });

  it('renders every office bearer with their name and role', () => {
    renderTeam();
    [
      ['Arun Kumar', 'President'],
      ['Chandra Shekar', 'Secretary'],
      ['Yogeshwara Gonchigar', 'Treasurer'],
      ['Naveen Setty', 'Chairperson'],
      ['Raghunath Shammanna', 'Chairperson'],
    ].forEach(([name, role]) => {
      const card = screen.getByRole('heading', { name }).closest('.team-page__card');
      expect(card).not.toBeNull();
      expect(card.textContent).toContain(role);
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/pages/Team.test.jsx`
Expected: FAIL with a module-not-found error for `./Team.jsx`.

- [ ] **Step 4: Write the implementation**

Create `src/pages/Team.jsx`:

```jsx
import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import { GavelIcon, QuillIcon, CoinIcon, ChairIcon } from '../components/icons/RoleIcons.jsx';
import './Team.css';

const OFFICE_BEARERS = [
  { name: 'Arun Kumar', role: 'President', Icon: GavelIcon },
  { name: 'Chandra Shekar', role: 'Secretary', Icon: QuillIcon },
  { name: 'Yogeshwara Gonchigar', role: 'Treasurer', Icon: CoinIcon },
  { name: 'Naveen Setty', role: 'Chairperson', Icon: ChairIcon },
  { name: 'Raghunath Shammanna', role: 'Chairperson', Icon: ChairIcon },
];

function Team() {
  return (
    <Layout>
      <section className="team-page">
        <KolamPattern />
        <div className="team-page__inner">
          <motion.h1
            className="team-page__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            2026 Office Bearers
          </motion.h1>
          <p className="team-page__contact">
            Contact us at <a href="mailto:mksdsm2024@gmail.com">mksdsm2024@gmail.com</a>
          </p>

          <div className="team-page__grid">
            {OFFICE_BEARERS.map(({ name, role, Icon }, index) => (
              <motion.div
                key={name}
                className="team-page__card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              >
                <div className="team-page__icon">
                  <Icon />
                </div>
                <h2 className="team-page__name">{name}</h2>
                <p className="team-page__role">{role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Team;
```

- [ ] **Step 5: Add page styling**

Create `src/pages/Team.css`:

```css
.team-page {
  background: var(--color-yellow);
  padding: calc(var(--nav-height) + 40px) 24px 100px;
}

.team-page__inner {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
}

.team-page__heading {
  font-family: var(--font-display);
  font-size: 2.1rem;
  color: var(--color-text-dark);
  margin: 0 0 12px;
}

.team-page__contact {
  margin: 0 0 40px;
  color: var(--color-text-dark);
}

.team-page__contact a {
  color: var(--color-orange-dark);
  font-weight: 700;
}

.team-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.team-page__card {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 28px 16px;
}

.team-page__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(232, 98, 44, 0.15);
  color: var(--color-orange-dark);
  margin-bottom: 12px;
}

.team-page__name {
  font-family: var(--font-display);
  font-size: 1.05rem;
  margin: 0 0 4px;
  color: var(--color-text-dark);
}

.team-page__role {
  margin: 0;
  color: var(--color-orange-dark);
  font-weight: 700;
  font-size: 0.9rem;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/pages/Team.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/icons/RoleIcons.jsx src/pages/Team.jsx src/pages/Team.css src/pages/Team.test.jsx
git commit -m "Add Team page with role icons for each office bearer"
```

---

### Task 17: Contact page with EmailJS (placeholder config)

**Files:**
- Create: `src/emailjs.js`
- Create: `src/pages/Contact.jsx`
- Create: `src/pages/Contact.css`
- Create: `src/pages/Contact.test.jsx`

**Interfaces:**
- Produces: `EMAILJS_CONFIG` (`{ serviceId, templateId, publicKey }`, all empty strings initially — the user fills these in later) and `isEmailjsConfigured()` from `src/emailjs.js`. `Contact` page component, routed at `/contact` in Task 18.

- [ ] **Step 1: Write the EmailJS config module**

Create `src/emailjs.js`:

```js
export const EMAILJS_CONFIG = {
  serviceId: '',
  templateId: '',
  publicKey: '',
};

export function isEmailjsConfigured() {
  return Boolean(EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId && EMAILJS_CONFIG.publicKey);
}
```

- [ ] **Step 2: Write the failing test**

Create `src/pages/Contact.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { AuthProvider } from '../auth/AuthContext.jsx';
import { isEmailjsConfigured } from '../emailjs.js';
import Contact from './Contact.jsx';

vi.mock('@emailjs/browser', () => ({ default: { send: vi.fn() } }));
vi.mock('../emailjs.js', () => ({
  EMAILJS_CONFIG: { serviceId: 'svc', templateId: 'tpl', publicKey: 'key' },
  isEmailjsConfigured: vi.fn(),
}));

function renderContact() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Contact />
      </AuthProvider>
    </MemoryRouter>
  );
}

function fillForm() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello!' } });
}

beforeEach(() => {
  vi.mocked(emailjs.send).mockReset();
  vi.mocked(isEmailjsConfigured).mockReset();
});

describe('Contact page', () => {
  it('renders a name/email/message form', () => {
    renderContact();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
  });

  it('shows an "unavailable" message instead of crashing when EmailJS is not configured', async () => {
    vi.mocked(isEmailjsConfigured).mockReturnValue(false);
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));

    await waitFor(() =>
      expect(screen.getByText(/isn't connected yet/)).toBeInTheDocument()
    );
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it('sends the message via EmailJS and shows a success message when configured', async () => {
    vi.mocked(isEmailjsConfigured).mockReturnValue(true);
    vi.mocked(emailjs.send).mockResolvedValue({ status: 200 });
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));

    await waitFor(() =>
      expect(emailjs.send).toHaveBeenCalledWith(
        'svc',
        'tpl',
        { from_name: 'Jane Doe', from_email: 'jane@example.com', message: 'Hello!' },
        'key'
      )
    );
    expect(screen.getByText('Thanks! Your message has been sent.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/pages/Contact.test.jsx`
Expected: FAIL with a module-not-found error for `./Contact.jsx`.

- [ ] **Step 4: Write the implementation**

Create `src/pages/Contact.jsx`:

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import { EMAILJS_CONFIG, isEmailjsConfigured } from '../emailjs.js';
import './Contact.css';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isEmailjsConfigured()) {
      setStatus('unavailable');
      return;
    }

    setStatus('sending');
    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        { from_name: form.name, from_email: form.email, message: form.message },
        EMAILJS_CONFIG.publicKey
      );
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <Layout>
      <section className="contact-page">
        <KolamPattern />
        <div className="contact-page__inner">
          <motion.h1
            className="contact-page__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Get in Touch
          </motion.h1>
          <p className="contact-page__subheading">
            Have a question or want to get involved? Send us a message.
          </p>

          <motion.form
            className="contact-page__form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              required
            />

            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
            />

            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
              rows={5}
              required
            />

            <button type="submit" className="contact-page__submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>

            {status === 'sent' && (
              <p className="contact-page__status contact-page__status--success">
                Thanks! Your message has been sent.
              </p>
            )}
            {status === 'error' && (
              <p className="contact-page__status contact-page__status--error">
                Something went wrong. Please try again later.
              </p>
            )}
            {status === 'unavailable' && (
              <p className="contact-page__status">
                The contact form isn&apos;t connected yet — please email us directly at{' '}
                <a href="mailto:mksdsm2024@gmail.com">mksdsm2024@gmail.com</a>.
              </p>
            )}
          </motion.form>
        </div>
      </section>
    </Layout>
  );
}

export default Contact;
```

- [ ] **Step 5: Add page styling**

Create `src/pages/Contact.css`:

```css
.contact-page {
  background: var(--color-yellow);
  padding: calc(var(--nav-height) + 40px) 24px 100px;
}

.contact-page__inner {
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
}

.contact-page__heading {
  font-family: var(--font-display);
  font-size: 2.1rem;
  color: var(--color-text-dark);
  margin: 0 0 12px;
}

.contact-page__subheading {
  margin: 0 0 32px;
  color: var(--color-text-dark);
  opacity: 0.85;
}

.contact-page__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 28px;
}

.contact-page__form label {
  font-weight: 700;
  color: var(--color-text-dark);
  font-size: 0.9rem;
}

.contact-page__form input,
.contact-page__form textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 34, 0, 0.25);
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.contact-page__submit {
  margin-top: 8px;
  padding: 12px;
  border: none;
  border-radius: 999px;
  background: var(--color-orange);
  color: var(--color-text-light);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.contact-page__submit:hover {
  background: var(--color-orange-dark);
}

.contact-page__status {
  margin: 4px 0 0;
  font-size: 0.9rem;
}

.contact-page__status--success {
  color: #1e7a2e;
}

.contact-page__status--error {
  color: #b00020;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/pages/Contact.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add src/emailjs.js src/pages/Contact.jsx src/pages/Contact.css src/pages/Contact.test.jsx
git commit -m "Add Contact page wired to EmailJS (left unconfigured as a placeholder)"
```

---

### Task 18: Final route wiring — App.jsx, remove Placeholder, update App.test.jsx

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Delete: `src/pages/Placeholder.jsx`
- Delete: `src/pages/Placeholder.css`

**Interfaces:**
- Consumes: `AuthProvider` (Task 2), `ProtectedRoute` (Task 3), `Home`, `Events`, `Gallery` (pre-existing/Tasks 8–9), `Culture` (Task 15), `Team` (Task 16), `Contact` (Task 17), `AdminLogin` (Task 11), `AdminDashboard` (Task 14).
- Produces: the final `App` component and full route table for the site.

- [ ] **Step 1: Replace App.jsx with the final route table**

Replace `src/App.jsx`:

```jsx
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Events from './pages/Events.jsx';
import Gallery from './pages/Gallery.jsx';
import Culture from './pages/Culture.jsx';
import Team from './pages/Team.jsx';
import Contact from './pages/Contact.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/culture" element={<Culture />} />
        <Route path="/team" element={<Team />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 2: Delete the now-unused Placeholder page**

Run: `git rm src/pages/Placeholder.jsx src/pages/Placeholder.css`
Expected: both files removed; `App.jsx` no longer imports `Placeholder` anywhere.

- [ ] **Step 3: Update App.test.jsx for the new pages and admin routes**

Replace `src/App.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import App from './App.jsx';

describe('App routing', () => {
  it('renders the hero welcome text on the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getAllByText(
        (_, element) => element.tagName === 'P' && element.textContent === 'Mayura Kannada Sangha'
      )
    ).toHaveLength(2);
  });

  it('renders the Culture & Values page', () => {
    render(
      <MemoryRouter initialEntries={['/culture']}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: 'Mayura Kannada Sangha – Central Iowa' })
    ).toBeInTheDocument();
  });

  it('renders the Team page', () => {
    render(
      <MemoryRouter initialEntries={['/team']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: '2026 Office Bearers' })).toBeInTheDocument();
  });

  it('renders the Contact page', () => {
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Get in Touch' })).toBeInTheDocument();
  });

  it('renders the Events page with upcoming and past sections', () => {
    render(
      <MemoryRouter initialEntries={['/events']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Up-Coming Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Past Events' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sponsorship Opportunities' })).toBeInTheDocument();
  });

  it('renders the Gallery overview heading', () => {
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument();
  });

  it('shows the admin login form on /admin/login', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Admin Sign In' })).toBeInTheDocument();
  });

  it('redirects /admin to the login page when logged out', () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Admin Sign In' })).toBeInTheDocument();
  });

  it('shows the dashboard at /admin when logged in', () => {
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback({ email: 'admin@mayurakannadasangha.org' });
      return () => {};
    });
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Admin Dashboard' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS across the whole suite (every test file from Tasks 1–18).

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "Wire final app routes: Culture, Team, Contact, and admin login/dashboard"
```

---

### Task 19: Firestore/Storage security rules and admin setup documentation

**Files:**
- Create: `firestore.rules`
- Create: `storage.rules`
- Create: `docs/admin-setup.md`

**Interfaces:**
- No code interfaces — this task produces the rules text (to be pasted into the Firebase console by the user) and a setup runbook. Nothing else in the codebase imports these files.

- [ ] **Step 1: Write the Firestore security rules**

Create `firestore.rules`:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /galleryCategories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

- [ ] **Step 2: Write the Storage security rules**

Create `storage.rules`:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /events/{eventId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /gallery/{categoryId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

- [ ] **Step 3: Write the admin setup runbook**

Create `docs/admin-setup.md`:

```markdown
# Admin CMS setup (one-time, before deploying)

This site's admin dashboard is backed by Firebase project `kannadasangha-83770`. Before the
admin login or dashboard will work in production, do the following in the
[Firebase console](https://console.firebase.google.com/project/kannadasangha-83770):

## 1. Enable the required products

- **Build → Authentication → Get started → Sign-in method → Email/Password** — enable it.
- **Build → Firestore Database → Create database** — start in production mode, pick any region.
- **Build → Storage → Get started** — start in production mode, same region as Firestore.

## 2. Create the admin user

In **Authentication → Users → Add user**, create:

- Email: `admin@mayurakannadasangha.org`
- Password: the password you want to use to sign in at `/admin/login` (username there is
  always `Admin`; only the password field matters for login).

## 3. Publish the security rules

- In **Firestore Database → Rules**, paste the contents of `firestore.rules` from this repo
  and click **Publish**.
- In **Storage → Rules**, paste the contents of `storage.rules` from this repo and click
  **Publish**.

These rules make all event/gallery data and images publicly readable (so the site works for
every visitor) but only writable by a signed-in admin.

## 4. Import the existing events and gallery photos

After deploying, log in at `/admin/login`, go to the dashboard, and click
**"Import Legacy Data (one-time)"**. This copies the events and gallery photos that used to
be hardcoded in `src/data/upcomingEvents.js`, `src/data/pastEvents.js`, and
`src/data/gallerySections.js` into Firestore, so the live site keeps showing them. Only run
this once — running it again will create duplicate entries.

## 5. Connect the contact form (optional, can be done later)

The Contact page is wired to [EmailJS](https://www.emailjs.com) but ships unconfigured. To
turn it on:

1. Create a free EmailJS account and an email service pointed at `mksdsm2024@gmail.com`.
2. Create an email template with `from_name`, `from_email`, and `message` variables.
3. Fill in `src/emailjs.js` with your Service ID, Template ID, and Public Key.

Until this is done, the Contact page shows a friendly "isn't connected yet" message with a
`mailto:` link instead of failing.
```

- [ ] **Step 4: Commit**

```bash
git add firestore.rules storage.rules docs/admin-setup.md
git commit -m "Add Firestore/Storage security rules and admin setup runbook"
```
