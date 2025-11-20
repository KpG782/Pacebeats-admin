/**
 * ============================================
 * SESSIONS API - Get User Sessions
 * ============================================
 *
 * This API route fetches all sessions for a specific user
 * Uses admin client to bypass RLS
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create admin client
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log(`🔍 [API] Fetching sessions for user ${userId}...`);

    const supabaseAdmin = getAdminClient();

    // Fetch user info
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, username")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("❌ [API] User not found:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all sessions for this user
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("running_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("session_start_time", { ascending: false });

    if (sessionsError) {
      console.error("❌ [API] Error fetching sessions:", sessionsError);
      return NextResponse.json(
        { error: sessionsError.message, details: sessionsError },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      console.log("⚠️ [API] No sessions found for this user");
      return NextResponse.json({ user, sessions: [] });
    }

    console.log(`📊 [API] Found ${sessions.length} sessions`);

    // Get session IDs for music count
    const sessionIds = sessions.map((s) => s.id);

    // Fetch music history count per session
    const { data: musicData, error: musicError } = await supabaseAdmin
      .from("session_music_history")
      .select("session_id")
      .in("session_id", sessionIds);

    if (musicError) {
      console.warn("⚠️ [API] Error fetching music data:", musicError);
    }

    // Count music per session
    const musicCountBySession = new Map<string, number>();
    (musicData || []).forEach((m) => {
      musicCountBySession.set(
        m.session_id,
        (musicCountBySession.get(m.session_id) || 0) + 1
      );
    });

    // Map sessions with calculated fields
    const mappedSessions = sessions.map((session) => {
      const totalSongs = musicCountBySession.get(session.id) || 0;

      return {
        id: session.id,
        session_id: session.id,
        user_id: session.user_id,
        user_email: user.email,
        user_name: user.username || user.email?.split("@")[0] || "Unknown",
        started_at: session.session_start_time,
        ended_at: session.session_end_time,
        duration_seconds: session.session_duration_seconds || 0,
        duration_minutes: Math.round(
          (session.session_duration_seconds || 0) / 60
        ),
        distance_km: session.total_distance_km || 0,
        total_steps: session.total_steps || 0,
        avg_pace_min_per_km: session.avg_pace_min_per_km,
        avg_cadence_spm: session.avg_cadence_spm,
        avg_heart_rate_bpm: session.avg_heart_rate_bpm,
        max_heart_rate_bpm: session.max_heart_rate_bpm,
        min_heart_rate_bpm: session.min_heart_rate_bpm,
        avg_speed_kmh: session.avg_speed_kmh,
        total_songs: totalSongs,
        completed_songs: 0, // Would need more complex query
        skipped_songs: 0,
        liked_songs: 0,
        disliked_songs: 0,
        total_time_ms: 0,
        run_type: session.run_type,
        selected_emotion: session.selected_emotion,
        selected_playlist: session.selected_playlist,
        status: session.status,
        created_at: session.created_at,
      };
    });

    return NextResponse.json({
      user,
      sessions: mappedSessions,
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
