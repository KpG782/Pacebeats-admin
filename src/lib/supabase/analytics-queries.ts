/**
 * Analytics Query Functions
 * Fetch and aggregate analytics data from the database
 */

import { supabase } from "./client";

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalDistance: number;
  totalDuration: number;
  totalSongs: number;
  avgSessionDuration: number;
  avgSessionDistance: number;
  avgHeartRate: number;
  totalHeartRateData: number;
  totalGPSPoints: number;
}

export interface UserGrowthData {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
}

export interface SessionTrendData {
  date: string;
  sessions: number;
  avgDuration: number;
  avgDistance: number;
  avgPace: number;
}

export interface MusicAnalytics {
  totalTracks: number;
  totalPlays: number;
  avgPlaysPerTrack: number;
  skipRate: number;
  completionRate: number;
  likeRate: number;
  topGenres: Array<{ genre: string; count: number; percentage: number }>;
  topArtists: Array<{ artist: string; plays: number }>;
  topTracks: Array<{
    title: string;
    artist: string;
    plays: number;
    completions: number;
    skips: number;
  }>;
  bpmDistribution: Array<{ range: string; count: number; avgPlays: number }>;
}

export interface RunTypeAnalytics {
  runType: string;
  count: number;
  percentage: number;
  avgDuration: number;
  avgDistance: number;
  avgPace: number;
}

export interface TimeAnalytics {
  hour: number;
  sessions: number;
  users: number;
  avgDuration: number;
}

export interface PerformanceMetrics {
  avgPace: number;
  avgHeartRate: number;
  avgCadence: number;
  avgSpeed: number;
  totalCalories: number;
  totalSteps: number;
}

/**
 * Get analytics summary (Dashboard overview stats)
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  console.log("🔍 Fetching analytics summary...");

  try {
    // Fetch users count
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (usersError) throw usersError;

    // Fetch all sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("running_sessions")
      .select("*");

    if (sessionsError) throw sessionsError;

    // Fetch music history count
    const { count: totalSongs, error: musicError } = await supabase
      .from("session_music_history")
      .select("*", { count: "exact", head: true });

    if (musicError) throw musicError;

    // Fetch heart rate data count
    const { count: totalHeartRateData, error: hrError } = await supabase
      .from("session_heart_rate_data")
      .select("*", { count: "exact", head: true });

    if (hrError) throw hrError;

    // Fetch GPS points count
    const { count: totalGPSPoints, error: gpsError } = await supabase
      .from("session_gps_points")
      .select("*", { count: "exact", head: true });

    if (gpsError) throw gpsError;

    // Calculate aggregations
    const totalSessions = sessions?.length || 0;
    const totalDistance =
      sessions?.reduce((sum, s) => sum + (s.total_distance_km || 0), 0) || 0;
    const totalDuration =
      sessions?.reduce(
        (sum, s) => sum + (s.session_duration_seconds || 0),
        0
      ) || 0;
    const avgHeartRate = sessions?.length
      ? Math.round(
          sessions.reduce((sum, s) => sum + (s.avg_heart_rate_bpm || 0), 0) /
            sessions.length
        )
      : 0;

    // Calculate active users (users with sessions in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUserIds = new Set(
      sessions
        ?.filter((s) => new Date(s.session_start_time) > thirtyDaysAgo)
        .map((s) => s.user_id) || []
    );

    const summary: AnalyticsSummary = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUserIds.size,
      totalSessions,
      totalDistance,
      totalDuration,
      totalSongs: totalSongs || 0,
      avgSessionDuration:
        totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0,
      avgSessionDistance:
        totalSessions > 0
          ? Number((totalDistance / totalSessions).toFixed(2))
          : 0,
      avgHeartRate,
      totalHeartRateData: totalHeartRateData || 0,
      totalGPSPoints: totalGPSPoints || 0,
    };

    console.log("✅ Analytics summary loaded:", summary);
    return summary;
  } catch (error) {
    console.error("❌ Error fetching analytics summary:", error);
    throw error;
  }
}

/**
 * Get user growth data over time
 */
