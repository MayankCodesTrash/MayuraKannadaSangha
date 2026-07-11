# Admin CMS setup (one-time, before deploying)

This site's admin dashboard is backed by Firebase project `kannadasangha-83770` (Auth +
Firestore) for data, and [Cloudinary](https://cloudinary.com) for image uploads — Cloudinary
is used instead of Firebase Storage because Firebase now requires the paid Blaze plan (a
credit card on file) just to enable Storage, even for free-tier usage. Cloudinary's free tier
needs no card. Before the admin login, dashboard, or image uploads will work in production, do
the following:

## 1. Enable the required Firebase products

In the [Firebase console](https://console.firebase.google.com/project/kannadasangha-83770):

- **Build → Authentication → Get started → Sign-in method → Email/Password** — enable it.
- **Build → Firestore Database → Create database** — start in production mode, pick any region.

## 2. Create the admin user

In **Authentication → Users → Add user**, create:

- Email: `admin@mayurakannadasangha.org`
- Password: the password you want to use to sign in at `/admin/login` (username there is
  always `Admin`; only the password field matters for login).

## 3. Publish the Firestore security rules

In **Firestore Database → Rules**, paste the contents of `firestore.rules` from this repo and
click **Publish**. This rule makes all event/gallery data publicly readable (so the site works
for every visitor) but only writable by a signed-in admin.

## 4. Connect Cloudinary for image uploads

1. Create a free account at [cloudinary.com](https://cloudinary.com) — no credit card required.
2. From the Cloudinary dashboard, copy your **Cloud Name**.
3. Go to **Settings → Upload → Upload presets → Add upload preset**, set **Signing Mode** to
   **Unsigned**, and save. Copy the preset name.
4. Fill in `src/cloudinary.js` with your Cloud Name and upload preset name.

Both values are safe to commit — an unsigned upload preset only allows uploads, not deletion
or account access. Deleting an image from the admin dashboard removes it from the site's
gallery/event listing, but the file itself stays in your Cloudinary account (deleting from
Cloudinary requires a secret key that can't safely live in browser code); periodically clear
unused files from the Cloudinary Media Library if storage usage matters to you.

Until this is configured, `src/cloudinary.js` ships with empty values and image uploads in the
admin dashboard will show an inline "not connected yet" error — the rest of the dashboard
(adding/editing events and categories without images) still works.

## 5. Import the existing events and gallery photos

After deploying, log in at `/admin/login`, go to the dashboard, and click
**"Import Legacy Data (one-time)"**. This copies the events and gallery photos that used to
be hardcoded in `src/data/upcomingEvents.js`, `src/data/pastEvents.js`, and
`src/data/gallerySections.js` into Firestore, so the live site keeps showing them (these use
their original external image URLs, not Cloudinary, so this step doesn't require Cloudinary to
be configured). Only run this once — running it again will create duplicate entries.

## 6. Connect the contact form (optional, can be done later)

The Contact page is wired to [EmailJS](https://www.emailjs.com) but ships unconfigured. To
turn it on:

1. Create a free EmailJS account and an email service pointed at `mksdsm2024@gmail.com`.
2. Create an email template with `from_name`, `from_email`, and `message` variables.
3. Fill in `src/emailjs.js` with your Service ID, Template ID, and Public Key.

Until this is done, the Contact page shows a friendly "isn't connected yet" message with a
`mailto:` link instead of failing.
