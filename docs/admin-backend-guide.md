Plan: Build PaceBeats Admin Dashboard Backend Integration
The dashboard has a production-ready frontend (90% complete UI) but operates entirely on mock data with zero backend integration. This plan transforms it into a functional admin system by implementing Supabase database, API routes, authentication, and real data fetching—while keeping the excellent existing UI intact.

Steps
Setup Foundation - Create .env.local with Supabase credentials, install @supabase/ssr and swr packages, establish Supabase client and server client, execute database schema SQL from admin.md creating 7 tables (users, running_sessions, session_gps_points, session_heart_rates, music_tracks, listening_events, user_activity_log)

Create Type System - Build complete TypeScript interfaces in src/lib/types/ matching database schema: user.ts with 18+ fields, session.ts with GPS/heart rate types, music.ts with tracks and listening events, analytics.ts for dashboard stats, api.ts for request/response types

Build API Layer - Implement Next.js API routes in src/app/api/admin/: authentication routes (login, logout, me), dashboard stats, users CRUD, sessions endpoints, music tracks, analytics overview

Create Data Queries - Build Supabase query functions in src/lib/supabase/queries/: users.ts for list/get/update/delete operations, sessions.ts with active session queries, music.ts for track management, analytics.ts for aggregated stats

Implement Data Hooks - Create SWR-based custom hooks in src/hooks/: use-users.ts, use-sessions.ts, use-music.ts, use-analytics.ts with loading/error states and data mutation functions

Connect Pages to Backend - Replace mock data imports in existing pages: update dashboard/page.tsx to use useDashboardStats(), update users/page.tsx to use useUsers(), update sessions/page.tsx to use useSessions(), update music/page.tsx to use useMusicTracks(), update analytics/page.tsx to use useAnalytics(), add loading skeletons and error boundaries

Implement Authentication - Create middleware.ts for route protection redirecting unauthenticated users to /login, update login/page.tsx to call real login API instead of setTimeout, add logout functionality to header.tsx, implement session management with cookies

Build Detail Pages - Create dynamic routes: users/[id]/page.tsx showing profile/stats/sessions, sessions/[id]/page.tsx with GPS map and metrics, music/[id]/page.tsx with engagement analytics

Enable CRUD Operations - Make existing UI buttons functional: connect "Delete" action in users/page.tsx to DELETE API, add "Edit User" modal with PATCH request, implement "Upload Music" form with file handling, add CSV export functionality using API data, enable real-time search/filter through API queries

Further Considerations
Database Seeding Strategy - Need initial data for testing? Create seed script with sample users/sessions/tracks, or wait for mobile app data? Option A: Seed immediately for testing / Option B: Start empty and populate from mobile app / Option C: Import mock data as seed

Authentication Provider - Use Supabase Auth (recommended for integration) or custom JWT system? Supabase Auth provides email/password, OAuth, and magic links out of the box

Real-time Updates - Implement Supabase real-time subscriptions for live session monitoring in sessions/page.tsx showing active runners, or poll API every N seconds?

Error Handling Pattern - Add global error boundary component, toast notifications for failed operations, or rely on inline error messages? Should failed API calls retry automatically?
