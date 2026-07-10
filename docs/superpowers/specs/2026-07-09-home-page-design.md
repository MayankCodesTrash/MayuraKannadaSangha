# Mayura Kannada Sangha Website — Home Page Design

## Overview
Website for the Mayura Kannada Sangha (Central Iowa), a Kannada cultural association in Des Moines, Iowa. This spec covers the initial build: a fully working Home page plus empty placeholder pages for the other sections, all sharing a common nav bar and visual theme.

## Stack
- **Vite + React** (JavaScript, no TypeScript requested)
- **React Router** for page routing
- **Framer Motion** for animations (wave dividers, nav/logo transitions)
- Assets served from `public/`: `public/m.png` (logo), `public/videos/0709.mp4` (hero video)

## Routes
- `/` — Home (full implementation, described below)
- `/events` — placeholder (nav + footer, empty content area)
- `/gallery` — placeholder
- `/culture` — "Our Culture and Values" — placeholder
- `/team` — placeholder
- `/contact` — placeholder

Placeholder pages share the same `<Layout>` (nav + footer) as Home but render an empty `<section>` where content will go later.

## Nav Bar
- Fixed to top, full width, present on every page.
- **Initial state** (top of page): transparent background, logo (`m.png`) rendered moderately large, nav links visible directly over whatever content is behind (video on Home, plain background on placeholder pages).
- **Scrolled state**: once scroll position exceeds ~80–100px, animate (Framer Motion) to:
  - Solid background (orange/yellow themed bar)
  - Logo shrinks to a smaller size
  - Transition is smooth (no jump), driven by a scroll listener toggling a boolean state that Framer Motion animates between.
- Nav links: Home, Events, Gallery, Our Culture and Values, Team, Contact — each a React Router `<Link>` to its route above.
- Active route should be visually indicated (e.g. underline or color).

## Home Page

### 1. Hero Section
- Container is `200vh` tall to give scroll room for the scrub effect.
- Inside the container, the `<video>` element (source: `videos/0709.mp4`) is `position: sticky; top: 0` so it stays pinned in the viewport while its container scrolls past.
- **Scroll-scrub behavior**: on scroll, compute progress (0–1) through the 200vh container and set `video.currentTime = progress * video.duration` directly (no frame-extraction pipeline — direct video seeking as agreed). Video does **not** autoplay/loop independently; its position is entirely scroll-driven. Use `requestAnimationFrame` to throttle the scroll-driven updates for smoothness, and set `video.muted = true` and remove native controls.
- **Hero text overlay**: pinned on top of the video for the entire hero section (not fading in/out), consisting of, in order, each on its own centered line:
  1. "Welcome to"
  2. "Mayura Kannada Sangha"
  3. "Central Iowa"
  4. "ಮಯೂರ ಕನ್ನಡ ಸಂಘ"
  5. "ಸೆಂಟ್ರಲ್ ಅಯೋವಾ"
  - Text is large, vertically and horizontally centered in the viewport (flex/grid centering), every line individually center-aligned (`text-align: center`).
  - English lines use a elegant display/serif Google Font (e.g. "Playfair Display" or similar); Kannada lines use "Noto Sans Kannada" (only font with full, reliable Kannada glyph coverage from Google Fonts) sized to visually balance with the English lines.
  - A subtle dark gradient/scrim sits between the video and the text (e.g. `rgba(0,0,0,0.35)` overlay) to guarantee readability regardless of the video frame showing behind it.
  - Text remains fixed relative to the video (i.e. also sticky-positioned within the hero container) so it stays on screen and centered throughout the entire scrub, not just at the top.

### 2. Blank Section
- Directly below the hero, one `100vh` empty section.
- Styled with the yellow theme: solid yellow background with a subtle, low-opacity, tileable SVG background pattern of kolam/rangoli-style geometric linework (repeating, decorative, not distracting).
- No content inside for now (intentionally blank, ready for future copy/sections).

### 3. Footer (with wave divider)
- Wave divider: an SVG shape at the top edge of the footer, animated continuously via Framer Motion to simulate a gentle ocean-like waving motion (looping, e.g. animating a `path` `d` attribute or using an SVG `<animate>`/Framer Motion `animate` loop). This same wave-divider component is reused at any section boundary in the future (built as a standalone reusable component).
- Footer background: orange theme.
- Footer content: association name, basic placeholder line (e.g. "Mayura Kannada Sangha • Des Moines, Iowa" + copyright), no real contact form/content yet (Contact page is a separate placeholder route).

## Visual Theme
- Two alternating background themes used across sections/pages:
  - **Yellow theme**: solid yellow background + subtle kolam-pattern SVG overlay.
  - **Orange theme**: solid orange background, used for footer and nav-bar-scrolled state; wave-shaped dividers at transitions between yellow and orange sections use Framer Motion continuous wave animation.
- Exact hex values to be tuned visually during implementation, starting from approx. `#F5B800` (yellow) and `#E8622C` (orange).
- Fonts: Google Fonts "Playfair Display" (or similar elegant serif) for English display text, "Noto Sans Kannada" for Kannada text, loaded via `<link>` in `index.html` or `@import` in global CSS.

## Placeholder Pages
- Each of `/events`, `/gallery`, `/culture`, `/team`, `/contact` renders: Nav (shared) + an empty `<section>` (yellow themed background, no content) + Footer (shared, with wave divider).
- Purpose: routes exist and are navigable now; content to be added later.

## Out of Scope
- Content for Events/Gallery/Culture/Team/Contact pages.
- Frame-by-frame ("Apple-style") image-sequence video scrubbing.
- Mobile hamburger menu / deep mobile UX optimization (site should be responsive-safe but not specially tuned for mobile in this pass).
- Backend, CMS, or data-driven content — everything is static for now.

## Testing / Verification
- `npm run dev` and manually verify in browser:
  - Nav bar starts transparent + large logo, becomes solid + small logo after ~80-100px scroll, transition is smooth.
  - Scrolling through the hero scrubs the video smoothly, text overlay is legible and centered throughout.
  - Blank section shows yellow background + visible (subtle) pattern.
  - Footer wave divider animates continuously (ocean-like) and footer is orange-themed.
  - All 6 nav links route correctly; placeholder pages render nav + empty section + footer without errors.
