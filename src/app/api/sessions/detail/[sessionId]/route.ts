/**
 * ============================================
 * SESSIONS API - Get/Delete Session Detail
 * ============================================
 *
 * GET: Fetches detailed information about a specific session
 * DELETE: Deletes a session and all related data
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
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    console.log(`🔍 [API] Fetching details for session ${sessionId}...`);

    const supabaseAdmin = getAdminClient();

    // Fetch session data
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("running_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      console.error("❌ [API] Session not found:", sessionError);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fetch user info
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, username")
      .eq("id", session.user_id)
      .single();

    if (userError || !user) {
      console.error("❌ [API] User not found:", userError);
    }

    // Fetch heart rate data
    const { data: heartRateData, error: hrError } = await supabaseAdmin
      .from("session_heart_rate_data")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp_offset_seconds", { ascending: true });

    if (hrError) {
      console.warn("⚠️ [API] Error fetching heart rate data:", hrError);
    }

    // Fetch music history
    const { data: musicHistory, error: musicError } = await supabaseAdmin
      .from("session_music_history")
      .select("*")
      .eq("session_id", sessionId)
      .order("play_order", { ascending: true });

    if (musicError) {
      console.warn("⚠️ [API] Error fetching music history:", musicError);
    }

    // Fetch GPS points
    const { data: gpsPoints, error: gpsError } = await supabaseAdmin
      .from("session_gps_points")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp_offset_seconds", { ascending: true });

    if (gpsError) {
      console.warn("⚠️ [API] Error fetching GPS points:", gpsError);
    }

    // Fetch pace intervals
    const { data: paceIntervals, error: paceError } = await supabaseAdmin
      .from("session_pace_intervals")
      .select("*")
      .eq("session_id", sessionId)
      .order("interval_number", { ascending: true });

    if (paceError) {
      console.warn("⚠️ [API] Error fetching pace intervals:", paceError);
    }

    // Count music stats
    const totalSongs = musicHistory?.length || 0;
    const completedSongs =
      musicHistory?.filter((m) => !m.was_skipped).length || 0;
    const skippedSongs = musicHistory?.filter((m) => m.was_skipped).length || 0;
    const likedSongs = musicHistory?.filter((m) => m.was_liked).length || 0;

    // Map session with all related data
    const sessionDetail = {
      id: session.id,
      session_id: session.id,
      user_id: session.user_id,
      user_email: user?.email || "",
      user_name: user?.username || user?.email?.split("@")[0] || "Unknown",
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
      completed_songs: completedSongs,
      skipped_songs: skippedSongs,
      liked_songs: likedSongs,
      disliked_songs: 0,
      total_time_ms: 0,
      run_type: session.run_type,
      selected_emotion: session.selected_emotion,
      selected_playlist: session.selected_playlist,
      status: session.status,
      created_at: session.created_at,
      heart_rate_data: heartRateData || [],
      music_history: musicHistory || [],
      gps_points: gpsPoints || [],
      pace_intervals: paceIntervals || [],
    };

    console.log(
      `✅ [API] Session detail loaded with ${
        heartRateData?.length || 0
      } HR points, ${musicHistory?.length || 0} tracks`
    );

    return NextResponse.json({ session: sessionDetail });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    console.log(`🗑️ [API] Deleting session ${sessionId}...`);

    const supabaseAdmin = getAdminClient();

    // Check if session exists
    const { data: session, error: checkError } = await supabaseAdmin
      .from("running_sessions")
      .select("id")
      .eq("id", sessionId)
      .single();

    if (checkError || !session) {
      console.error("❌ [API] Session not found:", checkError);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete related data first (to avoid foreign key constraint errors)
    console.log("🗑️ [API] Deleting related data...");

    // Delete session alerts
    await supabaseAdmin
      .from("session_alerts")
      .delete()
      .eq("session_id", sessionId);

    // Delete heart rate data
    await supabaseAdmin
      .from("session_heart_rate_data")
      .delete()
      .eq("session_id", sessionId);

    // Delete music history
    await supabaseAdmin
      .from("session_music_history")
      .delete()
      .eq("session_id", sessionId);

    // Delete GPS points
    await supabaseAdmin
      .from("session_gps_points")
      .delete()
      .eq("session_id", sessionId);

    // Delete pace intervals
    await supabaseAdmin
      .from("session_pace_intervals")
      .delete()
      .eq("session_id", sessionId);

    console.log("✅ [API] Related data deleted");

    // Now delete the session
    const { error: deleteError } = await supabaseAdmin
      .from("running_sessions")
      .delete()
      .eq("id", sessionId);

    if (deleteError) {
      console.error("❌ [API] Error deleting session:", deleteError);
      return NextResponse.json(
        { error: deleteError.message, details: deleteError },
        { status: 500 }
      );
    }

    console.log(`✅ [API] Session ${sessionId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
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
