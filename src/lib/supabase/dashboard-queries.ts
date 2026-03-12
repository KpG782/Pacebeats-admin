import { supabase } from "./client";

export interface DashboardMetricSnapshot {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  activeSessions: number;
  totalTracks: number;
  totalPlays: number;
  avgSessionDurationMinutes: number;
  avgSongsPerSession: number;
  avgCompletionRate: number;
  userRetentionRate: number;
  topGenre: string;
  topMood: string;
  topGenreTrackCount: number;
  topMoodTrackCount: number;
}

export interface DashboardActivityItem {
  id: string;
  type: "user_registered" | "session_completed" | "music_played";
  message: string;
  timestamp: string;
}

export interface DashboardTopTrack {
  id: string;
  name: string;
  artist: string;
  plays: number;
}

export interface DashboardStatusItem {
  label: string;
  status: "Operational" | "Degraded";
}

export interface DashboardData {
  metrics: DashboardMetricSnapshot;
  recentActivity: DashboardActivityItem[];
  topTracks: DashboardTopTrack[];
  statuses: DashboardStatusItem[];
}

type MusicRow = {
  track_id: string;
  name: string | null;
  artist: string | null;
  genre: string | null;
  mood: string | null;
};

type ListeningEventRow = {
  id: string;
  session_id: string;
  user_id: string;
  track_id: string;
  ts_start: string;
  completed: boolean | null;
  users?: Array<{
    username: string | null;
    email: string | null;
  }> | null;
  music?: Array<{
    name: string | null;
    artist: string | null;
  }> | null;
};

type RunningSessionRow = {
  id: string;
  user_id: string;
  session_start_time: string;
  created_at: string;
  session_duration_seconds: number | null;
  total_distance_km: number | null;
  status: "active" | "completed" | "paused" | "cancelled" | "pending";
  users?: Array<{
    username: string | null;
    email: string | null;
  }> | null;
};

type UserRow = {
  id: string;
  username: string | null;
  email: string | null;
  created_at: string;
};

const ACTIVE_USER_WINDOW_DAYS = 30;
const TOP_TRACK_EVENT_LIMIT = 1000;
const RECENT_ACTIVITY_LIMIT = 20;

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function firstRelation<T>(value?: T[] | null): T | null {
  return value && value.length > 0 ? value[0] : null;
}

function formatUserName(
  user?: { username: string | null; email: string | null } | null
) {
  return user?.username || user?.email || "Unknown user";
}

function formatTrackName(track?: { name: string | null; artist: string | null } | null) {
  if (!track?.name) return "Unknown track";
  return track.artist ? `${track.name} by ${track.artist}` : track.name;
}

