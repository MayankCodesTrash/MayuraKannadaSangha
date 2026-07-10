# Mayura Kannada Sangha Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Vite + React site with a fully implemented Home page (scroll-scrubbed hero video with centered welcome text, yellow patterned blank section, animated wave-divided orange footer) and a transparent-to-solid nav bar, plus empty placeholder pages for Events, Gallery, Our Culture and Values, Team, and Contact.

**Architecture:** Vite + React (JavaScript) SPA using React Router for routing. Framer Motion drives the nav bar's transparent→solid transition, the logo shrink, and a continuously animating SVG wave divider. The hero video is scrubbed by directly setting `video.currentTime` based on scroll position (no frame-extraction pipeline). Scroll-math and threshold logic are extracted into pure, unit-testable utility functions; components are covered by lightweight render smoke tests (Vitest + React Testing Library). Assets (`m.png`, `videos/0709.mp4`) live in `public/`.

**Tech Stack:** React 18, Vite 5, react-router-dom 6, framer-motion 11, Vitest + @testing-library/react for tests.

## Global Constraints

- No TypeScript — plain JavaScript (`.jsx`) throughout, per spec.
- Video scrubbing uses direct `video.currentTime` seeking — no ffmpeg / image-sequence pipeline.
- Hero text lines (exact strings, exact order): "Welcome to", "Mayura Kannada Sangha", "Central Iowa", "ಮಯೂರ ಕನ್ನಡ ಸಂಘ", "ಸೆಂಟ್ರಲ್ ಅಯೋವಾ" — every line individually centered, large, vertically+horizontally centered as a block.
- Nav bar: transparent + moderately large logo at scroll top; solid background + shrunk logo once scrolled past ~80–100px; transition animated via Framer Motion, no jump cuts.
- Yellow theme = solid yellow + subtle kolam/rangoli-style SVG line pattern. Orange theme = solid orange, used for footer and scrolled-nav background.
- Wave divider between yellow/orange boundaries continuously animates (ocean-like loop) via Framer Motion, and must be a single reusable component.
- Placeholder pages (`/events`, `/gallery`, `/culture`, `/team`, `/contact`) render Nav + empty yellow-themed section + Footer — no real content.
- Fonts: an elegant serif/display Google Font for English hero lines, "Noto Sans Kannada" for Kannada hero lines.
- Colors start at approx. `#F5B800` (yellow) / `#E8622C` (orange), defined as CSS custom properties so they're tunable in one place.

---

## Task 1: Scaffold Vite + React project, install dependencies, move assets

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `.gitignore`
- Modify (move): `m.png` → `public/m.png`
- Modify (move): `videos/0709.mp4` → `public/videos/0709.mp4`
- Test: `src/smoke.test.js`

**Interfaces:**
- Produces: a runnable Vite dev server (`npm run dev`), a working test runner (`npm test`), and `public/m.png` / `public/videos/0709.mp4` as the canonical asset paths every later task references.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "mayura-kannada-sangha",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "framer-motion": "^11.11.17",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "vite": "^5.4.11",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
```

- [ ] **Step 3: Create `src/setupTests.js`**

```js
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mayura Kannada Sangha — Central Iowa</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Noto+Sans+Kannada:wght@400;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `src/main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 6: Create placeholder `src/App.jsx` (real routes added in Task 10)**

```jsx
function App() {
  return <div>App scaffold</div>;
}

export default App;
```

- [ ] **Step 7: Create placeholder `src/index.css` (real theme added in Task 2)**

```css
* {
  box-sizing: border-box;
}
```

- [ ] **Step 8: Create `.gitignore`**

```
node_modules
dist
.DS_Store
```

- [ ] **Step 9: Move assets into `public/`**

```bash
mkdir -p public/videos
mv m.png public/m.png
mv videos/0709.mp4 public/videos/0709.mp4
rmdir videos
```

- [ ] **Step 10: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 11: Write a trivial smoke test to confirm the test runner works**

```js
// src/smoke.test.js
import { describe, it, expect } from 'vitest';