export async function getUserGrowthData(
  days: number = 30
): Promise<UserGrowthData[]> {
  console.log(`🔍 Fetching user growth data for last ${days} days...`);

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("created_at")
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Group by date
    const growthMap = new Map<string, { new: number; total: number }>();
    let cumulativeTotal = 0;

    users?.forEach((user) => {
      const date = new Date(user.created_at).toISOString().split("T")[0];
      if (!growthMap.has(date)) {
        growthMap.set(date, { new: 0, total: 0 });
      }
      const entry = growthMap.get(date)!;
      entry.new++;
      cumulativeTotal++;
      entry.total = cumulativeTotal;
    });

    // Convert to array and fill gaps
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result: UserGrowthData[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const data = growthMap.get(dateStr) || { new: 0, total: cumulativeTotal };
      result.push({
        date: dateStr,
        newUsers: data.new,
        activeUsers: 0, // Will be calculated separately
        totalUsers: data.total,
      });
    }

    console.log(`✅ Loaded ${result.length} days of user growth data`);
    return result;
  } catch (error) {
    console.error("❌ Error fetching user growth data:", error);
    throw error;
  }
}

/**
 * Get session trends over time
 */
export async function getSessionTrends(
  days: number = 30
): Promise<SessionTrendData[]> {
  console.log(`🔍 Fetching session trends for last ${days} days...`);

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: sessions, error } = await supabase
      .from("running_sessions")
      .select("*")
      .gte("session_start_time", startDate.toISOString())
      .order("session_start_time", { ascending: true });

    if (error) throw error;

    // Group by date
    const trendsMap = new Map<
      string,
      {
        sessions: number;
        totalDuration: number;
        totalDistance: number;
        totalPace: number;
        paceCount: number;
      }
    >();

    sessions?.forEach((session) => {
      const date = new Date(session.session_start_time)
        .toISOString()
        .split("T")[0];
      if (!trendsMap.has(date)) {
        trendsMap.set(date, {
          sessions: 0,
          totalDuration: 0,
          totalDistance: 0,
          totalPace: 0,
          paceCount: 0,
        });
      }
      const entry = trendsMap.get(date)!;
      entry.sessions++;
      entry.totalDuration += session.session_duration_seconds || 0;
      entry.totalDistance += session.total_distance_km || 0;
      if (session.avg_pace_min_per_km) {
        entry.totalPace += session.avg_pace_min_per_km;
        entry.paceCount++;
      }
    });

    // Convert to array
    const result: SessionTrendData[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const data = trendsMap.get(dateStr);
      result.push({
        date: dateStr,
        sessions: data?.sessions || 0,
        avgDuration: data ? Math.round(data.totalDuration / data.sessions) : 0,
        avgDistance: data
          ? Number((data.totalDistance / data.sessions).toFixed(2))
          : 0,
        avgPace:
          data && data.paceCount > 0
            ? Number((data.totalPace / data.paceCount).toFixed(2))
            : 0,
      });
    }

    console.log(`✅ Loaded ${result.length} days of session trends`);
    return result;
  } catch (error) {
    console.error("❌ Error fetching session trends:", error);
    throw error;
  }
}

/**
 * Get music analytics
 */
