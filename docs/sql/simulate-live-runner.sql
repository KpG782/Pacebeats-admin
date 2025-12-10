-- ============================================
-- LIVE RUNNER SIMULATOR (DEMO MODE)
-- ============================================
-- ✅ Creates ONE session, then updates it continuously
-- ✅ Simulates a real mobile app sending live data
-- ✅ Perfect for demos and testing IoT Monitor

-- ============================================
-- STEP 1: CREATE INITIAL SESSION (Run once)
-- ============================================

DO $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
BEGIN
    -- Get your user ID
    SELECT id INTO v_user_id 
    FROM users 
    WHERE email = 'kenpatrickgarcia123@gmail.com'
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found!';
    END IF;
    
    -- Check if active session already exists
    SELECT id INTO v_session_id
    FROM running_sessions
    WHERE user_id = v_user_id
      AND status = 'active'
    LIMIT 1;
    
    IF v_session_id IS NOT NULL THEN
        RAISE NOTICE '✅ Active session already exists: %', v_session_id;
        RAISE NOTICE '📍 Use the UPDATE queries below to simulate live data';
        RETURN;
    END IF;
    
    -- Create new active session
    INSERT INTO running_sessions (
        user_id,
        session_start_time,
        status,
        run_type,
        selected_emotion,
        selected_playlist,
        -- Real-time columns (will update continuously)
        current_distance_km,
        current_pace_min_per_km,
        elapsed_time_seconds,
        last_heartbeat_at,
        -- Aggregate columns (updated less frequently)
        total_distance_km,
        avg_pace_min_per_km,
        avg_heart_rate_bpm,
        avg_speed_kmh,
        session_duration_seconds
    ) VALUES (
        v_user_id,
        NOW() - INTERVAL '5 minutes',  -- Started 5 minutes ago
        'active',                       -- ✅ Must be 'active'
        'quick',
        'energetic',
        'AI Recommendations',
        -- Starting values
        0.5,    -- 500m distance
        6.0,    -- 6:00 min/km pace
        300,    -- 5 minutes elapsed
        NOW(),  -- Just received data
        0.5,
        6.0,
        140,
        10.0,
        300
    )
    RETURNING id INTO v_session_id;
    
    -- Insert initial heart rate
    INSERT INTO session_heart_rate_data (
        session_id,
        heart_rate_bpm,
        timestamp_offset_seconds,
        recorded_at
    ) VALUES (
        v_session_id,
        140,
        300,
        NOW()
    );
    
    RAISE NOTICE '✅ Session created: %', v_session_id;
    RAISE NOTICE '🎯 IoT Monitor should now show this runner!';
    RAISE NOTICE '📍 Run the UPDATE queries below every few seconds to simulate live updates';
    
END $$;

-- ============================================
-- STEP 2: SIMULATE LIVE UPDATES
-- ============================================
-- 🔁 Run this repeatedly (every 3-5 seconds) to simulate real-time data
-- 💡 This is what a real mobile app would do!

-- Update 1: Increase distance, update heart rate (simulate 3 seconds passed)
DO $$
DECLARE
    v_session_id UUID;
    v_new_distance NUMERIC;
    v_new_elapsed INTEGER;
    v_new_hr INTEGER;
BEGIN
    -- Get active session
    SELECT id INTO v_session_id
    FROM running_sessions
    WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
      AND status = 'active'
    LIMIT 1;
    
    IF v_session_id IS NULL THEN
        RAISE EXCEPTION 'No active session found! Run STEP 1 first.';
    END IF;
    
    -- Calculate new values (simulate runner moving)
    SELECT 
        current_distance_km + 0.015,  -- Add ~15 meters (3 seconds at 5:00/km pace)
        elapsed_time_seconds + 3,     -- Add 3 seconds
        135 + (RANDOM() * 30)::INTEGER -- Random HR between 135-165
    INTO v_new_distance, v_new_elapsed, v_new_hr
    FROM running_sessions
    WHERE id = v_session_id;
    
    -- ✅ UPDATE SESSION (this is what mobile app does!)
    UPDATE running_sessions
    SET
        current_distance_km = v_new_distance,
        elapsed_time_seconds = v_new_elapsed,
        current_pace_min_per_km = 5.5,  -- Pace slightly improved
        last_heartbeat_at = NOW(),      -- ✅ CRITICAL: Update timestamp
        avg_heart_rate_bpm = v_new_hr,
        total_distance_km = v_new_distance,
        session_duration_seconds = v_new_elapsed
    WHERE id = v_session_id;
    
    -- ✅ INSERT NEW HEART RATE READING
    INSERT INTO session_heart_rate_data (
        session_id,
        heart_rate_bpm,
        timestamp_offset_seconds,
        recorded_at
    ) VALUES (
        v_session_id,
        v_new_hr,
        v_new_elapsed,
        NOW()
    );
    
    RAISE NOTICE '✅ Updated session: Distance=%.2f km, HR=%s bpm, Time=%ss', 
        v_new_distance, v_new_hr, v_new_elapsed;
    RAISE NOTICE '🔄 IoT Monitor should update in real-time!';
    
