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
