QR Entry System — Scaffold

This repository contains a minimal scaffold for a QR-based event entry system.

Quick start

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

3. Open http://localhost:3000 and register an attendee. The API will generate a signed token and data-URL QR image (stored in `data/attendees.json`).

Notes & next steps

- This is a scaffold intended to be replaced with a production stack (Supabase for DB and realtime, SendGrid for emails, Tailwind for UI).
- Replace file-based persistence with a Postgres DB (Supabase) using `supabase/schema.sql`.
- Integrate email sending in `src/pages/api/register.js`.
- Add camera-based QR scanning on mobile (e.g., `html5-qrcode` or `jsQR`) and a real admin dashboard.

Files of interest

- `src/pages/index.js` — registration form
- `src/pages/api/register.js` — registration + QR generation (stub)
- `src/pages/api/validate.js` — token validation endpoint
- `src/pages/scan.js` — simple scanner UI (manual paste)
- `supabase/schema.sql` — production schema example

Environment

- Set `SECRET_KEY` for signing tokens in production.
- This scaffold uses `qrcode` to create data URLs for demonstration.

Email (SMTP / nodemailer)

- To send confirmation emails with the QR ticket using SMTP, set the following environment variables:
	- `SMTP_HOST` — your SMTP server host (e.g. `smtp.sendgrid.net`, `smtp.gmail.com`)
	- `SMTP_PORT` — SMTP port (usually `587` for STARTTLS or `465` for SSL)
	- `SMTP_USER` — SMTP username
	- `SMTP_PASS` — SMTP password
	- `FROM_EMAIL` — the "from" address for outgoing emails (e.g. `tickets@yourorg.org`)

Supabase setup

- Create a Supabase project and run the SQL in `supabase/schema.sql` (or use the Supabase SQL editor).
- Set the following environment variables for local development and deployment:
	- `SUPABASE_URL` — your Supabase project URL
	- `SUPABASE_SERVICE_KEY` — the service role key (or a key with write privileges)
	- `SECRET_KEY` — signing secret for QR tokens
  
	Auth (Supabase)

	- To enable Google sign-in, configure the Google provider in your Supabase project's Auth > Providers settings. You will need to provide OAuth client credentials (client ID and secret) in the Supabase dashboard.
	- Set the following public env vars in your Next.js environment so the frontend can use Supabase Auth:
		- `NEXT_PUBLIC_SUPABASE_URL` — same as `SUPABASE_URL`
		- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key

	Login

	- Visit `/auth/login` to sign in. The app supports Google OAuth and email magic-links (both redirect to `/admin` on success).


After you set env vars, install dependencies and run the app:

```bash
npm install
npm run dev
```

Next actions you can ask me to do

- Hook this scaffold to Supabase (I can add example server code and env instructions).
- Add camera-based scanning and admin dashboard.
- Integrate SendGrid for automated emails.
- Convert the UI to Tailwind and add mobile polish.
# Qr-entry-system-