-- ============================================
-- CREATE TEST DATA FOR IOT MONITOR
-- ============================================
-- ✅ FIXED: Uses status = 'active' (not 'running')
-- ✅ IoT Monitor will now detect this session!

DO $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
    v_start_time TIMESTAMPTZ;
BEGIN
    -- Get your user ID
    SELECT id INTO v_user_id 
    FROM users 
    WHERE email = 'kenpatrickgarcia123@gmail.com'  -- ⚠️ YOUR EMAIL
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found! Update email in script.';
    END IF;
    
    v_start_time := NOW();
    
    -- ✅ Create ACTIVE session (IoT Monitor looks for 'active', not 'running')
    INSERT INTO running_sessions (
        user_id,
        session_start_time,
        session_end_time,            -- NULL for active sessions
        session_duration_seconds,
        run_type,
        selected_emotion,
        selected_playlist,
        total_distance_km,
        total_steps,
        status,                      -- ✅ MUST BE 'active' for IoT Monitor
        current_distance_km,         -- ✅ Real-time column
        current_pace_min_per_km,     -- ✅ Real-time column
        elapsed_time_seconds,        -- ✅ Real-time column
        last_heartbeat_at            -- ✅ Real-time timestamp
    ) VALUES (
        v_user_id,
        v_start_time,
        NULL,                        -- ✅ NULL = still running
        0,                           -- Duration calculated at end
        'quick',
        'happy',
        'AI Recommendations',
        0,                           -- Final distance (empty until done)
        0,
        'active',                    -- ✅ CHANGED FROM 'running' to 'active'
        2.45,                        -- ✅ Current distance (2.45 km)
        5.30,                        -- ✅ Current pace (5:30 min/km)
        780,                         -- ✅ Elapsed time (13 minutes)
        NOW()                        -- ✅ Just now (CRITICAL for connection status)
    )
    RETURNING id INTO v_session_id;
    
    RAISE NOTICE '✅ Session created: %', v_session_id;
    RAISE NOTICE '📍 Status: active (IoT Monitor will see it!)';
    
    -- Insert multiple heart rate readings (simulate real-time)
    INSERT INTO session_heart_rate_data (
        session_id,
        heart_rate_bpm,
        timestamp_offset_seconds,
        is_connected,
        recorded_at
    ) VALUES 
        (v_session_id, 145, 0, true, v_start_time),
        (v_session_id, 148, 2, true, v_start_time + INTERVAL '2 seconds'),
        (v_session_id, 151, 4, true, v_start_time + INTERVAL '4 seconds'),
        (v_session_id, 149, 6, true, v_start_time + INTERVAL '6 seconds');
    
    RAISE NOTICE '✅ 4 heart rate readings inserted (145-151 bpm)';
    
    -- Insert GPS points (simulate movement)
    INSERT INTO session_gps_points (
        session_id,
        latitude,
        longitude,
        altitude_m,
        speed_mps,
        accuracy_m,
        timestamp_offset_seconds,
        recorded_at
    ) VALUES
        (v_session_id, 14.5695700, 121.0248500, 50.0, 2.9, 5.0, 0, v_start_time),
        (v_session_id, 14.5696200, 121.0249000, 50.5, 3.1, 5.0, 2, v_start_time + INTERVAL '2 seconds'),
        (v_session_id, 14.5696700, 121.0249500, 51.0, 3.2, 5.0, 4, v_start_time + INTERVAL '4 seconds');
    
    RAISE NOTICE '✅ 3 GPS points inserted (moving at ~11 km/h)';
    
    -- Create a HIGH severity alert
    INSERT INTO session_alerts (
        session_id,
        alert_type,
        alert_message,
        severity,
        heart_rate,
        triggered_at
    ) VALUES (
        v_session_id,
        'HIGH_HR_WARNING',
        'Heart rate elevated: 151 BPM',
        'HIGH',
        151,
        NOW()
    );
    
    RAISE NOTICE '✅ HIGH severity alert created';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 NOW CHECK YOUR IOT MONITOR DASHBOARD!';
    RAISE NOTICE '📍 URL: http://localhost:3000/dashboard/iot-monitor';
    RAISE NOTICE '📍 Session ID: %', v_session_id;
    RAISE NOTICE '🟢 Should show LIVE status (just updated)';
    RAISE NOTICE '❤️ Heart rate: 149 BPM (latest)';
    RAISE NOTICE '📍 Distance: 2.45 km';
    RAISE NOTICE '⏱️ Pace: 5:30 min/km';
    RAISE NOTICE '⏰ Time: 13m 0s';
    RAISE NOTICE '⚠️ 1 Alert (HIGH severity)';
    
END $$;

-- ============================================
-- DIAGNOSTIC: Check if IoT Monitor will see this
-- ============================================

SELECT 
    rs.id AS session_id,
    u.username,
    u.email,
    rs.status,
    rs.current_distance_km,
    rs.current_pace_min_per_km,
    rs.elapsed_time_seconds,
    rs.last_heartbeat_at,
    EXTRACT(EPOCH FROM (NOW() - rs.last_heartbeat_at)) AS seconds_ago,
    hr.heart_rate_bpm AS latest_hr
FROM running_sessions rs
JOIN users u ON u.id = rs.user_id
LEFT JOIN LATERAL (
    SELECT heart_rate_bpm, recorded_at
    FROM session_heart_rate_data
    WHERE session_id = rs.id
    ORDER BY recorded_at DESC
    LIMIT 1
) hr ON true
WHERE rs.status = 'active'  -- ✅ This is what IoT Monitor queries
  AND u.email = 'kenpatrickgarcia123@gmail.com'
ORDER BY rs.last_heartbeat_at DESC;

-- ✅ If this returns 1 row, IoT Monitor WILL show it!
-- ❌ If this returns 0 rows, something is wrong

-- ============================================
-- QUICK FIX: Update existing sessions to 'active'
-- ============================================

-- If you want to convert your existing 'running' sessions to 'active':
UPDATE running_sessions
SET 
    status = 'active',
    last_heartbeat_at = NOW()  -- Update timestamp to trigger realtime
WHERE status = 'running'
  AND user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1)
  AND session_end_time IS NULL;

-- Check results
SELECT 
    id, 
    status, 
    current_distance_km, 
    last_heartbeat_at,
    EXTRACT(EPOCH FROM (NOW() - last_heartbeat_at)) AS seconds_ago
FROM running_sessions
WHERE status = 'active'
  AND user_id = (SELECT id FROM users WHERE email = 'kenpatrickgarcia123@gmail.com' LIMIT 1);
