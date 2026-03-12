/**
 * Session Query Helpers
 * Functions to fetch and manage running sessions from Supabase
 */

import { supabase } from "./client";

// Types matching the running_sessions table structure
export interface SessionData {
  id: string;
  session_id: string; // Alias for id for backward compatibility
  user_id: string;
  user_email: string;
  user_name: string;
  started_at: string; // Alias for start_time
  ended_at: string | null; // Alias for end_time
  duration_seconds: number | null;
  duration_minutes: number; // Calculated from duration_seconds
  distance_km: number | null;
  total_steps: number;
  avg_pace_min_per_km: number | null;
  avg_cadence_spm: number | null;
  avg_heart_rate_bpm: number | null;
  max_heart_rate_bpm: number | null;
  min_heart_rate_bpm: number | null;
  avg_speed_kmh: number | null;
  total_songs: number;
  completed_songs: number;
  skipped_songs: number;
  liked_songs: number;
  disliked_songs: number;
  total_time_ms: number; // Total music play time
  run_type: string;
  selected_emotion: string | null;
  selected_playlist: string | null;
  status: "active" | "completed" | "paused" | "cancelled";
  created_at: string;
}

export interface HeartRateData {
  id: number;
  session_id: string;
  timestamp_offset_seconds: number;
  heart_rate_bpm: number;
  is_connected: boolean | null;
  recorded_at: string | null;
}

export interface MusicTrack {
  id: number;
  session_id: string;
  track_title: string;
  track_artist: string | null;
  track_duration_seconds: number | null;
  track_bpm: number | null;
  spotify_track_id: string | null;
  play_order: number;
  played_at_offset_seconds: number;
  played_duration_seconds: number;
  was_skipped: boolean;
  was_liked: boolean;
  recommended_by: string | null;
  recommendation_trigger: string | null;
  created_at: string;
}

export interface GpsPoint {
  id: number;
  session_id: string;
  timestamp_offset_seconds: number;
  latitude: number;
  longitude: number;
  altitude_m: number | null;
  accuracy_m: number | null;
  speed_mps: number | null;
  distance_from_prev_m: number | null;
  recorded_at: string;
}

export interface PaceInterval {
  id: number;
  session_id: string;
  interval_number: number;
  start_offset_seconds: number;
  end_offset_seconds: number;
  steps: number;
  distance_km: number | null;
  pace_min_per_km: number | null;
  cadence_spm: number | null;
  avg_heart_rate_bpm: number | null;
  pace_source: string | null;
  created_at: string;
}

export interface SessionDetail extends SessionData {
  heart_rate_data: HeartRateData[];
  music_history: MusicTrack[];
  gps_points: GpsPoint[];
  pace_intervals: PaceInterval[];
}

interface RunningSessionRow {
  id: string;
  user_id: string;
  session_start_time: string;
  session_end_time: string | null;
  session_duration_seconds: number | null;
  total_distance_km: number | null;
  total_steps: number | null;
  avg_pace_min_per_km: number | null;
  avg_cadence_spm: number | null;
  avg_heart_rate_bpm: number | null;
  max_heart_rate_bpm: number | null;
  min_heart_rate_bpm: number | null;
  avg_speed_kmh: number | null;
  run_type: string | null;
  selected_emotion: string | null;
  selected_playlist: string | null;
  status: string | null;
  created_at: string;
  users?: {
    email?: string | null;
    username?: string | null;
  } | null;
}

function normalizeStatus(
  status: string | null | undefined
): SessionData["status"] {
  switch (status) {
    case "active":
    case "completed":
    case "paused":
    case "cancelled":
      return status;
    default:
      return "completed";
  }
}

function mapSessionRowToSessionData(
  session: RunningSessionRow,
  musicStats?: {
    total: number;
    completed: number;
    skipped: number;
    liked: number;
    disliked?: number;
    totalTime: number;
  }
): SessionData {
  const user = session.users;
  const stats = musicStats || {
    total: 0,
    completed: 0,
    skipped: 0,
    liked: 0,
    disliked: 0,
    totalTime: 0,
  };

  return {
    id: session.id,
    session_id: session.id,
    user_id: session.user_id,
    user_email: user?.email || "Unknown",
    user_name: user?.username || "Unknown User",
    started_at: session.session_start_time,
    ended_at: session.session_end_time,
    duration_seconds: session.session_duration_seconds,
    duration_minutes: Math.round((session.session_duration_seconds || 0) / 60),
    distance_km: Number(session.total_distance_km || 0),
    total_steps: session.total_steps || 0,
    avg_pace_min_per_km: session.avg_pace_min_per_km,
    avg_cadence_spm: session.avg_cadence_spm || 0,
    avg_heart_rate_bpm: session.avg_heart_rate_bpm || 0,
    max_heart_rate_bpm: session.max_heart_rate_bpm || 0,
    min_heart_rate_bpm: session.min_heart_rate_bpm || 0,
    avg_speed_kmh: session.avg_speed_kmh || 0,
    total_songs: stats.total,
    completed_songs: stats.completed,
    skipped_songs: stats.skipped,
    liked_songs: stats.liked,
    disliked_songs: stats.disliked || 0,
    total_time_ms: stats.totalTime,
    run_type: session.run_type || "quick",
    selected_emotion: session.selected_emotion,
    selected_playlist: session.selected_playlist,
    status: normalizeStatus(session.status),
    created_at: session.created_at,
  };
}

