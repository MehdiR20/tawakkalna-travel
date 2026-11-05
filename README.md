# توكلنا للسياحة و الأسفار · Tawakkalna Tourism & Travel

Travel agency web app. Customers reserve trips online and pay in person at the agency; staff confirm the booking from the admin dashboard. There is no online payment.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma, NextAuth (credentials + bcrypt), Zod and Lucide.

## Getting started

```bash
npm install
cp .env.example .env     # then fill in the database URLs, NEXTAUTH_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD
npm run db:setup         # creates the database, the admin account and sample trips
npm run dev
```

Open http://localhost:3100. Sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env` to reach `/admin`.

## Before launch

- The seeded trips are samples. Replace them with real trips, prices and dates in `/admin/destinations`.
- Review the claims in the "Why us" section of the dictionaries in `src/i18n/`.
- Have a native speaker proofread the Arabic and French text in `src/i18n/` and the sample trips.
- Hero and sample trip photos are hotlinked from Unsplash. Consider hosting your own.
- Vercel runs several server instances, so replace the in-memory limiter in `src/lib/rate-limit.ts` with a shared store such as Redis.

## Deployment

Hosted on Vercel with PostgreSQL on Neon. Keep local development on its own database: `.env` must never point at production. Schema changes are applied with `npm run db:push`, using the URLs of the database you mean to change.

## How it's organized

```
prisma/             schema and seed
src/proxy.ts        redirects signed-out and non-admin visitors from protected pages
src/actions/        server actions: every write, validated with Zod and auth-checked
src/i18n/           languages: config, and one dictionary each for ar, fr and en
src/lib/            auth, session guards, validation, agency details, formatting
src/components/     shared UI; admin-only pieces are in components/admin
src/app/(site)/     public site, booking flow and profile
src/app/admin/      admin dashboard
```

## Rules worth knowing

- **Languages:** Arabic is the default, with French and English available from the switcher. The choice is kept in a cookie, so URLs are the same in every language. Trip content is stored per language; Arabic is required, and visitors see Arabic where a translation is missing.
- **Currency** is Algerian dinars, in whole units. The labels are in `src/i18n/`.
- **Booking status** starts as `PENDING`. Staff can move it to `CONFIRMED` once paid, or to `CANCELLED`. A cancelled booking is final, because its seats have been released.
- **Capacity** is the total seats for a destination. Pending and confirmed bookings hold seats. The check runs in a serializable transaction so the last seats can't be double-booked.
- **Price** is saved on the booking, so later price edits don't change existing bookings.
- **Deleting a destination** is refused if it has any bookings. Unpublish it instead.
- **Admin access** is checked against the database on every admin page and action, not just the session token.
