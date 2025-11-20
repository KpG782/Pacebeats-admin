# 🎯 IoT Monitor Demo & Testing Guide

This guide shows you **how to simulate live runner data** for testing the IoT Monitor dashboard without needing a real mobile app.

---

## 🚀 Quick Start (Choose One Method)

### **Method 1: Manual SQL Updates** (Recommended for Demos)

Best for: Live demos where you want to control exactly what happens

1. Open Supabase SQL Editor
2. Run the queries in `simulate-live-runner.sql`
3. Open IoT Monitor: `http://localhost:3000/dashboard/iot-monitor`
4. Run update queries every few seconds to see real-time changes

### **Method 2: Automated Script** (Recommended for Testing)

Best for: Continuous testing without manual intervention

1. Update credentials in `simulate-live-runner.js`
2. Run: `node simulate-live-runner.js`
3. Watch IoT Monitor update automatically every 3 seconds
4. Press `Ctrl+C` to stop

---

## 📖 Method 1: Manual SQL Demo (Step by Step)

### Step 1: Create Initial Session (Run Once)

```sql
-- Run the "STEP 1: CREATE INITIAL SESSION" block
-- This creates ONE active session
```

**Expected Result:**

- ✅ Session created with `status='active'`
- ✅ Runner appears in IoT Monitor immediately
- ✅ Shows: 0.5 km, 6:00 pace, 140 bpm

### Step 2: Simulate Normal Running (Run Repeatedly)

```sql
-- Run this every 3-5 seconds to simulate normal running
UPDATE running_sessions
SET
    current_distance_km = current_distance_km + 0.015,
    elapsed_time_seconds = elapsed_time_seconds + 3,
    avg_heart_rate_bpm = 140 + (RANDOM() * 10)::INTEGER,
    last_heartbeat_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';

INSERT INTO session_heart_rate_data (session_id, heart_rate_bpm, timestamp_offset_seconds, recorded_at)
SELECT id, 140 + (RANDOM() * 10)::INTEGER, elapsed_time_seconds, NOW()
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';
```

**What You'll See:**

- 🟢 Status: NORMAL (green badge)
- 📍 Distance increases by ~15m each time
- ⏱️ Time increases by 3 seconds
- ❤️ Heart rate: 140-150 bpm
- 🔴 Connection: LIVE (green dot)

### Step 3: Simulate High Heart Rate

```sql
-- Run this to trigger HIGH warning
UPDATE running_sessions
SET
    current_distance_km = current_distance_km + 0.015,
    elapsed_time_seconds = elapsed_time_seconds + 3,
    avg_heart_rate_bpm = 165 + (RANDOM() * 10)::INTEGER,
    last_heartbeat_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';

INSERT INTO session_heart_rate_data (session_id, heart_rate_bpm, timestamp_offset_seconds, recorded_at)
SELECT id, 165 + (RANDOM() * 10)::INTEGER, elapsed_time_seconds, NOW()
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';
```

**What You'll See:**

- 🟠 Status: HIGH (amber badge)
- ❤️ Heart rate: 165-175 bpm
- ⚠️ Alert banner may appear
- 🔔 Toast notification

### Step 4: Simulate CRITICAL Alert

```sql
-- Run this to trigger CRITICAL alert
UPDATE running_sessions
SET
    current_distance_km = current_distance_km + 0.015,
    elapsed_time_seconds = elapsed_time_seconds + 3,
    avg_heart_rate_bpm = 180 + (RANDOM() * 10)::INTEGER,
    last_heartbeat_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';

INSERT INTO session_heart_rate_data (session_id, heart_rate_bpm, timestamp_offset_seconds, recorded_at)
SELECT id, 180 + (RANDOM() * 10)::INTEGER, elapsed_time_seconds, NOW()
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';
```

**What You'll See:**

- 🔴 Status: CRITICAL (red badge)
- ❤️ Heart rate: 180-190 bpm
- 💓 Heart icon pulses (animation)
- 🚨 Critical alert banner at bottom
- 🔔 Toast notification

### Step 5: Simulate Connection Loss

**Don't run any queries for 30 seconds**

**What You'll See:**

- 0-10 seconds: 🟢 LIVE (green dot)
- 10-30 seconds: 🟡 SLOW (yellow dot)
- 30+ seconds: 🔴 LOST (red dot)

### Step 6: End Session

```sql
-- Mark session as completed
UPDATE running_sessions
SET
    status = 'completed',
    session_end_time = NOW(),
    session_duration_seconds = elapsed_time_seconds,
    total_distance_km = current_distance_km
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';
```

**What You'll See:**

- ❌ Runner disappears from IoT Monitor
- ✅ Session appears in Sessions Dashboard (with 'completed' status)

---

## 🤖 Method 2: Automated Script

### Setup

1. **Update credentials** in `simulate-live-runner.js`:

   ```javascript
   const SUPABASE_ANON_KEY = "your-anon-key-here"; // From .env.local
   const USER_EMAIL = "kenpatrickgarcia123@gmail.com";
   ```

2. **Install dependencies** (if not already):

   ```bash
   npm install @supabase/supabase-js
   ```

3. **Run the simulator**:
   ```bash
   node simulate-live-runner.js
   ```

### What It Does

- ✅ Creates an active session automatically
- ✅ Updates every 3 seconds with new data
- ✅ Simulates realistic heart rate changes (120-190 bpm)
- ✅ Gradually increases distance (~12 km/h pace)
- ✅ Occasionally spikes heart rate (simulates intensity)
- ✅ Creates alerts when HR goes high/critical
- ✅ Auto-stops after 5 minutes (safety)

### Output Example

