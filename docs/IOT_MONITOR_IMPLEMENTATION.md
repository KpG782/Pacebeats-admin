# IoT Monitor Implementation Guide

Complete documentation for the real-time IoT Monitor dashboard, including database schema, data flow, real-time subscriptions, and mobile app integration requirements.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Real-Time Subscriptions](#real-time-subscriptions)
5. [Mobile App Integration](#mobile-app-integration)
6. [API Endpoints](#api-endpoints)
7. [Code Examples](#code-examples)
8. [Testing Guide](#testing-guide)

---

## 🎯 Overview

The IoT Monitor provides real-time monitoring of active running sessions with live heart rate data, connection status tracking, and critical alert notifications. The system uses Supabase real-time subscriptions for instant updates and fallback polling for reliability.

### Key Features

- **Real-time heart rate monitoring** - Live updates as data streams from wearable devices
- **Connection status tracking** - LIVE, SLOW, or LOST indicators based on data freshness
- **Critical alert system** - Automatic alerts for dangerous heart rate levels
- **Multi-user monitoring** - Track unlimited concurrent runners
- **Mobile responsive** - Optimized for desktop and mobile viewing

### Status Thresholds

| Status       | Heart Rate Range     | Visual Indicator             |
| ------------ | -------------------- | ---------------------------- |
| **CRITICAL** | ≥ 180 bpm            | Red badge, pulsing animation |
| **HIGH**     | 165-179 bpm          | Amber badge                  |
| **NORMAL**   | 100-164 bpm          | Green badge                  |
| **LOW**      | < 100 bpm or no data | Blue badge                   |

### Connection Status

| Status   | Last Update       | Visual Indicator          |
| -------- | ----------------- | ------------------------- |
| **LIVE** | < 10 seconds ago  | Green dot, lightning icon |
| **SLOW** | 10-30 seconds ago | Yellow dot, pulsing       |
| **LOST** | > 30 seconds ago  | Red dot                   |

---

## 🗄️ Database Schema

### Required Tables

The IoT Monitor uses 4 main tables from the Supabase database:

#### 1. **users** - User Profiles

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
```

**Key Fields for IoT Monitor:**

- `id` - Unique user identifier (matches Supabase Auth)
- `username` - Display name in monitor (fallback to email if null)
- `email` - User email address

---

#### 2. **running_sessions** - Active Running Sessions

```sql
CREATE TABLE public.running_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end_time TIMESTAMPTZ,
  session_duration_seconds INTEGER DEFAULT 0,
  total_distance_km NUMERIC(10, 3) DEFAULT 0,
  avg_pace_min_per_km NUMERIC(5, 2),
  avg_speed_kmh NUMERIC(5, 2),
  avg_heart_rate_bpm INTEGER,
  max_heart_rate_bpm INTEGER,
  total_calories_burned INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  device_model TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Critical indexes for IoT Monitor performance
CREATE INDEX idx_running_sessions_user_id ON public.running_sessions(user_id);
CREATE INDEX idx_running_sessions_status ON public.running_sessions(status);
CREATE INDEX idx_running_sessions_active_users ON public.running_sessions(user_id, status)
  WHERE status = 'active';
CREATE INDEX idx_running_sessions_start_time ON public.running_sessions(session_start_time DESC);
```

**Key Fields for IoT Monitor:**

- `id` - Unique session identifier
- `user_id` - Foreign key to users table
- `status` - **'active'** = currently running (IoT Monitor filters on this)
- `session_start_time` - Used to calculate duration
- `session_duration_seconds` - Total running time (updated in real-time)
- `total_distance_km` - Distance covered
- `avg_pace_min_per_km` - Current average pace
- `avg_speed_kmh` - Current average speed
- `avg_heart_rate_bpm` - Average HR (fallback if no recent HR data)
- `device_model` - Wearable device (e.g., "Galaxy Watch 7")

**Real-time Updates:**

- Mobile app should UPDATE this record every 5-10 seconds
- Set `status = 'completed'` when run ends
- Set `status = 'paused'` when run is paused
- Set `status = 'active'` when run resumes

---

#### 3. **session_heart_rate_data** - Real-Time Heart Rate Stream

```sql
CREATE TABLE public.session_heart_rate_data (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.running_sessions(id) ON DELETE CASCADE,
  heart_rate_bpm INTEGER NOT NULL CHECK (heart_rate_bpm >= 40 AND heart_rate_bpm <= 220),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  timestamp_offset_seconds INTEGER NOT NULL,
  is_connected BOOLEAN DEFAULT true,
  device_battery_level INTEGER CHECK (device_battery_level >= 0 AND device_battery_level <= 100)
);

-- Critical indexes for real-time queries
CREATE INDEX idx_session_hr_session_id ON public.session_heart_rate_data(session_id);
CREATE INDEX idx_session_hr_recorded_at ON public.session_heart_rate_data(recorded_at DESC);
CREATE INDEX idx_session_hr_session_time ON public.session_heart_rate_data(session_id, recorded_at DESC);
```

**Key Fields for IoT Monitor:**

- `session_id` - Links to running_sessions table
- `heart_rate_bpm` - Heart rate value (40-220 bpm range enforced)
- `recorded_at` - **CRITICAL** - Timestamp for connection status calculation
- `timestamp_offset_seconds` - Seconds from session start
- `is_connected` - Whether wearable device is connected

**Real-time Updates:**

- Mobile app should INSERT new records every 1-5 seconds during active runs
- Use `recorded_at = NOW()` for accurate connection tracking
- IoT Monitor queries latest record per session for display

**Important Query Pattern:**

```sql
-- Get latest heart rate for each session
SELECT DISTINCT ON (session_id)
  session_id,
  heart_rate_bpm,
  recorded_at
FROM public.session_heart_rate_data
WHERE session_id IN (...)
ORDER BY session_id, recorded_at DESC;
```

---

#### 4. **session_alerts** - Critical Heart Rate Alerts

```sql
CREATE TABLE public.session_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.running_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('heart_rate', 'device_disconnected', 'battery_low', 'fall_detected')),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  message TEXT NOT NULL,
  heart_rate_bpm INTEGER,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for alert queries
CREATE INDEX idx_alerts_session_id ON public.session_alerts(session_id);
CREATE INDEX idx_alerts_user_id ON public.session_alerts(user_id);
CREATE INDEX idx_alerts_resolved ON public.session_alerts(resolved, created_at DESC);
CREATE INDEX idx_alerts_severity ON public.session_alerts(severity) WHERE resolved = false;
```

**Key Fields for IoT Monitor:**

- `alert_type` - Type of alert ('heart_rate' for HR alerts)
- `severity` - Alert level (LOW, MEDIUM, HIGH, CRITICAL)
- `message` - Human-readable alert text
- `heart_rate_bpm` - HR value that triggered alert
- `resolved` - Whether admin acknowledged the alert

**Auto-Alert Trigger (Optional):**

```sql
-- Automatic alert creation for critical heart rates
CREATE OR REPLACE FUNCTION create_heart_rate_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_severity TEXT;
  v_message TEXT;
BEGIN
  -- Get user_id from session
  SELECT user_id INTO v_user_id
  FROM public.running_sessions
  WHERE id = NEW.session_id;

  -- Determine severity based on heart rate
  IF NEW.heart_rate_bpm >= 180 THEN
    v_severity := 'CRITICAL';
    v_message := 'CRITICAL: Heart rate ' || NEW.heart_rate_bpm || ' bpm. Immediate attention required!';
  ELSIF NEW.heart_rate_bpm >= 165 THEN
    v_severity := 'HIGH';
    v_message := 'HIGH: Heart rate ' || NEW.heart_rate_bpm || ' bpm. Monitor closely.';
  ELSIF NEW.heart_rate_bpm < 100 AND NEW.heart_rate_bpm > 0 THEN
    v_severity := 'LOW';
    v_message := 'LOW: Heart rate ' || NEW.heart_rate_bpm || ' bpm. Check device connection.';
  ELSE
    RETURN NEW; -- No alert needed
  END IF;

  -- Insert alert (only if no recent similar alert exists)
  INSERT INTO public.session_alerts (
    session_id, user_id, alert_type, severity, message, heart_rate_bpm
  )
  SELECT
    NEW.session_id, v_user_id, 'heart_rate', v_severity, v_message, NEW.heart_rate_bpm
  WHERE NOT EXISTS (
    SELECT 1 FROM public.session_alerts
    WHERE session_id = NEW.session_id
      AND alert_type = 'heart_rate'
      AND severity = v_severity
      AND resolved = false
      AND created_at > NOW() - INTERVAL '5 minutes'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to heart rate inserts
CREATE TRIGGER trigger_heart_rate_alerts
  AFTER INSERT ON public.session_heart_rate_data
  FOR EACH ROW
  EXECUTE FUNCTION create_heart_rate_alert();
```

---

### Database Relationships

```
users (1) ──< (many) running_sessions
                          │
                          ├──< (many) session_heart_rate_data
                          │
                          └──< (many) session_alerts
```

---

## 🔄 Data Flow Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (Phone)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Wearable Device (Galaxy Watch, Apple Watch, etc.)   │  │
│  │  - Collects Heart Rate via BLE                       │  │
│  │  - Tracks GPS Location                               │  │
│  │  - Measures Pace, Distance, Duration                 │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │ Bluetooth                           │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Mobile App (React Native / Flutter / Native)        │  │
│  │  - Receives data from wearable every 1-5 seconds     │  │
│  │  - Processes and aggregates metrics                  │  │
│  │  - Manages session lifecycle (start/pause/stop)      │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼──────────────────────────────────┘
                         │ HTTPS
                         │ Supabase API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               Supabase Backend (PostgreSQL)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                 │  │
│  │  ├─ running_sessions (status = 'active')            │  │
│  │  ├─ session_heart_rate_data (INSERT stream)         │  │
│  │  ├─ session_alerts (auto-created on thresholds)     │  │
│  │  └─ users (profile info)                            │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────┴─────────────────────────────────┐  │
│  │  Realtime Engine (PostgreSQL Replication)           │  │
│  │  - Broadcasts INSERT/UPDATE/DELETE events           │  │
│  │  - Publishes to WebSocket channels                  │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼──────────────────────────────────┘
                         │ WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Admin Dashboard (Next.js Web App)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  IoT Monitor Page                                    │  │
│  │  ├─ Initial Load: Query active sessions             │  │
│  │  ├─ Real-time: Subscribe to table changes           │  │
│  │  ├─ Fallback: Poll every 5 seconds                  │  │
│  │  └─ Display: Live runner cards with status          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### Data Flow Steps

#### 1️⃣ **Session Start (Mobile App)**

```typescript
// Step 1: Create new running session
const { data: session, error } = await supabase
  .from("running_sessions")
  .insert({
    user_id: currentUserId, // From Supabase Auth
    session_start_time: new Date().toISOString(),
    status: "active",
    device_model: "Galaxy Watch 7", // Or detected device
    session_duration_seconds: 0,
    total_distance_km: 0,
    avg_pace_min_per_km: 0,
    avg_speed_kmh: 0,
  })
  .select()
  .single();

const sessionId = session.id;

// Step 2: Start heart rate monitoring loop
setInterval(async () => {
  // Get latest heart rate from wearable device
  const heartRate = await wearableDevice.getHeartRate();

  // Insert into database
  await supabase.from("session_heart_rate_data").insert({
    session_id: sessionId,
    heart_rate_bpm: heartRate,
    recorded_at: new Date().toISOString(), // CRITICAL for connection tracking
    timestamp_offset_seconds: Math.floor(
      (Date.now() - sessionStartTime) / 1000
    ),
    is_connected: wearableDevice.isConnected(),
  });
}, 3000); // Every 3 seconds

// Step 3: Update session metrics periodically
setInterval(async () => {
  await supabase
    .from("running_sessions")
    .update({
      session_duration_seconds: currentDuration,
      total_distance_km: currentDistance,
      avg_pace_min_per_km: currentPace,
      avg_speed_kmh: currentSpeed,
      avg_heart_rate_bpm: averageHeartRate,
      max_heart_rate_bpm: maxHeartRate,
      total_calories_burned: calculatedCalories,
      total_steps: totalSteps,
    })
    .eq("id", sessionId);
}, 5000); // Every 5 seconds
```

#### 2️⃣ **Real-Time Monitoring (Admin Dashboard)**

```typescript
// Step 1: Initial load - Get all active sessions
const loadActiveRunners = async () => {
  const { data: sessions } = await supabase
    .from("running_sessions")
    .select(
      `
      id,
      user_id,
      session_start_time,
      session_duration_seconds,
      total_distance_km,
      avg_pace_min_per_km,
      avg_speed_kmh,
      avg_heart_rate_bpm,
      status,
      users!inner (
        username,
        email
      )
    `
    )
    .eq("status", "active") // CRITICAL FILTER
    .order("session_start_time", { ascending: false });

  // Step 2: Get latest heart rate for each session
  const sessionIds = sessions.map((s) => s.id);
  const { data: latestHR } = await supabase
    .from("session_heart_rate_data")
    .select("session_id, heart_rate_bpm, recorded_at")
    .in("session_id", sessionIds)
    .order("recorded_at", { ascending: false });

  // Step 3: Map to Runner interface
  const runners = sessions.map((session) => {
    const hr = latestHR.find((h) => h.session_id === session.id);
    const secondsSinceUpdate = Math.floor(
      (Date.now() -
        new Date(hr?.recorded_at || session.session_start_time).getTime()) /
        1000
    );

    let connectionStatus = "LOST";
    if (secondsSinceUpdate < 10) connectionStatus = "LIVE";
    else if (secondsSinceUpdate < 30) connectionStatus = "SLOW";

    let status = "NORMAL";
    const heartRate = hr?.heart_rate_bpm || 0;
    if (heartRate >= 180) status = "CRITICAL";
    else if (heartRate >= 165) status = "HIGH";
    else if (heartRate < 100) status = "LOW";

    return {
      session_id: session.id,
      user_id: session.user_id,
      username: session.users.username || session.users.email.split("@")[0],
      email: session.users.email,
      heart_rate: heartRate,
      pace: session.avg_pace_min_per_km,
      speed: session.avg_speed_kmh,
      status: status,
      duration_seconds: session.session_duration_seconds,
      distance_km: session.total_distance_km,
      last_update: hr?.recorded_at || session.session_start_time,
      connection_status: connectionStatus,
      session_status: session.status,
    };
  });

  setRunners(runners);
};

// Step 4: Subscribe to real-time updates
const channel = supabase
  .channel("iot-monitor-realtime")
  .on(
    "postgres_changes",
    {
      event: "*", // INSERT, UPDATE, DELETE
      schema: "public",
      table: "running_sessions",
    },
    (payload) => {
      console.log("Session changed:", payload);
      loadActiveRunners(); // Refresh full list
    }
  )
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "session_heart_rate_data",
    },
    (payload) => {
      console.log("HR update:", payload);
      // Update specific runner's HR in state
      setRunners((prev) =>
        prev.map((runner) => {
          if (runner.session_id === payload.new.session_id) {
            return {
              ...runner,
              heart_rate: payload.new.heart_rate_bpm,
              last_update: payload.new.recorded_at,
              connection_status: "LIVE",
              status: getStatusFromHR(payload.new.heart_rate_bpm),
            };
          }
          return runner;
        })
      );
    }
  )
  .subscribe();
```

#### 3️⃣ **Session End (Mobile App)**

```typescript
// Mark session as completed
await supabase
  .from("running_sessions")
  .update({
    status: "completed",
    session_end_time: new Date().toISOString(),
    session_duration_seconds: finalDuration,
    total_distance_km: finalDistance,
    avg_pace_min_per_km: finalAvgPace,
    avg_speed_kmh: finalAvgSpeed,
    avg_heart_rate_bpm: finalAvgHR,
    max_heart_rate_bpm: finalMaxHR,
    total_calories_burned: finalCalories,
    total_steps: finalSteps,
  })
  .eq("id", sessionId);

// Stop heart rate monitoring loop
// Session will disappear from IoT Monitor (no longer 'active')
```

---

## 🔔 Real-Time Subscriptions

### Supabase Realtime Setup

#### Enable Realtime Replication

```sql
-- Enable realtime on required tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.running_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_heart_rate_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
```

#### Dashboard Subscription Code

```typescript
import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Create subscription channel
const channel: RealtimeChannel = supabase
  .channel("iot-monitor-realtime") // Unique channel name
  .on(
    "postgres_changes",
    {
      event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
      schema: "public",
      table: "running_sessions",
    },
    (payload) => {
      console.log("Session changed:", payload.eventType);
      // Payload structure:
      // {
      //   eventType: 'INSERT' | 'UPDATE' | 'DELETE',
      //   new: { ...newRecord }, // For INSERT/UPDATE
      //   old: { ...oldRecord }, // For UPDATE/DELETE
      // }
      loadActiveRunners(); // Refresh list
    }
  )
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "session_heart_rate_data",
    },
    (payload) => {
      console.log("HR update received:", payload.new);
      // Update specific runner in real-time
      const newHR = payload.new as {
        session_id: string;
        heart_rate_bpm: number;
        recorded_at: string;
      };

      setRunners((prev) =>
        prev.map((runner) => {
          if (runner.session_id === newHR.session_id) {
            return {
              ...runner,
              heart_rate: newHR.heart_rate_bpm,
              status: getHRStatus(newHR.heart_rate_bpm),
              last_update: newHR.recorded_at,
              connection_status: "LIVE",
            };
          }
          return runner;
        })
      );
    }
  )
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "session_alerts",
    },
    (payload) => {
      console.log("Alert created:", payload.new);
      // Show toast notification
      toast({
        title: "Critical Alert!",
        description: payload.new.message,
        variant: "destructive",
      });
    }
  )
  .subscribe((status) => {
    console.log("Realtime status:", status);
    // Status: 'SUBSCRIBED', 'TIMED_OUT', 'CLOSED', 'CHANNEL_ERROR'
  });

