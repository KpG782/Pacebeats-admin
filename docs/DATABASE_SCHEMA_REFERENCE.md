# Supabase Database Schema Reference

Complete database schema documentation for the Pacebeats Admin Dashboard.

---

## 📊 Database Overview

**Project:** Pacebeats Admin Dashboard  
**Database:** PostgreSQL (Supabase)  
**Total Tables:** 7  
**Supabase Project ID:** mxhnswymqijymrwvsybm  
**Dashboard:** https://supabase.com/dashboard/project/mxhnswymqijymrwvsybm

---

## 🗂️ Table Schema Reference

### 1. **users** (User Profiles)

Stores user profile information and account details.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  profile_picture_url TEXT,
  location TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  spotify_connected BOOLEAN DEFAULT false,
  spotify_user_id TEXT,
  total_runs INTEGER DEFAULT 0,
  total_distance_km NUMERIC(10, 2) DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Key Fields:**

- `id` (UUID): Primary key, matches Supabase Auth user ID
- `email` (TEXT): Unique user email, matches Auth email
- `role` (TEXT): User role - 'user', 'admin', or 'moderator'
- `spotify_connected` (BOOLEAN): Whether Spotify is linked
- `total_runs/distance/duration`: Aggregated running statistics

**Dashboard Usage:**

- Users page: Display all users, edit profiles
- Analytics: User growth, activity metrics
- Settings: Profile management

---

### 2. **running_sessions** (Running Activities)

Stores completed and active running sessions.

```sql
CREATE TABLE public.running_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  distance_meters NUMERIC(10, 2),
  duration_seconds INTEGER,
  avg_pace_min_per_km NUMERIC(5, 2),
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  calories_burned INTEGER,
  elevation_gain_meters NUMERIC(10, 2),
  route_data JSONB, -- GeoJSON format
  weather_conditions JSONB,
  device_model TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_running_sessions_user_id ON public.running_sessions(user_id);
CREATE INDEX idx_running_sessions_start_time ON public.running_sessions(start_time DESC);
CREATE INDEX idx_running_sessions_status ON public.running_sessions(status);
CREATE INDEX idx_running_sessions_user_status ON public.running_sessions(user_id, status);

-- Trigger for updated_at
CREATE TRIGGER update_running_sessions_updated_at
  BEFORE UPDATE ON public.running_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Key Fields:**

- `id` (UUID): Unique session identifier
- `user_id` (UUID): Foreign key to users table
- `status` (TEXT): 'active', 'paused', 'completed', 'cancelled'
- `route_data` (JSONB): GeoJSON coordinates for map display
- `device_model` (TEXT): Wearable device used (e.g., "Galaxy Watch 7")

**Dashboard Usage:**

- Sessions page: View all running sessions
- IoT Monitor: Real-time active sessions
- Analytics: Session statistics and trends

---

### 3. **session_heart_rate_data** (Heart Rate Monitoring)

Time-series heart rate data collected during running sessions.

```sql
CREATE TABLE public.session_heart_rate_data (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.running_sessions(id) ON DELETE CASCADE,
  timestamp_offset_seconds INTEGER NOT NULL,
  heart_rate_bpm INTEGER NOT NULL CHECK (heart_rate_bpm >= 40 AND heart_rate_bpm <= 220),
  is_connected BOOLEAN DEFAULT true,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_session_hr_session_id ON public.session_heart_rate_data(session_id);
CREATE INDEX idx_session_hr_timestamp ON public.session_heart_rate_data(session_id, timestamp_offset_seconds);
CREATE INDEX idx_session_hr_recorded_at ON public.session_heart_rate_data(recorded_at DESC);

-- Automatic alert trigger
CREATE TRIGGER check_heart_rate_alerts
  AFTER INSERT ON public.session_heart_rate_data
  FOR EACH ROW
  EXECUTE FUNCTION check_heart_rate_and_create_alert();
```

**Key Fields:**

- `session_id` (UUID): Links to running_sessions
- `timestamp_offset_seconds` (INTEGER): Seconds from session start
- `heart_rate_bpm` (INTEGER): Heart rate value (40-220 bpm)
- `is_connected` (BOOLEAN): Device connection status

**Dashboard Usage:**

- IoT Monitor: Real-time heart rate charts
- Sessions detail page: Heart rate graph
- Analytics: Heart rate zone analysis

---

### 4. **heart_rate_alerts** (Critical Heart Rate Alerts)

Stores alerts when heart rate exceeds safe thresholds.

```sql
CREATE TABLE public.heart_rate_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.running_sessions(id) ON DELETE CASCADE,
  heart_rate_bpm INTEGER NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'HIGH', 'CRITICAL')),
  message TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alerts_user_id ON public.heart_rate_alerts(user_id);
CREATE INDEX idx_alerts_session_id ON public.heart_rate_alerts(session_id);
CREATE INDEX idx_alerts_resolved ON public.heart_rate_alerts(resolved, created_at DESC);
CREATE INDEX idx_alerts_severity ON public.heart_rate_alerts(severity, resolved);

