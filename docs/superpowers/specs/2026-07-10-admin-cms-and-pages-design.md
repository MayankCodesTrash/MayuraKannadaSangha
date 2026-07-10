# Admin CMS, Firebase Backend, and New Content Pages — Design

## Goal

Turn the static Mayura Kannada Sangha site into one where a single admin can log in and manage events and gallery content live, without hand-editing code or redeploying. Also complete the three placeholder pages (Culture & Values, Team, Contact) with real content, and add a Kannada-language toggle to Culture & Values.

## Architecture

The site remains a static Vite/React app (deployed to Vercel via GitHub), but content that the admin edits now lives in **Firebase** instead of static JS data files:

- **Firestore** — two collections:
  - `events`: `{ title, day, month, year, time, location, imageUrl, storagePath, status: 'upcoming' | 'past', buttons: [{ label, url }] }` (buttons array has 0–3 entries)
  - `galleryCategories`: `{ title, images: [{ url, storagePath }] }`
- **Firebase Storage** — holds uploaded images at `/events/{eventId}/...` and `/gallery/{categoryId}/...`.
- **Firebase Authentication** (Email/Password) — one fixed admin account, internally `admin@mayurakannadasangha.org`, mapped in the UI to username `Admin`.
- **Security rules** — Firestore and Storage: public `read: true`; `write: if request.auth != null`. This is the actual security boundary; the login screen is just the UI for obtaining that auth session. Firebase web config values (`apiKey` etc.) are not secrets and can be committed directly in `src/firebase.js`.
- Public pages (`Events`, `Gallery`) subscribe to Firestore (`onSnapshot`) instead of importing the static data files, so admin changes appear for all visitors immediately with no redeploy.
- A one-time seed script migrates the current contents of `upcomingEvents.js`, `pastEvents.js`, and `gallerySections.js` into Firestore/Storage so no existing content is lost.

## Admin Sign-In

- Footer: small "Admin Sign In" link (subtle placement near the copyright line). If already authenticated, it instead reads "Admin Dashboard" with a "Log Out" action.
- Route `/admin/login`: plain centered card, Username + Password fields, Sign In button. Deliberately unstyled/minimal per request ("nothing fancy").
- On submit, sign in via Firebase Auth using the fixed internal email + provided password. On success, redirect to `/admin`.
- `/admin` and its sub-views are protected: unauthenticated visits redirect to `/admin/login`. Auth session persists across reloads (Firebase default persistence) until logout.

## Admin Dashboard (`/admin`)

Two tabs, functional/minimal styling (not part of the polished public design):

**Events tab**
- Table/list of all events (upcoming + past, status labeled), with Edit / Delete per row.
- Add Event form: title, day, month, year, time, location, image upload (file picker, preview, uploads to Storage), status toggle (Upcoming/Past), and a repeatable button editor (label + URL), capped at 3 buttons, with add/remove controls.
- Edit reopens the form pre-filled. Delete requires confirmation and removes both the Firestore doc and its Storage file.

**Gallery tab**
- List of categories with image counts, Edit / Delete per row.
- Add Category form: title + multi-file image upload to seed the category.
- Category edit view: rename, add more images (upload), remove individual images.

## Public Events Page

- Same visual design/animations as today (EventCard, PastEventCard, SponsorshipSection, KolamPattern), now driven by live Firestore data split into Upcoming/Past by the `status` field.
- `EventCard` renders 0–3 CTA buttons, stacked in vertical rows beneath the event details (previously supported exactly 1 button/link).

## Public Gallery Page

- Same bento layout and lightbox behavior, now reading categories/images from Firestore + Storage URLs. New categories/images appear automatically, no code changes.

## Culture & Values Page (`/culture`)

Replaces the `Placeholder` route with a real page matching the site's existing visual language (Playfair Display headings, warm yellow/orange palette, `KolamPattern` decoration, framer-motion scroll-in animations, consistent with Events/Gallery pages):

- Intro section: "Mayura Kannada Sangha – Central Iowa" heading + the two mission paragraphs provided by the user.
- Four value-pillar cards: Samskāra (ಸಂಸ್ಕಾರ), Sahabhāga (ಸಹಭಾಗ), Sāmudāyika Bhaava (ಸಾಮೂಹಿಕ ಭಾವ), Samskr̥tiya Samrakṣaṇe (ಸಂಸ್ಕೃತಿಯ ಸಂರಕ್ಷಣೆ) — each with the Kannada term, English name, and description, in an animated card grid rather than a bullet list.
- Closing paragraph ("We believe that when culture is celebrated...").
- An "EN / ಕನ್ನಡ" toggle in the page header swaps all body copy on this page to Kannada. Since the user did not supply Kannada translations of the paragraph text, Claude will draft a Kannada translation (using the `--font-kannada` / Noto Sans Kannada font already loaded site-wide) for review later; only this page is translated (nav and other pages stay English-only, per user scope decision).

## Team Page (`/team`)

Replaces the `Placeholder` route:

- "2026 Office Bearers" heading, with `mksdsm2024@gmail.com` contact link near the top.
- Officer cards in an animated grid: Arun Kumar (President), Chandra Shekar (Secretary), Yogeshwara Gonchigar (Treasurer), Naveen Setty (Chairperson), Raghunath Shammanna (Chairperson).
- Each card shows a small role icon (inline SVG, matching the site's existing hand-drawn inline-SVG icon style used for Instagram in the footer): President → gavel, Secretary → quill/document, Treasurer → coin, Chairperson → chair icon (both chairpersons share the same icon). No headshots available, so no photo placeholders are added.

## Contact Page (`/contact`)

Replaces the `Placeholder` route:

- Public-facing styled "Get in Touch" form (Name, Email, Message, Send), consistent with site design — not the plain admin-panel style.
- Wired to **EmailJS** (`@emailjs/browser` package) to send submissions directly to `mksdsm2024@gmail.com`, with inline success/error state, no page reload.
- EmailJS Service ID / Template ID / Public Key are left as placeholder config for now (user will supply later). Until configured, submitting shows a friendly "not available yet" inline message rather than failing silently or crashing.

## Out of Scope (explicitly excluded)

- Multi-admin accounts or role permissions — single fixed admin only.
- Site-wide Kannada translation — Culture & Values page only.
- Automatic upcoming/past classification by date — status is manually set by the admin.
- Real email sending on initial delivery (EmailJS left unconfigured/placeholder).
- Any custom backend/server code — Firebase client SDK only, no Cloud Functions.

## Setup Steps Required From User (before/at deploy time)

1. In the Firebase console for project `kannadasangha-83770`: enable **Firestore Database**, **Storage**, and **Authentication → Email/Password provider**.
2. Create the single admin user in Firebase Authentication with email `admin@mayurakannadasangha.org` and the provided password.
3. Publish the Firestore/Storage security rules Claude provides (public read, auth-required write).
4. Later, create a free EmailJS account and provide Service ID / Template ID / Public Key to activate the contact form.