END $$;

-- ============================================
-- STEP 3: QUICK UPDATE SHORTCUTS
-- ============================================

-- 🏃 Simulate normal running (HR 140-150)
UPDATE running_sessions
SET
    current_distance_km = current_distance_km + 0.015,
    elapsed_time_seconds = elapsed_time_seconds + 3,
    avg_heart_rate_bpm = 140 + (RANDOM() * 10)::INTEGER,
    last_heartbeat_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';

-- Add heart rate reading
INSERT INTO session_heart_rate_data (session_id, heart_rate_bpm, timestamp_offset_seconds, recorded_at)
SELECT id, 140 + (RANDOM() * 10)::INTEGER, elapsed_time_seconds, NOW()
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';

-- ============================================

-- ⚠️ Simulate HIGH heart rate (HR 165-175)
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

-- ============================================

-- 🚨 Simulate CRITICAL heart rate (HR 180-190)
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

-- ============================================

-- 🛑 Simulate LOST CONNECTION (no update for 30+ seconds)
-- Just don't run any UPDATE for 30 seconds
-- IoT Monitor will show "LOST" status automatically

-- ============================================

-- 🏁 END SESSION (mark as completed)
UPDATE running_sessions
SET
    status = 'completed',
    session_end_time = NOW(),
    session_duration_seconds = elapsed_time_seconds,
    total_distance_km = current_distance_km
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';

-- ✅ Session will disappear from IoT Monitor (only shows 'active')
-- ✅ Will appear in Sessions Dashboard (shows all sessions)

-- ============================================
-- DIAGNOSTIC: Check current session status
-- ============================================

SELECT 
    id,
    status,
    current_distance_km,
    current_pace_min_per_km,
    elapsed_time_seconds,
    last_heartbeat_at,
    EXTRACT(EPOCH FROM (NOW() - last_heartbeat_at)) AS seconds_ago,
    CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - last_heartbeat_at)) < 10 THEN 'LIVE 🟢'
        WHEN EXTRACT(EPOCH FROM (NOW() - last_heartbeat_at)) < 30 THEN 'SLOW 🟡'
        ELSE 'LOST 🔴'
    END AS connection_status,
    (SELECT heart_rate_bpm FROM session_heart_rate_data WHERE session_id = running_sessions.id ORDER BY recorded_at DESC LIMIT 1) AS latest_hr
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'active';

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================

/*
🎯 HOW TO USE THIS FOR DEMOS:

1️⃣ SETUP (Run once):
   - Run "STEP 1: CREATE INITIAL SESSION"
   - Check IoT Monitor - runner should appear

2️⃣ DEMO NORMAL RUNNING:
   - Run "Simulate normal running" query every 3-5 seconds
   - Watch IoT Monitor update in real-time
   - Heart rate: 140-150 (GREEN status)

3️⃣ DEMO HIGH HEART RATE:
   - Run "Simulate HIGH heart rate" query
   - Watch status change to HIGH (AMBER)
   - Alert should appear

4️⃣ DEMO CRITICAL ALERT:
   - Run "Simulate CRITICAL heart rate" query
   - Watch status change to CRITICAL (RED pulsing)
   - Critical alert banner should appear

5️⃣ DEMO CONNECTION LOSS:
   - Stop running queries for 30 seconds
   - Watch connection status change:
     * 0-10s: LIVE (green)
     * 10-30s: SLOW (yellow)
     * 30+s: LOST (red)

6️⃣ END DEMO:
   - Run "END SESSION" query
   - Runner disappears from IoT Monitor
   - Session appears in Sessions Dashboard

💡 PRO TIP:
   Open IoT Monitor side-by-side with Supabase SQL Editor
   Run update queries and watch real-time changes!

📍 IoT Monitor URL:
   http://localhost:3000/dashboard/iot-monitor
*/
