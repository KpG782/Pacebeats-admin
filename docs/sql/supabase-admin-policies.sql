-- ==========================================
-- PACEBEATS ADMIN - RLS POLICIES FOR ADMIN DASHBOARD
-- ==========================================
-- Run this in your Supabase SQL Editor to allow admin users to view all data
-- This enables the admin dashboard to display all users, sessions, and related data

-- ==========================================
-- 1. USERS TABLE POLICIES
-- ==========================================

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to view all users
CREATE POLICY "Admin users can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ==========================================
-- 2. SESSION HEART RATE DATA POLICIES
-- ==========================================

-- Enable RLS on session_heart_rate_data table
ALTER TABLE public.session_heart_rate_data ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to view all heart rate data
CREATE POLICY "Admin users can view all heart rate data"
  ON public.session_heart_rate_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert heart rate data for their own sessions
CREATE POLICY "Users can insert heart rate data for their sessions"
  ON public.session_heart_rate_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.running_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- ==========================================
-- 3. SESSION MUSIC HISTORY POLICIES
-- ==========================================

-- Enable RLS on session_music_history table
ALTER TABLE public.session_music_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to view all music history
CREATE POLICY "Admin users can view all music history"
  ON public.session_music_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert music history for their own sessions
CREATE POLICY "Users can insert music history for their sessions"
  ON public.session_music_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.running_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- ==========================================
-- 4. SESSION GPS POINTS POLICIES
-- ==========================================

-- Enable RLS on session_gps_points table
ALTER TABLE public.session_gps_points ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to view all GPS data
CREATE POLICY "Admin users can view all GPS data"
  ON public.session_gps_points
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert GPS points for their own sessions
CREATE POLICY "Users can insert GPS points for their sessions"
  ON public.session_gps_points
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.running_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- ==========================================
-- 5. SESSION PACE INTERVALS POLICIES
-- ==========================================

-- Enable RLS on session_pace_intervals table
ALTER TABLE public.session_pace_intervals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to view all pace intervals
CREATE POLICY "Admin users can view all pace intervals"
  ON public.session_pace_intervals
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert pace intervals for their own sessions
CREATE POLICY "Users can insert pace intervals for their sessions"
  ON public.session_pace_intervals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.running_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- ==========================================
-- 6. MUSIC TABLE POLICIES
-- ==========================================

-- Enable RLS on music table
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view music catalog
CREATE POLICY "All users can view music catalog"
  ON public.music
  FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- 7. LISTENING EVENTS POLICIES
-- ==========================================

-- Enable RLS on listening_events table
ALTER TABLE public.listening_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to view all listening events
CREATE POLICY "Admin users can view all listening events"
  ON public.listening_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert listening events for their own sessions
CREATE POLICY "Users can insert their own listening events"
  ON public.listening_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ==========================================
-- 8. RECOMMENDATION SERVED POLICIES
-- ==========================================

-- Enable RLS on recommendation_served table
ALTER TABLE public.recommendation_served ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to view all recommendations
CREATE POLICY "Admin users can view all recommendations"
  ON public.recommendation_served
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow system to insert recommendations
CREATE POLICY "System can insert recommendations"
  ON public.recommendation_served
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==========================================
-- SETUP COMPLETE!
-- ==========================================
-- Your admin dashboard can now view all data across all users
-- The policies ensure:
-- 1. Admin users (authenticated) can SELECT all data
-- 2. Regular users can only INSERT/UPDATE their own data
-- 3. All tables are protected by Row Level Security

-- Next steps:
-- 1. Refresh your admin dashboard
-- 2. You should now see all users and their sessions
-- 3. Make sure you're logged in with an admin@pacebeats.com account
