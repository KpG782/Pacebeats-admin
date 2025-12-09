# 🔌 PaceBeats Admin API Routes Documentation

> **Simple Explanation:** This document explains all the backend API routes (the "middleman" between your admin dashboard and the database). Think of API routes as waiters at a restaurant - they take orders from the frontend, fetch data from the kitchen (database), and bring it back to you.

---

## 📋 Table of Contents

1. [What Are API Routes?](#what-are-api-routes)
2. [How They Work](#how-they-work)
3. [Authentication & Security](#authentication--security)
4. [API Route #1: Active Runners Monitor](#1-active-runners-monitor)
5. [API Route #2: Users with Session Stats](#2-users-with-session-stats)
6. [API Route #3: User-Specific Sessions](#3-user-specific-sessions)
7. [API Route #4: Session Details](#4-session-details)
8. [API Route #5: Delete Session](#5-delete-session)
9. [Common Patterns](#common-patterns)
10. [Error Handling](#error-handling)

---

## 🤔 What Are API Routes?

**In Simple Terms:**

- Your admin dashboard (frontend) = The customer at a restaurant
- API Routes = The waiter
- Database (Supabase) = The kitchen

When your dashboard needs data, it asks the API route, which then goes to the database, gets the data, and brings it back.

**Technical Terms:**

- API routes are **server-side** endpoints in Next.js
- They run on the server (not in the user's browser)
- They can access sensitive credentials (like admin database keys)
- They handle HTTP requests: `GET` (read data), `POST` (create), `DELETE` (remove), etc.

**Why Use Them?**

1. **Security**: Keeps your admin database key secret (not visible in browser)
2. **Performance**: Can process/format data before sending to frontend
3. **Centralized Logic**: One place to handle database queries

---

## 🔄 How They Work

### Request Flow:

```
1. Dashboard Page (Browser)
   ↓ Makes HTTP Request
2. API Route (/api/sessions/users)
   ↓ Connects to Database
3. Supabase Database
   ↓ Returns Data
4. API Route (processes data)
   ↓ Sends JSON Response
5. Dashboard Page (displays data)
```

### Example in Code:

```typescript
// Frontend calls the API
const response = await fetch("/api/sessions/users");
const data = await response.json();

// API route handles the request
export async function GET() {
  const users = await supabase.from("users").select("*");
  return NextResponse.json({ users });
}
```

---

## 🔐 Authentication & Security

### Admin Client Pattern

All API routes use the **Service Role Key** (admin key) instead of the regular user key.

```typescript
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 🔑 Admin key!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false, // No user sessions needed
      persistSession: false, // Don't remember logins
    },
  });
};
```

**Why?**

- Regular users have **Row Level Security (RLS)** - they can only see their own data
- Admin needs to see **all users and sessions**
- Service role key **bypasses RLS** completely

⚠️ **Security Note:** The service role key is only in `.env.local` (server-side), never sent to the browser!

---

## 1️⃣ Active Runners Monitor

**File:** `src/app/api/iot-monitor/active-runners/route.ts`

### Purpose

Gets all currently running sessions (runners who are actively running RIGHT NOW).

### Simple Explanation

Imagine a dashboard showing all delivery drivers currently on the road. This API finds all runners whose session status is "active" or "running" and haven't stopped yet.

### API Endpoint

```
GET /api/iot-monitor/active-runners
```

### What It Does

#### Step 1: Get Active Sessions

```typescript
const { data: sessions } = await supabaseAdmin
  .from("running_sessions")
  .select(
    `
    id,
    user_id,
    session_start_time,
    current_distance_km,        // Real-time distance
    current_pace_min_per_km,    // Real-time pace
    current_heart_rate_bpm,     // Real-time heart rate ❤️
    elapsed_time_seconds,       // How long they've been running
    last_heartbeat_at,          // Last time app sent update
    status,                     // Must be "active" or "running"
    users (                     // Get user info too
      username,
      email
    )
  `
  )
  .in("status", ["active", "running"]) // Only active runners
  .order("last_heartbeat_at", { ascending: false }) // Most recent first
  .limit(50); // Max 50 runners
```

**Key Fields:**

- `current_distance_km` - How far they've run (updated every 2 seconds by mobile app)
- `current_pace_min_per_km` - Current pace (e.g., 5:30 min/km)
- `current_heart_rate_bpm` - Latest heart rate reading ❤️
- `last_heartbeat_at` - Last time the mobile app sent an update (shows if session is "stale")

#### Step 2: Get Heart Rate History

```typescript
const sessionIds = sessions.map((s) => s.id);

const { data: heartRates } = await supabaseAdmin
  .from("session_heart_rate_data")
  .select("session_id, heart_rate_bpm, recorded_at")
  .in("session_id", sessionIds)
  .order("recorded_at", { ascending: false });
```

This gets **all heart rate readings** for these sessions (not just the current one).

#### Step 3: Get Alerts

```typescript
const { data: alerts } = await supabaseAdmin
  .from("session_alerts")
  .select("session_id, severity, alert_message, triggered_at")
  .in("session_id", sessionIds)
  .order("triggered_at", { ascending: false });
```

Alerts = warnings like "High heart rate: 185 BPM!"

### Response Format

```json
{
  "sessions": [
    {
      "id": "11064df0-...",
      "user_id": "abc123...",
      "current_distance_km": 2.45,
      "current_pace_min_per_km": 5.3,
      "current_heart_rate_bpm": 149,
      "elapsed_time_seconds": 780,
      "last_heartbeat_at": "2025-11-23T10:15:30Z",
      "status": "running",
      "users": {
        "username": "ken_runner",
        "email": "ken@example.com"
      }
    }
  ],
  "heartRates": [
    {
      "session_id": "11064df0-...",
      "heart_rate_bpm": 149,
      "recorded_at": "2025-11-23T10:15:28Z"
    }
  ],
  "alerts": [
    {
      "session_id": "11064df0-...",
      "severity": "HIGH",
      "alert_message": "Heart rate elevated: 151 BPM",
      "triggered_at": "2025-11-23T10:14:00Z"
    }
  ]
}
```

### Used By

- **IOT Monitor Dashboard** (`src/app/dashboard/iot-monitor/page.tsx`)
- Shows live runners, their current stats, and alerts

### Real-World Example

```typescript
// Dashboard calls this API every 5 seconds
const fetchActiveRunners = async () => {
  const response = await fetch("/api/iot-monitor/active-runners");
  const { sessions, heartRates, alerts } = await response.json();

  // Display on dashboard:
  // - Ken is running 2.45 km at 5:30 pace, HR: 149 bpm
  // - Alice is running 1.2 km at 6:00 pace, HR: 135 bpm
  // - ⚠️ Alert: Ken's heart rate is HIGH!
};
```

---

## 2️⃣ Users with Session Stats

**File:** `src/app/api/sessions/users/route.ts`

### Purpose

Gets a list of ALL users with their aggregated running statistics (total distance, sessions, songs, etc.).

### Simple Explanation

Like a leaderboard showing each runner's total stats: "Ken has run 45 sessions, 120 km total, avg heart rate 145 bpm, listened to 320 songs."

### API Endpoint

```
GET /api/sessions/users
```

### What It Does

#### Step 1: Get All Users

```typescript
const { data: users } = await supabaseAdmin
  .from("users")
  .select("id, email, username, created_at")
  .order("created_at", { ascending: false }); // Newest users first
```

#### Step 2: Get All Sessions

```typescript
const { data: sessions } = await supabaseAdmin
  .from("running_sessions")
  .select("*");
```

Gets **every session** from the database (for all users).

#### Step 3: Get Music Data

```typescript
const allSessionIds = sessions.map((s) => s.id);

const { data: musicData } = await supabaseAdmin
  .from("session_music_history")
  .select("session_id")
  .in("session_id", allSessionIds);
```

Gets all songs played in all sessions.

#### Step 4: Group Sessions by User

```typescript
const sessionsByUser = new Map<string, typeof sessions>();
sessions.forEach((session) => {
  if (!sessionsByUser.has(session.user_id)) {
    sessionsByUser.set(session.user_id, []);
  }
  sessionsByUser.get(session.user_id)!.push(session);
});
```

**What's happening:**

- Creates a "dictionary" (Map) where each user ID points to their sessions
- Example: `{ "user123": [session1, session2, session3] }`

#### Step 5: Calculate Stats for Each User

```typescript
const usersWithStats = users.map((user) => {
  const userSessions = sessionsByUser.get(user.id) || [];

  // Total distance = sum of all session distances
  const totalDistance = userSessions.reduce(
    (sum, s) => sum + (s.total_distance_km || 0),
    0
  );

  // Total duration = sum of all session durations
  const totalDuration = userSessions.reduce(
    (sum, s) => sum + (s.session_duration_seconds || 0),
    0
  );

  // Average heart rate = average across all sessions
  const sessionsWithHR = userSessions.filter((s) => s.avg_heart_rate_bpm);
  const avgHeartRate =
    sessionsWithHR.length > 0
      ? Math.round(
          sessionsWithHR.reduce((sum, s) => sum + s.avg_heart_rate_bpm, 0) /
            sessionsWithHR.length
        )
      : 0;

  return {
    user_id: user.id,
    user_email: user.email,
    user_name: user.username || "Unknown",
    total_sessions: userSessions.length,
    total_distance_km: totalDistance,
    total_duration_seconds: totalDuration,
    avg_heart_rate_bpm: avgHeartRate,
    total_songs: musicCountByUser.get(user.id) || 0,
    last_session_date: lastSession?.session_start_time || user.created_at,
    created_at: user.created_at,
  };
});
```

**The `.reduce()` Pattern:**

```typescript
// Simple example of .reduce()
const numbers = [10, 20, 30];
const sum = numbers.reduce((total, number) => total + number, 0);
// sum = 60

// Applied to sessions
const totalDistance = sessions.reduce(
  (sum, session) => sum + session.total_distance_km,
  0 // Start at 0
);
```

### Response Format

```json
{
  "users": [
    {
      "user_id": "abc123...",
      "user_email": "ken@example.com",
      "user_name": "ken_runner",
      "total_sessions": 15,
      "total_distance_km": 45.2,
      "total_duration_seconds": 12000,
      "avg_heart_rate_bpm": 145,
      "total_songs": 120,
      "last_session_date": "2025-11-23T09:00:00Z",
      "created_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

### Used By

- **Users Dashboard** (`src/app/dashboard/users/page.tsx`)
- Shows table of all users with their aggregate stats

---

## 3️⃣ User-Specific Sessions

**File:** `src/app/api/sessions/[userId]/route.ts`

### Purpose

Gets all sessions for ONE specific user.

### Simple Explanation

Like viewing Ken's running history: all his past runs, when they happened, how far he ran, etc.

### API Endpoint

```
GET /api/sessions/[userId]

Example: GET /api/sessions/abc123-456-789
```

The `[userId]` is a **dynamic route parameter** - it changes based on which user you're viewing.

### What It Does

#### Step 1: Get User Info

```typescript
const { userId } = await params; // Extract userId from URL

const { data: user } = await supabaseAdmin
  .from("users")
  .select("id, email, username")
  .eq("id", userId) // Filter by this specific user
  .single(); // Only get one user
```

#### Step 2: Get All Sessions for This User

```typescript
const { data: sessions } = await supabaseAdmin
  .from("running_sessions")
  .select("*")
  .eq("user_id", userId) // Only this user's sessions
  .order("session_start_time", { ascending: false }); // Newest first
```

#### Step 3: Get Music Count per Session

```typescript
const sessionIds = sessions.map((s) => s.id);

const { data: musicData } = await supabaseAdmin
  .from("session_music_history")
  .select("session_id")
  .in("session_id", sessionIds);

// Count music per session
const musicCountBySession = new Map<string, number>();
musicData.forEach((m) => {
  musicCountBySession.set(
    m.session_id,
    (musicCountBySession.get(m.session_id) || 0) + 1
  );
});
```

#### Step 4: Map Sessions with Calculated Fields

```typescript
const mappedSessions = sessions.map((session) => {
  const totalSongs = musicCountBySession.get(session.id) || 0;

  return {
    id: session.id,
    user_id: session.user_id,
    user_email: user.email,
    user_name: user.username,
    started_at: session.session_start_time,
    ended_at: session.session_end_time,
    duration_minutes: Math.round(session.session_duration_seconds / 60),
    distance_km: session.total_distance_km,
    avg_heart_rate_bpm: session.avg_heart_rate_bpm,
    total_songs: totalSongs, // ← Calculated from music_history
    status: session.status,
    // ... more fields
  };
});
```

### Response Format

```json
{
  "user": {
    "id": "abc123...",
    "email": "ken@example.com",
    "username": "ken_runner"
  },
  "sessions": [
    {
      "id": "session-1",
      "started_at": "2025-11-23T09:00:00Z",
      "ended_at": "2025-11-23T09:45:00Z",
      "duration_minutes": 45,
      "distance_km": 7.5,
      "avg_heart_rate_bpm": 145,
      "total_songs": 8,
      "status": "completed"
    }
  ]
}
```

### Used By

- **Sessions Dashboard** (`src/app/dashboard/sessions/page.tsx`)
- When viewing a specific user's session history

---

## 4️⃣ Session Details

**File:** `src/app/api/sessions/detail/[sessionId]/route.ts`

### Purpose

Gets **EVERYTHING** about ONE specific session (heart rate data, GPS route, music played, etc.).

### Simple Explanation

Like clicking on a specific run to see the full details: the route map, heart rate graph, music playlist, pace breakdown, etc.

### API Endpoint

```
GET /api/sessions/detail/[sessionId]

Example: GET /api/sessions/detail/11064df0-abcd-1234
```

### What It Does

#### Step 1: Get Session Data

```typescript
const { sessionId } = await params;

const { data: session } = await supabaseAdmin
  .from("running_sessions")
  .select("*")
  .eq("id", sessionId)
  .single();
```

#### Step 2: Get User Info

```typescript
const { data: user } = await supabaseAdmin
  .from("users")
  .select("id, email, username")
  .eq("id", session.user_id)
  .single();
```

#### Step 3: Get Heart Rate Data (for graph)

```typescript
const { data: heartRateData } = await supabaseAdmin
  .from("session_heart_rate_data")
  .select("*")
  .eq("session_id", sessionId)
  .order("timestamp_offset_seconds", { ascending: true }); // Chronological order
```

**What's in the data:**

```typescript
[
  { heart_rate_bpm: 145, timestamp_offset_seconds: 0, recorded_at: "..." },
  { heart_rate_bpm: 148, timestamp_offset_seconds: 2, recorded_at: "..." },
  { heart_rate_bpm: 151, timestamp_offset_seconds: 4, recorded_at: "..." },
  // ... every 2 seconds
];
```

#### Step 4: Get Music History

```typescript
const { data: musicHistory } = await supabaseAdmin
  .from("session_music_history")
  .select("*")
  .eq("session_id", sessionId)
  .order("play_order", { ascending: true }); // Order songs were played
```

#### Step 5: Get GPS Points (for map)

```typescript
const { data: gpsPoints } = await supabaseAdmin
  .from("session_gps_points")
  .select("*")
  .eq("session_id", sessionId)
  .order("timestamp_offset_seconds", { ascending: true });
```

**GPS Data Structure:**

```typescript
[
  { latitude: 14.56957, longitude: 121.02485, timestamp_offset_seconds: 0 },
  { latitude: 14.56962, longitude: 121.0249, timestamp_offset_seconds: 2 },
  { latitude: 14.56967, longitude: 121.02495, timestamp_offset_seconds: 4 },
  // ... creates the route line on the map
];
```

#### Step 6: Get Pace Intervals

```typescript
const { data: paceIntervals } = await supabaseAdmin
  .from("session_pace_intervals")
  .select("*")
  .eq("session_id", sessionId)
  .order("interval_number", { ascending: true });
```

**Pace intervals** = splits (e.g., "First km: 5:30, Second km: 5:45, Third km: 5:20")

#### Step 7: Calculate Music Stats

```typescript
const totalSongs = musicHistory?.length || 0;
const completedSongs = musicHistory?.filter((m) => !m.was_skipped).length || 0;
const skippedSongs = musicHistory?.filter((m) => m.was_skipped).length || 0;
const likedSongs = musicHistory?.filter((m) => m.was_liked).length || 0;
```

**The `.filter()` Pattern:**

```typescript
// Simple example
const numbers = [1, 2, 3, 4, 5];
const evenNumbers = numbers.filter((n) => n % 2 === 0);
// evenNumbers = [2, 4]

// Applied to music
const skippedSongs = musicHistory.filter((song) => song.was_skipped);
// Gets only songs where was_skipped = true
```

### Response Format

```json
{
  "session": {
    "id": "11064df0-...",
    "user_email": "ken@example.com",
    "started_at": "2025-11-23T09:00:00Z",
    "ended_at": "2025-11-23T09:45:00Z",
    "distance_km": 7.5,
    "avg_heart_rate_bpm": 145,
    "total_songs": 8,
    "skipped_songs": 1,
    "liked_songs": 5,

    "heart_rate_data": [
      { "heart_rate_bpm": 145, "timestamp_offset_seconds": 0 },
      { "heart_rate_bpm": 148, "timestamp_offset_seconds": 2 }
    ],

    "music_history": [
      {
        "track_title": "Eye of the Tiger",
        "track_artist": "Survivor",
        "play_order": 1,
        "was_skipped": false,
        "was_liked": true
      }
    ],

    "gps_points": [
      { "latitude": 14.56957, "longitude": 121.02485 },
      { "latitude": 14.56962, "longitude": 121.0249 }
    ],

    "pace_intervals": [
      { "interval_number": 1, "avg_pace_min_per_km": 5.3 },
      { "interval_number": 2, "avg_pace_min_per_km": 5.45 }
    ]
  }
}
```

### Used By

- **Session Detail Page** (when clicking on a specific session)
- Shows full session analytics: heart rate graph, GPS map, music list, etc.

---

## 5️⃣ Delete Session

**File:** `src/app/api/sessions/detail/[sessionId]/route.ts` (same file, different method)

### Purpose

Deletes a session and all its related data (heart rate, GPS, music, alerts).

### Simple Explanation

Like permanently deleting a run from your history. It removes the session AND all associated data (since they're linked).

### API Endpoint

```
DELETE /api/sessions/detail/[sessionId]

Example: DELETE /api/sessions/detail/11064df0-abcd-1234
```

### What It Does

#### Step 1: Check if Session Exists

```typescript
const { sessionId } = await params;

const { data: session } = await supabaseAdmin
  .from("running_sessions")
  .select("id")
  .eq("id", sessionId)
  .single();

if (!session) {
  return NextResponse.json({ error: "Session not found" }, { status: 404 });
}
```

#### Step 2: Delete Related Data First

```typescript
// ⚠️ IMPORTANT: Delete in this order to avoid foreign key errors

// 1. Delete alerts
await supabaseAdmin.from("session_alerts").delete().eq("session_id", sessionId);

// 2. Delete heart rate data
await supabaseAdmin
  .from("session_heart_rate_data")
  .delete()
  .eq("session_id", sessionId);

// 3. Delete music history
await supabaseAdmin
  .from("session_music_history")
  .delete()
  .eq("session_id", sessionId);

// 4. Delete GPS points
await supabaseAdmin
  .from("session_gps_points")
  .delete()
  .eq("session_id", sessionId);

// 5. Delete pace intervals
await supabaseAdmin
  .from("session_pace_intervals")
  .delete()
  .eq("session_id", sessionId);
```

**Why this order?**

- All these tables have a `session_id` column that **references** the main `running_sessions` table
- This is called a **foreign key constraint**
- You must delete the "children" before deleting the "parent"

#### Step 3: Delete the Session Itself

```typescript
const { error: deleteError } = await supabaseAdmin
  .from("running_sessions")
  .delete()
  .eq("id", sessionId);

if (deleteError) {
  return NextResponse.json({ error: deleteError.message }, { status: 500 });
}
```

### Response Format

```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

### Used By

- **Session Detail Page** - "Delete Session" button
- **Sessions Table** - Bulk delete operations

### Real-World Example

```typescript
// Frontend confirmation dialog
const handleDelete = async () => {
  if (confirm("Are you sure? This cannot be undone!")) {
    const response = await fetch(`/api/sessions/detail/${sessionId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Session deleted!");
      router.push("/dashboard/sessions"); // Redirect to sessions list
    }
  }
};
```

---

## 🔧 Common Patterns

### 1. Error Handling Pattern

Every API route follows this structure:

```typescript
export async function GET() {
  try {
    // 1. Get data from database
    const { data, error } = await supabase.from("table").select("*");

    // 2. Check for database errors
    if (error) {
      console.error("❌ Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Check if data is empty
    if (!data || data.length === 0) {
      console.log("⚠️ No data found");
      return NextResponse.json({ data: [] });
    }

    // 4. Return success
    console.log(`✅ Found ${data.length} records`);
    return NextResponse.json({ data });
  } catch (error) {
    // 5. Catch unexpected errors
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 2. The Admin Client Pattern

```typescript
// ✅ ALWAYS use admin client in API routes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Admin key (bypasses RLS)
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ❌ NEVER use regular client in admin APIs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // User key (RLS applies)
);
```

### 3. Logging Pattern

```typescript
// Use emoji prefixes for easy scanning
console.log("🔍 [API] Fetching data..."); // Info
console.log("📊 [API] Found 15 records"); // Success count
console.log("✅ [API] Operation successful"); // Success
console.warn("⚠️ [API] No data found"); // Warning
console.error("❌ [API] Database error:", err); // Error
```

### 4. Data Transformation Pattern

```typescript
// Raw database data
const rawSession = {
  id: "abc123",
  session_start_time: "2025-11-23T09:00:00Z",
  session_duration_seconds: 2700, // 45 minutes in seconds
  total_distance_km: 7.5,
};

// Transform to frontend-friendly format
const transformedSession = {
  id: rawSession.id,
  started_at: rawSession.session_start_time, // Rename field
  duration_minutes: Math.round(rawSession.session_duration_seconds / 60), // Convert
  distance_km: rawSession.total_distance_km,
  // Add calculated fields
  pace_min_per_km:
    rawSession.total_distance_km > 0
      ? rawSession.session_duration_seconds / 60 / rawSession.total_distance_km
      : 0,
};
```

### 5. Aggregation Pattern (Reduce)

```typescript
// Calculate total distance across all sessions
const totalDistance = sessions.reduce(
  (sum, session) => sum + (session.total_distance_km || 0),
  0 // Initial value
);

// Calculate average heart rate
const avgHeartRate =
  sessions.length > 0
    ? Math.round(
        sessions.reduce((sum, s) => sum + (s.avg_heart_rate_bpm || 0), 0) /
          sessions.length
      )
    : 0;
```

### 6. Map/Group Pattern

```typescript
// Group sessions by user ID
const sessionsByUser = new Map<string, Session[]>();

sessions.forEach((session) => {
  if (!sessionsByUser.has(session.user_id)) {
    sessionsByUser.set(session.user_id, []);
  }
  sessionsByUser.get(session.user_id)!.push(session);
});

// Now you can access: sessionsByUser.get("user123") → [session1, session2, ...]
```

---

## ⚠️ Error Handling

### HTTP Status Codes

```typescript
// 200 - Success (default for NextResponse.json)
return NextResponse.json({ data: users });

// 404 - Not Found
return NextResponse.json({ error: "Session not found" }, { status: 404 });

// 500 - Internal Server Error
return NextResponse.json(
  { error: "Database error", details: error.message },
  { status: 500 }
);
```

### Error Response Format

All errors follow this structure:

```json
{
  "error": "Short error message",
  "message": "Detailed error explanation (optional)",
  "details": {
    /* Additional error info (optional) */
  }
}
```

### Frontend Error Handling Example

```typescript
const fetchSessions = async () => {
  try {
    const response = await fetch("/api/sessions/users");

    if (!response.ok) {
      const error = await response.json();
      console.error("API Error:", error.error);
      alert(`Error: ${error.error}`);
      return;
    }

    const data = await response.json();
    // Use data...
  } catch (error) {
    console.error("Network Error:", error);
    alert("Network error. Please check your connection.");
  }
};
```

---

## 🎯 Quick Reference

| API Route                          | Method | Purpose                            | Response                                  |
| ---------------------------------- | ------ | ---------------------------------- | ----------------------------------------- |
| `/api/iot-monitor/active-runners`  | GET    | Get all currently running sessions | Sessions, heart rates, alerts             |
| `/api/sessions/users`              | GET    | Get all users with aggregate stats | Users with total distance, sessions, etc. |
| `/api/sessions/[userId]`           | GET    | Get all sessions for one user      | User info + sessions array                |
| `/api/sessions/detail/[sessionId]` | GET    | Get full session details           | Session + heart rate + GPS + music        |
| `/api/sessions/detail/[sessionId]` | DELETE | Delete a session                   | Success message                           |

---

## 🔍 Debugging Tips

### 1. Check Console Logs

API routes log everything to the **server console** (not browser console):

```bash
# Run dev server
npm run dev

# Watch the terminal for logs:
🔍 [API] Fetching sessions for user abc123...
📊 [API] Found 15 sessions
✅ [API] Operation successful
```

### 2. Test API Routes Directly

Use browser or Postman:

```
http://localhost:3000/api/sessions/users
http://localhost:3000/api/iot-monitor/active-runners
http://localhost:3000/api/sessions/abc123-user-id
```

### 3. Check Environment Variables

```bash
# Verify .env.local has these keys:
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 4. Common Issues

**"Missing Supabase configuration"**

- `.env.local` file is missing or incorrect
- Restart dev server after adding `.env.local`

**"Session not found" (404)**

- Session ID is invalid or was deleted
- Check database directly in Supabase dashboard

**"Database error" (500)**

- Table doesn't exist
- Column name is wrong
- RLS policy blocking query (shouldn't happen with admin client)

---

## 📚 Additional Resources

- [Next.js API Routes Docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

**Created:** November 23, 2025  
**Last Updated:** November 23, 2025  
**Maintained By:** PaceBeats Team