export async function getMusicAnalytics(): Promise<MusicAnalytics> {
  console.log("🔍 Fetching music analytics...");

  try {
    // Fetch all music history
    const { data: musicHistory, error: musicError } = await supabase
      .from("session_music_history")
      .select("*");

    if (musicError) throw musicError;

    const totalTracks = new Set(
      musicHistory?.map((m) => m.spotify_track_id || m.track_title) || []
    ).size;
    const totalPlays = musicHistory?.length || 0;
    const totalSkipped = musicHistory?.filter((m) => m.was_skipped).length || 0;
    const totalCompleted =
      musicHistory?.filter((m) => !m.was_skipped).length || 0;
    const totalLiked = musicHistory?.filter((m) => m.was_liked).length || 0;

    // Top tracks
    const trackPlays = new Map<
      string,
      {
        title: string;
        artist: string;
        plays: number;
        skips: number;
        completions: number;
      }
    >();
    musicHistory?.forEach((track) => {
      const key = track.track_title;
      if (!trackPlays.has(key)) {
        trackPlays.set(key, {
          title: track.track_title,
          artist: track.track_artist || "Unknown",
          plays: 0,
          skips: 0,
          completions: 0,
        });
      }
      const entry = trackPlays.get(key)!;
      entry.plays++;
      if (track.was_skipped) entry.skips++;
      else entry.completions++;
    });

    const topTracks = Array.from(trackPlays.values())
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10);

    // BPM distribution
    const bpmRanges = new Map<string, { count: number; totalPlays: number }>();
    musicHistory?.forEach((track) => {
      const bpm = track.track_bpm || 0;
      let range = "Unknown";
      if (bpm > 0) {
        if (bpm < 100) range = "< 100";
        else if (bpm < 120) range = "100-120";
        else if (bpm < 140) range = "120-140";
        else if (bpm < 160) range = "140-160";
        else if (bpm < 180) range = "160-180";
        else range = "180+";
      }

      if (!bpmRanges.has(range)) {
        bpmRanges.set(range, { count: 0, totalPlays: 0 });
      }
      const entry = bpmRanges.get(range)!;
      entry.count++;
      entry.totalPlays++;
    });

    const bpmDistribution = Array.from(bpmRanges.entries()).map(
      ([range, data]) => ({
        range,
        count: data.count,
        avgPlays: data.count > 0 ? Math.round(data.totalPlays / data.count) : 0,
      })
    );

    const analytics: MusicAnalytics = {
      totalTracks,
      totalPlays,
      avgPlaysPerTrack:
        totalTracks > 0 ? Number((totalPlays / totalTracks).toFixed(2)) : 0,
      skipRate:
        totalPlays > 0
          ? Number(((totalSkipped / totalPlays) * 100).toFixed(2))
          : 0,
      completionRate:
        totalPlays > 0
          ? Number(((totalCompleted / totalPlays) * 100).toFixed(2))
          : 0,
      likeRate:
        totalPlays > 0
          ? Number(((totalLiked / totalPlays) * 100).toFixed(2))
          : 0,
      topGenres: [],
      topArtists: [],
      topTracks,
      bpmDistribution,
    };

    console.log("✅ Music analytics loaded");
    return analytics;
  } catch (error) {
    console.error("❌ Error fetching music analytics:", error);
    throw error;
  }
}

/**
 * Get run type distribution and analytics
 */
export async function getRunTypeAnalytics(): Promise<RunTypeAnalytics[]> {
  console.log("🔍 Fetching run type analytics...");

  try {
    const { data: sessions, error } = await supabase
      .from("running_sessions")
      .select("*");

    if (error) throw error;

    const runTypeMap = new Map<
      string,
      {
        count: number;
        totalDuration: number;
        totalDistance: number;
        totalPace: number;
        paceCount: number;
      }
    >();

    sessions?.forEach((session) => {
      const runType = session.run_type || "quick";
      if (!runTypeMap.has(runType)) {
        runTypeMap.set(runType, {
          count: 0,
          totalDuration: 0,
          totalDistance: 0,
          totalPace: 0,
          paceCount: 0,
        });
      }
      const entry = runTypeMap.get(runType)!;
      entry.count++;
      entry.totalDuration += session.session_duration_seconds || 0;
      entry.totalDistance += session.total_distance_km || 0;
      if (session.avg_pace_min_per_km) {
        entry.totalPace += session.avg_pace_min_per_km;
        entry.paceCount++;
      }
    });

    const totalCount = sessions?.length || 0;
    const result = Array.from(runTypeMap.entries()).map(([runType, data]) => ({
      runType,
      count: data.count,
      percentage: Number(((data.count / totalCount) * 100).toFixed(2)),
      avgDuration: Math.round(data.totalDuration / data.count),
      avgDistance: Number((data.totalDistance / data.count).toFixed(2)),
      avgPace:
        data.paceCount > 0
          ? Number((data.totalPace / data.paceCount).toFixed(2))
          : 0,
    }));

    console.log("✅ Run type analytics loaded");
    return result;
  } catch (error) {
    console.error("❌ Error fetching run type analytics:", error);
    throw error;
  }
}

