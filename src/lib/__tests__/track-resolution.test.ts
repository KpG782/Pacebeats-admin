import { describe, it, expect } from "vitest";
import {
  normalizeTrackKey,
  resolveTrack,
  buildTrackLookups,
  type MusicRow,
} from "../track-resolution";

// ---------------------------------------------------------------------------
// normalizeTrackKey
// ---------------------------------------------------------------------------

describe("normalizeTrackKey", () => {
  it("returns null for null input", () => {
    expect(normalizeTrackKey(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(normalizeTrackKey(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(normalizeTrackKey("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(normalizeTrackKey("   ")).toBeNull();
  });

  it("passes a plain Spotify ID through unchanged (lowercased)", () => {
    expect(normalizeTrackKey("6rqhFgbbKwnb9MLmUQDhG6")).toBe("6rqhfgbbkwnb9mlmuqdhg6");
  });

  it("strips spotify:track: URI prefix", () => {
    expect(normalizeTrackKey("spotify:track:6rqhFgbbKwnb9MLmUQDhG6")).toBe(
      "6rqhfgbbkwnb9mlmuqdhg6"
    );
  });

  it("strips https://open.spotify.com/track/ URL prefix", () => {
    expect(
      normalizeTrackKey("https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6")
    ).toBe("6rqhfgbbkwnb9mlmuqdhg6");
  });

  it("strips query-string from URL", () => {
    expect(
      normalizeTrackKey(
        "https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6?si=abc123"
      )
    ).toBe("6rqhfgbbkwnb9mlmuqdhg6");
  });

  it("strips trailing slash", () => {
    expect(normalizeTrackKey("6rqhFgbbKwnb9MLmUQDhG6/")).toBe("6rqhfgbbkwnb9mlmuqdhg6");
  });

  it("is case-insensitive (returns lower-case result)", () => {
    expect(normalizeTrackKey("SPOTIFY:TRACK:ABCDEF123")).toBe("abcdef123");
  });
});

// ---------------------------------------------------------------------------
// Shared fixture helpers
// ---------------------------------------------------------------------------

function makeMusic(overrides: Partial<MusicRow> = {}): MusicRow {
  return {
    track_id: "uuid-0001",
    spotify_id: null,
    name: "Test Song",
    artist: "Test Artist",
    genre: "Pop",
    mood: "Happy",
    tempo: 120,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// resolveTrack — lookup path 1: music.track_id
// ---------------------------------------------------------------------------

describe("resolveTrack – music.track_id lookup", () => {
  it("resolves when the event track_id matches music.track_id exactly", () => {
    const music = makeMusic({ track_id: "uuid-0001", name: "My Song", artist: "Band A" });
    const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups(
      [music],
      []
    );

    const result = resolveTrack("uuid-0001", musicById, musicBySpotifyId, historyBySpotifyId);
    expect(result).toEqual({ name: "My Song", artist: "Band A" });
  });

  it("ignores case differences in track_id", () => {
    const music = makeMusic({ track_id: "UUID-0001", name: "My Song", artist: "Band A" });
    const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups(
      [music],
      []
    );

    const result = resolveTrack("uuid-0001", musicById, musicBySpotifyId, historyBySpotifyId);
    expect(result).toEqual({ name: "My Song", artist: "Band A" });
  });
});

// ---------------------------------------------------------------------------
// resolveTrack — lookup path 2: music.spotify_id
// ---------------------------------------------------------------------------

describe("resolveTrack – music.spotify_id lookup", () => {
  it("resolves when the event track_id is a bare Spotify ID matching music.spotify_id", () => {
    const spotifyId = "6rqhFgbbKwnb9MLmUQDhG6";
    const music = makeMusic({
      track_id: "uuid-9999",    // different from the event's track_id
      spotify_id: spotifyId,
      name: "Summer Skin",
      artist: "Death Cab",
    });
    const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups(
      [music],
      []
    );

    // event stores the bare Spotify ID
    const result = resolveTrack(
      normalizeTrackKey(spotifyId)!,
      musicById,
      musicBySpotifyId,
      historyBySpotifyId
    );
    expect(result).toEqual({ name: "Summer Skin", artist: "Death Cab" });
  });

  it("resolves when the event track_id is a spotify:track: URI", () => {
    const spotifyId = "trackABC";
    const music = makeMusic({ track_id: "uuid-2", spotify_id: spotifyId, name: "URI Song" });
    const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups(
      [music],
      []
    );

    const eventTrackId = normalizeTrackKey(`spotify:track:${spotifyId}`)!;
    const result = resolveTrack(eventTrackId, musicById, musicBySpotifyId, historyBySpotifyId);
    expect(result.name).toBe("URI Song");
  });

  it("resolves when the event track_id is a full Spotify URL", () => {
    const spotifyId = "trackXYZ";
    const music = makeMusic({ track_id: "uuid-3", spotify_id: spotifyId, name: "URL Song" });
    const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups(
      [music],
      []
    );

    const eventTrackId = normalizeTrackKey(
      `https://open.spotify.com/track/${spotifyId}?si=foo`
    )!;
    const result = resolveTrack(eventTrackId, musicById, musicBySpotifyId, historyBySpotifyId);
    expect(result.name).toBe("URL Song");
  });
});

// ---------------------------------------------------------------------------
// resolveTrack — lookup path 3: session_music_history fallback
// ---------------------------------------------------------------------------

describe("resolveTrack – session_music_history fallback", () => {
  it("falls back to history when track is not in the music table", () => {
    const spotifyId = "missingFromMusic";
    const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups(
      [],  // empty music table
      [
        {
          spotify_track_id: spotifyId,
          track_title: "Highway Star",
          track_artist: "Deep Purple",
        },
      ]
    );

    const result = resolveTrack(
      normalizeTrackKey(spotifyId)!,
      musicById,
      musicBySpotifyId,
      historyBySpotifyId
    );
    expect(result).toEqual({ name: "Highway Star", artist: "Deep Purple" });
  });

  it("falls back to history when music row has null name", () => {
    const spotifyId = "nullNameTrack";
    const music = makeMusic({ track_id: "uuid-null", spotify_id: spotifyId, name: null });
    const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups(
      [music],
      [
        {
          spotify_track_id: spotifyId,
          track_title: "Invincible",
          track_artist: "Muse",
        },
      ]
    );

    const result = resolveTrack(
      normalizeTrackKey(spotifyId)!,
      musicById,
      musicBySpotifyId,
      historyBySpotifyId
    );
    expect(result).toEqual({ name: "Invincible", artist: "Muse" });
  });

  it("uses history entry where spotify_track_id is a URI format", () => {
    const rawId = "spotify:track:historySong";
    const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups(
      [],
      [
        {
          spotify_track_id: rawId,
          track_title: "ATWA",
          track_artist: "System of a Down",
        },
      ]
    );

    // The event track_id comes in as bare ID
    const eventId = normalizeTrackKey("historySong")!;
    const result = resolveTrack(eventId, musicById, musicBySpotifyId, historyBySpotifyId);
    expect(result).toEqual({ name: "ATWA", artist: "System of a Down" });
  });
});

// ---------------------------------------------------------------------------
// resolveTrack — Unknown track (no match anywhere)
// ---------------------------------------------------------------------------

describe("resolveTrack – Unknown track fallback", () => {
  it("returns Unknown track when ID exists in no source", () => {
    const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups([], []);
    const result = resolveTrack("totally-unknown-id", musicById, musicBySpotifyId, historyBySpotifyId);
    expect(result).toEqual({ name: "Unknown track", artist: "Unknown artist" });
  });

  it("returns Unknown track when history entry has null spotify_track_id", () => {
    // Tracks from local playback have no spotify_track_id in session_music_history
    const { musicById, musicBySpotifyId, historyBySpotifyId } = buildTrackLookups(
      [],
      [
        {
          spotify_track_id: null,   // local track — no Spotify ID to key on
          track_title: "Local File",
          track_artist: "Unknown",
        },
      ]
    );
    const result = resolveTrack("some-local-id", musicById, musicBySpotifyId, historyBySpotifyId);
    // Can't resolve because there's no key to match on
    expect(result.name).toBe("Unknown track");
  });
});

// ---------------------------------------------------------------------------
// buildTrackLookups — deduplication
// ---------------------------------------------------------------------------

describe("buildTrackLookups – deduplication", () => {
  it("keeps only the first history entry for a repeated spotify_track_id", () => {
    const { historyBySpotifyId } = buildTrackLookups(
      [],
      [
        { spotify_track_id: "dup-id", track_title: "First", track_artist: "A" },
        { spotify_track_id: "dup-id", track_title: "Second", track_artist: "B" },
      ]
    );
    expect(historyBySpotifyId.get("dup-id")?.name).toBe("First");
  });
});
