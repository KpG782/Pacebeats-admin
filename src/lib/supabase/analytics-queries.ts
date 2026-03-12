import { supabase } from "./client";
import {
  normalizeTrackKey,
  resolveTrack,
  buildTrackLookups,
  type MusicRow as ResolvedMusicRow,
} from "../track-resolution";

export type AnalyticsRange = "week" | "month" | "year" | "custom";

export interface AnalyticsStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalPlays: number;
  avgSessionDurationMinutes: number;
  userRetentionRate: number;
  avgTracksPerSession: number;
  avgCompletionRate: number;
}

export interface AnalyticsTopSong {
  id: string;
  name: string;
  artist: string;
  plays: number;
  listeners: number;
  completionRate: number;
}

export interface AnalyticsBreakdownItem {
  name: string;
  value: number;
  color: string;
  tracks: number;
  avgPlays: number;
}

export interface AnalyticsBpmItem {
  range: string;
  count: number;
  avgPlays: number;
}

export interface AnalyticsTrendPoint {
  label: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  avgDuration: number;
}

export interface AnalyticsSessionMetric {
  label: string;
  totalSessions: number;
  avgDuration: number;
  completedSessions: number;
  avgDistance: number;
}

export interface AnalyticsMusicEngagement {
  label: string;
  plays: number;
  uniqueListeners: number;
  avgCompletionRate: number;
  skipRate: number;
}

export interface AnalyticsCompletionPoint {
  label: string;
  completionRate: number;
  likedRate: number;
  totalPlays: number;
}

export interface AnalyticsPeakHour {
  hour: string;
  sessions: number;
  plays: number;
  users: number;
}

export interface AnalyticsData {
  stats: AnalyticsStats;
  topSongs: AnalyticsTopSong[];
  genreDistribution: AnalyticsBreakdownItem[];
  moodDistribution: AnalyticsBreakdownItem[];
  bpmDistribution: AnalyticsBpmItem[];
  userActivityTrend: AnalyticsTrendPoint[];
  sessionMetrics: AnalyticsSessionMetric[];
  musicEngagement: AnalyticsMusicEngagement[];
  completionTrend: AnalyticsCompletionPoint[];
  peakUsageHours: AnalyticsPeakHour[];
}

type UserRow = {
  id: string;
  created_at: string | null;
};

type SessionRow = {
  id: string;
  user_id: string;
  session_start_time: string;
  session_duration_seconds: number | null;
  total_distance_km: number | null;
  status: string | null;
};

type MusicRow = ResolvedMusicRow;

type ListeningEventRow = {
  session_id: string | null;
  user_id: string | null;
  ts_start: string | null;
  track_id: string | null;
  played_ms: number | null;
  completed: boolean | null;
  skipped: boolean | null;
  liked: boolean | null;
  disliked: boolean | null;
};

type SessionMusicHistoryRow = {
  spotify_track_id: string | null;
  track_title: string;
  track_artist: string | null;
  created_at: string | null;
};

const COLORS = [
  "oklch(0.55 0.18 250)",
  "oklch(0.65 0.15 200)",
  "oklch(0.70 0.12 180)",
  "oklch(0.60 0.16 220)",
  "oklch(0.50 0.20 260)",
  "oklch(0.75 0.10 200)",
];

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getRangeStart(range: AnalyticsRange) {
  const date = new Date();

  if (range === "week") {
    date.setDate(date.getDate() - 6);
  } else if (range === "year") {
    date.setFullYear(date.getFullYear() - 1);
    date.setMonth(date.getMonth() + 1);
  } else {
    date.setDate(date.getDate() - 29);
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function makeDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function makeMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function safeDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getBucketTemplate(range: AnalyticsRange) {
  if (range === "year") {
    const buckets: Array<{ key: string; label: string; start: Date; end: Date }> = [];
    const current = getRangeStart(range);

    for (let index = 0; index < 12; index += 1) {
      const start = new Date(current.getFullYear(), current.getMonth() + index, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      buckets.push({
        key: makeMonthKey(start),
        label: formatMonthLabel(start),
        start,
        end,
      });
    }

    return buckets;
  }

  const start = getRangeStart(range);
  const days = range === "week" ? 7 : 30;
  const buckets: Array<{ key: string; label: string; start: Date; end: Date }> = [];

  for (let index = 0; index < days; index += 1) {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() + index);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    buckets.push({
      key: makeDateKey(dayStart),
      label: formatDayLabel(dayStart),
      start: dayStart,
      end: dayEnd,
    });
  }

  return buckets;
}

function bucketKeyForDate(date: Date, range: AnalyticsRange) {
  return range === "year" ? makeMonthKey(date) : makeDateKey(date);
}

function createEmptyPeakHours() {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour: `${String(hour).padStart(2, "0")}:00`,
    sessions: 0,
    plays: 0,
    users: new Set<string>(),
  }));
}