-- Alert creation function
CREATE OR REPLACE FUNCTION check_heart_rate_and_create_alert()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid UUID;
  alert_severity TEXT;
  alert_message TEXT;
BEGIN
  -- Get user_id from session
  SELECT user_id INTO user_uuid
  FROM public.running_sessions
  WHERE id = NEW.session_id;

  -- Determine severity
  IF NEW.heart_rate_bpm >= 180 THEN
    alert_severity := 'CRITICAL';
    alert_message := 'Critical heart rate detected! Immediate attention required.';
  ELSIF NEW.heart_rate_bpm >= 160 THEN
    alert_severity := 'HIGH';
    alert_message := 'High heart rate detected. Consider slowing down.';
  ELSIF NEW.heart_rate_bpm < 50 THEN
    alert_severity := 'LOW';
    alert_message := 'Unusually low heart rate detected.';
  ELSE
    RETURN NEW; -- No alert needed
  END IF;

  -- Insert alert
  INSERT INTO public.heart_rate_alerts (
    user_id, session_id, heart_rate_bpm, severity, message
  ) VALUES (
    user_uuid, NEW.session_id, NEW.heart_rate_bpm, alert_severity, alert_message
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Key Fields:**

- `severity` (TEXT): 'LOW', 'HIGH', 'CRITICAL'
- `resolved` (BOOLEAN): Whether admin acknowledged alert
- `message` (TEXT): Alert description

**Dashboard Usage:**

- IoT Monitor: Real-time alert notifications
- Analytics: Alert frequency analysis

---

### 5. **music** (Music Catalog)

Spotify music tracks available for recommendations.

```sql
CREATE TABLE public.music (
  id BIGSERIAL PRIMARY KEY,
  spotify_track_id TEXT UNIQUE NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_image_url TEXT,
  duration_ms INTEGER,
  tempo_bpm INTEGER,
  energy NUMERIC(3, 2) CHECK (energy >= 0 AND energy <= 1),
  valence NUMERIC(3, 2) CHECK (valence >= 0 AND valence <= 1),
  danceability NUMERIC(3, 2) CHECK (danceability >= 0 AND danceability <= 1),
  acousticness NUMERIC(3, 2),
  instrumentalness NUMERIC(3, 2),
  liveness NUMERIC(3, 2),
  speechiness NUMERIC(3, 2),
  popularity INTEGER,
  explicit BOOLEAN DEFAULT false,
  release_date DATE,
  genres TEXT[],
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_music_spotify_id ON public.music(spotify_track_id);
CREATE INDEX idx_music_tempo ON public.music(tempo_bpm);
CREATE INDEX idx_music_energy ON public.music(energy DESC);
CREATE INDEX idx_music_artist ON public.music(artist_name);
CREATE INDEX idx_music_track_name ON public.music(track_name);
```

**Key Fields:**

- `spotify_track_id` (TEXT): Unique Spotify identifier
- `tempo_bpm` (INTEGER): Beats per minute for pace matching
- `energy/valence/danceability` (NUMERIC): Audio features (0-1)
- `genres` (TEXT[]): Array of music genres

**Dashboard Usage:**

- Music page: Browse and manage music library
- Analytics: Popular tracks, genre distribution

---

### 6. **listening_events** (Music Playback History)

Tracks when users listen to music during runs.

```sql
CREATE TABLE public.listening_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.running_sessions(id) ON DELETE CASCADE,
  track_id BIGINT NOT NULL REFERENCES public.music(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_played_ms INTEGER,
  skipped BOOLEAN DEFAULT false,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  context JSONB, -- Additional metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listening_user_id ON public.listening_events(user_id);
CREATE INDEX idx_listening_session_id ON public.listening_events(session_id);
CREATE INDEX idx_listening_track_id ON public.listening_events(track_id);
CREATE INDEX idx_listening_played_at ON public.listening_events(played_at DESC);
CREATE INDEX idx_listening_skipped ON public.listening_events(skipped);
```

**Key Fields:**

- `track_id` (BIGINT): Links to music table
- `skipped` (BOOLEAN): Whether user skipped the track
- `user_rating` (INTEGER): Optional rating (1-5)
- `context` (JSONB): Additional metadata (pace, location, etc.)

**Dashboard Usage:**

- Music page: Track popularity and skip rates
- Analytics: Listening patterns and preferences
- Sessions detail: Music played during session

---

### 7. **recommendation_served** (Music Recommendations)

Logs music recommendations served to users during runs.

```sql
CREATE TABLE public.recommendation_served (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.running_sessions(id) ON DELETE CASCADE,
  track_id BIGINT NOT NULL REFERENCES public.music(id) ON DELETE CASCADE,
  recommended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recommendation_score NUMERIC(5, 4),
  recommendation_reason TEXT,
  user_accepted BOOLEAN,
  user_pace_km_min NUMERIC(5, 2),
  user_heart_rate INTEGER,
  user_mood TEXT,
  candidate_score NUMERIC(5, 4),
  run_mode TEXT,
  target_pace_min NUMERIC(5, 2)
);

-- Indexes
CREATE INDEX idx_recommendation_user_id ON public.recommendation_served(user_id);
CREATE INDEX idx_recommendation_session_id ON public.recommendation_served(session_id);
CREATE INDEX idx_recommendation_track_id ON public.recommendation_served(track_id);
CREATE INDEX idx_recommendation_accepted ON public.recommendation_served(user_accepted);
```

**Key Fields:**

- `recommendation_score` (NUMERIC): Algorithm confidence score
- `recommendation_reason` (TEXT): Why this track was recommended
- `user_accepted` (BOOLEAN): Whether user played the track
- `run_mode` (TEXT): Running mode (pace, interval, recovery, etc.)

**Dashboard Usage:**

- Analytics: Recommendation acceptance rate
- Music page: Track recommendation performance

---

## 🔐 Row Level Security (RLS) Policies

### Enable RLS on All Tables

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_heart_rate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heart_rate_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_served ENABLE ROW LEVEL SECURITY;
```

### Admin Access Policies (Full Access)

```sql
-- Users table
CREATE POLICY "Admin full access to users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Apply similar policies to all tables
-- See ADMIN_ACCOUNT_SETUP.md for complete policy setup
```

---

## 🔄 Realtime Configuration

### Enable Realtime Replication

```sql
-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.running_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_heart_rate_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.heart_rate_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.music;
ALTER PUBLICATION supabase_realtime ADD TABLE public.listening_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recommendation_served;
```

**Dashboard Usage:**

- IoT Monitor: Subscribe to `session_heart_rate_data` and `heart_rate_alerts`
- Users page: Subscribe to `users` for live updates
- Sessions: Subscribe to `running_sessions` for status changes

---

## 📈 Database Views (Optional)

### Active Runners View

```sql
CREATE OR REPLACE VIEW public.active_runners AS
SELECT
  u.id as user_id,
  u.full_name as username,
  rs.id as session_id,
  rs.device_model,
  rs.start_time,
  rs.duration_seconds,
  rs.distance_meters,
  rs.avg_pace_min_per_km as avg_pace,
  latest_hr.heart_rate_bpm as heart_rate,
  latest_hr.recorded_at as last_update,
  CASE
    WHEN latest_hr.heart_rate_bpm >= 180 THEN 'CRITICAL'
    WHEN latest_hr.heart_rate_bpm >= 160 THEN 'HIGH'
    WHEN latest_hr.heart_rate_bpm < 50 THEN 'LOW'
    ELSE 'NORMAL'
  END as status
FROM public.running_sessions rs
JOIN public.users u ON rs.user_id = u.id
LEFT JOIN LATERAL (
  SELECT heart_rate_bpm, recorded_at
  FROM public.session_heart_rate_data
  WHERE session_id = rs.id
  ORDER BY recorded_at DESC
  LIMIT 1
) latest_hr ON true
WHERE rs.status = 'active';
```

### Music Analytics View

```sql
CREATE OR REPLACE VIEW public.music_analytics AS
SELECT
  m.id,
  m.track_name,
  m.artist_name,
  m.tempo_bpm,
  m.energy,
  COUNT(le.id) as play_count,
  COUNT(CASE WHEN le.skipped = false THEN 1 END) as completed_plays,
  COUNT(CASE WHEN le.skipped = true THEN 1 END) as skip_count,
  AVG(le.user_rating) as avg_rating,
  COUNT(rs.id) as recommendation_count,
  COUNT(CASE WHEN rs.user_accepted = true THEN 1 END) as accepted_recommendations
FROM public.music m
LEFT JOIN public.listening_events le ON m.id = le.track_id
LEFT JOIN public.recommendation_served rs ON m.id = rs.track_id
GROUP BY m.id, m.track_name, m.artist_name, m.tempo_bpm, m.energy;
```

---

## 🔧 Utility Functions

### Update Timestamp Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Aggregate User Statistics Function

```sql
CREATE OR REPLACE FUNCTION update_user_running_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    total_runs = (
      SELECT COUNT(*) FROM public.running_sessions
      WHERE user_id = NEW.user_id AND status = 'completed'
    ),
    total_distance_km = (
      SELECT COALESCE(SUM(distance_meters), 0) / 1000
      FROM public.running_sessions
      WHERE user_id = NEW.user_id AND status = 'completed'
    ),
    total_duration_minutes = (
      SELECT COALESCE(SUM(duration_seconds), 0) / 60
      FROM public.running_sessions
      WHERE user_id = NEW.user_id AND status = 'completed'
    )
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_on_session_complete
  AFTER UPDATE OF status ON public.running_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_user_running_stats();
```

---

## 📚 Related Documentation

- [Admin Account Setup](./ADMIN_ACCOUNT_SETUP.md)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Backend Integration](./BACKEND_INTEGRATION_COMPLETE.md)

---

**Last Updated:** November 20, 2025  
**Version:** 1.0.0
