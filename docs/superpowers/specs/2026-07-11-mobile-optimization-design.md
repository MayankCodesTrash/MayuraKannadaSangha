# Mobile Optimization Design

## Goal
Make the site usable and correct on mobile viewports, specifically: the nav bar, the scroll-scrubbed hero video on the home page, and the admin screens (dashboard, events tab, gallery tab). Also replace the day/month/year text inputs in the admin event form with a native date picker.

## 1. Nav bar (`src/components/NavBar.jsx`, `NavBar.css`)

**Problem:** No responsive styles exist. The horizontal `navbar__links` list has no wrap/collapse behavior, so it overflows or crowds on narrow screens.

**Design:**
- Add a breakpoint (`max-width: 720px`) below which:
  - `navbar__links` is hidden by default.
  - A hamburger toggle button (`navbar__toggle`) appears, reusing the existing `motion` primitives already imported (`framer-motion`) for an open/close animation.
  - Tapping the toggle opens a full-width dropdown/overlay panel listing `NAV_LINKS` (imported from `../data/navLinks.js`, no changes needed there) as stacked links.
  - Selecting a link (via `NavLink`) closes the menu (track open state with `useState`).
  - Logo and nav height (`--nav-height`, `--nav-height-scrolled` CSS vars) scale down further on mobile so the hero content isn't pushed too far below the fold.
- No changes to `isNavSolid`/scroll-shrink logic — that behavior stays for both mobile and desktop, just at smaller pixel values.

## 2. Hero video (`src/components/HeroVideo.jsx`, `HeroVideo.css`)

**Problem (root cause confirmed via `ffprobe`):** the source video (`/videos/0709.mp4`) is 720×720. The container height is derived from `aspect-ratio: 1/1` on a `width: 100%` box, so container height == container width. On desktop (wide viewport), that height comfortably exceeds `100vh`, giving scroll room for `getScrubProgress` in `src/utils/scroll.js` to compute a 0→1 progress used to scrub `video.currentTime`. On mobile (narrow viewport, e.g. ~390px wide but ~800px tall), the container is only ~390px tall — shorter than the viewport. `getScrubProgress` returns `0` whenever `scrollableRange <= 0`, so the scrub never advances, and the `position: sticky` pinned overlay (which assumes `height: 100vh`) overflows/unsticks against its too-short parent — this is the "cut off" look.

**Design:**
- Add a mobile breakpoint (same `720px` cutoff as nav, or a dedicated one if visual testing shows otherwise) where `.hero__video-wrap` drops `aspect-ratio: 1/1` in favor of an explicit height (e.g. `height: 220vh`) large enough to give a real scroll range above `100vh`. Exact multiplier tuned during implementation by checking the scrub feels smooth on common phone heights (~700–900px).
- `.hero__video` keeps `object-fit: cover`, so the square source still crops sensibly to fill the taller mobile box.
- Re-check `.hero__text` font sizes at narrow widths (already uses `clamp()`, but confirm the lower bound doesn't overflow on ~360px-wide devices) and adjust `hero__text` padding if needed.
- No changes to the scrubbing logic itself (`getScrubProgress`, the `requestAnimationFrame` loop) — the fix is purely giving it a valid scroll range on mobile.

## 3. Admin screens (`AdminDashboard.jsx`/`.css`, `EventsAdminTab.jsx`/`.css`, `GalleryAdminTab.jsx`/`.css`)

**Problem:** Flex rows (dashboard header + actions, tab bar, event/gallery list rows) have no wrap behavior and aren't sized for narrow viewports; form inputs/buttons aren't necessarily full-width/tap-friendly.

**Design:**
- `AdminDashboard.css`: stack `admin-dashboard__header` (title + actions) vertically below ~600px; let `admin-dashboard__header-actions` wrap; ensure the tab bar (`admin-dashboard__tabs`) buttons remain reachable/full-width on narrow screens.
- `EventsAdminTab.css` / `GalleryAdminTab.css`: allow list rows (`events-admin__row`, `gallery-admin__row`) to wrap or stack label/status/actions vertically on narrow screens; ensure form inputs stretch to full width and buttons have adequate tap target size (min ~44px height).
- No structural/JSX changes needed for this section beyond the date picker change below — purely CSS.

## 4. Admin event date picker (`EventsAdminTab.jsx`)

**Problem:** The event form has three separate text inputs (`day`, `month`, `year`) which is unwieldy on mobile (three small text boxes vs. one control).

**Current data model (unchanged downstream):** Firestore event docs store `day` (e.g. `"17"`), `month` (3-letter abbreviation, e.g. `"Jul"`), `year` (e.g. `"2026"`) as separate string fields — consumed directly by `EventCard.jsx` for the ticket-style date display, and produced this way by `seedLegacyData.js`. This spec does not change the storage schema.

**Design:**
- Replace the three `day`/`month`/`year` text `<input>` fields in the form with a single `<input type="date" id="event-date">`.
- Form state keeps a single derived field, e.g. `eventDate` (ISO `YYYY-MM-DD` string, native to `<input type="date">`), instead of separate `day`/`month`/`year` fields in `EMPTY_FORM`.
- On `startEdit`, reconstruct the ISO date string from the event's stored `day`/`month`/`year` (parsing the 3-letter month abbreviation) to pre-fill the date input.
- On `handleSubmit`, derive `day`, `month` (3-letter abbreviation), and `year` strings from `form.eventDate` before writing to Firestore, so `baseFields` sent to `createEvent`/`updateEvent` are unchanged in shape.
- A small local helper (e.g. `toDayMonthYear(isoDate)` / `fromDayMonthYear(day, month, year)`) added at the top of `EventsAdminTab.jsx` handles the conversion both ways.

## 5. Testing
- Existing test files (`NavBar.test.jsx`, `HeroVideo.test.jsx`, `AdminDashboard.test.jsx`, `EventsAdminTab.test.jsx`) will need updates/additions to cover: hamburger menu open/close, date picker round-trip conversion (edit pre-fill + submit), and that responsive CSS changes don't break existing rendering assumptions.
- Manual verification: run `npm run dev`, check nav/hero/admin at common mobile widths (375px, 390px, 414px) via browser dev tools device emulation.

## 6. Deployment
- Once implemented and tests pass, commit and push directly to `main` (matching this repo's existing workflow of direct-to-main commits), after explicit confirmation.