describe('test runner', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 12: Run the test suite**

Run: `npm test`
Expected: PASS (1 test passed)

- [ ] **Step 13: Verify dev server boots**

Run: `npm run dev -- --port 5173` in the background, then `curl -s http://localhost:5173 | head -5`, then stop the server.
Expected: HTML response containing `<div id="root">`.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "Scaffold Vite + React project with test runner and assets in public/"
```

---

## Task 2: Global theme (CSS variables, fonts, reset)

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: CSS custom properties every later component relies on: `--color-yellow`, `--color-yellow-dark`, `--color-orange`, `--color-orange-dark`, `--color-text-dark`, `--font-display` (English), `--font-kannada`, `--nav-height`.

- [ ] **Step 1: Replace `src/index.css` with the full theme**

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
  --nav-height: 96px;
  --nav-height-scrolled: 64px;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

body {
  font-family: var(--font-display);
  color: var(--color-text-dark);
  background: var(--color-yellow);
}

a {
  color: inherit;
}

section {
  position: relative;
  overflow: hidden;
}
```

- [ ] **Step 2: Verify the build still succeeds**

Run: `npm run build`
Expected: build succeeds with no CSS errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "Add global theme CSS variables and base styles"
```

---

## Task 3: Pure scroll utility functions (TDD)

**Files:**
- Create: `src/utils/scroll.js`
- Test: `src/utils/scroll.test.js`

**Interfaces:**
- Produces:
  - `getScrubProgress(top: number, containerHeight: number, viewportHeight: number): number` — returns a value clamped to `[0, 1]`.
  - `isNavSolid(scrollY: number, threshold?: number): boolean` — `threshold` defaults to `90`.
- Consumed by: `HeroVideo` (Task 9) for `getScrubProgress`, `NavBar` (Task 6) for `isNavSolid`.

- [ ] **Step 1: Write the failing tests**

```js
// src/utils/scroll.test.js
import { describe, it, expect } from 'vitest';
import { getScrubProgress, isNavSolid } from './scroll.js';

describe('getScrubProgress', () => {
  it('returns 0 when the container top is at the viewport top', () => {
    expect(getScrubProgress(0, 2000, 1000)).toBe(0);
  });

  it('returns 1 when scrolled exactly through the scrollable range', () => {
    // container height 2000, viewport 1000 -> scrollable range is 1000px
    expect(getScrubProgress(-1000, 2000, 1000)).toBe(1);
  });

  it('returns 0.5 at the midpoint of the scrollable range', () => {
    expect(getScrubProgress(-500, 2000, 1000)).toBe(0.5);
  });

  it('clamps to 0 when top is positive (not yet scrolled in)', () => {
    expect(getScrubProgress(400, 2000, 1000)).toBe(0);
  });

  it('clamps to 1 when scrolled past the end', () => {
    expect(getScrubProgress(-5000, 2000, 1000)).toBe(1);
  });

  it('returns 0 when container is not taller than the viewport (no scrollable range)', () => {
    expect(getScrubProgress(0, 800, 1000)).toBe(0);
  });
});

describe('isNavSolid', () => {
  it('is false at scrollY 0', () => {
    expect(isNavSolid(0)).toBe(false);
  });

  it('is false just under the default threshold', () => {
    expect(isNavSolid(89)).toBe(false);
  });

  it('is true at or past the default threshold', () => {
    expect(isNavSolid(90)).toBe(true);
    expect(isNavSolid(200)).toBe(true);
  });

  it('respects a custom threshold', () => {
    expect(isNavSolid(50, 40)).toBe(true);
    expect(isNavSolid(30, 40)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/utils/scroll.test.js`
Expected: FAIL with "Failed to resolve import ./scroll.js" or similar module-not-found error.

- [ ] **Step 3: Implement `src/utils/scroll.js`**

```js
export function getScrubProgress(top, containerHeight, viewportHeight) {
  const scrollableRange = containerHeight - viewportHeight;
  if (scrollableRange <= 0) return 0;
  const scrolled = -top;
  return Math.min(1, Math.max(0, scrolled / scrollableRange));
}

export function isNavSolid(scrollY, threshold = 90) {
  return scrollY >= threshold;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/utils/scroll.test.js`
Expected: PASS (10 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/utils/scroll.js src/utils/scroll.test.js
git commit -m "Add pure scroll utility functions with unit tests"
```

---

## Task 4: WaveDivider component (continuously animated SVG wave)

**Files:**
- Create: `src/components/WaveDivider.jsx`
- Create: `src/components/WaveDivider.css`
- Test: `src/components/WaveDivider.test.jsx`

**Interfaces:**
- Produces: `<WaveDivider flip?: boolean />` — a React component rendering a full-width animated SVG wave. `flip` (default `false`) mirrors it vertically for use above vs. below a section.
- Consumed by: `Footer` (Task 7), and reusable at any future section boundary.

- [ ] **Step 1: Write the failing smoke test**

```jsx
// src/components/WaveDivider.test.jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import WaveDivider from './WaveDivider.jsx';

describe('WaveDivider', () => {
  it('renders an svg element', () => {
    const { container } = render(<WaveDivider />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies the flip class when flip is true', () => {
    const { container } = render(<WaveDivider flip />);
    expect(container.querySelector('.wave-divider--flip')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/WaveDivider.test.jsx`
Expected: FAIL — cannot find module `./WaveDivider.jsx`.

- [ ] **Step 3: Implement `src/components/WaveDivider.jsx`**

```jsx
import { motion } from 'framer-motion';
import './WaveDivider.css';

const WAVE_PATH_A =
  'M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z';
const WAVE_PATH_B =
  'M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 L1440,120 L0,120 Z';

function WaveDivider({ flip = false }) {
  return (
    <div className={`wave-divider${flip ? ' wave-divider--flip' : ''}`}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          fill="var(--color-orange)"
          animate={{ d: [WAVE_PATH_A, WAVE_PATH_B, WAVE_PATH_A] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

export default WaveDivider;
```

- [ ] **Step 4: Implement `src/components/WaveDivider.css`**

```css
.wave-divider {
  width: 100%;
  line-height: 0;
}

.wave-divider svg {
  width: 100%;
  height: 80px;
  display: block;
}

.wave-divider--flip {
  transform: scaleY(-1);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/components/WaveDivider.test.jsx`
Expected: PASS (2 tests passed)

- [ ] **Step 6: Commit**

```bash
git add src/components/WaveDivider.jsx src/components/WaveDivider.css src/components/WaveDivider.test.jsx
git commit -m "Add continuously animated WaveDivider component"
```

---

## Task 5: KolamPattern background component

**Files:**
- Create: `src/components/KolamPattern.jsx`
- Create: `src/components/KolamPattern.css`
- Test: `src/components/KolamPattern.test.jsx`

**Interfaces:**
- Produces: `<KolamPattern />` — an absolutely-positioned, full-bleed, low-opacity SVG line pattern meant to be placed as the first child of a `position: relative` yellow-themed section.
- Consumed by: the blank section on Home (Task 10) and placeholder pages (Task 10).

- [ ] **Step 1: Write the failing smoke test**

```jsx
// src/components/KolamPattern.test.jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import KolamPattern from './KolamPattern.jsx';

describe('KolamPattern', () => {
  it('renders an svg with a pattern definition', () => {
    const { container } = render(<KolamPattern />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('pattern')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/KolamPattern.test.jsx`
Expected: FAIL — cannot find module `./KolamPattern.jsx`.

- [ ] **Step 3: Implement `src/components/KolamPattern.jsx`**

A tileable dot-grid-and-diamond kolam-style motif, repeated via an SVG `<pattern>`.

```jsx
import './KolamPattern.css';

function KolamPattern() {
  return (
    <svg className="kolam-pattern" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern
          id="kolam-tile"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="40" cy="10" r="3" fill="var(--color-text-dark)" />
          <circle cx="10" cy="40" r="3" fill="var(--color-text-dark)" />
          <circle cx="70" cy="40" r="3" fill="var(--color-text-dark)" />
          <circle cx="40" cy="70" r="3" fill="var(--color-text-dark)" />
          <circle cx="40" cy="40" r="3" fill="var(--color-text-dark)" />
          <path
            d="M40,10 L70,40 L40,70 L10,40 Z"
            fill="none"
            stroke="var(--color-text-dark)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kolam-tile)" />
    </svg>
  );
}

export default KolamPattern;
```

- [ ] **Step 4: Implement `src/components/KolamPattern.css`**

```css
.kolam-pattern {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.12;
  pointer-events: none;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/components/KolamPattern.test.jsx`
Expected: PASS (1 test passed)

- [ ] **Step 6: Commit**

```bash
git add src/components/KolamPattern.jsx src/components/KolamPattern.css src/components/KolamPattern.test.jsx
git commit -m "Add tileable KolamPattern background component"
```

---

## Task 6: NavBar component

**Files:**
- Create: `src/components/NavBar.jsx`
- Create: `src/components/NavBar.css`
- Test: `src/components/NavBar.test.jsx`

**Interfaces:**
- Consumes: `isNavSolid` from `src/utils/scroll.js` (Task 3).
- Produces: `<NavBar />` — fixed-position nav rendered once in `Layout` (Task 8). Renders `NavLink`s to `/`, `/events`, `/gallery`, `/culture`, `/team`, `/contact` with labels "Home", "Events", "Gallery", "Our Culture and Values", "Team", "Contact".

- [ ] **Step 1: Write the failing smoke test**

```jsx
// src/components/NavBar.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/NavBar.test.jsx`
Expected: FAIL — cannot find module `./NavBar.jsx`.

- [ ] **Step 3: Implement `src/components/NavBar.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isNavSolid } from '../utils/scroll.js';
import './NavBar.css';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/culture', label: 'Our Culture and Values' },
  { to: '/team', label: 'Team' },
  { to: '/contact', label: 'Contact' },
];

function NavBar() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setSolid(isNavSolid(window.scrollY));
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className="navbar"
      animate={{
        backgroundColor: solid ? 'rgba(232, 98, 44, 1)' : 'rgba(232, 98, 44, 0)',
        boxShadow: solid ? '0 2px 12px rgba(0,0,0,0.15)' : '0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <motion.img
        src="/m.png"
        alt="Mayura Kannada Sangha logo"
        className="navbar__logo"
        animate={{ height: solid ? 40 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      <ul className="navbar__links">
        {LINKS.map(({ to, label }) => (
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
    </motion.nav>
  );
}

export default NavBar;
```

- [ ] **Step 4: Implement `src/components/NavBar.css`**

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: var(--nav-height);
}

.navbar__logo {
  display: block;
}

.navbar__links {
  list-style: none;
  display: flex;
  gap: 24px;
  margin: 0;
  padding: 0;
}

.navbar__link {
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-text-light);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
}

.navbar__link--active {
  border-bottom-color: var(--color-text-light);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/components/NavBar.test.jsx`
Expected: PASS (1 test passed)

- [ ] **Step 6: Commit**

```bash
git add src/components/NavBar.jsx src/components/NavBar.css src/components/NavBar.test.jsx
git commit -m "Add NavBar with scroll-driven solid background and logo shrink"
```

---

## Task 7: Footer component

**Files:**
- Create: `src/components/Footer.jsx`
- Create: `src/components/Footer.css`
- Test: `src/components/Footer.test.jsx`

**Interfaces:**
- Consumes: `WaveDivider` from Task 4.
- Produces: `<Footer />` rendered once in `Layout` (Task 8).

- [ ] **Step 1: Write the failing smoke test**

```jsx
// src/components/Footer.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer.jsx';

describe('Footer', () => {
  it('renders the association name and a wave divider svg', () => {
    const { container } = render(<Footer />);
    expect(screen.getByText(/Mayura Kannada Sangha/)).toBeInTheDocument();
    expect(container.querySelector('.wave-divider svg')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/Footer.test.jsx`
Expected: FAIL — cannot find module `./Footer.jsx`.

- [ ] **Step 3: Implement `src/components/Footer.jsx`**

```jsx
import WaveDivider from './WaveDivider.jsx';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <WaveDivider />
      <div className="footer__content">
        <p className="footer__name">Mayura Kannada Sangha • Des Moines, Iowa</p>
        <p className="footer__copyright">
          © {new Date().getFullYear()} Mayura Kannada Sangha, Central Iowa
        </p>
      </div>
    </footer>
  );
}

export default Footer;
```

- [ ] **Step 4: Implement `src/components/Footer.css`**

```css
.footer {
  background: var(--color-orange);
  color: var(--color-text-light);
  text-align: center;
}

.footer__content {
  padding: 32px 16px 48px;
}

.footer__name {
  font-family: var(--font-display);
  font-size: 1.1rem;
  margin: 0 0 8px;
}

.footer__copyright {
  font-size: 0.85rem;
  opacity: 0.85;
  margin: 0;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/components/Footer.test.jsx`
Expected: PASS (1 test passed)

- [ ] **Step 6: Commit**

```bash
git add src/components/Footer.jsx src/components/Footer.css src/components/Footer.test.jsx
git commit -m "Add Footer with wave divider"
```

---

## Task 8: Layout component

**Files:**
- Create: `src/components/Layout.jsx`
- Test: `src/components/Layout.test.jsx`

**Interfaces:**
- Consumes: `NavBar` (Task 6), `Footer` (Task 7).
- Produces: `<Layout>{children}</Layout>` — wraps every page (`Home` and the five placeholders) with the shared nav and footer.

- [ ] **Step 1: Write the failing smoke test**

```jsx
// src/components/Layout.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout.jsx';

describe('Layout', () => {
  it('renders nav, children, and footer', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>page content</div>
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByAltText('Mayura Kannada Sangha logo')).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(screen.getByText(/Mayura Kannada Sangha/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/Layout.test.jsx`
Expected: FAIL — cannot find module `./Layout.jsx`.

- [ ] **Step 3: Implement `src/components/Layout.jsx`**

```jsx
import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';

function Layout({ children }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/Layout.test.jsx`
Expected: PASS (1 test passed)

- [ ] **Step 5: Commit**

```bash
git add src/components/Layout.jsx src/components/Layout.test.jsx
git commit -m "Add Layout component wrapping pages with NavBar and Footer"
```

---

## Task 9: HeroVideo component (scroll-scrubbed video + centered welcome text)

**Files:**
- Create: `src/components/HeroVideo.jsx`
- Create: `src/components/HeroVideo.css`
- Test: `src/components/HeroVideo.test.jsx`

**Interfaces:**
- Consumes: `getScrubProgress` from `src/utils/scroll.js` (Task 3).
- Produces: `<HeroVideo />` — a `200vh` container with a sticky video scrubbed by scroll and a centered text overlay, used only on `Home` (Task 10).

- [ ] **Step 1: Write the failing smoke test**

```jsx
// src/components/HeroVideo.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroVideo from './HeroVideo.jsx';

describe('HeroVideo', () => {
  it('renders the video element and every hero text line, centered', () => {
    const { container } = render(<HeroVideo />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video.querySelector('source').getAttribute('src')).toBe('/videos/0709.mp4');

    [
      'Welcome to',
      'Mayura Kannada Sangha',
      'Central Iowa',
      'ಮಯೂರ ಕನ್ನಡ ಸಂಘ',
      'ಸೆಂಟ್ರಲ್ ಅಯೋವಾ',
    ].forEach((line) => {
      expect(screen.getByText(line)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/HeroVideo.test.jsx`
Expected: FAIL — cannot find module `./HeroVideo.jsx`.

- [ ] **Step 3: Implement `src/components/HeroVideo.jsx`**

```jsx
import { useEffect, useRef } from 'react';
import { getScrubProgress } from '../utils/scroll.js';
import './HeroVideo.css';

function HeroVideo() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    let rafId = null;

    function updateVideoFrame() {
      rafId = null;
      const rect = container.getBoundingClientRect();
      const progress = getScrubProgress(rect.top, rect.height, window.innerHeight);
      if (video.duration && !Number.isNaN(video.duration)) {
        video.currentTime = progress * video.duration;
      }
    }

    function onScroll() {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateVideoFrame);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="hero" ref={containerRef}>
      <div className="hero__sticky">
        <video
          ref={videoRef}
          className="hero__video"
          muted
          playsInline
          preload="auto"
        >
          <source src="/videos/0709.mp4" type="video/mp4" />
        </video>
        <div className="hero__scrim" />
        <div className="hero__text">
          <p className="hero__line hero__line--english">Welcome to</p>
          <p className="hero__line hero__line--english hero__line--title">
            Mayura Kannada Sangha
          </p>
          <p className="hero__line hero__line--english">Central Iowa</p>
          <p className="hero__line hero__line--kannada hero__line--title">
            ಮಯೂರ ಕನ್ನಡ ಸಂಘ
          </p>
          <p className="hero__line hero__line--kannada">ಸೆಂಟ್ರಲ್ ಅಯೋವಾ</p>
        </div>
      </div>
    </div>
  );
}

export default HeroVideo;
```

- [ ] **Step 4: Implement `src/components/HeroVideo.css`**

```css
.hero {
  height: 200vh;
  position: relative;
}

.hero__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.hero__text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-text-light);
  padding: 0 24px;
}

.hero__line {
  margin: 0.15em 0;
  text-align: center;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.hero__line--english {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2.75rem);
}

.hero__line--kannada {
  font-family: var(--font-kannada);
  font-size: clamp(1.3rem, 3.5vw, 2.25rem);
}

.hero__line--title {
  font-size: clamp(2.25rem, 6vw, 4rem);
  font-weight: 700;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/components/HeroVideo.test.jsx`
Expected: PASS (1 test passed)

- [ ] **Step 6: Commit**

```bash
git add src/components/HeroVideo.jsx src/components/HeroVideo.css src/components/HeroVideo.test.jsx
git commit -m "Add HeroVideo with scroll-scrubbed video and centered welcome text"
```

---

## Task 10: Home page, Placeholder page, and App routes

**Files:**
- Create: `src/pages/Home.jsx`
- Create: `src/pages/Home.css`
- Create: `src/pages/Placeholder.jsx`
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: `Layout` (Task 8), `HeroVideo` (Task 9), `KolamPattern` (Task 5).
- Produces: the six routes described in the spec, wired into `App.jsx`.

- [ ] **Step 1: Write the failing routing test**

```jsx
// src/App.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

describe('App routing', () => {
  it('renders the hero welcome text on the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Mayura Kannada Sangha')).toBeInTheDocument();
  });

  it.each([
    ['/events', 'Events'],
    ['/gallery', 'Gallery'],
    ['/culture', 'Our Culture and Values'],
    ['/team', 'Team'],
    ['/contact', 'Contact'],
  ])('renders a placeholder heading for %s', (path, heading) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/App.test.jsx`
Expected: FAIL — `App` scaffold from Task 1 has no routes, "Mayura Kannada Sangha" text not found.

- [ ] **Step 3: Implement `src/pages/Home.jsx`**

```jsx
import Layout from '../components/Layout.jsx';
import HeroVideo from '../components/HeroVideo.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import './Home.css';

function Home() {
  return (
    <Layout>
      <HeroVideo />
      <section className="home__blank">
        <KolamPattern />
      </section>
    </Layout>
  );
}

export default Home;
```

- [ ] **Step 4: Implement `src/pages/Home.css`**

```css
.home__blank {
  height: 100vh;
  background: var(--color-yellow);
}
```

- [ ] **Step 5: Implement `src/pages/Placeholder.jsx`**

```jsx
import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';

function Placeholder({ title }) {
  return (
    <Layout>
      <section
        style={{
          minHeight: '100vh',
          background: 'var(--color-yellow)',
          paddingTop: 'var(--nav-height)',
        }}
      >
        <KolamPattern />
        <h1
          style={{
            position: 'relative',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            marginTop: '64px',
          }}
        >
          {title}
        </h1>
      </section>
    </Layout>
  );
}

export default Placeholder;
```

- [ ] **Step 6: Implement `src/App.jsx`**

```jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Placeholder from './pages/Placeholder.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<Placeholder title="Events" />} />
      <Route path="/gallery" element={<Placeholder title="Gallery" />} />
      <Route path="/culture" element={<Placeholder title="Our Culture and Values" />} />
      <Route path="/team" element={<Placeholder title="Team" />} />
      <Route path="/contact" element={<Placeholder title="Contact" />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- src/App.test.jsx`
Expected: PASS (6 tests passed)

- [ ] **Step 8: Run the full test suite**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 9: Commit**

```bash
git add src/pages src/App.jsx src/App.test.jsx
git commit -m "Wire up Home page and placeholder routes"
```

---

## Task 11: Production build check and manual browser verification

**Files:** none (verification only)

**Interfaces:** none — this task confirms the assembled app from Tasks 1–10 works end-to-end.

- [ ] **Step 1: Run the full test suite one more time**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: build succeeds, `dist/` is created with no errors or warnings about missing assets.

- [ ] **Step 3: Start the dev server and manually verify in a browser**

Run: `npm run dev`, open `http://localhost:5173`, and check:
- Nav bar starts transparent with a moderately large logo; scrolling past ~90px animates it to a solid orange bar with a smaller logo, smoothly.
- Scrolling through the hero scrubs the video frame-by-frame; the five welcome-text lines stay centered (both axes) and legible the entire time.
- Below the hero, a full-height yellow section with a faint kolam line pattern is visible.
- The footer has a continuously animating wave divider and orange background with the association name.
- Clicking each of the 6 nav links navigates to its route; the 5 placeholder routes show a centered heading and the shared nav/footer with no console errors.

- [ ] **Step 4: Stop the dev server**

Kill the `npm run dev` process once verification is complete.

---

## Self-Review Notes

- **Spec coverage:** Routes (Task 10), nav transparent→solid + logo shrink (Task 6), hero scroll-scrub + centered text (Task 9), blank yellow section with kolam pattern (Task 5, 10), animated wave-divided orange footer (Task 4, 7), placeholder pages (Task 10), fonts/colors (Task 2) — all covered.
- **Placeholder scan:** no TBD/TODO markers; every step has concrete code.
- **Type/name consistency:** `getScrubProgress(top, containerHeight, viewportHeight)` and `isNavSolid(scrollY, threshold)` signatures match between Task 3's definition and their Task 6/9 call sites. Asset paths `/m.png` and `/videos/0709.mp4` match the `public/` layout from Task 1.