/**
 * Fetch all running sessions with user information
 */
export async function getAllSessions(): Promise<SessionData[]> {
  console.log("🔍 Fetching sessions from running_sessions table...");

  try {
    // Fetch all running sessions with user data
    const { data: sessions, error: sessionsError } = await supabase
      .from("running_sessions")
      .select(`
        *,
        users (
          email,
          username
        )
      `)
      .order("session_start_time", { ascending: false });

    if (sessionsError) {
      console.error("❌ Error fetching sessions:", {
        message: sessionsError.message,
        details: sessionsError.details,
        hint: sessionsError.hint,
        code: sessionsError.code,
      });
      // Return empty array instead of throwing to prevent page crash
      return [];
    }

    if (!sessions || sessions.length === 0) {
      console.log("⚠️ No sessions found in database");
      return [];
    }

    console.log(`✅ Found ${sessions.length} sessions`);

    // Fetch music history for all sessions to calculate music stats
    const sessionIds = sessions.map((s) => s.id);
    
    let musicData: Array<{
      session_id: string;
      was_skipped: boolean;
      was_liked: boolean;
      played_duration_seconds: number;
    }> = [];
    if (sessionIds.length > 0) {
      const { data, error: musicError } = await supabase
        .from("session_music_history")
        .select("session_id, was_skipped, was_liked, played_duration_seconds")
        .in("session_id", sessionIds);

      if (musicError) {
        console.error("⚠️ Error fetching music data:", {
          message: musicError.message,
          details: musicError.details,
          hint: musicError.hint,
        });
        // Continue without music data
      } else {
        musicData = data || [];
      }
    }

    // Group music data by session
    const musicBySession = new Map<
      string,
      {
        total: number;
        completed: number;
        skipped: number;
        liked: number;
        disliked: number;
        totalTime: number;
      }
    >();

    musicData.forEach((track) => {
      if (!musicBySession.has(track.session_id)) {
        musicBySession.set(track.session_id, {
          total: 0,
          completed: 0,
          skipped: 0,
          liked: 0,
          disliked: 0,
          totalTime: 0,
        });
      }
      const stats = musicBySession.get(track.session_id)!;
      stats.total++;
      if (!track.was_skipped) stats.completed++;
      if (track.was_skipped) stats.skipped++;
      if (track.was_liked) stats.liked++;
      stats.totalTime += (track.played_duration_seconds || 0) * 1000; // Convert to ms
    });

    // Map to SessionData format
    const sessionsData: SessionData[] = (sessions as RunningSessionRow[]).map((session) => {
      const musicStats = musicBySession.get(session.id) || {
        total: 0,
        completed: 0,
        skipped: 0,
        liked: 0,
        disliked: 0,
        totalTime: 0,
      };

      return mapSessionRowToSessionData(session, musicStats);
    });

    console.log(`✅ Successfully processed ${sessionsData.length} sessions`);
    return sessionsData;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Unexpected error in getAllSessions:", {
      message: err?.message || "Unknown error",
      name: err?.name,
    });
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Get complete session detail with all related data
 */
