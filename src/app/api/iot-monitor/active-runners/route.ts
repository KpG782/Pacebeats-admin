/**
 * ============================================
 * IOT MONITOR API - Server-Side Data Fetcher
 * ============================================
 *
 * This API route uses the admin client to fetch all active runners
 * Bypasses RLS so admin can see all sessions
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create admin client directly in the route to avoid initialization issues
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ [API] Missing Supabase environment variables");
    console.error("  - NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
    console.error(
      "  - SUPABASE_SERVICE_ROLE_KEY:",
      supabaseServiceKey ? "✅" : "❌"
    );
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function GET() {
  try {
    console.log("🔍 [API] Loading active runners (admin mode)...");

    const supabaseAdmin = getAdminClient();

    // Get active sessions with user info (bypasses RLS)
    // ✅ Fixed: Using correct column names from actual database schema
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("running_sessions")
      .select(
        `
        id,
        user_id,
        session_start_time,
        session_end_time,
        session_duration_seconds,
        run_type,
        total_distance_km,
        current_distance_km,
        avg_pace_min_per_km,
        current_pace_min_per_km,
        avg_heart_rate_bpm,
        max_heart_rate_bpm,
        avg_speed_kmh,
        calories_burned,
        status,
        elapsed_time_seconds,
        last_heartbeat_at,
        created_at,
        updated_at,
        users (
          username,
          email
        )
      `
      )
      .in("status", ["active", "running"]) // Accept both statuses
      .order("last_heartbeat_at", { ascending: false })
      .limit(50);

    if (sessionsError) {
      console.error("❌ [API] Sessions query error:", sessionsError);
      return NextResponse.json(
        { error: sessionsError.message, details: sessionsError },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      console.log("📊 [API] No active sessions found");
      return NextResponse.json({ sessions: [], heartRates: [], alerts: [] });
    }

    console.log(`📊 [API] Found ${sessions.length} active sessions`);

    const sessionIds = sessions.map((s) => s.id);

    // Get latest heart rate for each session (optimized query)
    const { data: heartRates, error: hrError } = await supabaseAdmin
      .from("session_heart_rate_data")
      .select("session_id, heart_rate_bpm, recorded_at")
      .in("session_id", sessionIds)
      .order("recorded_at", { ascending: false });

    if (hrError) {
      console.error("❌ [API] Heart rate query error:", hrError);
    }

    // Get unresolved alerts
    const { data: alerts, error: alertsError } = await supabaseAdmin
      .from("session_alerts")
      .select("session_id, severity, alert_message, triggered_at")
      .in("session_id", sessionIds)
      .order("triggered_at", { ascending: false });

    if (alertsError) {
      console.error("❌ [API] Alerts query error:", alertsError);
    }

    console.log(
      `✅ [API] Loaded ${heartRates?.length || 0} HR readings, ${
        alerts?.length || 0
      } alerts`
    );

    return NextResponse.json({
      sessions,
      heartRates: heartRates || [],
      alerts: alerts || [],
    });
  } catch (error) {
    console.error("❌ [API] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
