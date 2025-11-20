# IoT Monitor - Current Status & Setup Guide

**Document Created:** November 21, 2025  
**Purpose:** Complete overview of the IoT Monitor implementation, current issues, and setup requirements for AI assistance

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Current Implementation](#current-implementation)
3. [Architecture & Data Flow](#architecture--data-flow)
4. [Known Issues & Challenges](#known-issues--challenges)
5. [Database Requirements](#database-requirements)
6. [Mobile App Integration Needs](#mobile-app-integration-needs)
7. [Setup Instructions](#setup-instructions)
8. [Testing Workflow](#testing-workflow)
9. [Next Steps & Recommendations](#next-steps--recommendations)

---

## 🎯 Overview

### What is the IoT Monitor?

The IoT Monitor is a **real-time dashboard** for tracking active runners during their sessions. It displays live data from wearable devices (smartwatches) through a Next.js admin dashboard.

### Key Features

- ✅ **Real-time heart rate monitoring** - Live updates from wearable devices
- ✅ **Connection status tracking** - Shows if device is LIVE, SLOW, or LOST
- ✅ **Critical alerts** - Automatic warnings for dangerous heart rates
- ✅ **Multi-user monitoring** - Track unlimited concurrent runners
- ✅ **Mobile responsive UI** - Works on desktop, tablet, and mobile
- ✅ **Search & filters** - Filter by status (Critical, High, Normal, Low)

### Tech Stack

- **Frontend:** Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Real-time subscriptions)
- **UI Components:** shadcn/ui + Framer Motion (animations)
- **Authentication:** Supabase Auth (admin role required)

---

## 📁 Current Implementation

### File Location

```
src/app/dashboard/iot-monitor/page.tsx
```

### Code Structure

```typescript
// Main component
export default function IoTMonitorPage() {
  // State management
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Core functions
  const loadActiveRunners = useCallback(async () => {
    // Fetches active sessions from database
    // Gets latest heart rate data
    // Calculates connection status
  }, []);

  // Real-time subscriptions (3 separate channels)
  useEffect(() => {
    // Channel 1: running_sessions changes
    // Channel 2: heart_rate_data inserts
    // Channel 3: alerts inserts
  }, [isMonitoring]);

  // Fallback polling (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadActiveRunners();
    }, 5000);
  }, [isMonitoring]);

  // UI rendering
  return <div>{/* Stats cards, search/filter, runner cards */}</div>;
}
```

### Data Model

```typescript
interface Runner {
  session_id: string; // UUID from running_sessions.id
  user_id: string; // UUID from users.id
  username: string; // Display name
  email: string; // User email
  heart_rate: number | null; // Latest HR (bpm)
  pace: number | null; // Pace (min/km)
  speed: number | null; // Speed (km/h)
  status: "NORMAL" | "HIGH" | "CRITICAL" | "LOW";
  duration_seconds: number; // Total run time
  distance_km: number | null; // Distance covered
  last_update: string; // ISO timestamp
  connection_status: "LIVE" | "SLOW" | "LOST";
  session_status: string; // 'active', 'paused', 'completed'
  alert_count: number; // Number of alerts
  latest_alert_severity: string | null;
}
```

### Status Logic

```typescript
// Heart Rate Status
const getHRStatus = (hr: number | null) => {
  if (!hr || hr === 0) return "LOW";
  if (hr > 180) return "CRITICAL"; // 🔴 Dangerous
  if (hr > 165) return "HIGH"; // 🟠 Warning
  if (hr < 100) return "LOW"; // 🔵 Possibly disconnected
  return "NORMAL"; // 🟢 Healthy
};

// Connection Status
const getConnectionStatus = (lastUpdate: string) => {
  const secondsSinceUpdate = Math.floor(
    (Date.now() - new Date(lastUpdate).getTime()) / 1000
  );

  if (secondsSinceUpdate < 10) return "LIVE"; // 🟢 Active
  if (secondsSinceUpdate < 30) return "SLOW"; // 🟡 Lagging
  return "LOST"; // 🔴 Disconnected
};
```

---

## 🏗️ Architecture & Data Flow

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  MOBILE APP (Phone + Watch)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Wearable Device (Galaxy Watch, Apple Watch, etc.)   │  │
│  │  - Measures heart rate via BLE                       │  │
│  │  - Tracks GPS location                               │  │
│  │  - Calculates pace, distance, duration              │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │ Bluetooth                           │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Mobile App (React Native / Native)                  │  │
│  │  - Receives data from watch every 1-5 seconds        │  │
│  │  - Aggregates metrics                                │  │
│  │  - Sends to Supabase via HTTPS                       │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼──────────────────────────────────┘
                         │ HTTPS API Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                 │  │
│  │  ├─ running_sessions (status='active')              │  │
│  │  ├─ session_heart_rate_data (INSERT every 1-5s)     │  │
│  │  ├─ heart_rate_alerts (auto-created triggers)       │  │
│  │  └─ users (profile data)                            │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────┴─────────────────────────────────┐  │
│  │  Realtime Engine (PostgreSQL CDC)                   │  │
│  │  - Listens for INSERT/UPDATE/DELETE                 │  │
│  │  - Broadcasts to WebSocket subscribers              │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼──────────────────────────────────┘
                         │ WebSocket (Real-time)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               ADMIN DASHBOARD (Next.js)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  IoT Monitor Page                                    │  │
│  │  1️⃣ Initial Load: Query all active sessions          │  │
│  │  2️⃣ Real-time: Subscribe to table changes            │  │
│  │  3️⃣ Fallback: Poll every 5 seconds                   │  │
│  │  4️⃣ Display: Live runner cards with metrics          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Sequence

#### 1️⃣ Session Start (Mobile App)

```typescript
// Mobile app creates session when user starts run
POST /running_sessions
{
  user_id: "uuid",
  session_start_time: "2025-11-21T10:00:00Z",
  status: "active",
  device_model: "Galaxy Watch 7"
}

// Admin dashboard receives via real-time subscription
// New runner card appears automatically
```

#### 2️⃣ Heart Rate Streaming (Mobile App)

```typescript
// Mobile app sends HR every 1-5 seconds
setInterval(() => {
  POST /session_heart_rate_data
  {
    session_id: "uuid",
    heart_rate_bpm: 145,
    recorded_at: "2025-11-21T10:00:03Z",
    timestamp_offset_seconds: 3
  }
}, 3000);

// Admin dashboard updates instantly via WebSocket
// Heart icon updates, connection status shows "LIVE"
```

#### 3️⃣ Session Updates (Mobile App)

```typescript
// Mobile app updates session metrics every 5-10 seconds
PATCH /running_sessions/:id
{
  session_duration_seconds: 600,
  total_distance_km: 1.5,
  avg_pace_min_per_km: 5.5,
  avg_heart_rate_bpm: 145
}

// Admin dashboard shows updated distance, pace, duration
```

#### 4️⃣ Critical Alert (Automatic)

```typescript
// Database trigger detects HR >= 180 bpm
// Automatically creates alert
INSERT INTO heart_rate_alerts
{
  session_id: "uuid",
  heart_rate: 185,
  severity: "CRITICAL"
}

// Admin dashboard shows:
// - Red pulsing heart icon
// - Critical badge
// - Bottom banner alert
// - Toast notification
```

#### 5️⃣ Session End (Mobile App)

```typescript
// Mobile app marks session complete
PATCH /running_sessions/:id
{
  status: "completed",
  session_end_time: "2025-11-21T10:30:00Z"
}

// Admin dashboard removes runner from list
// (Only 'active' sessions are shown)
```

---

## ⚠️ Known Issues & Challenges

### 🔴 Critical Issues

#### 1. No Real Mobile App Yet

**Status:** ❌ **BLOCKING**

**Problem:**

- IoT Monitor is fully built but has no data source
- Requires mobile app to send heart rate data
- Cannot test real-time features without live data

**Impact:**

- Dashboard shows "No active runners" by default
- Real-time subscriptions work but have nothing to subscribe to
- Cannot demonstrate critical alert features

**Solution:**

- Need mobile app integration (React Native, Flutter, or Native)
- OR create a data simulator/mock mobile app for testing
- OR use SQL inserts to manually test features

---

#### 2. Database Schema Mismatch

**Status:** ⚠️ **PARTIALLY RESOLVED**

**Problem:**

- IoT Monitor expects specific columns in `running_sessions`:
  - `current_distance_km` (real-time distance)
  - `current_pace_min_per_km` (real-time pace)
  - `elapsed_time_seconds` (elapsed time vs total duration)
  - `last_heartbeat_at` (connection tracking)

**Impact:**

- Dashboard queries may fail if columns don't exist
- Connection status calculation may be inaccurate
- Mobile app may not know which fields to update

**Current Workaround:**

```typescript
// Dashboard falls back to aggregate columns
const distanceKm =
  session.current_distance_km || session.total_distance_km || 0;
const pace = session.current_pace_min_per_km || session.avg_pace_min_per_km;
```

**Solution:**

```sql
-- Add missing columns to running_sessions
ALTER TABLE public.running_sessions
ADD COLUMN IF NOT EXISTS current_distance_km NUMERIC(10, 3),
ADD COLUMN IF NOT EXISTS current_pace_min_per_km NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS elapsed_time_seconds INTEGER,
ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ;

-- Create index for connection tracking
CREATE INDEX IF NOT EXISTS idx_sessions_heartbeat
ON public.running_sessions(last_heartbeat_at DESC)
WHERE status = 'active';
```

---

#### 3. Heart Rate Alert System Not Configured

**Status:** ⚠️ **NEEDS SETUP**

**Problem:**

- `heart_rate_alerts` table may not exist
- Database trigger for auto-creating alerts not configured
- Alert queries in dashboard may fail

**Current State:**

```typescript
// Dashboard queries alerts but table might be missing
const { data: alerts } = await supabase
  .from("heart_rate_alerts") // ❌ May not exist
  .select("session_id, severity")
  .in("session_id", sessionIds)
  .eq("resolved", false);
```

**Solution:**

1. Run SQL schema from `supabase-schema.sql`
2. Create `heart_rate_alerts` table
3. Set up database trigger for automatic alert creation
4. Enable RLS policies

---

### 🟡 Medium Issues

#### 4. Real-time Subscription Reliability

**Status:** ⚠️ **NEEDS TESTING**

**Problem:**

- Real-time subscriptions use 3 separate channels
- WebSocket connection can drop on poor network
- Fallback polling every 5 seconds helps but isn't instant

**Current Implementation:**

```typescript
// 3 separate realtime channels
const sessionsChannel = supabase.channel("db-changes-sessions");
const heartRateChannel = supabase.channel("db-changes-heart-rate");
const alertsChannel = supabase.channel("db-changes-alerts");

// Fallback polling
setInterval(() => {
  loadActiveRunners();
}, 5000);
```

**Potential Issues:**

- Multiple channels = more memory usage
- If WebSocket drops, updates delayed up to 5 seconds
- Reconnection logic not implemented

**Recommendation:**

- Test with real mobile data to verify reliability
- Add reconnection handling
- Consider combining channels into one

---

#### 5. Performance at Scale

**Status:** ⚠️ **UNTESTED**

**Problem:**

- Dashboard queries all active sessions on every load
- No pagination (limit 50 runners hardcoded)
- Heart rate query uses `DISTINCT ON` which can be slow

**Current Query:**

```typescript
// Gets all active sessions
const { data: sessions } = await supabase
  .from("running_sessions")
  .select(/* ... */)
  .eq("status", "active")
  .order("last_heartbeat_at", { ascending: false })
  .limit(50); // Hardcoded limit

// Gets ALL heart rate data for those sessions
const { data: latestHR } = await supabase
  .from("session_heart_rate_data")
  .select("session_id, heart_rate_bpm, recorded_at")
  .in("session_id", sessionIds)
  .order("recorded_at", { ascending: false });
// ⚠️ Could return thousands of rows if sessions are long
```

**Impact:**

- Works fine for < 50 concurrent runners
- May slow down with 100+ runners
- Heart rate query could be optimized

**Optimization Ideas:**

- Use database view for "latest heart rate per session"
- Add pagination to dashboard
- Use PostgreSQL window functions for better performance

---

### 🟢 Minor Issues

#### 6. UI/UX Polish Needed

**Issues:**

- Empty state when no runners (shows generic message)
- No loading skeleton for individual runner cards
- Search/filter doesn't persist on refresh
- No "Export to CSV" for runner data
- No admin notifications for critical alerts (besides toast)

**Priority:** Low (functionality works, just needs polish)

---

#### 7. Error Handling Edge Cases

**Missing Error Handling:**

- What if user doesn't exist for a session?
- What if heart rate is out of range (< 40 or > 220)?
- What if session has no heart rate data at all?
- What if database connection drops?

**Current State:**

- Basic try/catch blocks exist
- Toast notifications show errors
- Console logs for debugging

**Recommendation:**

- Add more specific error messages
- Handle edge cases gracefully
- Add retry logic for failed queries

---

## 🗄️ Database Requirements

### Required Tables

#### 1. `users` Table

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `running_sessions` Table (WITH UPDATES)

```sql
CREATE TABLE public.running_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end_time TIMESTAMPTZ,

  -- Duration fields
  session_duration_seconds INTEGER DEFAULT 0,
  elapsed_time_seconds INTEGER DEFAULT 0,  -- ✅ NEEDED

  -- Distance fields
  total_distance_km NUMERIC(10, 3) DEFAULT 0,
  current_distance_km NUMERIC(10, 3),      -- ✅ NEEDED

  -- Pace/Speed fields
  avg_pace_min_per_km NUMERIC(5, 2),
  current_pace_min_per_km NUMERIC(5, 2),   -- ✅ NEEDED
  avg_speed_kmh NUMERIC(5, 2),

  -- Heart rate fields
  avg_heart_rate_bpm INTEGER,
  max_heart_rate_bpm INTEGER,

  -- Other metrics
  total_calories_burned INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,

  -- Device info
  device_model TEXT,

  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  last_heartbeat_at TIMESTAMPTZ,           -- ✅ NEEDED

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Critical indexes
CREATE INDEX idx_sessions_active ON public.running_sessions(status, last_heartbeat_at DESC)
  WHERE status = 'active';
CREATE INDEX idx_sessions_user ON public.running_sessions(user_id);
CREATE INDEX idx_sessions_start ON public.running_sessions(session_start_time DESC);
```

#### 3. `session_heart_rate_data` Table

```sql
CREATE TABLE public.session_heart_rate_data (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.running_sessions(id) ON DELETE CASCADE,
  heart_rate_bpm INTEGER NOT NULL CHECK (heart_rate_bpm >= 40 AND heart_rate_bpm <= 220),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  timestamp_offset_seconds INTEGER NOT NULL,
  is_connected BOOLEAN DEFAULT true
);

-- Critical indexes
CREATE INDEX idx_hr_session_recorded ON public.session_heart_rate_data(session_id, recorded_at DESC);
CREATE INDEX idx_hr_recorded ON public.session_heart_rate_data(recorded_at DESC);
```

#### 4. `heart_rate_alerts` Table

```sql
CREATE TABLE public.heart_rate_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  session_id UUID NOT NULL REFERENCES public.running_sessions(id) ON DELETE CASCADE,
  heart_rate INTEGER NOT NULL CHECK (heart_rate >= 40 AND heart_rate <= 220),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'HIGH', 'CRITICAL')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  CONSTRAINT heart_rate_alerts_check CHECK (
    (resolved = false AND resolved_at IS NULL) OR
    (resolved = true AND resolved_at IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_alerts_session ON public.heart_rate_alerts(session_id);
CREATE INDEX idx_alerts_unresolved ON public.heart_rate_alerts(resolved, created_at DESC)
  WHERE resolved = false;
```

### Database Functions & Triggers (Optional but Recommended)

#### Auto-Update Session Timestamp

```sql
-- Update last_heartbeat_at when heart rate inserted
CREATE OR REPLACE FUNCTION update_session_heartbeat()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.running_sessions
  SET last_heartbeat_at = NEW.recorded_at
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_heartbeat
  AFTER INSERT ON public.session_heart_rate_data
  FOR EACH ROW
  EXECUTE FUNCTION update_session_heartbeat();
```

#### Auto-Create Critical Alerts

```sql
-- Automatically create alerts for dangerous heart rates
CREATE OR REPLACE FUNCTION create_heart_rate_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_username TEXT;
  v_severity TEXT;
BEGIN
  -- Only process critical/high/low heart rates
  IF NEW.heart_rate_bpm >= 180 THEN
    v_severity := 'CRITICAL';
  ELSIF NEW.heart_rate_bpm >= 165 THEN
    v_severity := 'HIGH';
  ELSIF NEW.heart_rate_bpm < 100 AND NEW.heart_rate_bpm > 0 THEN
    v_severity := 'LOW';
  ELSE
    RETURN NEW; -- Normal range, no alert
  END IF;

  -- Get user info
  SELECT rs.user_id, COALESCE(u.username, u.email)
  INTO v_user_id, v_username
  FROM public.running_sessions rs
  JOIN public.users u ON u.id = rs.user_id
  WHERE rs.id = NEW.session_id;

  -- Create alert (if no similar alert in last 5 minutes)
  INSERT INTO public.heart_rate_alerts (
    user_id, username, session_id, heart_rate, severity
  )
  SELECT v_user_id, v_username, NEW.session_id, NEW.heart_rate_bpm, v_severity
  WHERE NOT EXISTS (
    SELECT 1 FROM public.heart_rate_alerts
    WHERE session_id = NEW.session_id
      AND severity = v_severity
      AND resolved = false
      AND created_at > NOW() - INTERVAL '5 minutes'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hr_alerts
  AFTER INSERT ON public.session_heart_rate_data
  FOR EACH ROW
  EXECUTE FUNCTION create_heart_rate_alert();
```

### Realtime Configuration

```sql
-- Enable realtime on all IoT Monitor tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.running_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_heart_rate_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.heart_rate_alerts;
```

---

## 📱 Mobile App Integration Needs

### What the Mobile App Must Do

#### 1️⃣ Authentication

```typescript
// Mobile app must authenticate users
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mxhnswymqijymrwvsybm.supabase.co",
  "YOUR_ANON_KEY"
);

// Sign in user
const { data } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});

const userId = data.user?.id; // Save for session creation
```

#### 2️⃣ Start Running Session

```typescript
// When user taps "Start Run"
async function startRun(userId: string, deviceModel: string) {
  const { data: session } = await supabase
    .from("running_sessions")
    .insert({
      user_id: userId,
      session_start_time: new Date().toISOString(),
      status: "active",
      device_model: deviceModel,
      session_duration_seconds: 0,
      current_distance_km: 0,
      current_pace_min_per_km: 0,
    })
    .select()
    .single();

  return session.id; // Save session ID
}
```

#### 3️⃣ Stream Heart Rate Data

```typescript
// Loop: Send HR every 1-5 seconds
let hrInterval = setInterval(async () => {
  const heartRate = await getHeartRateFromWatch(); // Get from wearable

  await supabase.from("session_heart_rate_data").insert({
    session_id: sessionId,
    heart_rate_bpm: heartRate,
    recorded_at: new Date().toISOString(), // ⚠️ CRITICAL - Current time
    timestamp_offset_seconds: Math.floor((Date.now() - startTime) / 1000),
    is_connected: true,
  });
}, 3000); // Every 3 seconds
```

#### 4️⃣ Update Session Metrics

```typescript
// Loop: Update session every 5-10 seconds
setInterval(async () => {
  await supabase
    .from("running_sessions")
    .update({
      elapsed_time_seconds: currentDuration,
      current_distance_km: currentDistance,
      current_pace_min_per_km: currentPace,
      avg_pace_min_per_km: averagePace,
      avg_speed_kmh: averageSpeed,
      avg_heart_rate_bpm: averageHR,
      max_heart_rate_bpm: maxHR,
      last_heartbeat_at: new Date().toISOString(), // ⚠️ Update heartbeat
    })
    .eq("id", sessionId);
}, 5000);
```

#### 5️⃣ End Running Session

```typescript
// When user taps "Stop Run"
async function stopRun(sessionId: string, finalMetrics: any) {
  // Stop intervals
  clearInterval(hrInterval);
  clearInterval(metricsInterval);

  // Mark session complete
  await supabase
    .from("running_sessions")
    .update({
      status: "completed",
      session_end_time: new Date().toISOString(),
      session_duration_seconds: finalMetrics.duration,
      total_distance_km: finalMetrics.distance,
      avg_pace_min_per_km: finalMetrics.pace,
      avg_heart_rate_bpm: finalMetrics.avgHR,
      max_heart_rate_bpm: finalMetrics.maxHR,
    })
    .eq("id", sessionId);
}
```

### Mobile App Checklist

- [ ] **Authentication:** User can sign in via Supabase Auth
- [ ] **Wearable Connection:** App connects to smartwatch via Bluetooth
- [ ] **Session Start:** Creates `running_sessions` record with `status='active'`
- [ ] **Heart Rate Stream:** Inserts into `session_heart_rate_data` every 1-5 seconds
- [ ] **Metrics Updates:** Updates `running_sessions` every 5-10 seconds
- [ ] **Session End:** Sets `status='completed'` when run ends
- [ ] **Error Handling:** Retries on network failure
- [ ] **Background Mode:** Continues sending data when app in background

---

## 🛠️ Setup Instructions

### For Testing Without Mobile App

#### Option 1: Manual SQL Testing

```sql
-- 1. Create test user
INSERT INTO public.users (id, email, username, role)
VALUES (
  'test-user-id',
  'testrunner@example.com',
  'Test Runner',
  'user'
);

-- 2. Create active session
INSERT INTO public.running_sessions (
  id, user_id, session_start_time, status, device_model
) VALUES (
  'test-session-id',
  'test-user-id',
  NOW(),
  'active',
  'Test Device'
);

-- 3. Insert heart rate data (repeat every few seconds)
INSERT INTO public.session_heart_rate_data (
  session_id, heart_rate_bpm, recorded_at, timestamp_offset_seconds
) VALUES (
  'test-session-id',
  145,  -- Change this value to test different statuses
  NOW(),
  30
);

-- 4. Update session metrics
UPDATE public.running_sessions
SET
  elapsed_time_seconds = 300,
  current_distance_km = 0.5,
  current_pace_min_per_km = 5.5,
  last_heartbeat_at = NOW()
WHERE id = 'test-session-id';

-- 5. Test critical alert (insert HR >= 180)
INSERT INTO public.session_heart_rate_data (
  session_id, heart_rate_bpm, recorded_at, timestamp_offset_seconds
) VALUES (
  'test-session-id',
  185,  -- CRITICAL level
  NOW(),
  60
);

-- 6. End session
UPDATE public.running_sessions
SET status = 'completed', session_end_time = NOW()
WHERE id = 'test-session-id';
```

#### Option 2: JavaScript Test Script

```javascript
// test-iot-simulator.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("YOUR_URL", "YOUR_KEY");

async function simulateRunner() {
  // Create test user
  const userId = crypto.randomUUID();
  await supabase.from("users").insert({
    id: userId,
    email: "simulator@test.com",
    username: "Simulated Runner",
  });

  // Start session
  const { data: session } = await supabase
    .from("running_sessions")
    .insert({
      user_id: userId,
      session_start_time: new Date().toISOString(),
      status: "active",
      device_model: "Simulator",
    })
    .select()
    .single();

  console.log("✅ Session started:", session.id);

  // Simulate heart rate for 2 minutes
  for (let i = 0; i < 40; i++) {
    const hr = 120 + Math.floor(Math.random() * 60); // 120-180 bpm

    await supabase.from("session_heart_rate_data").insert({
      session_id: session.id,
      heart_rate_bpm: hr,
      recorded_at: new Date().toISOString(),
      timestamp_offset_seconds: i * 3,
    });

    console.log(`💓 HR: ${hr} bpm`);
    await new Promise((r) => setTimeout(r, 3000)); // Wait 3 seconds
  }

  // End session
  await supabase
    .from("running_sessions")
    .update({ status: "completed", session_end_time: new Date().toISOString() })
    .eq("id", session.id);

  console.log("✅ Session ended");
}

simulateRunner();
```

### For Production Setup

1. **Database Schema:**

   ```bash
   # Run all SQL from supabase-schema.sql
   # Includes tables, indexes, triggers, RLS policies
   ```

2. **Realtime Configuration:**

   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.running_sessions;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.session_heart_rate_data;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.heart_rate_alerts;
   ```

3. **Environment Variables:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://mxhnswymqijymrwvsybm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Deploy Dashboard:**

   ```bash
   npm run build
   npm run start
   ```

5. **Mobile App Integration:**
   - Provide mobile developers with API documentation
   - Share database schema and expected data format
   - Set up test users and devices
   - Monitor logs during beta testing

---

## 🧪 Testing Workflow

### Test Cases

#### ✅ Test 1: New Session Appears

1. Insert active session into database
2. Verify runner card appears in dashboard
3. Check username displays correctly
4. Verify initial stats show (0 distance, 0 duration)

#### ✅ Test 2: Heart Rate Updates

1. Insert heart rate data for session
2. Verify heart rate updates instantly (real-time)
3. Check status badge color (green/amber/red)
4. Verify connection status shows "LIVE"

#### ✅ Test 3: Connection Status Changes

1. Wait 15 seconds without inserting HR
2. Verify status changes to "SLOW" (yellow dot)
3. Wait 35 seconds total
4. Verify status changes to "LOST" (red dot)

#### ✅ Test 4: Critical Heart Rate Alert

1. Insert HR >= 180 bpm
2. Verify status changes to "CRITICAL"
3. Check heart icon pulses (animation)
4. Verify alert banner appears at bottom
5. Check toast notification appears
6. Verify alert created in `heart_rate_alerts` table

#### ✅ Test 5: Search & Filter

1. Create multiple test runners
2. Search by username
3. Filter by status (Critical, High, Normal)
4. Verify results update correctly

#### ✅ Test 6: Session Ends

1. Update session status to 'completed'
2. Verify runner disappears from dashboard
3. Check no console errors

#### ✅ Test 7: Pause Monitoring

1. Click "Pause" button
2. Verify real-time updates stop
3. Verify polling stops
4. Click "Start" button
5. Verify monitoring resumes

---

## 🚀 Next Steps & Recommendations

### Immediate Actions (High Priority)

1. **✅ Fix Database Schema**

   - Run SQL to add missing columns (`current_distance_km`, `current_pace_min_per_km`, `elapsed_time_seconds`, `last_heartbeat_at`)
   - Create `heart_rate_alerts` table
   - Set up database triggers for auto-updating `last_heartbeat_at`

2. **✅ Create Test Data**

   - Write SQL script to generate realistic test data
   - OR build simple simulator tool
   - Verify IoT Monitor displays correctly

3. **✅ Test Real-time Subscriptions**
   - Insert data manually and verify instant updates
   - Test WebSocket connection reliability
   - Add reconnection logic if needed

### Short-term Actions (Medium Priority)

4. **📱 Mobile App Integration**

   - Provide API documentation to mobile team
   - Share database schema and data format
   - Set up test environment for beta testing

5. **🔔 Alert System Enhancement**

   - Add email notifications for critical alerts
   - Create admin alert management page
   - Add "Acknowledge Alert" functionality

6. **📊 Performance Optimization**
   - Create database view for "latest heart rate per session"
   - Add pagination to dashboard (show 20 runners, load more)
   - Optimize queries with proper indexes

### Long-term Actions (Low Priority)

7. **🎨 UI/UX Improvements**

   - Add more detailed runner profiles (click to expand)
   - Show historical heart rate graph
   - Add GPS route visualization
   - Export runner data to CSV

8. **📈 Analytics & Reporting**

   - Track total monitoring time
   - Count critical alerts per day
   - Generate safety reports
   - Show average heart rate trends

9. **🔒 Security & Compliance**
   - Review RLS policies
   - Add audit logging
   - Implement data retention policies
   - HIPAA compliance (if needed for health data)

---

## 📚 Additional Resources

### Documentation Files

- `IOT_MONITOR_IMPLEMENTATION.md` - Original detailed guide
- `DATABASE_SCHEMA_REFERENCE.md` - Full database schema
- `supabase-schema.sql` - SQL setup script

### External Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Query (TanStack)](https://tanstack.com/query/latest)

### Contact

- GitHub Issues: [Report bugs or request features]
- Email: dev@pacebeats.com

---

## 🎯 Summary for AI Assistance

**When providing this document to an AI for help:**

> "I have built a real-time IoT monitoring dashboard for tracking runners' heart rates during active sessions. The frontend is complete and functional, but I need help with:
>
> 1. **Database Setup:** Ensuring all required columns exist in `running_sessions` table
> 2. **Testing Strategy:** Creating realistic test data without a mobile app
> 3. **Alert System:** Setting up automatic critical heart rate alerts
> 4. **Performance:** Optimizing queries for 50+ concurrent runners
> 5. **Mobile Integration:** Defining exact API contract for mobile developers
>
> The system uses Next.js 15, Supabase (PostgreSQL + Realtime), and TypeScript. Key files:
>
> - Frontend: `src/app/dashboard/iot-monitor/page.tsx`
> - Schema: `supabase-schema.sql`
> - Docs: `docs/IOT_MONITOR_IMPLEMENTATION.md`
>
> Please review the 'Known Issues' section and help me resolve the critical blockers first."

---

**Document Version:** 1.0  
**Last Updated:** November 21, 2025  
**Author:** Pacebeats Development Team  
**Status:** ✅ **READY FOR AI REVIEW**
