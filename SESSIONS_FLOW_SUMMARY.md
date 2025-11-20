# Sessions Dashboard Flow Summary

## 📋 Overview

Three-level navigation: **Users List** → **User's Sessions** → **Session Details**

---

## 🗂️ Database Tables Used

### Core Tables

1. **`users`** - User profiles and account info

   - Primary Key: `id` (uuid)
   - Fields: `email`, `username`, `age`, `weight_kg`, `height_cm`, `gender`, etc.

2. **`running_sessions`** - Main session data
   - Primary Key: `id` (uuid)
   - Foreign Key: `user_id` → `users.id`
   - Fields: `start_time`, `end_time`, `distance_meters`, `duration_seconds`, `avg_pace_min_per_km`, `avg_heart_rate`, `calories_burned`, `status`

### Related Session Data Tables

3. **`session_heart_rate_data`** - Heart rate measurements during session

   - Foreign Key: `session_id` → `running_sessions.id`
   - Fields: `timestamp_offset_seconds`, `heart_rate_bpm`, `is_connected`, `recorded_at`

4. **`session_music_history`** - Music played during session

   - Foreign Key: `session_id` → `running_sessions.id`
   - Foreign Key: `track_id` → `music.track_id`
   - Fields: `play_order`, `played_at_offset_seconds`, `duration_played_ms`, `skipped`, `completed`

5. **`session_gps_points`** - GPS coordinates during session

   - Foreign Key: `session_id` → `running_sessions.id`
   - Fields: `timestamp_offset_seconds`, `latitude`, `longitude`, `altitude_meters`, `accuracy_meters`, `speed_mps`

6. **`session_pace_intervals`** - Pace data for intervals

   - Foreign Key: `session_id` → `running_sessions.id`
   - Fields: `interval_number`, `start_time_offset_seconds`, `end_time_offset_seconds`, `distance_meters`, `pace_min_per_km`, `avg_heart_rate`

7. **`music`** - Music catalog
   - Primary Key: `track_id` (text)
   - Fields: `name`, `artist`, `spotify_id`, `genre`, `tempo`, `energy`, `danceability`, `duration_ms`

---

## 🔄 Data Flow Logic

### Level 1: Users List Page (`/dashboard/sessions`)

**File:** `src/app/dashboard/sessions/page.tsx`

**Query Function:** `getUsersWithSessions()`

```typescript
// Located in: src/lib/supabase/session-queries.ts

// STEP 1: Fetch all users
const users = await supabase
  .from("users")
  .select("id, email, username, created_at")
  .order("created_at", { ascending: false });

// STEP 2: For each user, aggregate their session stats
for (const user of users) {
  // Get all sessions for this user
  const sessions = await supabase
    .from("running_sessions")
    .select("*")
    .eq("user_id", user.id); // ← FILTER BY USER_ID

  // Count total sessions
  totalSessions = sessions.length;

  // Sum up distance, duration
  totalDistance = sum(sessions.distance_meters);
  totalDuration = sum(sessions.duration_seconds);

  // Calculate averages
  avgHeartRate = average(sessions.avg_heart_rate);
  avgPace = average(sessions.avg_pace_min_per_km);

  // Get music stats from session_music_history
  const musicHistory = await supabase
    .from("session_music_history")
    .select("*")
    .in("session_id", sessionIds); // ← All sessions for this user

  totalSongsPlayed = musicHistory.length;
}
```

**Display:**

- Table with columns: Username, Email, Total Sessions, Distance, Duration, Avg HR, Songs Played
- Click user → Navigate to `/sessions/[userId]`

---

### Level 2: User's Sessions Page (`/dashboard/sessions/[userId]`)

**File:** `src/app/dashboard/sessions/[id]/page.tsx`

**Query Function:** `getUserSessions(userId: string)`

```typescript
// STEP 1: Get all sessions for specific user
const sessions = await supabase
  .from("running_sessions")
  .select("*")
  .eq("user_id", userId) // ← FILTER BY USER_ID (from URL param)
  .order("start_time", { ascending: false });

// STEP 2: Get session IDs
const sessionIds = sessions.map((s) => s.id);

// STEP 3: Fetch music history for all these sessions
const musicHistory = await supabase
  .from("session_music_history")
  .select("*")
  .in("session_id", sessionIds) // ← FILTER BY SESSION IDs
  .order("session_id")
  .limit(200); // Performance limit

// STEP 4: Group music by session_id
const musicBySession = groupBy(musicHistory, "session_id");

// STEP 5: Map to each session
sessions.map((session) => ({
  ...session,
  songsPlayed: musicBySession[session.id]?.length || 0,
  // Include all session fields: distance, duration, pace, heart rate
}));
```

**Display:**

- User header with name/email
- Session cards showing:
  - Date & Time
  - Distance (km)
  - Duration
  - Avg Pace
  - Avg Heart Rate
  - Songs Played
- Click session → Navigate to `/sessions/[userId]/session/[sessionId]`

---

### Level 3: Session Details Page (`/dashboard/sessions/[userId]/session/[sessionId]`)

**File:** `src/app/dashboard/sessions/[id]/session/[sessionId]/page.tsx`

**Query Function:** `getSessionDetail(sessionId: string)`

