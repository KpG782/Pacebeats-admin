# 🎯 Demo Ready - Tomorrow's Presentation

## ✅ What's Been Fixed

1. **IoT Monitor** - Now accepts BOTH `'active'` AND `'running'` status
2. **Demo Script Created** - `demo-simulation-running-status.sql`
3. **Status Aligned** - Sessions use `'running'`, IoT Monitor shows them too!

---

## 🚀 Quick Start for Tomorrow

### **Option 1: Simple Demo (Recommended)** ⭐

```sql
-- 1️⃣ CREATE SESSION (Run ONCE at start of demo)
-- Copy and run "STEP 1: CREATE SESSION" from demo-simulation-running-status.sql

-- 2️⃣ UPDATE SESSION (Run REPEATEDLY during demo)
-- Copy this shortcut and run it every 5-10 seconds:

UPDATE running_sessions
SET
    current_distance_km = current_distance_km + 0.015,
    elapsed_time_seconds = elapsed_time_seconds + 3,
    current_pace_min_per_km = CASE WHEN current_distance_km > 0
        THEN (elapsed_time_seconds + 3) / 60.0 / (current_distance_km + 0.015)
        ELSE 0 END,
    avg_heart_rate_bpm = 140 + (RANDOM() * 10)::INTEGER,
    last_heartbeat_at = NOW(),
    total_distance_km = current_distance_km + 0.015,
    session_duration_seconds = elapsed_time_seconds + 3,
    total_steps = total_steps + 40,
    total_calories_burned = total_calories_burned + 5
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running';

-- Add heart rate reading
INSERT INTO session_heart_rate_data (session_id, heart_rate_bpm, timestamp_offset_seconds, recorded_at)
SELECT id, 140 + (RANDOM() * 10)::INTEGER, elapsed_time_seconds, NOW()
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running';

-- 3️⃣ END SESSION (Run ONCE at end of demo)
UPDATE running_sessions
SET status = 'completed', session_end_time = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running';
```

---

## 📋 Demo Flow (5-10 Minutes)

### **Before Demo Starts** (1 minute)

1. Open Supabase SQL Editor
2. Open Sessions Dashboard: `http://localhost:3000/dashboard/sessions`
3. Run **STEP 1: CREATE SESSION** from `demo-simulation-running-status.sql`
4. ✅ Verify session appears with status "running"

### **During Demo** (5-7 minutes)

#### Part 1: Normal Running (2 minutes)

- Run the "Normal running" update query **5-10 times** (every 10 seconds)
- **What to say:**
  - _"Here you can see a runner currently active"_
  - _"Distance is increasing - now at X km"_
  - _"Heart rate stable at 145 bpm"_
  - _"Time is tracking - X minutes elapsed"_

#### Part 2: Session Details (1 minute)

- Click on the session row to open details
- **What to say:**
  - _"Here's all the session data"_
  - _"We track distance, pace, heart rate, steps, calories"_
  - _"GPS points are recorded throughout the run"_
  - _"Music played during the session is logged"_

#### Part 3: High Heart Rate Alert (1 minute)

- Run the "High heart rate" update query **2-3 times**
- **What to say:**
  - _"Notice the heart rate went up to 170 bpm"_
  - _"System creates automatic alerts for safety"_
  - _"This helps monitor runner health in real-time"_

#### Part 4: Critical Alert (Optional - 1 minute)

- Run the "CRITICAL heart rate" update query **once**
- **What to say:**
  - _"If heart rate becomes critical (180+), immediate alert"_
  - _"This is for emergency monitoring"_

#### Part 5: End Session (1 minute)

- Run **STEP 3: END SESSION**
- Refresh page
- **What to say:**
  - _"When run completes, status changes to 'completed'"_
  - _"All data is preserved for historical analysis"_
  - _"Can view detailed statistics and graphs"_

---

## 🎬 Demo Script (What to Say)

### **Opening** (30 seconds)

> "This is the Pacebeats Admin Dashboard. It allows us to monitor all running sessions in real-time. Right now, we have one active runner."

### **Live Updates** (2 minutes)

> "Watch as the data updates live - the mobile app sends data every 3-5 seconds:
>
> - Distance is increasing as they run
> - Heart rate is being monitored continuously
> - Pace and speed are calculated automatically
> - Steps and calories are tracked"

### **Health Monitoring** (1 minute)

> "The system monitors heart rate for safety:
>
> - Green = Normal (100-165 bpm)
> - Amber = High (165-180 bpm)
> - Red = Critical (180+ bpm)
>
> When heart rate gets high, the system automatically creates alerts so coaches can intervene if needed."

