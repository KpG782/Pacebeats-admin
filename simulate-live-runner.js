/**
 * ============================================
 * LIVE RUNNER SIMULATOR (Auto-Update Version)
 * ============================================
 *
 * This script automatically simulates a live runner by:
 * 1. Creating an active session
 * 2. Continuously updating it with new data (every 3 seconds)
 * 3. Simulating realistic heart rate changes
 *
 * Perfect for demos - just run it and watch IoT Monitor!
 *
 * Usage:
 *   node simulate-live-runner.js
 *
 * Press Ctrl+C to stop
 */

import { createClient } from "@supabase/supabase-js";

// ⚠️ UPDATE THESE WITH YOUR VALUES
const SUPABASE_URL = "https://mxhnswymqijymrwvsybm.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE"; // Get from .env.local
const USER_EMAIL = "kenpatrickgarcia123@gmail.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let sessionId = null;
let startTime = null;
let updateInterval = null;
let currentHR = 140;
let currentDistance = 0;

// Simulate realistic heart rate changes
function simulateHeartRate() {
  // Random walk (goes up/down by 1-5 bpm)
  const change = Math.floor(Math.random() * 10) - 5;
  currentHR = Math.max(120, Math.min(185, currentHR + change));

  // Occasionally spike (simulate intensity changes)
  if (Math.random() < 0.1) {
    currentHR += Math.floor(Math.random() * 20);
  }

  return Math.min(190, Math.max(120, currentHR));
}

// Calculate pace based on distance and time
function calculatePace(distanceKm, timeSeconds) {
  if (distanceKm === 0) return 0;
  return timeSeconds / 60 / distanceKm; // min/km
}

// Format time as MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

// Create initial active session
async function createSession() {
  console.log("🏃 Creating active session...");

  // Get user ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", USER_EMAIL)
    .single();

  if (userError || !user) {
    console.error("❌ User not found:", USER_EMAIL);
    process.exit(1);
  }

  startTime = new Date();

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from("running_sessions")
    .insert({
      user_id: user.id,
      session_start_time: startTime.toISOString(),
      status: "active",
      run_type: "quick",
      selected_emotion: "energetic",
      selected_playlist: "AI Recommendations",
      current_distance_km: 0,
      current_pace_min_per_km: 0,
      elapsed_time_seconds: 0,
      last_heartbeat_at: new Date().toISOString(),
      total_distance_km: 0,
      avg_heart_rate_bpm: currentHR,
      session_duration_seconds: 0,
    })
    .select()
    .single();

  if (sessionError || !session) {
    console.error("❌ Failed to create session:", sessionError);
    process.exit(1);
  }

  sessionId = session.id;
  console.log("✅ Session created:", sessionId);
  console.log("📍 IoT Monitor should now show this runner!");
  console.log("🔄 Updating every 3 seconds...\n");

  // Insert initial heart rate
  await supabase.from("session_heart_rate_data").insert({
    session_id: sessionId,
    heart_rate_bpm: currentHR,
    timestamp_offset_seconds: 0,
    recorded_at: new Date().toISOString(),
  });
}

// Update session with new data (simulates mobile app sending data)
async function updateSession() {
  if (!sessionId) return;

  const now = new Date();
  const elapsedSeconds = Math.floor((now - startTime) / 1000);

  // Simulate running at ~5:30 min/km pace (3.3 m/s = ~12 km/h)
  currentDistance += 0.01; // Add 10 meters per update (3 seconds)
  const pace = calculatePace(currentDistance, elapsedSeconds);
  const hr = simulateHeartRate();

  // Update session
  const { error: updateError } = await supabase
    .from("running_sessions")
    .update({
      current_distance_km: currentDistance,
      current_pace_min_per_km: pace,
      elapsed_time_seconds: elapsedSeconds,
      last_heartbeat_at: now.toISOString(), // ✅ CRITICAL for connection status
      avg_heart_rate_bpm: hr,
      total_distance_km: currentDistance,
      session_duration_seconds: elapsedSeconds,
    })
    .eq("id", sessionId);

  if (updateError) {
    console.error("❌ Update failed:", updateError);
    return;
  }

  // Insert heart rate reading
  await supabase.from("session_heart_rate_data").insert({
    session_id: sessionId,
    heart_rate_bpm: hr,
    timestamp_offset_seconds: elapsedSeconds,
    recorded_at: now.toISOString(),
  });

  // Determine status
  let status = "🟢 NORMAL";
  if (hr >= 180) status = "🔴 CRITICAL";
  else if (hr >= 165) status = "🟠 HIGH";
  else if (hr < 100) status = "🔵 LOW";

  console.log(
    `⏱️ ${formatTime(elapsedSeconds)} | ` +
      `📍 ${currentDistance.toFixed(2)} km | ` +
      `⚡ ${pace.toFixed(2)} min/km | ` +
      `❤️ ${hr} bpm ${status}`
  );

  // Create alert if critical
  if (hr >= 165) {
    await supabase.from("session_alerts").insert({
      session_id: sessionId,
      alert_type: hr >= 180 ? "CRITICAL_HR_ALERT" : "HIGH_HR_WARNING",
      alert_message: `Heart rate ${
        hr >= 180 ? "critical" : "elevated"
      }: ${hr} BPM`,
      severity: hr >= 180 ? "CRITICAL" : "HIGH",
      heart_rate: hr,
      triggered_at: now.toISOString(),
    });
  }
}

// End session gracefully
async function endSession() {
  if (!sessionId) return;

  console.log("\n🛑 Ending session...");

  const now = new Date();
  const elapsedSeconds = Math.floor((now - startTime) / 1000);

  await supabase
    .from("running_sessions")
    .update({
      status: "completed",
      session_end_time: now.toISOString(),
      session_duration_seconds: elapsedSeconds,
      total_distance_km: currentDistance,
    })
    .eq("id", sessionId);

  console.log("✅ Session completed");
  console.log(
    `📊 Final: ${currentDistance.toFixed(2)} km in ${formatTime(
      elapsedSeconds
    )}`
  );
  process.exit(0);
}

// Main
async function main() {
  console.log("🎯 Live Runner Simulator for IoT Monitor");
  console.log("==========================================\n");

  // Create session
  await createSession();

  // Start updating every 3 seconds
  updateInterval = setInterval(updateSession, 3000);

  // Handle Ctrl+C
  process.on("SIGINT", endSession);

  // Auto-stop after 5 minutes (for demo safety)
  setTimeout(() => {
    console.log("\n⏰ 5 minutes elapsed - auto-stopping");
    endSession();
  }, 5 * 60 * 1000);
}

main().catch(console.error);