function createBreakdown(
  eventRows: ListeningEventRow[],
  musicById: Map<string, MusicRow>,
  musicBySpotifyId: Map<string, MusicRow>,
  keyName: "genre" | "mood"
) {
  // Iterate events directly and resolve each to a music row so that play counts
  // are always accurate regardless of whether IDs match via track_id or spotify_id.
  const stats = new Map<string, { plays: number; uniqueTracks: Set<string> }>();

  for (const event of eventRows) {
    const key = normalizeTrackKey(event.track_id);
    if (!key) continue;

    const musicRow = musicById.get(key) ?? musicBySpotifyId.get(key);
    const category = (musicRow?.[keyName] as string | null | undefined) || `Unknown ${keyName}`;

    const current = stats.get(category) ?? { plays: 0, uniqueTracks: new Set<string>() };
    current.plays += 1;
    current.uniqueTracks.add(key);
    stats.set(category, current);
  }

  return [...stats.entries()]
    .map(([name, stat], index) => ({
      name,
      value: stat.plays,
      color: COLORS[index % COLORS.length],
      tracks: stat.uniqueTracks.size,
      avgPlays: stat.uniqueTracks.size > 0 ? round(stat.plays / stat.uniqueTracks.size) : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function getBpmRangeLabel(tempo: number | null) {
  if (tempo === null || Number.isNaN(tempo)) return "Unknown";
  if (tempo < 100) return "<100 BPM";
  if (tempo < 120) return "100-119 BPM";
  if (tempo < 140) return "120-139 BPM";
  if (tempo < 160) return "140-159 BPM";
  return "160+ BPM";
}

export async function getAnalyticsData(
  range: AnalyticsRange
): Promise<AnalyticsData> {
  const startDate = getRangeStart(range);
  const startIso = startDate.toISOString();

  const [
    totalUsersResult,
    usersResult,
    sessionsResult,
    musicResult,
    eventsResult,
    sessionMusicHistoryResult,
  ] = await Promise.allSettled([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id, created_at").gte("created_at", startIso),
    supabase
      .from("running_sessions")
      .select(
        "id, user_id, session_start_time, session_duration_seconds, total_distance_km, status"
      )
      .gte("session_start_time", startIso),
    supabase.from("music").select("track_id, spotify_id, name, artist, genre, mood, tempo"),
    supabase
      .from("listening_events")
      .select(
        "session_id, user_id, ts_start, track_id, played_ms, completed, skipped, liked, disliked"
      )
      .gte("ts_start", startIso),
    supabase
      .from("session_music_history")
      .select("spotify_track_id, track_title, track_artist, created_at")
      .gte("created_at", startIso),
  ]);

  const queryErrors: Record<string, unknown> = {};

  const totalUsers =
    totalUsersResult.status === "fulfilled" && !totalUsersResult.value.error
      ? totalUsersResult.value.count || 0
      : 0;
  if (
    totalUsersResult.status === "rejected" ||
    (totalUsersResult.status === "fulfilled" && totalUsersResult.value.error)
  ) {
    queryErrors.users_count =
      totalUsersResult.status === "rejected"
        ? totalUsersResult.reason
        : totalUsersResult.value.error;
  }

  const users =
    usersResult.status === "fulfilled" && !usersResult.value.error
      ? ((usersResult.value.data || []) as UserRow[])
      : [];
  if (
    usersResult.status === "rejected" ||
    (usersResult.status === "fulfilled" && usersResult.value.error)
  ) {
    queryErrors.users =
      usersResult.status === "rejected" ? usersResult.reason : usersResult.value.error;
  }

  const sessions =
    sessionsResult.status === "fulfilled" && !sessionsResult.value.error
      ? ((sessionsResult.value.data || []) as SessionRow[])
      : [];
  if (
    sessionsResult.status === "rejected" ||
    (sessionsResult.status === "fulfilled" && sessionsResult.value.error)
  ) {
    queryErrors.running_sessions =
      sessionsResult.status === "rejected"
        ? sessionsResult.reason
        : sessionsResult.value.error;
  }

  const musicRows =
    musicResult.status === "fulfilled" && !musicResult.value.error
      ? ((musicResult.value.data || []) as MusicRow[])
      : [];
  if (
    musicResult.status === "rejected" ||
    (musicResult.status === "fulfilled" && musicResult.value.error)
  ) {
    queryErrors.music =
      musicResult.status === "rejected" ? musicResult.reason : musicResult.value.error;
  }

  const eventRows =
    eventsResult.status === "fulfilled" && !eventsResult.value.error
      ? (((eventsResult.value.data || []) as ListeningEventRow[]).filter(
          (event) => event.ts_start
        ) as ListeningEventRow[])
      : [];
  if (
    eventsResult.status === "rejected" ||
    (eventsResult.status === "fulfilled" && eventsResult.value.error)
  ) {
    queryErrors.listening_events =
      eventsResult.status === "rejected"
        ? eventsResult.reason
        : eventsResult.value.error;
  }

  const sessionMusicHistory =
    sessionMusicHistoryResult.status === "fulfilled" &&
    !sessionMusicHistoryResult.value.error
      ? ((sessionMusicHistoryResult.value.data || []) as SessionMusicHistoryRow[])
      : [];
  if (
    sessionMusicHistoryResult.status === "rejected" ||
    (sessionMusicHistoryResult.status === "fulfilled" &&
      sessionMusicHistoryResult.value.error)
  ) {
    queryErrors.session_music_history =
      sessionMusicHistoryResult.status === "rejected"
        ? sessionMusicHistoryResult.reason
        : sessionMusicHistoryResult.value.error;
  }

  if (Object.keys(queryErrors).length > 0) {
    console.error("Analytics query degradation:", queryErrors);
  }

  const activeUsers = new Set(
    [
      ...sessions.map((session) => session.user_id),
      ...eventRows.map((event) => event.user_id).filter(Boolean),
    ].filter(Boolean)
  ).size;

  const completedEvents = eventRows.filter((event) => event.completed).length;
  const completionRate =
    eventRows.length > 0 ? round((completedEvents / eventRows.length) * 100) : 0;

  const completedSessions = sessions.filter(
    (session) => typeof session.session_duration_seconds === "number"
  );
  const avgSessionDurationMinutes =
    completedSessions.length > 0
      ? round(
          completedSessions.reduce(
            (sum, session) => sum + (session.session_duration_seconds || 0),
            0
          ) /
            completedSessions.length /
            60
        )
      : 0;

  const tracksPerSessionMap = new Map<string, number>();
  eventRows.forEach((event) => {
    if (!event.session_id) return;
    tracksPerSessionMap.set(
      event.session_id,
      (tracksPerSessionMap.get(event.session_id) || 0) + 1
    );
  });

  const avgTracksPerSession =
    sessions.length > 0
      ? round(
          [...tracksPerSessionMap.values()].reduce((sum, count) => sum + count, 0) /
            sessions.length
        )
      : 0;

  const stats: AnalyticsStats = {
    totalUsers,
    activeUsers,
    totalSessions: sessions.length,
    totalPlays: eventRows.length,
    avgSessionDurationMinutes,
    userRetentionRate: totalUsers > 0 ? round((activeUsers / totalUsers) * 100) : 0,
    avgTracksPerSession,
    avgCompletionRate: completionRate,
  };

  const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups(
    musicRows,
    sessionMusicHistory
  );

  const eventsByTrack = new Map<string, ListeningEventRow[]>();
  eventRows.forEach((event) => {
    const trackKey = normalizeTrackKey(event.track_id);
    if (!trackKey) return;
    const list = eventsByTrack.get(trackKey) || [];
    list.push(event);
    eventsByTrack.set(trackKey, list);
  });

  const topSongs = [...eventsByTrack.entries()]
    .map(([trackId, events]) => {
      const resolved = resolveTrack(trackId, musicById, musicBySpotifyId, historyBySpotifyId);

      // Diagnostic: log any track ID that couldn't be resolved so devs can
      // inspect the exact values in the browser console and patch source data.
      if (resolved.name === "Unknown track") {
        console.warn(
          "[analytics] Unresolved track_id — not found in music or session_music_history:",
          trackId
        );
      }

      const listeners = new Set(
        events.map((event) => event.user_id).filter(Boolean)
      ).size;

      return {
        id: trackId,
        name: resolved.name,
        artist: resolved.artist,
        plays: events.length,
        listeners,
        completionRate:
          events.length > 0
            ? round(
                (events.filter((event) => event.completed).length / events.length) * 100
              )
            : 0,
      };
    })
    .filter((track) => track.name !== "Unknown track")
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 10);

  const genreDistribution = createBreakdown(eventRows, musicById, musicBySpotifyId, "genre");
  const moodDistribution = createBreakdown(eventRows, musicById, musicBySpotifyId, "mood");

  const bpmBuckets = new Map<
    string,
    { count: number; totalPlays: number }
  >();
  musicRows.forEach((track) => {
    const bucket = getBpmRangeLabel(track.tempo);
    const current = bpmBuckets.get(bucket) || { count: 0, totalPlays: 0 };
    const normalizedTrackId = normalizeTrackKey(track.track_id);
    const normalizedSpotifyId = normalizeTrackKey(track.spotify_id);
    current.count += 1;
    current.totalPlays +=
      (
        eventsByTrack.get(normalizedTrackId ?? "") ||
        eventsByTrack.get(normalizedSpotifyId ?? "") ||
        []
      ).length;
    bpmBuckets.set(bucket, current);
  });

  const bpmOrder = ["<100 BPM", "100-119 BPM", "120-139 BPM", "140-159 BPM", "160+ BPM", "Unknown"];
  const bpmDistribution = bpmOrder
    .filter((label) => bpmBuckets.has(label))
    .map((label) => {
      const bucket = bpmBuckets.get(label)!;
      return {
        range: label,
        count: bucket.count,
        avgPlays: bucket.count > 0 ? round(bucket.totalPlays / bucket.count) : 0,
      };
    });

  const bucketTemplate = getBucketTemplate(range);
  const activityMap = new Map(
    bucketTemplate.map((bucket) => [
      bucket.key,
      {
        label: bucket.label,
        activeUsers: new Set<string>(),
        newUsers: 0,
        sessions: 0,
        totalDuration: 0,
        durationCount: 0,
        plays: 0,
        listeners: new Set<string>(),
        completedEvents: 0,
        skippedEvents: 0,
        likedEvents: 0,
        totalDistance: 0,
        distanceCount: 0,
        completedSessions: 0,
      },
    ])
  );

  users.forEach((user) => {
    const date = safeDate(user.created_at);
    if (!date) return;
    const bucket = activityMap.get(bucketKeyForDate(date, range));
    if (bucket) {
      bucket.newUsers += 1;
    }
  });

  sessions.forEach((session) => {
    const date = safeDate(session.session_start_time);
    if (!date) return;
    const bucket = activityMap.get(bucketKeyForDate(date, range));
    if (!bucket) return;

    bucket.sessions += 1;
    bucket.activeUsers.add(session.user_id);
    if (typeof session.session_duration_seconds === "number") {
      bucket.totalDuration += session.session_duration_seconds;
      bucket.durationCount += 1;
    }
    if (typeof session.total_distance_km === "number") {
      bucket.totalDistance += session.total_distance_km;
      bucket.distanceCount += 1;
    }
    if (session.status === "completed") {
      bucket.completedSessions += 1;
    }
  });

  eventRows.forEach((event) => {
    const date = safeDate(event.ts_start);
    if (!date) return;
    const bucket = activityMap.get(bucketKeyForDate(date, range));
    if (!bucket) return;

    bucket.plays += 1;
    if (event.user_id) {
      bucket.activeUsers.add(event.user_id);
      bucket.listeners.add(event.user_id);
    }
    if (event.completed) {
      bucket.completedEvents += 1;
    }
    if (event.skipped) {
      bucket.skippedEvents += 1;
    }
    if (event.liked) {
      bucket.likedEvents += 1;
    }
  });

  const userActivityTrend = bucketTemplate.map((bucket) => {
    const value = activityMap.get(bucket.key)!;
    return {
      label: value.label,
      activeUsers: value.activeUsers.size,
      newUsers: value.newUsers,
      sessions: value.sessions,
      avgDuration:
        value.durationCount > 0 ? round(value.totalDuration / value.durationCount) : 0,
    };
  });

  const sessionMetrics = bucketTemplate.map((bucket) => {
    const value = activityMap.get(bucket.key)!;
    return {
      label: value.label,
      totalSessions: value.sessions,
      avgDuration:
        value.durationCount > 0 ? round(value.totalDuration / value.durationCount) : 0,
      completedSessions: value.completedSessions,
      avgDistance:
        value.distanceCount > 0 ? round(value.totalDistance / value.distanceCount, 2) : 0,
    };
  });

  const musicEngagement = bucketTemplate.map((bucket) => {
    const value = activityMap.get(bucket.key)!;
    return {
      label: value.label,
      plays: value.plays,
      uniqueListeners: value.listeners.size,
      avgCompletionRate:
        value.plays > 0 ? round((value.completedEvents / value.plays) * 100) : 0,
      skipRate: value.plays > 0 ? round((value.skippedEvents / value.plays) * 100) : 0,
    };
  });

  const completionTrend = bucketTemplate.map((bucket) => {
    const value = activityMap.get(bucket.key)!;
    return {
      label: value.label,
      completionRate:
        value.plays > 0 ? round((value.completedEvents / value.plays) * 100) : 0,
      likedRate: value.plays > 0 ? round((value.likedEvents / value.plays) * 100) : 0,
      totalPlays: value.plays,
    };
  });

  const peakHours = createEmptyPeakHours();
  sessions.forEach((session) => {
    const date = safeDate(session.session_start_time);
    if (!date) return;
    peakHours[date.getHours()].sessions += 1;
    peakHours[date.getHours()].users.add(session.user_id);
  });
  eventRows.forEach((event) => {
    const date = safeDate(event.ts_start);
    if (!date) return;
    peakHours[date.getHours()].plays += 1;
    if (event.user_id) {
      peakHours[date.getHours()].users.add(event.user_id);
    }
  });

  const peakUsageHours = peakHours.map((hour) => ({
    hour: hour.hour,
    sessions: hour.sessions,
    plays: hour.plays,
    users: hour.users.size,
  }));

  return {
    stats,
    topSongs,
    genreDistribution,
    moodDistribution,
    bpmDistribution,
    userActivityTrend,
    sessionMetrics,
    musicEngagement,
    completionTrend,
    peakUsageHours,
  };
}