export async function getSessionDetail(
  sessionId: string
): Promise<SessionDetail | null> {
  console.log(`🔍 Fetching session detail for ${sessionId}...`);

  try {
    // Fetch main session with user data
    const { data: session, error: sessionError } = await supabase
      .from("running_sessions")
      .select(`
        *,
        users (
          email,
          username
        )
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("❌ Error fetching session:", {
        message: sessionError.message,
        details: sessionError.details,
        hint: sessionError.hint,
        code: sessionError.code,
      });
      return null;
    }

    if (!session) {
      console.log("⚠️ Session not found");
      return null;
    }

    console.log("✅ Session found, fetching related data...");

    // Fetch all related data in parallel
    const [
      { data: heartRateData, error: hrError },
      { data: musicHistory, error: musicError },
      { data: gpsPoints, error: gpsError },
      { data: paceIntervals, error: paceError },
    ] = await Promise.all([
      supabase
        .from("session_heart_rate_data")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp_offset_seconds", { ascending: true }),

      supabase
        .from("session_music_history")
        .select("*")
        .eq("session_id", sessionId)
        .order("play_order", { ascending: true }),

      supabase
        .from("session_gps_points")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp_offset_seconds", { ascending: true }),

      supabase
        .from("session_pace_intervals")
        .select("*")
        .eq("session_id", sessionId)
        .order("interval_number", { ascending: true }),
    ]);

    // Log any errors but continue with available data
    if (hrError) {
      console.warn("⚠️ Error fetching heart rate data:", hrError.message);
    }
    if (musicError) {
      console.warn("⚠️ Error fetching music history:", musicError.message);
    }
    if (gpsError) {
      console.warn("⚠️ Error fetching GPS points:", gpsError.message);
    }
    if (paceError) {
      console.warn("⚠️ Error fetching pace intervals:", paceError.message);
    }

    // Calculate music stats
    const musicStats = {
      total: musicHistory?.length || 0,
      completed: musicHistory?.filter((t) => !t.was_skipped).length || 0,
      skipped: musicHistory?.filter((t) => t.was_skipped).length || 0,
      liked: musicHistory?.filter((t) => t.was_liked).length || 0,
      disliked: 0, // Not in current schema
      totalTime:
        musicHistory?.reduce(
          (sum, t) => sum + (t.played_duration_seconds || 0) * 1000,
          0
        ) || 0,
    };

    const sessionDetail: SessionDetail = {
      ...mapSessionRowToSessionData(
        session as RunningSessionRow,
        musicStats
      ),
      heart_rate_data: (heartRateData || []) as HeartRateData[],
      music_history: (musicHistory || []) as MusicTrack[],
      gps_points: (gpsPoints || []) as GpsPoint[],
      pace_intervals: (paceIntervals || []) as PaceInterval[],
    };

    console.log(
      `✅ Session detail loaded: ${musicStats.total} tracks, ${heartRateData?.length || 0} HR points, ${gpsPoints?.length || 0} GPS points, ${paceIntervals?.length || 0} intervals`
    );

    return sessionDetail;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Error loading session detail:", {
      message: err?.message || "Unknown error",
      name: err?.name,
      stack: err?.stack,
    });
    return null;
  }
}

/**
 * Get all sessions for a specific user
 */
export async function getUserSessions(userId: string): Promise<SessionData[]> {
  console.log(`🔍 Fetching sessions for user ${userId}...`);

  try {
    const { data: sessions, error } = await supabase
      .from("running_sessions")
      .select(`
        *,
        users (
          email,
          username
        )
      `)
      .eq("user_id", userId)
      .order("session_start_time", { ascending: false });

    if (error) {
      console.error("❌ Error fetching user sessions:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return [];
    }

    if (!sessions || sessions.length === 0) {
      console.log("⚠️ No sessions found for this user");
      return [];
    }

    // Get music stats for these sessions
    const sessionIds = sessions.map((s) => s.id);
    let musicData: Array<{
      session_id: string;
      was_skipped: boolean;
      was_liked: boolean;
      played_duration_seconds: number;
    }> = [];

    if (sessionIds.length > 0) {
      const { data, error: musicError } = await supabase
        .from("session_music_history")
        .select("session_id, was_skipped, was_liked, played_duration_seconds")
        .in("session_id", sessionIds);

      if (musicError) {
        console.error("⚠️ Error fetching music data:", musicError.message);
        // Continue without music data
      } else {
        musicData = data || [];
      }
    }

    // Group music data by session
    const musicBySession = new Map<
      string,
      {
        total: number;
        completed: number;
        skipped: number;
        liked: number;
        totalTime: number;
      }
    >();

    musicData.forEach((track) => {
      if (!musicBySession.has(track.session_id)) {
        musicBySession.set(track.session_id, {
          total: 0,
          completed: 0,
          skipped: 0,
          liked: 0,
          totalTime: 0,
        });
      }
      const stats = musicBySession.get(track.session_id)!;
      stats.total++;
      if (!track.was_skipped) stats.completed++;
      if (track.was_skipped) stats.skipped++;
      if (track.was_liked) stats.liked++;
      stats.totalTime += (track.played_duration_seconds || 0) * 1000;
    });

    const sessionsData = (sessions as RunningSessionRow[]).map((session) => {
      const musicStats = musicBySession.get(session.id) || {
        total: 0,
        completed: 0,
        skipped: 0,
        liked: 0,
        totalTime: 0,
      };

      return mapSessionRowToSessionData(session, {
        ...musicStats,
        disliked: 0,
      });
    });

    console.log(`✅ Found ${sessionsData.length} sessions for user`);
    return sessionsData;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Unexpected error in getUserSessions:", {
      message: err?.message || "Unknown error",
      name: err?.name,
    });
    return [];
  }
}

/**
 * Delete a session and all related data
 */
export async function deleteSession(sessionId: string) {
  console.log(`🗑️ Deleting session ${sessionId}...`);

  try {
    // Delete main session (cascade should handle related tables)
    const { error } = await supabase
      .from("running_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw error;

    console.log("✅ Session deleted successfully");
    return { success: true };
  } catch (error: unknown) {
    console.error("❌ Error deleting session:", error);
    throw error;
  }
}