```
🎯 Live Runner Simulator for IoT Monitor
==========================================

🏃 Creating active session...
✅ Session created: abc123-def456-...
📍 IoT Monitor should now show this runner!
🔄 Updating every 3 seconds...

⏱️ 0m 3s | 📍 0.01 km | ⚡ 3.00 min/km | ❤️ 142 bpm 🟢 NORMAL
⏱️ 0m 6s | 📍 0.02 km | ⚡ 3.00 min/km | ❤️ 145 bpm 🟢 NORMAL
⏱️ 0m 9s | 📍 0.03 km | ⚡ 3.00 min/km | ❤️ 143 bpm 🟢 NORMAL
⏱️ 0m 12s | 📍 0.04 km | ⚡ 3.00 min/km | ❤️ 168 bpm 🟠 HIGH
⏱️ 0m 15s | 📍 0.05 km | ⚡ 3.00 min/km | ❤️ 172 bpm 🟠 HIGH
...
```

**Press `Ctrl+C` to stop**

---

## 🎬 Demo Script (For Presentations)

**Perfect for showing IoT Monitor to stakeholders:**

1. **Setup** (before demo):

   ```sql
   -- Run STEP 1 to create initial session
   -- Verify runner appears in IoT Monitor
   ```

2. **Normal Running** (30 seconds):

   - Run "normal running" query 5-10 times
   - Say: _"Here you can see a runner currently active, heart rate stable at 145 bpm"_

3. **High Heart Rate** (15 seconds):

   - Run "high heart rate" query 3-5 times
   - Say: _"Notice the heart rate is elevated - status changed to HIGH"_

4. **Critical Alert** (15 seconds):

   - Run "critical heart rate" query 2-3 times
   - Say: _"Now we have a critical situation - heart rate over 180, system alerts immediately"_

5. **Connection Loss** (30 seconds):

   - Don't run any queries, wait 30 seconds
   - Say: _"If we lose connection, the system shows LOST status"_

6. **Recovery** (15 seconds):

   - Run "normal running" query once
   - Say: _"Connection restored - back to normal monitoring"_

7. **End Session**:
   - Run end session query
   - Say: _"When the run completes, it moves to the Sessions Dashboard"_

---

## 🔧 Troubleshooting

### Runner Not Appearing?

**Check session status:**

```sql
SELECT id, status, last_heartbeat_at
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
ORDER BY created_at DESC
LIMIT 1;
```

**Must be:**

- ✅ `status = 'active'` (not 'running' or 'completed')
- ✅ `last_heartbeat_at` within last 5 minutes

**Fix:**

```sql
UPDATE running_sessions
SET status = 'active', last_heartbeat_at = NOW()
WHERE id = 'your-session-id';
```

### Real-time Not Updating?

1. **Hard refresh**: `Ctrl + Shift + R`
2. **Check WebSocket**: Open DevTools → Network → WS
3. **Check Supabase Realtime**: Must be enabled on tables
4. **Fallback polling**: Works even if WebSocket fails (updates every 5s)

### JavaScript Simulator Errors?

1. **Module not found**: Run `npm install @supabase/supabase-js`
2. **Authentication error**: Check `SUPABASE_ANON_KEY` is correct
3. **User not found**: Update `USER_EMAIL` in script
4. **Type module**: Add `"type": "module"` to `package.json`

---

## 📊 Understanding the Data Flow

### What Happens in Real Mobile App:

```
1. User starts run → Creates session (status='active')
2. Every 1-5 seconds:
   - Read heart rate from watch
   - Calculate distance/pace from GPS
   - UPDATE running_sessions (current_distance_km, last_heartbeat_at, etc.)
   - INSERT session_heart_rate_data
3. User stops run → UPDATE status='completed'
```

### What Happens in Demo:

```
1. Create session manually (SQL or JS)
2. Every few seconds:
   - Run UPDATE query (simulates mobile app update)
   - IoT Monitor receives via WebSocket
   - Dashboard updates in real-time
3. Mark completed manually
```

**It's the EXACT same data flow!** 🎯

---

## 🎓 Key Concepts

### Status Values

- `active` = Currently running, visible in IoT Monitor
- `running` = Sessions Dashboard status (NOT for IoT Monitor)
- `completed` = Finished, NOT shown in IoT Monitor
- `pending` = Not started, NOT shown in IoT Monitor

### Connection Status (Auto-calculated)

- `LIVE` 🟢 = Updated within last 10 seconds
- `SLOW` 🟡 = Updated 10-30 seconds ago
- `LOST` 🔴 = No update for 30+ seconds

### Heart Rate Status (Auto-calculated)

- `NORMAL` 🟢 = 100-165 bpm
- `HIGH` 🟠 = 165-180 bpm
- `CRITICAL` 🔴 = 180+ bpm
- `LOW` 🔵 = < 100 bpm or null

---

## 💡 Tips

- **Open side-by-side**: IoT Monitor + SQL Editor for instant feedback
- **Use shortcuts**: Copy/paste quick update queries for faster demos
- **Multiple runners**: Change `user_id` to simulate multiple active runners
- **Realistic data**: Use the automated script for most realistic simulation
- **Performance testing**: Run multiple automated scripts simultaneously

---

## 📝 Next Steps

After successful demo/testing:

1. **Mobile App Integration**: Replace simulated data with real mobile app
2. **Alert System**: Add email notifications for critical alerts
3. **Analytics**: Track monitoring sessions, alert frequency, etc.
4. **UI Polish**: Add more runner details, historical graphs, etc.

---

**Questions?** Check `docs/IOT_MONITOR_CURRENT_STATUS.md` for complete documentation.
