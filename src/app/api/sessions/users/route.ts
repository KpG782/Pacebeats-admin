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

export async function GET(request: Request) {
  try {
    console.log("🔍 [API] Fetching users with session statistics...");

    // ✅ Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    const supabaseAdmin = getAdminClient();

    // ✅ Fetch users with pagination and limit
    const {
      data: users,
      error: usersError,
      count,
    } = await supabaseAdmin
      .from("users")
      .select("id, email, username, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

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

    console.log(`📊 [API] Found ${users.length} users (total: ${count})`);

    // ✅ Fetch only necessary session fields for better performance
    const userIds = users.map((u) => u.id);
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("running_sessions")
      .select(
        "id, user_id, total_distance_km, session_duration_seconds, avg_heart_rate_bpm, session_start_time, created_at"
      )
      .in("user_id", userIds)
      .order("session_start_time", { ascending: false });

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
    for (const session of sessions || []) {
      if (!sessionsByUser.has(session.user_id)) {
        sessionsByUser.set(session.user_id, []);
      }
      sessionsByUser.get(session.user_id)!.push(session);
    }

    // Count music tracks per user
    const musicCountByUser = new Map<string, number>();
    for (const session of sessions || []) {
      if (!musicCountByUser.has(session.user_id)) {
        const userSessions = sessionsByUser.get(session.user_id) || [];
        const userSessionIds = new Set(userSessions.map((s) => s.id));
        const count = musicData.filter((m) =>
          userSessionIds.has(m.session_id)
        ).length;
        musicCountByUser.set(session.user_id, count);
      }
    }

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

    return NextResponse.json(
      {
        users: usersWithStats,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: offset + limit < (count || 0),
        },
      },
      {
        headers: {
          // ✅ Cache for 30 seconds to improve performance
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
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
