/**
 * Pure, side-effect-free track resolution utilities.
 * Extracted so they can be unit-tested without a Supabase connection.
 */

export interface MusicRow {
  track_id: string;
  spotify_id: string | null;
  name: string | null;
  artist: string | null;
  genre: string | null;
  mood: string | null;
  tempo: number | null;
}

export interface HistoryEntry {
  name: string;
  artist: string | null;
}

/**
 * Normalises any Spotify-flavoured track identifier to a bare track ID string.
 *
 * Handles formats produced by the mobile app:
 *   - Plain Spotify ID       "6rqhFgbbKwnb9MLmUQDhG6"
 *   - URI                    "spotify:track:6rqhFgbbKwnb9MLmUQDhG6"
 *   - Web URL                "https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6"
 *   - Web URL with query     "https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6?si=abc"
 *   - Trailing slash         "6rqhFgbbKwnb9MLmUQDhG6/"
 *
 * Returns null for null / empty / whitespace-only inputs.
 */
export function normalizeTrackKey(value: string | null | undefined): string | null {
  if (!value) return null;

  return value
    .trim()
    .toLowerCase()
    .replace(/^spotify:track:/, "")
    .replace(/^https?:\/\/open\.spotify\.com\/track\//, "")
    .split("?")[0]
    .replace(/\/$/, "") || null;
}

/**
 * Resolves a track ID (from listening_events) to its display name and artist
 * using three data sources in priority order:
 *
 *  1. music table keyed by track_id (internal UUID)
 *  2. music table keyed by spotify_id
 *  3. session_music_history keyed by spotify_track_id (fallback for tracks
 *     not yet in the music catalogue)
 *
 * Returns { name: "Unknown track", artist: "Unknown artist" } when no source
 * can resolve the ID.
 */
export function resolveTrack(
  trackId: string,
  musicById: Map<string, MusicRow>,
  musicBySpotifyId: Map<string, MusicRow>,
  historyBySpotifyId: Map<string, HistoryEntry>
): { name: string; artist: string } {
  const musicRow = musicById.get(trackId) ?? musicBySpotifyId.get(trackId);
  if (musicRow?.name) {
    return {
      name: musicRow.name,
      artist: musicRow.artist ?? "Unknown artist",
    };
  }

  const historyEntry = historyBySpotifyId.get(trackId);
  if (historyEntry?.name) {
    return {
      name: historyEntry.name,
      artist: historyEntry.artist ?? "Unknown artist",
    };
  }

  return { name: "Unknown track", artist: "Unknown artist" };
}

/**
 * Builds the three lookup maps required by resolveTrack from raw query rows.
 * All keys are normalised via normalizeTrackKey so IDs in any Spotify format
 * match correctly.
 */
export function buildTrackLookups(
  musicRows: MusicRow[],
  historyRows: Array<{ spotify_track_id: string | null; track_title: string; track_artist: string | null }>
): {
  musicById: Map<string, MusicRow>;
  musicBySpotifyId: Map<string, MusicRow>;
  historyBySpotifyId: Map<string, HistoryEntry>;
} {
  const musicById = new Map<string, MusicRow>();
  const musicBySpotifyId = new Map<string, MusicRow>();

  for (const track of musicRows) {
    const normId = normalizeTrackKey(track.track_id);
    if (normId) musicById.set(normId, track);

    const normSpotify = normalizeTrackKey(track.spotify_id);
    if (normSpotify) musicBySpotifyId.set(normSpotify, track);
  }

  const historyBySpotifyId = new Map<string, HistoryEntry>();
  for (const entry of historyRows) {
    const key = normalizeTrackKey(entry.spotify_track_id);
    if (!key || historyBySpotifyId.has(key)) continue;
    historyBySpotifyId.set(key, {
      name: entry.track_title,
      artist: entry.track_artist,
    });
  }

  return { musicById, musicBySpotifyId, historyBySpotifyId };
}
