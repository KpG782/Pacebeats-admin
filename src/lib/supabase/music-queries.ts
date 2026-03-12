import { supabase } from "./client";

export interface MusicLibraryTrack {
  track_id: string;
  name: string;
  artist: string;
  genre: string;
  mood: string;
  duration_ms: number;
  tempo: number | null;
  energy: number | null;
  year: number | null;
  spotify_id: string | null;
  spotify_preview_url: string | null;
  tags: string | null;
  total_plays: number;
  unique_listeners: number;
  completion_rate: number;
  likes: number;
}

export interface MusicLibraryStats {
  totalTracks: number;
  totalPlays: number;
  avgTempo: number;
  avgEnergy: number;
  genresCount: number;
}

export interface MusicLibraryData {
  tracks: MusicLibraryTrack[];
  stats: MusicLibraryStats;
}

export interface MusicListeningEvent {
  event_key: string;
  session_id: string;
  user_id: string | null;
  ts_start: string;
  ts_end: string | null;
  played_ms: number | null;
  completed: boolean | null;
  skipped: boolean | null;
  liked: boolean | null;
  disliked: boolean | null;
}

export interface MusicTrackDetail extends MusicLibraryTrack {
  events: MusicListeningEvent[];
}

type MusicRow = {
  track_id: string;
  name: string | null;
  artist: string | null;
  spotify_preview_url: string | null;
  spotify_id: string | null;
  tags: string | null;
  genre: string | null;
  year: number | null;
  duration_ms: number | null;
  energy: number | null;
  tempo: number | null;
  mood: string | null;
};

type ListeningEventRow = {
  session_id: string | null;
  user_id: string | null;
  ts_start: string;
  ts_end: string | null;
  track_id: string | null;
  played_ms: number | null;
  completed: boolean | null;
  skipped: boolean | null;
  liked: boolean | null;
  disliked: boolean | null;
};

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function mapTrack(
  row: MusicRow,
  events: ListeningEventRow[] = []
): MusicLibraryTrack {
  const uniqueListeners = new Set(events.map((event) => event.user_id)).size;
  const completionRate =
    events.length > 0
      ? round(
          (events.filter((event) => event.completed).length / events.length) * 100
        )
      : 0;

  return {
    track_id: row.track_id,
    name: row.name || "Unknown track",
    artist: row.artist || "Unknown artist",
    genre: row.genre || "Uncategorized",
    mood: row.mood || "Unknown",
    duration_ms: row.duration_ms || 0,
    tempo: row.tempo,
    energy: row.energy,
    year: row.year,
    spotify_id: row.spotify_id,
    spotify_preview_url: row.spotify_preview_url,
    tags: row.tags,
    total_plays: events.length,
    unique_listeners: uniqueListeners,
    completion_rate: completionRate,
    likes: events.filter((event) => event.liked).length,
  };
}

export async function getMusicLibraryData(): Promise<MusicLibraryData> {
  const [{ data: musicRows, error: musicError }, listeningEventsResult] =
    await Promise.all([
      supabase
        .from("music")
        .select(
          "track_id, name, artist, spotify_preview_url, spotify_id, tags, genre, year, duration_ms, energy, tempo, mood"
        )
        .order("name", { ascending: true }),
      supabase
        .from("listening_events")
        .select(
          "session_id, user_id, ts_start, ts_end, track_id, played_ms, completed, skipped, liked, disliked"
        ),
    ]);

  if (musicError) {
    throw musicError;
  }

  const eventRows =
    listeningEventsResult.error || !listeningEventsResult.data
      ? []
      : listeningEventsResult.data;

  const eventsByTrack = new Map<string, ListeningEventRow[]>();
  (eventRows || []).forEach((event) => {
    const list = eventsByTrack.get(event.track_id) || [];
    list.push(event);
    eventsByTrack.set(event.track_id, list);
  });

  const tracks = ((musicRows || []) as MusicRow[]).map((row) =>
    mapTrack(row, eventsByTrack.get(row.track_id) || [])
  );

  const totalPlays = tracks.reduce((sum, track) => sum + track.total_plays, 0);
  const avgTempo =
    tracks.filter((track) => typeof track.tempo === "number").length > 0
      ? round(
          tracks.reduce((sum, track) => sum + (track.tempo || 0), 0) /
            tracks.filter((track) => typeof track.tempo === "number").length
        )
      : 0;
  const avgEnergy =
    tracks.filter((track) => typeof track.energy === "number").length > 0
      ? round(
          tracks.reduce((sum, track) => sum + (track.energy || 0), 0) /
            tracks.filter((track) => typeof track.energy === "number").length
        )
      : 0;

  return {
    tracks,
    stats: {
      totalTracks: tracks.length,
      totalPlays,
      avgTempo,
      avgEnergy,
      genresCount: new Set(tracks.map((track) => track.genre)).size,
    },
  };
}

export async function getMusicTrackDetail(
  trackId: string
): Promise<MusicTrackDetail | null> {
  const [{ data: musicRow, error: musicError }, listeningEventsResult] =
    await Promise.all([
      supabase
        .from("music")
        .select(
          "track_id, name, artist, spotify_preview_url, spotify_id, tags, genre, year, duration_ms, energy, tempo, mood"
        )
        .eq("track_id", trackId)
        .single(),
      supabase
        .from("listening_events")
        .select(
          "session_id, user_id, ts_start, ts_end, track_id, played_ms, completed, skipped, liked, disliked"
        )
        .eq("track_id", trackId)
        .order("ts_start", { ascending: false }),
    ]);

  if (musicError) {
    if (musicError.code === "PGRST116") {
      return null;
    }
    throw musicError;
  }

  const eventRows =
    listeningEventsResult.error || !listeningEventsResult.data
      ? []
      : listeningEventsResult.data;

  const track = mapTrack(musicRow as MusicRow, (eventRows || []) as ListeningEventRow[]);

  return {
    ...track,
    events: ((eventRows || []) as ListeningEventRow[]).map((event) => ({
      event_key: `${event.track_id || trackId}-${event.user_id || "anon"}-${
        event.session_id || "no-session"
      }-${event.ts_start}`,
      session_id: event.session_id || "",
      user_id: event.user_id,
      ts_start: event.ts_start,
      ts_end: event.ts_end,
      played_ms: event.played_ms,
      completed: event.completed,
      skipped: event.skipped,
      liked: event.liked,
      disliked: event.disliked,
    })),
  };
}
