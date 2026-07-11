# Mobile Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the nav bar, home page hero video, and admin screens work correctly on mobile viewports, and replace the admin event form's day/month/year text inputs with a native calendar date picker.

**Architecture:** All changes are additive CSS (media queries at a `640px` breakpoint, matching the existing convention in `Culture.css`) plus one JS-driven change to `NavBar.jsx` (viewport-aware height animation + a hamburger menu) and one data-shape-preserving refactor to `EventsAdminTab.jsx` (single `<input type="date">` replacing three text inputs, converted to/from the existing `day`/`month`/`year` string fields at the read/write boundary).

**Tech Stack:** React 18, react-router-dom, framer-motion (already a dependency, no new deps), Vitest + Testing Library, plain CSS (no CSS framework in this repo).

## Global Constraints

- No new dependencies — use only what's already in `package.json` (framer-motion, react-router-dom).
- Mobile breakpoint: `max-width: 640px`, matching the existing pattern in `src/pages/Culture.css:98`.
- Do not change the Firestore data shape for events (`day`, `month`, `year` remain separate string fields — `month` is a full month name, e.g. `"September"`, confirmed from `src/data/upcomingEvents.js` and `EventsAdminTab.test.jsx`).
- All existing tests must keep passing; run `npm test` after every task.
- Minimum tap target height for admin buttons on mobile: 44px.

---

### Task 1: NavBar mobile hamburger menu

**Files:**
- Modify: `src/components/NavBar.jsx`
- Modify: `src/components/NavBar.css`
- Modify: `src/index.css:10-11` (`--nav-height` / `--nav-height-scrolled` vars)
- Test: `src/components/NavBar.test.jsx`

**Interfaces:**
- Consumes: `NAV_LINKS` from `src/data/navLinks.js` (unchanged: `[{ to, label }]`), `isNavSolid` from `src/utils/scroll.js` (unchanged).
- Produces: no new exports; `NavBar` remains a default export with no props.

- [ ] **Step 1: Write the failing test for the hamburger menu**

Replace the contents of `src/components/NavBar.test.jsx` with:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './NavBar.jsx';