/**
 * Get time-based analytics (hourly distribution)
 */
export async function getTimeAnalytics(): Promise<TimeAnalytics[]> {
  console.log("🔍 Fetching time analytics...");

  try {
    const { data: sessions, error } = await supabase
      .from("running_sessions")
      .select("*");

    if (error) throw error;

    const hourlyMap = new Map<
      number,
      {
        sessions: number;
        users: Set<string>;
        totalDuration: number;
      }
    >();

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, { sessions: 0, users: new Set(), totalDuration: 0 });
    }

    sessions?.forEach((session) => {
      const hour = new Date(session.session_start_time).getHours();
      const entry = hourlyMap.get(hour)!;
      entry.sessions++;
      entry.users.add(session.user_id);
      entry.totalDuration += session.session_duration_seconds || 0;
    });

    const result: TimeAnalytics[] = Array.from(hourlyMap.entries()).map(
      ([hour, data]) => ({
        hour,
        sessions: data.sessions,
        users: data.users.size,
        avgDuration:
          data.sessions > 0
            ? Math.round(data.totalDuration / data.sessions)
            : 0,
      })
    );

    console.log("✅ Time analytics loaded");
    return result;
  } catch (error) {
    console.error("❌ Error fetching time analytics:", error);
    throw error;
  }
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  console.log("🔍 Fetching performance metrics...");

  try {
    const { data: sessions, error } = await supabase
      .from("running_sessions")
      .select("*");

    if (error) throw error;

    let totalPace = 0;
    let paceCount = 0;
    let totalHeartRate = 0;
    let hrCount = 0;
    let totalCadence = 0;
    let cadenceCount = 0;
    let totalSpeed = 0;
    let speedCount = 0;
    let totalCalories = 0;
    let totalSteps = 0;

    sessions?.forEach((session) => {
      if (session.avg_pace_min_per_km) {
        totalPace += session.avg_pace_min_per_km;
        paceCount++;
      }
      if (session.avg_heart_rate_bpm) {
        totalHeartRate += session.avg_heart_rate_bpm;
        hrCount++;
      }
      if (session.avg_cadence_spm) {
        totalCadence += session.avg_cadence_spm;
        cadenceCount++;
      }
      if (session.avg_speed_kmh) {
        totalSpeed += session.avg_speed_kmh;
        speedCount++;
      }
      totalCalories += session.calories_burned || 0;
      totalSteps += session.total_steps || 0;
    });

    const metrics: PerformanceMetrics = {
      avgPace: paceCount > 0 ? Number((totalPace / paceCount).toFixed(2)) : 0,
      avgHeartRate: hrCount > 0 ? Math.round(totalHeartRate / hrCount) : 0,
      avgCadence:
        cadenceCount > 0 ? Math.round(totalCadence / cadenceCount) : 0,
      avgSpeed:
        speedCount > 0 ? Number((totalSpeed / speedCount).toFixed(2)) : 0,
      totalCalories,
      totalSteps,
    };

    console.log("✅ Performance metrics loaded");
    return metrics;
  } catch (error) {
    console.error("❌ Error fetching performance metrics:", error);
    throw error;
  }
}
