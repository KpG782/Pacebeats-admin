-- ==========================================
-- PACEBEATS ADMIN - SUPABASE DATABASE SCHEMA
-- ==========================================
-- This file contains all SQL needed to set up the database for the Pacebeats Admin Dashboard
-- Run this in your Supabase SQL editor

-- ==========================================
-- 1. USERS TABLE (Already exists - reference only)
-- ==========================================
-- Note: This table should already exist in your Supabase project
-- Included here for reference and to show the structure

-- CREATE TABLE IF NOT EXISTS public.users (
--   id uuid PRIMARY KEY DEFAULT auth.uid(),
--   email text,
--   created_at timestamptz DEFAULT now(),
--   age int2,
--   weight_kg float4,
--   height_cm float4,
--   run_frequency text,
--   pump_up_genres text[],
--   survey_completed bool DEFAULT false,
--   survey_completed_at timestamp,
--   username text,
--   gender text,
--   provider text,
--   experience_duration text,
--   pace_band text,
--   unknown_pace bool DEFAULT false,
--   preferred_genres text[],
--   spotify_access_token text,
--   spotify_refresh_token text,
--   spotify_connected_at text,
--   spotify_token_expires_at text,
--   spotify_user_id text,
--   height_unit text DEFAULT 'cm',
--   weight_unit text DEFAULT 'kg'
-- );

-- ==========================================
-- 2. RUNNING SESSIONS TABLE
-- ==========================================
-- Create running_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.running_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  distance_meters float,
  duration_seconds integer,
  avg_pace_min_per_km numeric,
  avg_heart_rate integer,
  calories_burned integer,
  route_polyline text,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for running_sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.running_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.running_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON public.running_sessions(start_time DESC);

-- ==========================================
-- 3. SESSION HEART RATE DATA TABLE (Already exists - reference only)
-- ==========================================
-- Note: This table should already exist based on your schema
-- CREATE TABLE IF NOT EXISTS public.session_heart_rate_data (
--   id bigserial PRIMARY KEY,
--   session_id uuid NOT NULL REFERENCES public.running_sessions(id) ON DELETE CASCADE,
--   timestamp_offset_seconds integer NOT NULL,
--   heart_rate_bpm integer NOT NULL CHECK (heart_rate_bpm >= 40 AND heart_rate_bpm <= 220),
--   is_connected boolean DEFAULT true,
--   recorded_at timestamptz DEFAULT now(),
--   CONSTRAINT unique_session_timestamp UNIQUE (session_id, timestamp_offset_seconds)
-- );

-- CREATE INDEX IF NOT EXISTS idx_hr_session_id ON public.session_heart_rate_data(session_id, timestamp_offset_seconds);

-- ==========================================
-- 4. HEART RATE ALERTS TABLE (NEW - Required for IoT Monitor)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.heart_rate_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  session_id uuid NOT NULL REFERENCES public.running_sessions(id) ON DELETE CASCADE,
  heart_rate integer NOT NULL CHECK (heart_rate >= 40 AND heart_rate <= 220),
  severity text NOT NULL CHECK (severity IN ('LOW', 'HIGH', 'CRITICAL')),
  created_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  CONSTRAINT heart_rate_alerts_check CHECK (
    (resolved = false AND resolved_at IS NULL) OR 
    (resolved = true AND resolved_at IS NOT NULL)
  )
);

-- Create indexes for heart_rate_alerts
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.heart_rate_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_session_id ON public.heart_rate_alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON public.heart_rate_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.heart_rate_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.heart_rate_alerts(created_at DESC);

-- ==========================================
-- 5. MUSIC TABLE (Already exists - reference only)
-- ==========================================
-- Note: This table should already exist
-- CREATE TABLE IF NOT EXISTS public.music (
--   track_id text PRIMARY KEY,
--   name text,
--   artist text,
--   spotify_preview_url text,
--   spotify_id text,
--   tags text,
--   genre text,
--   year int8,
--   duration_ms int8,
--   danceability float8,
--   energy float8,
--   key text,
--   loudness float8,
--   mode text,
--   speechiness float8,
--   acousticness float8,
--   instrumentalness text,
--   liveness float8,
--   valence float8,
--   tempo float8,
--   time_signature int8,
--   mood varchar
-- );

-- ==========================================
-- 6. LISTENING EVENTS TABLE (Already exists - reference only)
-- ==========================================
-- Note: No primary key is set according to your schema
-- You may want to add a composite primary key or an id column
-- CREATE TABLE IF NOT EXISTS public.listening_events (
--   session_id uuid NOT NULL,
--   user_id uuid NOT NULL,
--   ts_start timestamptz NOT NULL,
--   ts_end timestamptz,
--   track_id text NOT NULL,
--   played_ms int4,
--   completed bool,
--   skipped bool,
--   liked bool,
--   disliked bool
-- );

-- Optional: Add composite primary key to listening_events
-- ALTER TABLE public.listening_events 
--   ADD PRIMARY KEY (session_id, user_id, ts_start, track_id);

