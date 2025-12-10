-- ============================================
-- REAL DEMO SIMULATION - STATUS: 'running'
-- ============================================
-- ✅ Creates session with status='running' (for Sessions Dashboard)
-- ✅ Just UPDATE repeatedly - session stays visible
-- ✅ Perfect for tomorrow's demo!

-- ============================================
-- STEP 1: CREATE SESSION (Run ONCE)
-- ============================================

DO $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
    v_start_time TIMESTAMPTZ;
BEGIN
    -- Get your user ID
    SELECT id INTO v_user_id 
    FROM users 
    WHERE email = 'kenpatrickgarcia123@gmail.com'
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION '❌ User not found! Update email in script.';
    END IF;
    
    -- Delete any old active/running sessions first (cleanup)
    DELETE FROM running_sessions
    WHERE user_id = v_user_id
      AND status IN ('active', 'running');
    
    v_start_time := NOW();
    
    RAISE NOTICE '🏃 Creating new session with status=running...';
    
    -- ✅ Create session with status='running'
    INSERT INTO running_sessions (
        user_id,
        session_start_time,
        session_end_time,
        session_duration_seconds,
        run_type,
        selected_emotion,
        selected_playlist,
        -- Status
        status,                      -- ✅ 'running' for Sessions Dashboard
        -- Real-time columns (will update continuously)
        current_distance_km,
        current_pace_min_per_km,
        elapsed_time_seconds,
        last_heartbeat_at,
        -- Aggregate columns
        total_distance_km,
        avg_pace_min_per_km,
        avg_heart_rate_bpm,
        avg_speed_kmh,
        total_steps,
        total_calories_burned
    ) VALUES (
        v_user_id,
        v_start_time,
        NULL,                        -- Still running
        0,
        'quick',
        'energetic',
        'AI Recommendations',
        -- Status
        'running',                   -- ✅ Sessions Dashboard will show this
        -- Starting values
        0.0,                         -- Distance
        0.0,                         -- Pace
        0,                           -- Time
        NOW(),                       -- Just now
        0.0,
        0.0,
        140,                         -- Starting HR
        10.0,
        0,
        0
    )
    RETURNING id INTO v_session_id;
    
    -- Insert initial heart rate
    INSERT INTO session_heart_rate_data (
        session_id,
        heart_rate_bpm,
        timestamp_offset_seconds,
        recorded_at,
        is_connected
    ) VALUES (
        v_session_id,
        140,
        0,
        NOW(),
        true
    );
    
    -- Insert initial GPS point
    INSERT INTO session_gps_points (
        session_id,
        latitude,
        longitude,
        altitude_m,
        speed_mps,
        accuracy_m,
        timestamp_offset_seconds,
        recorded_at
    ) VALUES (
        v_session_id,
        14.5695700,
        121.0248500,
        50.0,
        0.0,
        5.0,
        0,
        NOW()
    );
    
    RAISE NOTICE '✅ Session created: %', v_session_id;
    RAISE NOTICE '📍 Status: running';
    RAISE NOTICE '🎯 Sessions Dashboard will show this!';
    RAISE NOTICE '📍 Distance: 0.0 km';
    RAISE NOTICE '❤️ Heart rate: 140 bpm';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 NOW RUN THE UPDATE QUERIES BELOW REPEATEDLY!';
    
END $$;


-- ============================================
-- STEP 2: UPDATE SESSION (Run REPEATEDLY)
-- ============================================
-- 🔁 Run this every 3-5 seconds during demo
-- 💡 This simulates mobile app sending live data!

DO $$
DECLARE
    v_session_id UUID;
    v_new_distance NUMERIC;
    v_new_elapsed INTEGER;
    v_new_hr INTEGER;
    v_new_pace NUMERIC;
    v_new_speed NUMERIC;
    v_new_steps INTEGER;
    v_new_calories INTEGER;
