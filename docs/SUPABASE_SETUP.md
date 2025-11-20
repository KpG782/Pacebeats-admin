# Supabase Setup Guide for Pacebeats Admin

This guide will help you set up the Supabase backend for the Pacebeats Admin Dashboard.

## Prerequisites

- Supabase account (sign up at [supabase.com](https://supabase.com))
- Existing Supabase project for Pacebeats
- Node.js and npm installed

## Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 2: Configure Environment Variables

Your `.env` file should already contain:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project:

1. Go to **Settings** → **API**
2. Copy **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Run Database Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase-schema.sql` from the project root
5. Click **Run** to execute the SQL

This will create:

- `running_sessions` table
- `heart_rate_alerts` table (NEW - for IoT monitoring)
- Indexes for optimal performance
- Row Level Security (RLS) policies
- Realtime subscriptions
- Automatic alert creation triggers

## Step 4: Verify Table Creation

1. Go to **Table Editor** in Supabase
2. Verify the following tables exist:
   - ✅ `users`
   - ✅ `running_sessions`
   - ✅ `session_heart_rate_data`
   - ✅ `heart_rate_alerts` (NEW)
   - ✅ `music`
   - ✅ `listening_events`
   - ✅ `recommendation_served`

## Step 5: Enable Realtime

1. Go to **Database** → **Replication** in Supabase
2. Enable replication for the following tables:
   - `session_heart_rate_data`
   - `heart_rate_alerts`
   - `running_sessions`

This allows the admin dashboard to receive real-time updates.

## Step 6: Set Up Authentication

### Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter admin email and password
4. Click **Create user**

### Test Login

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Enter admin credentials
4. You should be redirected to the dashboard

## Step 7: Test IoT Monitor

### Using Mock Data (Default)

1. Navigate to **IoT Monitor** in the sidebar
2. The dashboard will show mock data with simulated heart rate updates
3. Click the **🎭 Mock Data** button to see it's in mock mode

### Using Real Data

1. Click the **🎭 Mock Data** button to switch to **🔗 Live Data**
2. The dashboard will now fetch from Supabase
3. Insert test data to see real-time updates:

```sql
-- 1. Create a test user (if not exists)
INSERT INTO users (id, email, username)
VALUES ('test-user-id', 'test@example.com', 'test_runner');

-- 2. Create an active session
INSERT INTO running_sessions (id, user_id, start_time, status)
VALUES ('test-session-id', 'test-user-id', NOW(), 'active');

-- 3. Insert heart rate data
INSERT INTO session_heart_rate_data (session_id, timestamp_offset_seconds, heart_rate_bpm)
VALUES ('test-session-id', 0, 165);

-- 4. Watch the IoT Monitor update in real-time!
```

## Database Schema Overview

### Tables

#### `users`

Stores user profile information including Spotify integration and fitness metrics.

#### `running_sessions`

Tracks all running sessions with metrics like distance, pace, and heart rate.

#### `session_heart_rate_data`

Stores time-series heart rate data for each session.

#### `heart_rate_alerts` (NEW)

Automatically created when heart rate is abnormal:

- **CRITICAL**: > 180 BPM
- **HIGH**: > 160 BPM
- **LOW**: < 50 BPM

#### `music`

Music track library with Spotify metadata and audio features.

#### `listening_events`

Records when tracks are played during sessions.

#### `recommendation_served`

Logs which tracks were recommended to users.

## Real-time Subscriptions

The admin dashboard automatically subscribes to:

1. **Heart Rate Updates**: `session_heart_rate_data` table

   - Updates runner cards in real-time
   - Triggers when new heart rate data is inserted

2. **Alert Updates**: `heart_rate_alerts` table

   - Shows new alerts as they're created
   - Updates when alerts are resolved

3. **Session Updates**: `running_sessions` table
   - Tracks active/completed sessions
   - Updates session metrics

## Security & Row Level Security (RLS)

### RLS Policies

All tables have RLS enabled with the following policies:

1. **Authenticated users can view all data** (for admin dashboard)
2. **Users can only modify their own data**
3. **System can create alerts automatically**

### Modifying Policies

If you need to adjust access:

```sql
-- Example: Allow only specific admin users
CREATE POLICY "Admin access only"
ON public.heart_rate_alerts
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE email LIKE '%@admin.pacebeats.com'
  )
);
```

## Troubleshooting

### Issue: "Failed to load real-time data"

**Solution:**

1. Check that environment variables are correct
2. Verify RLS policies are enabled
3. Ensure realtime is enabled for tables

### Issue: "No data showing in IoT Monitor"

**Solution:**

1. Make sure you have active sessions in the database
2. Check that sessions have status = 'active'
3. Verify heart rate data exists for those sessions

### Issue: "Alerts not creating automatically"

**Solution:**

1. Verify the trigger exists: `trigger_check_heart_rate`
2. Check that heart rate values are outside normal range
3. Ensure the function `check_heart_rate_and_create_alert()` exists

### Issue: "Cannot resolve alerts"

**Solution:**

1. Check RLS policies on `heart_rate_alerts` table
2. Verify user has UPDATE permission
3. Check browser console for errors

## Android App Integration

To send heart rate data from your Android app:

```kotlin
// Example: Send heart rate to Supabase
val heartRateData = mapOf(
    "session_id" to sessionId,
    "timestamp_offset_seconds" to offsetSeconds,
    "heart_rate_bpm" to heartRate,
    "is_connected" to true
)

supabaseClient
    .from("session_heart_rate_data")
    .insert(heartRateData)
    .execute()
```

See `docs/ANDROID_IOT_INTEGRATION.md` for full Android integration guide.

## API Reference

### Supabase Client Functions

```typescript
// Authentication
import {
  signInWithEmail,
  signOut,
  getCurrentUser,
} from "@/lib/supabase/client";

// Queries
import {
  getActiveRunners,
  getActiveAlerts,
  resolveAlert,
} from "@/lib/supabase/queries";

// Realtime
import { subscribeToTable, unsubscribeChannel } from "@/lib/supabase/client";
```

### Usage Examples

```typescript
// Get active runners
const runners = await getActiveRunners();

// Get unresolved alerts
const alerts = await getActiveAlerts();

// Resolve an alert
await resolveAlert(alertId);

// Subscribe to heart rate updates
const channel = subscribeToTable("session_heart_rate_data", (payload) => {
  console.log("New heart rate:", payload.new);
});

// Cleanup
await unsubscribeChannel(channel);
```

## Next Steps

1. ✅ Complete Supabase setup
2. ✅ Test login authentication
3. ✅ Test IoT Monitor with mock data
4. 🔄 Create test sessions and heart rate data
5. 🔄 Integrate with Android app
6. 🔄 Deploy to production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Support

For issues or questions:

- Check the [Supabase Community](https://github.com/supabase/supabase/discussions)
- Review the documentation in `docs/`
- Contact the development team