// Cleanup on component unmount
useEffect(() => {
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Subscription Events

| Event Type                            | Trigger                 | Use Case                        |
| ------------------------------------- | ----------------------- | ------------------------------- |
| `INSERT` on `running_sessions`        | New session started     | Add new runner to monitor       |
| `UPDATE` on `running_sessions`        | Session metrics updated | Update duration, distance, pace |
| `DELETE` on `running_sessions`        | Session deleted         | Remove runner from monitor      |
| `INSERT` on `session_heart_rate_data` | New heart rate reading  | Update HR display instantly     |
| `INSERT` on `session_alerts`          | Critical alert created  | Show notification banner        |

---

## 📱 Mobile App Integration

### Requirements for Mobile App Developers

#### 1. Authentication

```typescript
// Initialize Supabase client with your project credentials
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mxhnswymqijymrwvsybm.supabase.co", // Your Supabase URL
  "YOUR_ANON_KEY" // Get from Supabase Dashboard > Settings > API
);

// Sign in user (example)
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});

// Get current user ID
const userId = data.user?.id; // UUID format
```

#### 2. Session Lifecycle Management

##### Start Session

```typescript
async function startRunningSession(userId: string, deviceModel: string) {
  const { data: session, error } = await supabase
    .from("running_sessions")
    .insert({
      user_id: userId,
      session_start_time: new Date().toISOString(),
      status: "active",
      device_model: deviceModel,
      session_duration_seconds: 0,
      total_distance_km: 0,
      avg_pace_min_per_km: 0,
      avg_speed_kmh: 0,
      avg_heart_rate_bpm: 0,
      max_heart_rate_bpm: 0,
      total_calories_burned: 0,
      total_steps: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to start session:", error);
    return null;
  }

  return session.id; // UUID - Save this for updates
}
```

##### Update Session Metrics

```typescript
async function updateSessionMetrics(
  sessionId: string,
  metrics: {
    durationSeconds: number;
    distanceKm: number;
    avgPaceMinPerKm: number;
    avgSpeedKmh: number;
    avgHeartRateBpm: number;
    maxHeartRateBpm: number;
    totalCaloriesBurned: number;
    totalSteps: number;
  }
) {
  const { error } = await supabase
    .from("running_sessions")
    .update({
      session_duration_seconds: metrics.durationSeconds,
      total_distance_km: metrics.distanceKm,
      avg_pace_min_per_km: metrics.avgPaceMinPerKm,
      avg_speed_kmh: metrics.avgSpeedKmh,
      avg_heart_rate_bpm: metrics.avgHeartRateBpm,
      max_heart_rate_bpm: metrics.maxHeartRateBpm,
      total_calories_burned: metrics.totalCaloriesBurned,
      total_steps: metrics.totalSteps,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    console.error("Failed to update session:", error);
  }
}

// Call this every 5-10 seconds during active run
setInterval(() => {
  updateSessionMetrics(sessionId, currentMetrics);
}, 5000);
```

##### End Session

```typescript
async function endRunningSession(sessionId: string, finalMetrics: any) {
  const { error } = await supabase
    .from("running_sessions")
    .update({
      status: "completed",
      session_end_time: new Date().toISOString(),
      session_duration_seconds: finalMetrics.durationSeconds,
      total_distance_km: finalMetrics.distanceKm,
      avg_pace_min_per_km: finalMetrics.avgPaceMinPerKm,
      avg_speed_kmh: finalMetrics.avgSpeedKmh,
      avg_heart_rate_bpm: finalMetrics.avgHeartRateBpm,
      max_heart_rate_bpm: finalMetrics.maxHeartRateBpm,
      total_calories_burned: finalMetrics.totalCaloriesBurned,
      total_steps: finalMetrics.totalSteps,
    })
    .eq("id", sessionId);

  if (error) {
    console.error("Failed to end session:", error);
  }
}
```

##### Pause/Resume Session

```typescript
async function pauseSession(sessionId: string) {
  await supabase
    .from("running_sessions")
    .update({ status: "paused" })
    .eq("id", sessionId);
}

async function resumeSession(sessionId: string) {
  await supabase
    .from("running_sessions")
    .update({ status: "active" })
    .eq("id", sessionId);
}
```

#### 3. Heart Rate Streaming

```typescript
// Heart rate monitoring loop
let heartRateInterval: NodeJS.Timeout;
let sessionStartTime: number;

async function startHeartRateMonitoring(sessionId: string) {
  sessionStartTime = Date.now();

  heartRateInterval = setInterval(async () => {
    // Get heart rate from wearable device (example - adapt to your SDK)
    const heartRate = await getHeartRateFromDevice();

    if (heartRate) {
      const { error } = await supabase.from("session_heart_rate_data").insert({
        session_id: sessionId,
        heart_rate_bpm: heartRate,
        recorded_at: new Date().toISOString(), // CRITICAL - use current time
        timestamp_offset_seconds: Math.floor(
          (Date.now() - sessionStartTime) / 1000
        ),
        is_connected: true,
      });

      if (error) {
        console.error("Failed to insert HR data:", error);
      }
    } else {
      // Device disconnected
      await supabase.from("session_heart_rate_data").insert({
        session_id: sessionId,
        heart_rate_bpm: 0,
        recorded_at: new Date().toISOString(),
        timestamp_offset_seconds: Math.floor(
          (Date.now() - sessionStartTime) / 1000
        ),
        is_connected: false,
      });
    }
  }, 3000); // Every 3 seconds (adjust as needed: 1-5 seconds)
}

function stopHeartRateMonitoring() {
  if (heartRateInterval) {
    clearInterval(heartRateInterval);
  }
}

// Example: Get heart rate from Galaxy Watch (Tizen/Wear OS)
async function getHeartRateFromDevice(): Promise<number | null> {
  try {
    // Wear OS example (adapt to your platform)
    const heartRateSensor = await navigator.sensors?.heartRate?.connect();
    const reading = await heartRateSensor?.read();
    return reading?.value || null;
  } catch (error) {
    console.error("Failed to read heart rate:", error);
    return null;
  }
}
```

#### 4. Complete Example: Run Tracking Flow

```typescript
class RunTrackingService {
  private sessionId: string | null = null;
  private sessionStartTime: number = 0;
  private updateInterval: NodeJS.Timeout | null = null;
  private hrInterval: NodeJS.Timeout | null = null;

  async startRun(userId: string, deviceModel: string) {
    // 1. Create session
    const { data: session } = await supabase
      .from("running_sessions")
      .insert({
        user_id: userId,
        session_start_time: new Date().toISOString(),
        status: "active",
        device_model: deviceModel,
      })
      .select()
      .single();

    this.sessionId = session.id;
    this.sessionStartTime = Date.now();

    // 2. Start heart rate monitoring (every 3 seconds)
    this.hrInterval = setInterval(async () => {
      const hr = await this.getHeartRate();
      await supabase.from("session_heart_rate_data").insert({
        session_id: this.sessionId,
        heart_rate_bpm: hr || 0,
        recorded_at: new Date().toISOString(),
        timestamp_offset_seconds: Math.floor(
          (Date.now() - this.sessionStartTime) / 1000
        ),
        is_connected: hr !== null,
      });
    }, 3000);

    // 3. Start metrics updates (every 5 seconds)
    this.updateInterval = setInterval(async () => {
      const metrics = await this.getCurrentMetrics();
      await supabase
        .from("running_sessions")
        .update(metrics)
        .eq("id", this.sessionId);
    }, 5000);
  }

  async pauseRun() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    if (this.hrInterval) clearInterval(this.hrInterval);

    await supabase
      .from("running_sessions")
      .update({ status: "paused" })
      .eq("id", this.sessionId);
  }

  async resumeRun() {
    // Restart intervals
    this.startRun(/* ... */);

    await supabase
      .from("running_sessions")
      .update({ status: "active" })
      .eq("id", this.sessionId);
  }

  async stopRun() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    if (this.hrInterval) clearInterval(this.hrInterval);

    const finalMetrics = await this.getCurrentMetrics();

    await supabase
      .from("running_sessions")
      .update({
        ...finalMetrics,
        status: "completed",
        session_end_time: new Date().toISOString(),
      })
      .eq("id", this.sessionId);
  }

  private async getHeartRate(): Promise<number | null> {
    // Implement device-specific HR reading
    return 120; // Example
  }

  private async getCurrentMetrics() {
    // Calculate current metrics from GPS, sensors, etc.
    return {
      session_duration_seconds: Math.floor(
        (Date.now() - this.sessionStartTime) / 1000
      ),
      total_distance_km: 2.5, // Example
      avg_pace_min_per_km: 5.5,
      avg_speed_kmh: 10.9,
      avg_heart_rate_bpm: 145,
      max_heart_rate_bpm: 165,
      total_calories_burned: 250,
      total_steps: 3000,
    };
  }
}

// Usage
const runTracker = new RunTrackingService();
await runTracker.startRun(userId, "Galaxy Watch 7");
// ... run in progress ...
await runTracker.stopRun();
```

---

## 🔌 API Endpoints

### Supabase REST API

All database operations use Supabase's auto-generated REST API:

```
Base URL: https://mxhnswymqijymrwvsybm.supabase.co/rest/v1
Authorization: Bearer YOUR_ANON_KEY
apikey: YOUR_ANON_KEY
```

#### Example: Insert Heart Rate Data (cURL)

```bash
curl -X POST 'https://mxhnswymqijymrwvsybm.supabase.co/rest/v1/session_heart_rate_data' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "session_id": "123e4567-e89b-12d3-a456-426614174000",
    "heart_rate_bpm": 145,
    "recorded_at": "2025-11-21T10:30:00Z",
    "timestamp_offset_seconds": 120,
    "is_connected": true
  }'
```

#### Example: Update Session (cURL)

```bash
curl -X PATCH 'https://mxhnswymqijymrwvsybm.supabase.co/rest/v1/running_sessions?id=eq.SESSION_ID' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_duration_seconds": 1800,
    "total_distance_km": 3.5,
    "avg_pace_min_per_km": 5.14,
    "avg_heart_rate_bpm": 152
  }'
```

---

## 💻 Code Examples

### Dashboard: Runner Interface

```typescript
interface Runner {
  session_id: string; // UUID from running_sessions.id
  user_id: string; // UUID from users.id
  username: string; // Display name (from users.username or email)
  email: string; // User email
  heart_rate: number | null; // Latest HR reading (bpm)
  pace: number | null; // Current pace (min/km)
  speed: number | null; // Current speed (km/h)
  status: "NORMAL" | "HIGH" | "CRITICAL" | "LOW"; // HR status
  duration_seconds: number; // Total run duration
  distance_km: number | null; // Total distance covered
  last_update: string; // ISO timestamp of last HR reading
  connection_status: "LIVE" | "SLOW" | "LOST"; // Connection status
  session_status: string; // 'active', 'paused', 'completed'
}
```

### Dashboard: Status Calculation

```typescript
// Determine heart rate status
const getHRStatus = (
  hr: number | null
): "NORMAL" | "HIGH" | "CRITICAL" | "LOW" => {
  if (!hr || hr === 0) return "LOW";
  if (hr >= 180) return "CRITICAL";
  if (hr >= 165) return "HIGH";
  if (hr < 100) return "LOW";
  return "NORMAL";
};

// Determine connection status based on last update time
const getConnectionStatus = (lastUpdate: string): "LIVE" | "SLOW" | "LOST" => {
  const secondsSinceUpdate = Math.floor(
    (Date.now() - new Date(lastUpdate).getTime()) / 1000
  );

  if (secondsSinceUpdate < 10) return "LIVE";
  if (secondsSinceUpdate < 30) return "SLOW";
  return "LOST";
};
```

### Dashboard: Format Helpers

```typescript
// Format duration in seconds to readable string
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
};

// Format time ago from ISO timestamp
const formatTimeAgo = (timestamp: string): string => {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000
  );
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};
```

---

## 🧪 Testing Guide

### Manual Testing Steps

#### Test 1: Start Active Session

1. Create a test user in Supabase Auth
2. Insert a test session:

```sql
INSERT INTO public.running_sessions (
  user_id, session_start_time, status, device_model
) VALUES (
  'YOUR_USER_ID',
  NOW(),
  'active',
  'Test Device'
) RETURNING id;
```

3. Open IoT Monitor dashboard
4. Verify new runner appears in the list

#### Test 2: Heart Rate Updates

1. Insert heart rate data:

```sql
INSERT INTO public.session_heart_rate_data (
  session_id, heart_rate_bpm, recorded_at, timestamp_offset_seconds
) VALUES (
  'YOUR_SESSION_ID',
  145,
  NOW(),
  30
);
```

2. Verify heart rate updates in dashboard instantly (via realtime)
3. Connection status should show "LIVE" (green dot)

#### Test 3: Connection Status Changes

1. Wait 15 seconds without inserting HR data
2. Verify connection status changes to "SLOW" (yellow dot)
3. Wait 35 seconds total
4. Verify connection status changes to "LOST" (red dot)

#### Test 4: Critical Heart Rate Alert

1. Insert critical HR:

```sql
INSERT INTO public.session_heart_rate_data (
  session_id, heart_rate_bpm, recorded_at, timestamp_offset_seconds
) VALUES (
  'YOUR_SESSION_ID',
  185, -- Critical level
  NOW(),
  60
);
```

2. Verify status badge changes to "CRITICAL" (red)
3. Verify heart icon pulses
4. Check if alert banner appears at bottom of screen
5. Check `session_alerts` table for auto-created alert

#### Test 5: End Session

1. Update session status:

```sql
UPDATE public.running_sessions
SET status = 'completed', session_end_time = NOW()
WHERE id = 'YOUR_SESSION_ID';
```

2. Verify runner disappears from IoT Monitor
3. Verify no errors in console

### Automated Test Script

```typescript
// test-iot-monitor.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("YOUR_URL", "YOUR_KEY");

async function testIoTMonitor() {
  // 1. Create test user
  const { data: authUser } = await supabase.auth.signUp({
    email: "test@example.com",
    password: "testpassword123",
  });
  const userId = authUser.user!.id;

  // 2. Start session
  const { data: session } = await supabase
    .from("running_sessions")
    .insert({
      user_id: userId,
      session_start_time: new Date().toISOString(),
      status: "active",
      device_model: "Test Device",
    })
    .select()
    .single();

  console.log("✅ Session created:", session.id);

  // 3. Simulate heart rate stream
  for (let i = 0; i < 10; i++) {
    const hr = 140 + Math.floor(Math.random() * 40);
    await supabase.from("session_heart_rate_data").insert({
      session_id: session.id,
      heart_rate_bpm: hr,
      recorded_at: new Date().toISOString(),
      timestamp_offset_seconds: i * 5,
      is_connected: true,
    });
    console.log(`💓 HR inserted: ${hr} bpm`);
    await new Promise((r) => setTimeout(r, 2000)); // 2 second delay
  }

  // 4. End session
  await supabase
    .from("running_sessions")
    .update({ status: "completed", session_end_time: new Date().toISOString() })
    .eq("id", session.id);

  console.log("✅ Session completed");
}

testIoTMonitor();
```

---

## 🎨 UI Components Reference

### Status Badges

```tsx
<Badge className={getStatusColor(runner.status)}>{runner.status}</Badge>

// Colors:
// CRITICAL: bg-red-500 text-white
// HIGH: bg-amber-500 text-white
// LOW: bg-blue-500 text-white
// NORMAL: bg-green-500 text-white
```

### Heart Rate Display

```tsx
<Heart className={getHeartColor(runner.status)} />
<span>{runner.heart_rate || 0} BPM</span>

// Colors:
// CRITICAL: text-red-500 (with animate-pulse)
// HIGH: text-amber-500
// LOW: text-blue-500
// NORMAL: text-green-500
```

### Connection Status Indicator

```tsx
<div
  className={`w-3 h-3 rounded-full ${getConnectionColor(
    runner.connection_status
  )}`}
/>

// Colors:
// LIVE: bg-green-500
// SLOW: bg-yellow-500 animate-pulse
// LOST: bg-red-500
```

---

## 📚 Additional Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/mxhnswymqijymrwvsybm
- **Database Schema**: [DATABASE_SCHEMA_REFERENCE.md](./DATABASE_SCHEMA_REFERENCE.md)
- **Supabase Realtime Docs**: https://supabase.com/docs/guides/realtime
- **Supabase Client Docs**: https://supabase.com/docs/reference/javascript/introduction

---

## 🐛 Troubleshooting

### Issue: Runners not appearing in dashboard

**Possible Causes:**

1. No sessions with `status = 'active'`
2. RLS policies blocking access
3. User not authenticated as admin

**Solution:**

```sql
-- Check active sessions
SELECT * FROM public.running_sessions WHERE status = 'active';

-- Verify admin user
SELECT id, email, role FROM public.users WHERE role = 'admin';

-- Disable RLS temporarily for testing
ALTER TABLE public.running_sessions DISABLE ROW LEVEL SECURITY;
```

### Issue: Heart rate not updating in real-time

**Possible Causes:**

1. Realtime not enabled on table
2. WebSocket connection failed
3. Mobile app not inserting data

**Solution:**

```sql
-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_heart_rate_data;

-- Check recent HR inserts
SELECT * FROM public.session_heart_rate_data
ORDER BY recorded_at DESC LIMIT 10;
```

### Issue: Connection status always "LOST"

**Possible Causes:**

1. `recorded_at` timestamp is incorrect
2. No heart rate data being inserted
3. Clock sync issues between mobile and server

**Solution:**

- Ensure mobile app uses `recorded_at: new Date().toISOString()`
- Verify timestamps in database match current time
- Check mobile device clock settings

---

**Last Updated:** November 21, 2025  
**Version:** 1.0.0  
**Author:** Pacebeats Development Team