### **Closing** (30 seconds)

> "When the run completes, all data is saved. We can then generate detailed reports, analyze performance trends, and provide insights to help runners improve."

---

## 📊 What Dashboard Shows

### **Sessions List View**

- ✅ Session ID
- ✅ User name/email
- ✅ Status (running/completed/pending)
- ✅ Distance (updating live)
- ✅ Duration (updating live)
- ✅ Average pace
- ✅ Average heart rate
- ✅ Music played count
- ✅ Engagement metrics

### **Session Detail View** (Click on row)

- ✅ All metrics above
- ✅ Heart rate chart
- ✅ GPS route map
- ✅ Music tracks played
- ✅ Alerts/warnings
- ✅ Device information
- ✅ Complete timeline

---

## 🔧 Both Dashboards Now Work!

### **Sessions Dashboard** (Your main demo)

- URL: `http://localhost:3000/dashboard/sessions`
- Shows: ALL sessions (running, completed, pending)
- Status: Uses `'running'` for active sessions
- ✅ **This is what you'll demo tomorrow**

### **IoT Monitor** (Real-time monitoring)

- URL: `http://localhost:3000/dashboard/iot-monitor`
- Shows: ONLY currently active runners (running/active)
- Features: Live heart rate, connection status, critical alerts
- ✅ **Now works with your 'running' status too!**

---

## ⚡ Quick Commands (Copy & Paste)

### Create Session

```sql
-- Run STEP 1 from demo-simulation-running-status.sql
```

### Update Session (Normal HR)

```sql
UPDATE running_sessions SET current_distance_km = current_distance_km + 0.015, elapsed_time_seconds = elapsed_time_seconds + 3, avg_heart_rate_bpm = 145, last_heartbeat_at = NOW(), total_distance_km = current_distance_km + 0.015, session_duration_seconds = elapsed_time_seconds + 3 WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1) AND status = 'running';
INSERT INTO session_heart_rate_data (session_id, heart_rate_bpm, timestamp_offset_seconds, recorded_at) SELECT id, 145, elapsed_time_seconds, NOW() FROM running_sessions WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1) AND status = 'running';
```

### Update Session (High HR)

```sql
UPDATE running_sessions SET current_distance_km = current_distance_km + 0.015, elapsed_time_seconds = elapsed_time_seconds + 3, avg_heart_rate_bpm = 170, last_heartbeat_at = NOW(), total_distance_km = current_distance_km + 0.015, session_duration_seconds = elapsed_time_seconds + 3 WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1) AND status = 'running';
INSERT INTO session_heart_rate_data (session_id, heart_rate_bpm, timestamp_offset_seconds, recorded_at) SELECT id, 170, elapsed_time_seconds, NOW() FROM running_sessions WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1) AND status = 'running';
```

### End Session

```sql
UPDATE running_sessions SET status = 'completed', session_end_time = NOW() WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1) AND status = 'running';
```

---

## ✅ Pre-Demo Checklist

- [ ] Development server running: `npm run dev`
- [ ] Supabase SQL Editor open
- [ ] Sessions Dashboard open: `localhost:3000/dashboard/sessions`
- [ ] Demo script file ready: `demo-simulation-running-status.sql`
- [ ] Test once: Create → Update → End session
- [ ] Clean up old test sessions
- [ ] Notes ready for what to say

---

## 🆘 Troubleshooting

### Session not appearing?

```sql
-- Check if session exists
SELECT id, status, current_distance_km FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
ORDER BY created_at DESC LIMIT 1;
```

### Need to reset?

```sql
-- Delete all test sessions
DELETE FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1);
```

### Dashboard not updating?

- Hard refresh: `Ctrl + Shift + R`
- Check browser console for errors
- Verify session has `status = 'running'`

---

## 🎯 Success Criteria

By end of demo, you should have shown:

- ✅ Live session with real-time updates
- ✅ Distance increasing during run
- ✅ Heart rate monitoring
- ✅ Alert system (high/critical)
- ✅ Session completion workflow
- ✅ Data persistence and history

---

## 📁 Files You Need

1. **`demo-simulation-running-status.sql`** - Main demo script
2. **Sessions Dashboard** - `localhost:3000/dashboard/sessions`
3. **IoT Monitor** (bonus) - `localhost:3000/dashboard/iot-monitor`

---

**Good luck with your demo tomorrow! 🚀**

If anything doesn't work, just message me and I'll help debug immediately.
