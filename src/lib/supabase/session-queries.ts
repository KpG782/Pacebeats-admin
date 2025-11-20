/**
 * Session Query Helpers
 * Functions to fetch and manage running sessions from Supabase
 */

import { supabaseAdmin } from "./admin-client";

// Use admin client to bypass RLS and access all sessions
const supabase = supabaseAdmin;

// Database row type for running_sessions table
interface RunningSessionRow {
  id: string;
  user_id: string;
  session_start_time: string;
  session_end_time?: string | null;
  session_duration_seconds: number;
  total_distance_km: number;
  total_steps?: number;
  avg_pace_min_per_km?: number | null;
  avg_cadence_spm?: number | null;
  avg_heart_rate_bpm?: number | null;
  max_heart_rate_bpm?: number | null;
  min_heart_rate_bpm?: number | null;
  avg_speed_kmh?: number | null;
  run_type?: string;
  selected_emotion?: string | null;
  selected_playlist?: string | null;
  status: string;
  created_at: string;
}

// Types matching the running_sessions table structure
export interface SessionData {
  id: string;
  session_id: string; // Alias for id for backward compatibility
  user_id: string;
  user_email: string;
  user_name: string;
  started_at: string | null; // Alias for start_time - nullable for incomplete sessions
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

export interface UserWithSessions {
  user_id: string;
  user_email: string;
  user_name: string;
  total_sessions: number;
  total_distance_km: number;
  total_duration_seconds: number;
  avg_heart_rate_bpm: number;
  total_songs: number;
  last_session_date: string;
  created_at: string;
}

/**
 * Fetch all running sessions with user information
 */
export async function getAllSessions(): Promise<SessionData[]> {
  console.log("🔍 Fetching sessions from running_sessions table...");

  try {
    // Fetch all running sessions WITHOUT join (Android pattern)
    const { data: sessions, error: sessionsError } = await supabase
      .from("running_sessions")
      .select("*")
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

    // Type assertion for database rows
    const typedSessions = sessions as RunningSessionRow[];

    // Fetch users separately (Android pattern)
    const userIds = [...new Set(typedSessions.map((s) => s.user_id))];
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, username")
      .in("id", userIds);

    if (usersError) {
      console.error("⚠️ Error fetching users:", usersError);
    }

    // Type assertion for user records
    interface UserRecord {
      id: string;
      email: string;
      username: string | null;
    }
    const typedUsers = (users || []) as UserRecord[];

    // Create user map for quick lookup
    const userMap = new Map(typedUsers.map((u) => [u.id, u]));

    // Fetch music history for all sessions to calculate music stats
    const sessionIds = typedSessions.map((s) => s.id);

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
    const sessionsData: SessionData[] = typedSessions.map((session) => {
      const user = userMap.get(session.user_id);
      const musicStats = musicBySession.get(session.id) || {
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
        started_at: session.session_start_time || null,
        ended_at: (session.session_end_time || null) as string | null,
        duration_seconds: session.session_duration_seconds ?? null,
        duration_minutes: Math.round(
          (session.session_duration_seconds || 0) / 60
        ),
        distance_km: session.total_distance_km ?? null,
        total_steps: session.total_steps || 0,
        avg_pace_min_per_km: session.avg_pace_min_per_km ?? null,
        avg_cadence_spm: session.avg_cadence_spm ?? null,
        avg_heart_rate_bpm: session.avg_heart_rate_bpm ?? null,
        max_heart_rate_bpm: session.max_heart_rate_bpm ?? null,
        min_heart_rate_bpm: session.min_heart_rate_bpm ?? null,
        avg_speed_kmh: session.avg_speed_kmh ?? null,
        total_songs: musicStats.total,
        completed_songs: musicStats.completed,
        skipped_songs: musicStats.skipped,
        liked_songs: musicStats.liked,
        disliked_songs: musicStats.disliked,
        total_time_ms: musicStats.totalTime,
        run_type: session.run_type || "quick",
        selected_emotion: session.selected_emotion ?? null,
        selected_playlist: session.selected_playlist ?? null,
        status:
          (session.status as "active" | "completed" | "paused" | "cancelled") ||
          "completed",
        created_at: session.created_at,
      };
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
    // Fetch main session WITHOUT join (Android pattern)
    const { data: session, error: sessionError } = await supabase
      .from("running_sessions")
      .select("*")
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

    // Type assertion for database row
    const typedSession = session as RunningSessionRow;

    console.log("✅ Session found, fetching related data...");

    // Fetch user separately (Android pattern)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, username")
      .eq("id", typedSession.user_id)
      .single();

    if (userError) {
      console.warn("⚠️ Error fetching user:", userError.message);
    }

    // Type assertion for user record
    interface UserRecord {
      id: string;
      email: string;
      username: string | null;
    }
    const typedUser = user as UserRecord | null;

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
        .order("timestamp_offset_seconds", { ascending: true })
        .limit(5000), // Performance limit - same as Android app

      supabase
        .from("session_music_history")
        .select("*")
        .eq("session_id", sessionId)
        .order("play_order", { ascending: true })
        .limit(200), // Performance limit - same as Android app

      supabase
        .from("session_gps_points")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp_offset_seconds", { ascending: true })
        .limit(10000), // Performance limit - same as Android app

      supabase
        .from("session_pace_intervals")
        .select("*")
        .eq("session_id", sessionId)
        .order("interval_number", { ascending: true })
        .limit(100), // Performance limit - same as Android app
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

    // Type assertions for fetched data
    const typedMusicHistory = (musicHistory || []) as MusicTrack[];

    // Calculate music stats
    const musicStats = {
      total: typedMusicHistory.length,
      completed: typedMusicHistory.filter((t) => !t.was_skipped).length,
      skipped: typedMusicHistory.filter((t) => t.was_skipped).length,
      liked: typedMusicHistory.filter((t) => t.was_liked).length,
      disliked: 0, // Not in current schema
      totalTime: typedMusicHistory.reduce(
        (sum, t) => sum + (t.played_duration_seconds || 0) * 1000,
        0
      ),
    };

    const sessionDetail: SessionDetail = {
      id: typedSession.id,
      session_id: typedSession.id,
      user_id: typedSession.user_id,
      user_email: typedUser?.email || "Unknown",
      user_name: typedUser?.username || "Unknown User",
      started_at: typedSession.session_start_time ?? null,
      ended_at: typedSession.session_end_time ?? null,
      duration_seconds: typedSession.session_duration_seconds ?? null,
      duration_minutes: Math.round(
        (typedSession.session_duration_seconds || 0) / 60
      ),
      distance_km: typedSession.total_distance_km ?? null,
      total_steps: typedSession.total_steps || 0,
      avg_pace_min_per_km: typedSession.avg_pace_min_per_km ?? null,
      avg_cadence_spm: typedSession.avg_cadence_spm ?? null,
      avg_heart_rate_bpm: typedSession.avg_heart_rate_bpm ?? null,
      max_heart_rate_bpm: typedSession.max_heart_rate_bpm ?? null,
      min_heart_rate_bpm: typedSession.min_heart_rate_bpm ?? null,
      avg_speed_kmh: typedSession.avg_speed_kmh ?? null,
      total_songs: musicStats.total,
      completed_songs: musicStats.completed,
      skipped_songs: musicStats.skipped,
      liked_songs: musicStats.liked,
      disliked_songs: musicStats.disliked,
      total_time_ms: musicStats.totalTime,
      run_type: typedSession.run_type || "quick",
      selected_emotion: typedSession.selected_emotion ?? null,
      selected_playlist: typedSession.selected_playlist ?? null,
      status: "completed",
      created_at: typedSession.created_at,
      heart_rate_data: (heartRateData || []) as HeartRateData[],
      music_history: (musicHistory || []) as MusicTrack[],
      gps_points: (gpsPoints || []) as GpsPoint[],
      pace_intervals: (paceIntervals || []) as PaceInterval[],
    };

    console.log(
      `✅ Session detail loaded: ${musicStats.total} tracks, ${
        heartRateData?.length || 0
      } HR points, ${gpsPoints?.length || 0} GPS points, ${
        paceIntervals?.length || 0
      } intervals`
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
    // Fetch sessions WITHOUT join (Android pattern)
    const { data: sessions, error } = await supabase
      .from("running_sessions")
      .select("*")
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

    // Type assertion for database rows
    const typedSessions = sessions as RunningSessionRow[];

    // Fetch user info separately (Android pattern)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, username")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("⚠️ Error fetching user:", userError);
    }

    // Type assertion for user record
    interface UserRecord {
      id: string;
      email: string;
      username: string | null;
    }
    const typedUser = user as UserRecord | null;

    // Get music stats for these sessions
    const sessionIds = typedSessions.map((s) => s.id);
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

    const sessionsData = typedSessions.map((session) => {
      const musicStats = musicBySession.get(session.id) || {
        total: 0,
        completed: 0,
        skipped: 0,
        liked: 0,
        totalTime: 0,
      };

      return {
        id: session.id,
        session_id: session.id,
        user_id: session.user_id,
        user_email: typedUser?.email || "Unknown",
        user_name: typedUser?.username || "Unknown User",
        started_at: session.session_start_time ?? null,
        ended_at: session.session_end_time ?? null,
        duration_seconds: session.session_duration_seconds ?? null,
        duration_minutes: Math.round(
          (session.session_duration_seconds || 0) / 60
        ),
        distance_km: session.total_distance_km ?? null,
        total_steps: session.total_steps || 0,
        avg_pace_min_per_km: session.avg_pace_min_per_km ?? null,
        avg_cadence_spm: session.avg_cadence_spm ?? null,
        avg_heart_rate_bpm: session.avg_heart_rate_bpm ?? null,
        max_heart_rate_bpm: session.max_heart_rate_bpm ?? null,
        min_heart_rate_bpm: session.min_heart_rate_bpm ?? null,
        avg_speed_kmh: session.avg_speed_kmh ?? null,
        total_songs: musicStats.total,
        completed_songs: musicStats.completed,
        skipped_songs: musicStats.skipped,
        liked_songs: musicStats.liked,
        disliked_songs: 0,
        total_time_ms: musicStats.totalTime,
        run_type: session.run_type || "quick",
        selected_emotion: session.selected_emotion ?? null,
        selected_playlist: session.selected_playlist ?? null,
        status:
          (session.status as "active" | "completed" | "paused" | "cancelled") ||
          "completed",
        created_at: session.created_at,
      };
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

// Type for user data from database
interface UserRow {
  id: string;
  email: string | null;
  username: string | null;
  created_at: string;
}

/**
 * Get all users with their session statistics
 */
export async function getUsersWithSessions(): Promise<UserWithSessions[]> {
  console.log("🔍 Fetching users with session statistics...");

  try {
    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, username, created_at")
      .order("created_at", { ascending: false });

    if (usersError) {
      console.error("❌ Error fetching users:", usersError);
      return [];
    }

    if (!users || users.length === 0) {
      console.log("⚠️ No users found");
      return [];
    }

    // Type assertion for user records
    const typedUsers = users as UserRow[];

    // Fetch all sessions (get all columns to avoid field name issues)
    const { data: sessions, error: sessionsError } = await supabase
      .from("running_sessions")
      .select("*");

    if (sessionsError) {
      console.error("⚠️ Error fetching sessions:", sessionsError);
    }

    // Type assertion for session records
    const typedSessions = (sessions || []) as RunningSessionRow[];

    // Fetch all session IDs first to get music count
    const allSessionIds = typedSessions.map((s) => s.id);

    // Fetch music history count with proper session_id mapping
    let musicData: Array<{ session_id: string }> = [];
    if (allSessionIds.length > 0) {
      const { data, error: musicError } = await supabase
        .from("session_music_history")
        .select("session_id")
        .in("session_id", allSessionIds);

      if (musicError) {
        console.warn("⚠️ Error fetching music data:", musicError);
      } else {
        musicData = data || [];
      }
    }

    // Group sessions by user
    const sessionsByUser = new Map<string, RunningSessionRow[]>();
    typedSessions.forEach((session) => {
      if (!sessionsByUser.has(session.user_id)) {
        sessionsByUser.set(session.user_id, []);
      }
      sessionsByUser.get(session.user_id)!.push(session);
    });

    // Count music tracks per user
    const musicCountByUser = new Map<string, number>();
    typedSessions.forEach((session) => {
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
    const usersWithStats: UserWithSessions[] = typedUsers.map((user) => {
      const userSessions = sessionsByUser.get(user.id) || [];
      const totalDistance = userSessions.reduce(
        (sum, s) => sum + (s.total_distance_km || 0),
        0
      );
      const totalDuration = userSessions.reduce(
        (sum, s) => sum + (s.session_duration_seconds || 0),
        0
      );

      // Calculate average heart rate
      const avgHeartRate =
        userSessions.length > 0
          ? Math.round(
              userSessions.reduce(
                (sum, s) => sum + (s.avg_heart_rate_bpm || 0),
                0
              ) / userSessions.length
            )
          : 0;

      const lastSessionDate =
        userSessions.length > 0
          ? userSessions.sort(
              (a, b) =>
                new Date(b.session_start_time).getTime() -
                new Date(a.session_start_time).getTime()
            )[0].session_start_time
          : user.created_at;

      return {
        user_id: user.id,
        user_email: user.email || "Unknown",
        user_name: user.username || "Unknown User",
        total_sessions: userSessions.length,
        total_distance_km: totalDistance,
        total_duration_seconds: totalDuration,
        avg_heart_rate_bpm: avgHeartRate,
        total_songs: musicCountByUser.get(user.id) || 0,
        last_session_date: lastSessionDate,
        created_at: user.created_at,
      };
    });

    console.log(`✅ Loaded ${usersWithStats.length} users with stats`);
    return usersWithStats;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Unexpected error in getUsersWithSessions:", {
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
