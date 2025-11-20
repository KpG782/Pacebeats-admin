-- ==========================================
-- DISABLE RLS FOR ADMIN DASHBOARD DEVELOPMENT
-- ==========================================
-- Run this in your Supabase SQL Editor to temporarily disable RLS
-- WARNING: This allows all authenticated users to access all data
-- Only use this for development/testing purposes

-- Disable RLS on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_heart_rate_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_music_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_gps_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_pace_intervals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.music DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_served DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.heart_rate_alerts DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS DISABLED
-- ==========================================
-- Your admin dashboard can now access all data
-- Remember to re-enable RLS in production!
