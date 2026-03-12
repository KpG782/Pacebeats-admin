# Supabase Setup

## Required Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Basic Setup

1. Create a Supabase project.
2. Run the SQL in `supabase-schema.sql`.
3. Confirm the main tables exist:
   - `users`
   - `running_sessions`
   - `music`
   - `listening_events`
   - `recommendation_served`
4. Enable the policies your admin app needs.
5. Create at least one admin user.

## Minimum Data Needed For A Useful Dashboard

- Users in `users`
- Sessions in `running_sessions`
- Tracks in `music`
- Playback history in `listening_events`

## Current Admin Coverage

- `/dashboard` reads live summary data from Supabase
- `/dashboard/users` reads live user data
- `/dashboard/sessions` reads live session data

## Known Gaps

- Music pages still need full live query integration
- Analytics still needs real aggregate queries
- Some settings and notifications are still placeholder flows