export async function getDashboardData(): Promise<DashboardData> {
  const statuses: DashboardStatusItem[] = [
    { label: "API Server", status: "Operational" },
    { label: "Database", status: "Operational" },
    { label: "Music Catalog", status: "Operational" },
    { label: "Event Stream", status: "Operational" },
  ];

  const [
    usersResult,
    sessionsResult,
    musicResult,
    recentEventsResult,
    topTrackEventsResult,
    totalPlaysResult,
    recentUsersResult,
    recentSessionsResult,
  ] = await Promise.allSettled([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase
      .from("running_sessions")
      .select(
        "id, user_id, session_start_time, created_at, session_duration_seconds, total_distance_km, status",
        {
        count: "exact",
        }
      ),
    supabase.from("music").select("track_id, name, artist, genre, mood"),
    supabase
      .from("listening_events")
      .select(
        "id, session_id, user_id, track_id, ts_start, completed, users(username, email), music(name, artist)"
      )
      .order("ts_start", { ascending: false })
      .limit(RECENT_ACTIVITY_LIMIT),
    supabase
      .from("listening_events")
      .select("id, track_id")
      .order("ts_start", { ascending: false })
      .limit(TOP_TRACK_EVENT_LIMIT),
    supabase.from("listening_events").select("id", { count: "exact", head: true }),
    supabase
      .from("users")
      .select("id, username, email, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("running_sessions")
      .select(
        "id, user_id, session_start_time, created_at, session_duration_seconds, total_distance_km, status, users(username, email)"
      )
      .order("session_start_time", { ascending: false })
      .limit(6),
  ]);

  const usersCount =
    usersResult.status === "fulfilled" && !usersResult.value.error
      ? usersResult.value.count || 0
      : 0;

  if (usersResult.status === "rejected" || (usersResult.status === "fulfilled" && usersResult.value.error)) {
    statuses[1].status = "Degraded";
  }

  const sessions =
    sessionsResult.status === "fulfilled" && !sessionsResult.value.error
      ? (sessionsResult.value.data as RunningSessionRow[] | null) || []
      : [];

  if (sessionsResult.status === "rejected" || (sessionsResult.status === "fulfilled" && sessionsResult.value.error)) {
    statuses[1].status = "Degraded";
    statuses[3].status = "Degraded";
  }

  const music =
    musicResult.status === "fulfilled" && !musicResult.value.error
      ? (musicResult.value.data as MusicRow[] | null) || []
      : [];

  if (musicResult.status === "rejected" || (musicResult.status === "fulfilled" && musicResult.value.error)) {
    statuses[2].status = "Degraded";
  }

  const recentEvents =
    recentEventsResult.status === "fulfilled" && !recentEventsResult.value.error
      ? (recentEventsResult.value.data as ListeningEventRow[] | null) || []
      : [];

  if (
    recentEventsResult.status === "rejected" ||
    (recentEventsResult.status === "fulfilled" && recentEventsResult.value.error)
  ) {
    statuses[3].status = "Degraded";
  }

  const totalPlays =
    totalPlaysResult.status === "fulfilled" && !totalPlaysResult.value.error
      ? totalPlaysResult.value.count || 0
      : 0;

  const topTrackEvents =
    topTrackEventsResult.status === "fulfilled" && !topTrackEventsResult.value.error
      ? (topTrackEventsResult.value.data as Array<{ id: string; track_id: string }> | null) || []
      : [];

  const recentUsers =
    recentUsersResult.status === "fulfilled" && !recentUsersResult.value.error
      ? (recentUsersResult.value.data as UserRow[] | null) || []
      : [];

  const recentSessions =
    recentSessionsResult.status === "fulfilled" && !recentSessionsResult.value.error
      ? (recentSessionsResult.value.data as RunningSessionRow[] | null) || []
      : [];

  const activeSessions = sessions.filter((session) => session.status === "active").length;
  const completedSessions = sessions.filter((session) => session.status === "completed");
  const completedWithDuration = completedSessions.filter(
    (session) =>
      typeof session.session_duration_seconds === "number" &&
      session.session_duration_seconds > 0
  );
  const avgSessionDurationMinutes =
    completedWithDuration.length > 0
      ? round(
          completedWithDuration.reduce(
            (sum, session) => sum + (session.session_duration_seconds || 0),
            0
          ) /
            completedWithDuration.length /
            60
        )
      : 0;

  const activeUserCutoff = new Date();
  activeUserCutoff.setDate(activeUserCutoff.getDate() - ACTIVE_USER_WINDOW_DAYS);
  const activeUsers = new Set(
    sessions
      .filter((session) => new Date(session.session_start_time) >= activeUserCutoff)
      .map((session) => session.user_id)
  ).size;

  const musicById = new Map(music.map((track) => [track.track_id, track]));

  const topGenreCounts = new Map<string, number>();
  const topMoodCounts = new Map<string, number>();
  music.forEach((track) => {
    const genre = track.genre || "Uncategorized";
    const mood = track.mood || "Unknown";
    topGenreCounts.set(genre, (topGenreCounts.get(genre) || 0) + 1);
    topMoodCounts.set(mood, (topMoodCounts.get(mood) || 0) + 1);
  });

  const [topGenre = "No genre", topGenreTrackCount = 0] =
    [...topGenreCounts.entries()].sort((a, b) => b[1] - a[1])[0] || [];
  const [topMood = "No mood", topMoodTrackCount = 0] =
    [...topMoodCounts.entries()].sort((a, b) => b[1] - a[1])[0] || [];

  const eventsByTrack = new Map<string, number>();
  topTrackEvents.forEach((event) => {
    eventsByTrack.set(event.track_id, (eventsByTrack.get(event.track_id) || 0) + 1);
  });

  const topTracks = [...eventsByTrack.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([trackId, plays]) => {
      const track = musicById.get(trackId);
      return {
        id: trackId,
        name: track?.name || "Unknown track",
        artist: track?.artist || "Unknown artist",
        plays,
      };
    });

  const listeningEventsForCompletion = recentEvents;
  const completionRate =
    listeningEventsForCompletion.length > 0
      ? round(
          (listeningEventsForCompletion.filter((event) => event.completed).length /
            listeningEventsForCompletion.length) *
            100
        )
      : 0;

  const eventsBySession = new Map<string, number>();
  recentEvents.forEach((event) => {
    const count = eventsBySession.get(event.session_id) || 0;
    eventsBySession.set(event.session_id, count + 1);
  });

  const avgSongsPerSession =
    eventsBySession.size > 0
      ? round(
          [...eventsBySession.values()].reduce((sum, count) => sum + count, 0) /
            eventsBySession.size
        )
      : 0;

  const userRetentionRate =
    usersCount > 0 ? round((activeUsers / usersCount) * 100) : 0;

  const activityFromUsers: DashboardActivityItem[] = recentUsers.map((user) => ({
    id: `user-${user.id}`,
    type: "user_registered",
    message: `New user registered: ${formatUserName(user)}`,
    timestamp: user.created_at,
  }));

  const activityFromSessions: DashboardActivityItem[] = recentSessions.map((session) => ({
    id: `session-${session.id}`,
    type: "session_completed",
    message:
      session.status === "active"
        ? `Session started: ${formatUserName(firstRelation(session.users))}`
        : `Session ${session.status}: ${formatUserName(firstRelation(session.users))}${
            session.total_distance_km
              ? ` • ${Number(session.total_distance_km).toFixed(1)} km`
              : ""
          }`,
    timestamp: session.session_start_time || session.created_at,
  }));

  const activityFromEvents: DashboardActivityItem[] = recentEvents.slice(0, 8).map((event) => ({
    id: `play-${event.id}`,
    type: "music_played",
    message: `Track played: ${formatTrackName(firstRelation(event.music))} by ${formatUserName(
      firstRelation(event.users)
    )}`,
    timestamp: event.ts_start,
  }));

  const recentActivity = [...activityFromUsers, ...activityFromSessions, ...activityFromEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return {
    metrics: {
      totalUsers: usersCount,
      activeUsers,
      totalSessions: sessionsResult.status === "fulfilled" && !sessionsResult.value.error
        ? sessionsResult.value.count || sessions.length
        : sessions.length,
      activeSessions,
      totalTracks: music.length,
      totalPlays,
      avgSessionDurationMinutes,
      avgSongsPerSession,
      avgCompletionRate: completionRate,
      userRetentionRate,
      topGenre,
      topMood,
      topGenreTrackCount,
      topMoodTrackCount,
    },
    recentActivity,
    topTracks,
    statuses,
  };
}
