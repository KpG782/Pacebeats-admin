-- ============================================
-- QUICK FIX: Convert 'running' to 'active'
-- ============================================
-- This will make your existing test data visible in IoT Monitor

UPDATE running_sessions
SET 
    status = 'active',              -- ✅ Change from 'running' to 'active'
    last_heartbeat_at = NOW()       -- ✅ Update timestamp (triggers realtime)
WHERE status = 'running'
  AND session_end_time IS NULL      -- Only sessions still in progress
  AND user_id = (
      SELECT id 
      FROM users 
      WHERE email = 'kenpatrickgarcia123@gmail.com' 
      LIMIT 1
  );

-- Verify the change
SELECT 
    id, 
    status, 
    current_distance_km, 
    current_pace_min_per_km,
    elapsed_time_seconds,
    last_heartbeat_at,
    EXTRACT(EPOCH FROM (NOW() - last_heartbeat_at)) AS seconds_ago
FROM running_sessions
WHERE status = 'active'
  AND user_id = (
      SELECT id 
      FROM users 
      WHERE email = 'kenpatrickgarcia123@gmail.com' 
      LIMIT 1
  )
ORDER BY last_heartbeat_at DESC;

-- ✅ After running this, go to IoT Monitor and refresh (Ctrl+Shift+R)
-- 🎯 Your session should now appear!