-- ==========================================
-- 7. RECOMMENDATION SERVED TABLE (Already exists - reference only)
-- ==========================================
-- CREATE TABLE IF NOT EXISTS public.recommendation_served (
--   session_id uuid,
--   user_id uuid,
--   ts timestamptz DEFAULT now(),
--   track_id text,
--   rank integer,
--   bpm_center numeric,
--   pace_min numeric,
--   user_mood text,
--   candidate_score numeric,
--   run_mode text,
--   target_pace_min numeric
-- );

-- ==========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.running_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heart_rate_alerts ENABLE ROW LEVEL SECURITY;

-- Running Sessions Policies
-- Allow authenticated users to view all sessions (for admin dashboard)
CREATE POLICY "Allow authenticated users to view all sessions"
  ON public.running_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own sessions
CREATE POLICY "Users can insert their own sessions"
  ON public.running_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own sessions
CREATE POLICY "Users can update their own sessions"
  ON public.running_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Heart Rate Alerts Policies
-- Allow authenticated users to view all alerts (for admin dashboard)
CREATE POLICY "Allow authenticated users to view all alerts"
  ON public.heart_rate_alerts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow system/service role to insert alerts
CREATE POLICY "System can insert alerts"
  ON public.heart_rate_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update alerts (for resolving)
CREATE POLICY "Authenticated users can update alerts"
  ON public.heart_rate_alerts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 9. ENABLE REALTIME
-- ==========================================

-- Enable realtime for IoT monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_heart_rate_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.heart_rate_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.running_sessions;

-- ==========================================
-- 10. FUNCTIONS AND TRIGGERS
-- ==========================================

-- Function to automatically create alerts when heart rate is abnormal
CREATE OR REPLACE FUNCTION check_heart_rate_and_create_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_severity text;
  v_session running_sessions%ROWTYPE;
  v_user users%ROWTYPE;
BEGIN
  -- Determine severity
  IF NEW.heart_rate_bpm > 180 THEN
    v_severity := 'CRITICAL';
  ELSIF NEW.heart_rate_bpm > 160 THEN
    v_severity := 'HIGH';
  ELSIF NEW.heart_rate_bpm < 50 THEN
    v_severity := 'LOW';
  ELSE
    -- Normal range, no alert needed
    RETURN NEW;
  END IF;

  -- Get session and user info
  SELECT * INTO v_session FROM running_sessions WHERE id = NEW.session_id;
  SELECT * INTO v_user FROM users WHERE id = v_session.user_id;

  -- Check if there's already an unresolved alert for this session and severity
  IF NOT EXISTS (
    SELECT 1 FROM heart_rate_alerts 
    WHERE session_id = NEW.session_id 
    AND severity = v_severity 
    AND resolved = false
    AND created_at > NOW() - INTERVAL '5 minutes'
  ) THEN
    -- Create new alert
    INSERT INTO heart_rate_alerts (
      user_id,
      username,
      session_id,
      heart_rate,
      severity,
      resolved
    ) VALUES (
      v_session.user_id,
      COALESCE(v_user.username, v_user.email, 'Unknown'),
      NEW.session_id,
      NEW.heart_rate_bpm,
      v_severity,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic alert creation
DROP TRIGGER IF EXISTS trigger_check_heart_rate ON public.session_heart_rate_data;
CREATE TRIGGER trigger_check_heart_rate
  AFTER INSERT OR UPDATE ON public.session_heart_rate_data
  FOR EACH ROW
  EXECUTE FUNCTION check_heart_rate_and_create_alert();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for running_sessions updated_at
DROP TRIGGER IF EXISTS update_running_sessions_updated_at ON public.running_sessions;
CREATE TRIGGER update_running_sessions_updated_at
  BEFORE UPDATE ON public.running_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 11. SAMPLE DATA (OPTIONAL - For Testing)
-- ==========================================

-- Uncomment the following to insert sample data for testing
-- Make sure to replace user IDs with actual IDs from your users table

/*
-- Insert sample active sessions
INSERT INTO public.running_sessions (id, user_id, start_time, status, distance_meters, duration_seconds, avg_pace_min_per_km)
VALUES 
  (gen_random_uuid(), 'YOUR_USER_ID_1', NOW() - INTERVAL '30 minutes', 'active', 3000, 1800, 6.0),
  (gen_random_uuid(), 'YOUR_USER_ID_2', NOW() - INTERVAL '15 minutes', 'active', 1500, 900, 6.0);

-- Insert sample heart rate data
-- Replace SESSION_ID with actual session IDs from above
INSERT INTO public.session_heart_rate_data (session_id, timestamp_offset_seconds, heart_rate_bpm)
VALUES 
  ('SESSION_ID_1', 0, 120),
  ('SESSION_ID_1', 60, 135),
  ('SESSION_ID_1', 120, 150),
  ('SESSION_ID_2', 0, 110),
  ('SESSION_ID_2', 60, 125);
*/

-- ==========================================
-- SETUP COMPLETE!
-- ==========================================
-- Your database is now ready for the Pacebeats Admin Dashboard
-- Next steps:
-- 1. Verify all tables exist: Check the Table Editor in Supabase
-- 2. Test realtime: Insert data and watch the IoT Monitor update
-- 3. Configure your .env file with Supabase credentials
-- 4. Start the admin dashboard: npm run dev
