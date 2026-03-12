# Pacebeats Admin Dashboard

Pacebeats Admin is a Next.js 15 dashboard for managing users, sessions, music data, and reporting for the Pacebeats platform.

## Current Scope

- Admin authentication with Supabase Auth
- Dashboard home with live Supabase-backed metrics
- User management with list and detail views
- Session management with detail drilldowns
- Music library and analytics UI
- Settings, notifications, and help pages

## Notable Status

- The dashboard home now reads live data from Supabase.
- Users and sessions are the strongest real-data modules today.
- Music, analytics, notifications, and settings still need more backend wiring.

## Stack

- Next.js 15
- React 19
- TypeScript
- Supabase
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Set up the database using [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

4. Create an admin account using [docs/ADMIN_ACCOUNT_SETUP.md](docs/ADMIN_ACCOUNT_SETUP.md)

5. Start the app

```bash
npm run dev
```

## Main Routes

- `/login`
- `/dashboard`
- `/dashboard/users`
- `/dashboard/sessions`
- `/dashboard/music`
- `/dashboard/analytics`
- `/dashboard/notifications`
- `/dashboard/help`
- `/dashboard/settings/profile`
- `/dashboard/settings/account`
- `/dashboard/settings/security`

## Project Notes

- The repo still contains some mock datasets under `src/lib/enhanced-*.ts` and `src/lib/mock-data.ts`.
- The dashboard home uses `src/lib/supabase/dashboard-queries.ts`.
- Session detail queries are implemented in `src/lib/supabase/session-queries.ts`.

## Documentation

- [docs/ADMIN_DASHBOARD.md](docs/ADMIN_DASHBOARD.md)
- [docs/ADMIN_DASHBOARD_COMPARISON.md](docs/ADMIN_DASHBOARD_COMPARISON.md)
- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
- [docs/ADMIN_ACCOUNT_SETUP.md](docs/ADMIN_ACCOUNT_SETUP.md)