BEGIN
    -- Get the running session
    SELECT id INTO v_session_id
    FROM running_sessions
    WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
      AND status = 'running'
      AND session_end_time IS NULL
    LIMIT 1;
    
    IF v_session_id IS NULL THEN
        RAISE EXCEPTION '❌ No running session found! Run STEP 1 first.';
    END IF;
    
    -- Calculate new values (simulate runner progressing)
    SELECT 
        current_distance_km + 0.015,              -- Add ~15 meters (3s at 5:00/km)
        elapsed_time_seconds + 3,                 -- Add 3 seconds
        135 + (RANDOM() * 30)::INTEGER,           -- Random HR 135-165
        CASE 
            WHEN current_distance_km > 0 THEN 
                (elapsed_time_seconds + 3) / 60.0 / (current_distance_km + 0.015)
            ELSE 0 
        END,                                       -- Calculate pace
        (current_distance_km + 0.015) / ((elapsed_time_seconds + 3) / 3600.0), -- Speed km/h
        total_steps + 40,                         -- ~40 steps per 3 seconds
        total_calories_burned + 5                 -- ~5 calories per 3 seconds
    INTO v_new_distance, v_new_elapsed, v_new_hr, v_new_pace, v_new_speed, v_new_steps, v_new_calories
    FROM running_sessions
    WHERE id = v_session_id;
    
    -- ✅ UPDATE SESSION (this is what mobile app does!)
    UPDATE running_sessions
    SET
        -- Real-time columns (update every time)
        current_distance_km = v_new_distance,
        current_pace_min_per_km = v_new_pace,
        elapsed_time_seconds = v_new_elapsed,
        last_heartbeat_at = NOW(),
        -- Aggregate columns (running averages)
        total_distance_km = v_new_distance,
        avg_pace_min_per_km = v_new_pace,
        avg_heart_rate_bpm = v_new_hr,
        avg_speed_kmh = v_new_speed,
        session_duration_seconds = v_new_elapsed,
        total_steps = v_new_steps,
        total_calories_burned = v_new_calories,
        -- Update max HR if higher
        max_heart_rate_bpm = GREATEST(COALESCE(max_heart_rate_bpm, 0), v_new_hr)
    WHERE id = v_session_id;
    
    -- ✅ INSERT NEW HEART RATE READING
    INSERT INTO session_heart_rate_data (
        session_id,
        heart_rate_bpm,
        timestamp_offset_seconds,
        recorded_at,
        is_connected
    ) VALUES (
        v_session_id,
        v_new_hr,
        v_new_elapsed,
        NOW(),
        true
    );
    
    -- ✅ INSERT NEW GPS POINT (simulate movement)
    INSERT INTO session_gps_points (
        session_id,
        latitude,
        longitude,
        altitude_m,
        speed_mps,
        accuracy_m,
        timestamp_offset_seconds,
        recorded_at
    ) VALUES (
        v_session_id,
        14.5695700 + (RANDOM() * 0.001),  -- Slight lat change
        121.0248500 + (RANDOM() * 0.001), -- Slight lng change
        50.0 + (RANDOM() * 5),             -- Altitude variation
        v_new_speed / 3.6,                 -- Convert km/h to m/s
        5.0,
        v_new_elapsed,
        NOW()
    );
    
    -- Log the update
    RAISE NOTICE '✅ Updated session:';
    RAISE NOTICE '   📍 Distance: %.2f km', v_new_distance;
    RAISE NOTICE '   ⏱️ Time: %s seconds (% min)', v_new_elapsed, ROUND(v_new_elapsed / 60.0, 1);
    RAISE NOTICE '   ⚡ Pace: % min/km', ROUND(v_new_pace, 2);
    RAISE NOTICE '   🏃 Speed: % km/h', ROUND(v_new_speed, 2);
    RAISE NOTICE '   ❤️ HR: % bpm', v_new_hr;
    RAISE NOTICE '   👟 Steps: %', v_new_steps;
    RAISE NOTICE '   🔥 Calories: %', v_new_calories;
    
    -- Create alert if HR is high
    IF v_new_hr >= 165 THEN
        INSERT INTO session_alerts (
            session_id,
            alert_type,
            alert_message,
            severity,
            heart_rate,
            triggered_at
        ) VALUES (
            v_session_id,
            CASE WHEN v_new_hr >= 180 THEN 'CRITICAL_HR_ALERT' ELSE 'HIGH_HR_WARNING' END,
            'Heart rate ' || CASE WHEN v_new_hr >= 180 THEN 'critical' ELSE 'elevated' END || ': ' || v_new_hr || ' BPM',
            CASE WHEN v_new_hr >= 180 THEN 'CRITICAL' ELSE 'HIGH' END,
            v_new_hr,
            NOW()
        );
        RAISE NOTICE '   ⚠️ ALERT CREATED: % HR', CASE WHEN v_new_hr >= 180 THEN 'CRITICAL' ELSE 'HIGH' END;
    END IF;
    
END $$;


-- ============================================
-- QUICK UPDATE SHORTCUTS FOR DEMO
-- ============================================

-- 🏃 Normal running (HR 140-150) - Run this repeatedly
UPDATE running_sessions
SET
    current_distance_km = current_distance_km + 0.015,
    elapsed_time_seconds = elapsed_time_seconds + 3,
    current_pace_min_per_km = CASE WHEN current_distance_km > 0 THEN (elapsed_time_seconds + 3) / 60.0 / (current_distance_km + 0.015) ELSE 0 END,
    avg_heart_rate_bpm = 140 + (RANDOM() * 10)::INTEGER,
    last_heartbeat_at = NOW(),
    total_distance_km = current_distance_km + 0.015,
    session_duration_seconds = elapsed_time_seconds + 3,
    total_steps = total_steps + 40,
    total_calories_burned = total_calories_burned + 5
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running'
  AND session_end_time IS NULL;

