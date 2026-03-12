# Admin Account Setup

## Purpose

This dashboard is admin-only. A user must exist in Supabase Auth and also have an admin role in the `users` table.

## Required Fields

- `id`
- `email`
- `username`
- `role`

## Recommended Flow

1. Create the user in Supabase Auth.
2. Insert or update the matching row in `public.users`.
3. Set `role = 'admin'`.
4. Sign in through `/login`.

## Example SQL

```sql
update public.users
set role = 'admin'
where email = 'admin@pacebeats.com';
```

## Verification

- The user can sign in at `/login`
- Non-admin users are blocked from `/dashboard`
- Admin users are redirected to `/dashboard`

## Notes

- Access control is currently enforced by checking `users.role` after sign-in.