```typescript
// STEP 1: Fetch main session data
const session = await supabase
  .from("running_sessions")
  .select("*")
  .eq("id", sessionId) // ← FILTER BY SESSION_ID
  .single();

// STEP 2: Fetch all related data in parallel (with performance limits)
const [heartRateData, musicHistory, gpsPoints, paceIntervals] =
  await Promise.all([
    // Heart rate data (max 5000 records)
    supabase
      .from("session_heart_rate_data")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp_offset_seconds", { ascending: true })
      .limit(5000),

    // Music history (max 200 tracks)
    supabase
      .from("session_music_history")
      .select(
        `
      *,
      music:track_id (
        name, artist, genre, tempo, duration_ms, spotify_id
      )
    `
      )
      .eq("session_id", sessionId)
      .order("play_order", { ascending: true })
      .limit(200),

    // GPS points (max 10000 points)
    supabase
      .from("session_gps_points")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp_offset_seconds", { ascending: true })
      .limit(10000),

    // Pace intervals (max 100 intervals)
    supabase
      .from("session_pace_intervals")
      .select("*")
      .eq("session_id", sessionId)
      .order("interval_number", { ascending: true })
      .limit(100),
  ]);

// STEP 3: Return complete session object
return {
  ...session,
  heartRateData,
  musicHistory,
  gpsPoints,
  paceIntervals,
};
```

**Validation:**

```typescript
// IMPORTANT: Verify session belongs to user
useEffect(() => {
  if (session && session.user_id !== params.id) {
    // Session doesn't belong to this user - redirect
    router.push(`/sessions/${params.id}`);
  }
}, [session, params.id]);
```

**Display:**

- Session overview card:
  - Date, Distance, Duration, Pace, Calories, Heart Rate
- Tabs:
  - **Music Tab:** List of all songs played (from `musicHistory`)
    - Track name, artist, genre, tempo
    - Play time, duration, skipped/completed status
  - **Details Tab:** Session metrics
    - Heart rate chart (from `heartRateData`)
    - GPS map (from `gpsPoints`)
    - Pace intervals chart (from `paceIntervals`)

---

## 🎯 Key Filtering Pattern

### Android App Analytics Flow (Your Working Pattern)

```kotlin
// 1. Filter by user_id first
val sessions = sessionsRepo.getSessionsByUserId(userId)

// 2. Then filter by session_id
val sessionDetail = sessionsRepo.getSessionDetail(sessionId)

// 3. Join related tables
val heartRate = heartRateRepo.getBySessionId(sessionId, limit = 5000)
val music = musicRepo.getBySessionId(sessionId, limit = 200)
val gps = gpsRepo.getBySessionId(sessionId, limit = 10000)
val pace = paceRepo.getBySessionId(sessionId, limit = 100)
```

### Admin Dashboard Implementation (Matching Above)

```typescript
// 1. getUsersWithSessions() - Groups users with aggregated stats
//    Query: SELECT * FROM users
//    Then for each user: SELECT * FROM running_sessions WHERE user_id = ?

// 2. getUserSessions(userId) - Filters sessions by user_id
//    Query: SELECT * FROM running_sessions WHERE user_id = ?
//    Then: SELECT * FROM session_music_history WHERE session_id IN (?)

// 3. getSessionDetail(sessionId) - Gets complete session data
//    Query: SELECT * FROM running_sessions WHERE id = ?
//    Then parallel queries:
//      - session_heart_rate_data WHERE session_id = ? LIMIT 5000
//      - session_music_history WHERE session_id = ? LIMIT 200
//      - session_gps_points WHERE session_id = ? LIMIT 10000
//      - session_pace_intervals WHERE session_id = ? LIMIT 100
```

---

## ⚡ Performance Limits (Matching Android App)

| Table                     | Limit  | Reason                                                       |
| ------------------------- | ------ | ------------------------------------------------------------ |
| `session_heart_rate_data` | 5,000  | Prevents loading massive datasets (1 record/second = 83 min) |
| `session_music_history`   | 200    | Typical session has 15-30 songs                              |
| `session_gps_points`      | 10,000 | 1 point/second = 2.7 hours of GPS data                       |
| `session_pace_intervals`  | 100    | Covers up to 100km at 1km intervals                          |

---

## 🔐 Current RLS Status

**Currently DISABLED** (for development) - Run `disable-rls.sql`

**For Production:** Use `supabase-admin-policies.sql` which creates:

- Admin users can SELECT all data
- Regular users can only INSERT/UPDATE their own data
- All tables protected by Row Level Security

---

## 📊 Comparison: Android App vs Admin Dashboard

| Aspect                 | Android App (Kotlin)                                    | Admin Dashboard (TypeScript)                             |
| ---------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| **Level 1**            | Not applicable (mobile shows logged-in user only)       | Show all users with aggregated stats                     |
| **Level 2**            | Analytics screen - shows user's sessions                | Show specific user's sessions (filtered by `user_id`)    |
| **Level 3**            | Session detail - full session data                      | Show full session data (filtered by `session_id`)        |
| **Filtering**          | `WHERE user_id = current_user` → `WHERE session_id = ?` | Same pattern: filter by `user_id` → then by `session_id` |
| **Performance Limits** | 5000 HR, 200 music, 10000 GPS, 100 pace                 | **Identical limits**                                     |
| **Data Joins**         | Separate repository queries, then combine               | Parallel `Promise.all()` queries, then combine           |

---

## 🚀 Next Steps

1. **Run `disable-rls.sql`** in Supabase SQL Editor
2. **Refresh admin dashboard** - should now load data
3. **Test the flow:**
   - Click user → See their sessions
   - Click session → See full details
4. **Compare** with your Android app Analytics feature
5. **Report** any differences in behavior

---

## 📁 File Locations

```
src/lib/supabase/
  ├── session-queries.ts          # All query functions
  │   ├── getUsersWithSessions()
  │   ├── getUserSessions(userId)
  │   └── getSessionDetail(sessionId)
  └── types.ts                     # TypeScript interfaces

src/app/dashboard/sessions/
  ├── page.tsx                     # Level 1: Users list
  ├── [id]/
  │   ├── page.tsx                 # Level 2: User's sessions
  │   └── session/
  │       └── [sessionId]/
  │           └── page.tsx         # Level 3: Session details
```