INSERT INTO session_heart_rate_data (session_id, heart_rate_bpm, timestamp_offset_seconds, recorded_at, is_connected)
SELECT id, 140 + (RANDOM() * 10)::INTEGER, elapsed_time_seconds, NOW(), true
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running';


-- ⚠️ High heart rate (HR 165-175)
UPDATE running_sessions
SET
    current_distance_km = current_distance_km + 0.015,
    elapsed_time_seconds = elapsed_time_seconds + 3,
    avg_heart_rate_bpm = 165 + (RANDOM() * 10)::INTEGER,
    last_heartbeat_at = NOW(),
    total_distance_km = current_distance_km + 0.015,
    session_duration_seconds = elapsed_time_seconds + 3
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running';

INSERT INTO session_heart_rate_data (session_id, heart_rate_bpm, timestamp_offset_seconds, recorded_at, is_connected)
SELECT id, 165 + (RANDOM() * 10)::INTEGER, elapsed_time_seconds, NOW(), true
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running';


-- 🚨 CRITICAL heart rate (HR 180-190)
UPDATE running_sessions
SET
    current_distance_km = current_distance_km + 0.015,
    elapsed_time_seconds = elapsed_time_seconds + 3,
    avg_heart_rate_bpm = 180 + (RANDOM() * 10)::INTEGER,
    last_heartbeat_at = NOW(),
    total_distance_km = current_distance_km + 0.015,
    session_duration_seconds = elapsed_time_seconds + 3
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running';

INSERT INTO session_heart_rate_data (session_id, heart_rate_bpm, timestamp_offset_seconds, recorded_at, is_connected)
SELECT id, 180 + (RANDOM() * 10)::INTEGER, elapsed_time_seconds, NOW(), true
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running';


-- ============================================
-- STEP 3: END SESSION (Run when done)
-- ============================================

UPDATE running_sessions
SET
    status = 'completed',
    session_end_time = NOW(),
    session_duration_seconds = elapsed_time_seconds,
    total_distance_km = current_distance_km
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running'
  AND session_end_time IS NULL;


-- ============================================
-- CHECK CURRENT SESSION STATUS
-- ============================================

SELECT 
    id,
    status,
    current_distance_km,
    current_pace_min_per_km,
    elapsed_time_seconds,
    ROUND(elapsed_time_seconds / 60.0, 1) AS minutes,
    avg_heart_rate_bpm,
    max_heart_rate_bpm,
    total_steps,
    total_calories_burned,
    last_heartbeat_at,
    EXTRACT(EPOCH FROM (NOW() - last_heartbeat_at)) AS seconds_since_update,
    (SELECT COUNT(*) FROM session_heart_rate_data WHERE session_id = running_sessions.id) AS hr_readings,
    (SELECT COUNT(*) FROM session_gps_points WHERE session_id = running_sessions.id) AS gps_points,
    (SELECT COUNT(*) FROM session_alerts WHERE session_id = running_sessions.id) AS alerts
FROM running_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND status = 'running'
ORDER BY created_at DESC
LIMIT 1;


-- ============================================
-- VIEW LATEST HEART RATE READINGS
-- ============================================

SELECT 
    heart_rate_bpm,
    timestamp_offset_seconds,
    recorded_at,
    EXTRACT(EPOCH FROM (NOW() - recorded_at)) AS seconds_ago
FROM session_heart_rate_data
WHERE session_id = (
    SELECT id FROM running_sessions 
    WHERE user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
      AND status = 'running'
    LIMIT 1
)
ORDER BY recorded_at DESC
LIMIT 10;


-- ============================================
-- DEMO INSTRUCTIONS
-- ============================================

/*
🎯 FOR TOMORROW'S DEMO:

1️⃣ BEFORE DEMO (Setup):
   - Run "STEP 1: CREATE SESSION" 
   - Verify session appears in Sessions Dashboard
   - Status should show: "running"

2️⃣ DURING DEMO (Live Updates):
   - Copy the "Normal running" quick update query
   - Run it every 5-10 seconds during demo
   - Watch Sessions Dashboard update live:
     * Distance increases
     * Time increases  
     * Heart rate changes
     * Steps/calories increase

3️⃣ SHOW FEATURES:
   - Run "High heart rate" query → Show alert system
   - Run "CRITICAL heart rate" → Show critical alert
   - Stop updating for 1 minute → Let them see it's still "running"

4️⃣ END DEMO:
   - Run "STEP 3: END SESSION"
   - Session changes to "completed"
   - All data preserved

✅ SESSIONS DASHBOARD WILL SHOW:
   - Status: "running" (not "active")
   - Distance updating live
   - Time updating live
   - Heart rate updating
   - Steps & calories updating
   - All real-time metrics visible!

💡 TIP:
   Open Sessions Dashboard and Supabase SQL Editor side-by-side
   Run update query, watch dashboard update instantly!
*/