describe('NavBar', () => {
  it('renders the logo and all six section links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );
    expect(screen.getByAltText('Mayura Kannada Sangha logo')).toBeInTheDocument();
    ['Home', 'Events', 'Gallery', 'Our Culture and Values', 'Team', 'Contact'].forEach(
      (label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
    );
  });

  it('opens and closes the mobile menu via the hamburger toggle', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Close navigation menu' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation menu' }));

    const closeButton = screen.getByRole('button', { name: 'Close navigation menu' });
    expect(closeButton).toBeInTheDocument();

    const mobileMenu = within(closeButton.closest('.navbar__mobile-menu'));
    ['Home', 'Events', 'Gallery', 'Our Culture and Values', 'Team', 'Contact'].forEach(
      (label) => {
        expect(mobileMenu.getByText(label)).toBeInTheDocument();
      }
    );

    fireEvent.click(mobileMenu.getByText('Events'));

    expect(screen.queryByRole('button', { name: 'Close navigation menu' })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify the new test fails**

Run: `npx vitest run src/components/NavBar.test.jsx`
Expected: FAIL — `getByRole('button', { name: 'Toggle navigation menu' })` finds no element.

- [ ] **Step 3: Implement the hamburger menu and viewport-aware sizing in NavBar.jsx**

Replace the contents of `src/components/NavBar.jsx` with:

```jsx
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isNavSolid } from '../utils/scroll.js';
import { NAV_LINKS } from '../data/navLinks.js';
import './NavBar.css';

const MOBILE_BREAKPOINT = 640;
const NAV_HEIGHT = { desktop: 256, mobile: 96 };
const NAV_HEIGHT_SCROLLED = { desktop: 120, mobile: 64 };
const LOGO_HEIGHT = { desktop: 240, mobile: 64 };
const LOGO_HEIGHT_SCROLLED = { desktop: 96, mobile: 44 };

function NavBar() {
  const [solid, setSolid] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setSolid(isNavSolid(window.scrollY));
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  const size = isMobile ? 'mobile' : 'desktop';
  const navHeight = solid ? NAV_HEIGHT_SCROLLED[size] : NAV_HEIGHT[size];
  const logoHeight = solid ? LOGO_HEIGHT_SCROLLED[size] : LOGO_HEIGHT[size];

  return (
    <>
      <motion.nav
        className="navbar"
        animate={{ height: navHeight }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="navbar__scrim" />
        <motion.div
          className="navbar__solid"
          animate={{
            opacity: solid ? 1 : 0,
            boxShadow: solid ? '0 2px 12px rgba(0,0,0,0.15)' : '0 0 0 rgba(0,0,0,0)',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
        <motion.img
          src="/m.png"
          alt="Mayura Kannada Sangha logo"
          className="navbar__logo"
          animate={{ height: logoHeight }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
        <ul className="navbar__links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  'navbar__link' + (isActive ? ' navbar__link--active' : '')
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="navbar__toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>
      </motion.nav>
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <button
            type="button"
            className="navbar__mobile-close"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          >
            ×
          </button>
          <ul className="navbar__mobile-links">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    'navbar__mobile-link' + (isActive ? ' navbar__mobile-link--active' : '')
                  }
                  onClick={closeMenu}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default NavBar;
```

- [ ] **Step 4: Add hamburger toggle, mobile menu overlay, and responsive rules to NavBar.css**

Append to `src/components/NavBar.css`:

```css
.navbar__toggle {
  display: none;
  position: relative;
  z-index: 2;
  width: 40px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-direction: column;
  justify-content: space-between;
}

.navbar__toggle-bar {
  display: block;
  width: 100%;
  height: 3px;
  border-radius: 2px;
  background: var(--color-text-light);
}

.navbar__mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: var(--color-orange);
}

.navbar__mobile-close {
  position: absolute;
  top: 24px;
  right: 24px;
  border: none;
  background: transparent;
  color: var(--color-text-light);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.navbar__mobile-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.navbar__mobile-link {
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--color-text-light);
}

.navbar__mobile-link--active {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .navbar {
    padding: 0 20px;
  }

  .navbar__links {
    display: none;
  }

  .navbar__toggle {
    display: flex;
  }
}
```

- [ ] **Step 5: Update the `--nav-height` CSS variables for mobile in index.css**

In `src/index.css`, the `:root` block currently reads:

```css
:root {
  --color-yellow: #f5b800;
  --color-yellow-dark: #d99f00;
  --color-orange: #e8622c;
  --color-orange-dark: #c94f1f;
  --color-text-dark: #3a2200;
  --color-text-light: #fff8e7;
  --font-display: 'Playfair Display', 'Georgia', serif;
  --font-kannada: 'Noto Sans Kannada', sans-serif;
  --nav-height: 256px;
  --nav-height-scrolled: 120px;
}
```

Add a mobile override directly after the `:root` block (these values must match `NAV_HEIGHT.mobile` / `NAV_HEIGHT_SCROLLED.mobile` from `NavBar.jsx`, since `Contact.css`, `Team.css`, `Gallery.css`, and `Culture.css` use `--nav-height` to pad content below the fixed nav bar):

```css
@media (max-width: 640px) {
  :root {
    --nav-height: 96px;
    --nav-height-scrolled: 64px;
  }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/components/NavBar.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add src/components/NavBar.jsx src/components/NavBar.css src/components/NavBar.test.jsx src/index.css
git commit -m "Add mobile hamburger menu and viewport-aware sizing to NavBar"
```

---

### Task 2: Fix hero video scroll-scrub on mobile

**Files:**
- Modify: `src/components/HeroVideo.css`

**Interfaces:**
- Consumes: nothing new — no JS or JSX changes in this task.
- Produces: nothing new — CSS-only fix.

**Context:** `ffprobe` confirms `/videos/0709.mp4` is 720×720. `.hero__video-wrap` uses `aspect-ratio: 1/1` on a `width: 100%` box, so its height equals its width. On desktop that height comfortably exceeds `100vh`, giving `getScrubProgress` (in `src/utils/scroll.js`) a real scroll range to drive the scrub effect. On mobile, width (~375–430px) is far less than viewport height (~700–900px), so the container is shorter than the viewport — `getScrubProgress` returns `0` (its `scrollableRange <= 0` guard) and the `position: sticky` pinned overlay (assuming `height: 100vh`) overflows its too-short parent, which is what reads as "cut off."

- [ ] **Step 1: Add a mobile-specific height to `.hero__video-wrap`**

Append to `src/components/HeroVideo.css`:

```css
@media (max-width: 640px) {
  .hero__video-wrap {
    aspect-ratio: unset;
    height: 220vh;
  }

  .hero__text {
    padding: 0 16px;
  }
}
```

- [ ] **Step 2: Run the existing HeroVideo test to confirm no regression**

Run: `npx vitest run src/components/HeroVideo.test.jsx`
Expected: PASS (this task doesn't change markup, only CSS, so the existing test should be unaffected)

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run dev`
Open the printed local URL, open browser dev tools, switch to a mobile device emulation (e.g. iPhone SE, 375×667) on the Home page, and confirm:
- Scrolling past the hero section visibly scrubs the video (frame changes as you scroll).
- The welcome text is readable and not clipped by the container.

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroVideo.css
git commit -m "Fix hero video scroll-scrub range on mobile viewports"
```

---

### Task 3: Admin screens responsive CSS

**Files:**
- Modify: `src/pages/AdminDashboard.css`
- Modify: `src/components/admin/EventsAdminTab.css`
- Modify: `src/components/admin/GalleryAdminTab.css`

**Interfaces:**
- Consumes: nothing new — no JS or JSX changes in this task.
- Produces: nothing new — CSS-only fixes.

- [ ] **Step 1: Add mobile rules to AdminDashboard.css**

Append to `src/pages/AdminDashboard.css`:

```css
@media (max-width: 640px) {
  .admin-dashboard {
    padding: 16px;
  }

  .admin-dashboard__header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .admin-dashboard__header-actions {
    flex-direction: column;
  }

  .admin-dashboard__header-actions button {
    width: 100%;
    min-height: 44px;
  }

  .admin-dashboard__tabs {
    flex-direction: column;
  }

  .admin-dashboard__tab {
    width: 100%;
    min-height: 44px;
  }
}
```

- [ ] **Step 2: Add mobile rules to EventsAdminTab.css**

Append to `src/components/admin/EventsAdminTab.css`:

```css
@media (max-width: 640px) {
  .events-admin__row {
    flex-wrap: wrap;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .events-admin__row button {
    min-height: 44px;
  }

  .events-admin__form {
    max-width: 100%;
  }

  .events-admin__button-row {
    flex-direction: column;
  }

  .events-admin__form-actions button,
  .events-admin__add {
    min-height: 44px;
  }
}
```

- [ ] **Step 3: Add mobile rules to GalleryAdminTab.css**

Append to `src/components/admin/GalleryAdminTab.css`:

```css
@media (max-width: 640px) {
  .gallery-admin__row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .gallery-admin__add-form,
  .gallery-admin__editor {
    max-width: 100%;
  }

  .gallery-admin__row button,
  .gallery-admin__editor button {
    min-height: 44px;
  }
}
```

- [ ] **Step 4: Run the existing admin tests to confirm no regression**

Run: `npx vitest run src/pages/AdminDashboard.test.jsx src/components/admin/EventsAdminTab.test.jsx`
Expected: PASS (CSS-only changes, no markup changed in this task)

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, log into `/admin`, switch dev tools to a mobile emulation width (375px), and confirm the dashboard header, tab bar, and both Events/Gallery list rows and forms stack vertically without horizontal overflow, and buttons are comfortably tappable.

- [ ] **Step 6: Commit**

```bash
git add src/pages/AdminDashboard.css src/components/admin/EventsAdminTab.css src/components/admin/GalleryAdminTab.css
git commit -m "Make admin dashboard, events tab, and gallery tab responsive on mobile"
```

---

### Task 4: Replace day/month/year inputs with a native date picker

**Files:**
- Modify: `src/components/admin/EventsAdminTab.jsx`
- Test: `src/components/admin/EventsAdminTab.test.jsx`

**Interfaces:**
- Consumes: `createEvent`, `updateEvent` from `src/data/eventsRepo.js` (unchanged signatures: `createEvent(eventData)`, `updateEvent(eventId, eventData)`).
- Produces: two new local (not exported) helpers in `EventsAdminTab.jsx`: `isoToDateFields(isoDate) -> { day, month, year }` and `dateFieldsToISO(day, month, year) -> string`. `month` is always a full month name (e.g. `"August"`), matching the existing Firestore field format.

- [ ] **Step 1: Update the test file's create/edit assertions to use the date picker**

Replace the contents of `src/components/admin/EventsAdminTab.test.jsx` with:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  uploadEventImage: vi.fn(() => Promise.resolve({ image: 'https://example.com/img.jpg', storagePath: 'img' })),
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

  it('creates a new event with a title, date, and one button', async () => {
    render(<EventsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Event' }));

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Summer Picnic' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-08-09' } });
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

  it('pre-fills the form when editing an existing event, including the date picker', () => {
    render(<EventsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Title')).toHaveValue('Dasara Mahotsava 2025');
    expect(screen.getByLabelText('Date')).toHaveValue('2025-09-27');
    expect(screen.getByLabelText('Button 1 label')).toHaveValue('Tickets');
  });

  it('deletes an event after confirmation', async () => {
    render(<EventsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteEvent).toHaveBeenCalledWith('evt-1'));
  });

  it('shows an error message when the image upload fails', async () => {
    vi.mocked(uploadEventImage).mockRejectedValue(
      new Error('Image uploads are not connected yet.')
    );
    render(<EventsAdminTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Image'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(screen.getByText('Image uploads are not connected yet.')).toBeInTheDocument()
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/admin/EventsAdminTab.test.jsx`
Expected: FAIL — `getByLabelText('Date')` finds no element (the form still has separate Day/Month/Year fields).

- [ ] **Step 3: Add the date conversion helpers and update form state in EventsAdminTab.jsx**

In `src/components/admin/EventsAdminTab.jsx`, replace the top of the file (imports through `EMPTY_FORM`) with:

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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isoToDateFields(isoDate) {
  if (!isoDate) return { day: '', month: '', year: '' };
  const [year, month, day] = isoDate.split('-');
  return {
    day: String(Number(day)),
    month: MONTH_NAMES[Number(month) - 1] ?? '',
    year,
  };
}

function dateFieldsToISO(day, month, year) {
  const monthIndex = MONTH_NAMES.indexOf(month);
  if (!day || monthIndex === -1 || !year) return '';
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const EMPTY_FORM = {
  title: '',
  eventDate: '',
  time: '',
  location: '',
  status: 'upcoming',
  image: '',
  storagePath: null,
  buttons: [],
};
```

- [ ] **Step 4: Update `startEdit` to derive the ISO date from stored day/month/year**

In `src/components/admin/EventsAdminTab.jsx`, replace the `startEdit` function:

```jsx
  function startEdit(event) {
    setForm({
      title: event.title ?? '',
      eventDate: dateFieldsToISO(event.day, event.month, event.year),
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
```

- [ ] **Step 5: Update `handleSubmit` to derive day/month/year from the ISO date**

In `src/components/admin/EventsAdminTab.jsx`, replace the start of `handleSubmit` (the `baseFields` construction):

```jsx
  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const buttons = form.buttons.filter((button) => button.label && button.url);
      const { day, month, year } = isoToDateFields(form.eventDate);
      const baseFields = {
        title: form.title,
        day,
        month,
        year,
        time: form.time,
        location: form.location,
        status: form.status,
        buttons,
      };
```

(Leave the rest of `handleSubmit` — the `if (editingId) { ... } else { ... }` block and `catch`/`finally` — unchanged.)

- [ ] **Step 6: Replace the three Day/Month/Year inputs with a single date input**

In `src/components/admin/EventsAdminTab.jsx`, replace this block:

```jsx
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
```

with:

```jsx
          <label htmlFor="event-date">Date</label>
          <input
            id="event-date"
            type="date"
            value={form.eventDate}
            onChange={(event) => updateField('eventDate', event.target.value)}
            required
          />
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/components/admin/EventsAdminTab.test.jsx`
Expected: PASS (6 tests)

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/EventsAdminTab.jsx src/components/admin/EventsAdminTab.test.jsx
git commit -m "Replace day/month/year text inputs with a native date picker in admin events form"
```

---

### Task 5: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: All test files pass (no failures).

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: Build completes with no errors.

- [ ] **Step 3: Manual mobile smoke test**

Run: `npm run dev`, then in a browser with dev tools mobile emulation (375×667 and 414×896):
- Home page: hamburger menu opens/closes and links navigate; hero video scrubs while scrolling.
- Admin dashboard (`/admin`, after logging in): header, tabs, and both Events/Gallery tabs are usable without horizontal scrolling; tapping "Edit" on an event pre-fills the new date picker with the correct date; changing the date and saving persists correctly (check the event's displayed date on the public Events page afterward).

- [ ] **Step 4: No commit needed for this task** (verification only — if any issues are found, fix them in the relevant task above and re-commit there).

---

### Task 6: Push to main

**Files:** none

- [ ] **Step 1: Confirm with the user before pushing**

Before running the push, explicitly confirm with the user that it's OK to push the accumulated commits from Tasks 1–4 directly to `main` (this repo's existing workflow, per recent commit history, is direct-to-main).

- [ ] **Step 2: Push**

```bash
git push origin main
```

Expected: push succeeds, `git status` shows the local `main` branch up to date with `origin/main`.
