/**
 * ============================================
 * SESSIONS API - Get Users with Sessions Stats
 * ============================================
 *
 * This API route uses the admin client to fetch all users with their session statistics
 * Bypasses RLS so admin can see all data
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create admin client directly in the route
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ [API] Missing Supabase environment variables");
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
    console.log("🔍 [API] Fetching users with session statistics...");

    const supabaseAdmin = getAdminClient();

    // Fetch all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id, email, username, created_at")
      .order("created_at", { ascending: false });

    if (usersError) {
      console.error("❌ [API] Error fetching users:", usersError);
      return NextResponse.json(
        { error: usersError.message, details: usersError },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      console.log("⚠️ [API] No users found");
      return NextResponse.json({ users: [] });
    }

    console.log(`📊 [API] Found ${users.length} users`);

    // Fetch all sessions
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("running_sessions")
      .select("*");

    if (sessionsError) {
      console.warn("⚠️ [API] Error fetching sessions:", sessionsError);
    }

    // Fetch music history count
    const allSessionIds = (sessions || []).map((s) => s.id);
    let musicData: Array<{ session_id: string }> = [];

    if (allSessionIds.length > 0) {
      const { data, error: musicError } = await supabaseAdmin
        .from("session_music_history")
        .select("session_id")
        .in("session_id", allSessionIds);

      if (musicError) {
        console.warn("⚠️ [API] Error fetching music data:", musicError);
      } else {
        musicData = data || [];
      }
    }

    // Group sessions by user
    const sessionsByUser = new Map<string, typeof sessions>();
    (sessions || []).forEach((session) => {
      if (!sessionsByUser.has(session.user_id)) {
        sessionsByUser.set(session.user_id, []);
      }
      sessionsByUser.get(session.user_id)!.push(session);
    });

    // Count music tracks per user
    const musicCountByUser = new Map<string, number>();
    (sessions || []).forEach((session) => {
      if (!musicCountByUser.has(session.user_id)) {
        const userSessions = sessionsByUser.get(session.user_id) || [];
        const userSessionIds = userSessions.map((s) => s.id);
        const count = musicData.filter((m) =>
          userSessionIds.includes(m.session_id)
        ).length;
        musicCountByUser.set(session.user_id, count);
      }
    });

    // Map users with their stats
    const usersWithStats = users.map((user) => {
      const userSessions = sessionsByUser.get(user.id) || [];
      const totalSessions = userSessions.length;

      // Calculate aggregates
      const totalDistance = userSessions.reduce(
        (sum, s) => sum + (s.total_distance_km || 0),
        0
      );
      const totalDuration = userSessions.reduce(
        (sum, s) => sum + (s.session_duration_seconds || 0),
        0
      );

      // Calculate average heart rate (only from sessions that have it)
      const sessionsWithHR = userSessions.filter((s) => s.avg_heart_rate_bpm);
      const avgHeartRate =
        sessionsWithHR.length > 0
          ? Math.round(
              sessionsWithHR.reduce((sum, s) => sum + s.avg_heart_rate_bpm, 0) /
                sessionsWithHR.length
            )
          : 0;

      const totalSongs = musicCountByUser.get(user.id) || 0;

      // Get last session date
      const lastSession = userSessions[0]; // Already sorted by date desc
      const lastSessionDate = lastSession
        ? lastSession.session_start_time || lastSession.created_at
        : user.created_at;

      return {
        user_id: user.id,
        user_email: user.email,
        user_name: user.username || user.email?.split("@")[0] || "Unknown",
        total_sessions: totalSessions,
        total_distance_km: Number(totalDistance.toFixed(2)),
        total_duration_seconds: totalDuration,
        avg_heart_rate_bpm: avgHeartRate,
        total_songs: totalSongs,
        last_session_date: lastSessionDate,
        created_at: user.created_at,
      };
    });

    console.log(`✅ [API] Processed ${usersWithStats.length} users with stats`);

    return NextResponse.json({ users: usersWithStats });
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
