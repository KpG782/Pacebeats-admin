// Music database types based on the new schema
export interface MusicTrack {
  track_id: string;
  name: string;
  artist: string;
  spotify_preview_url?: string;
  spotify_id?: string;
  tags?: string;
  genre?: string;
  year?: number;
  duration_ms?: number;
  danceability?: number;
  energy?: number;
  key?: string;
  loudness?: number;
  mode?: string;
  speechiness?: number;
  acousticness?: number;
  instrumentalness?: string;
  liveness?: number;
  valence?: number;
  tempo?: number;
  time_signature?: number;
  mood?: string;
}

// Helper to map database columns to display format
export function formatMusicTrack(track: MusicTrack) {
  return {
    id: track.track_id,
    track_name: track.name,
    artist_name: track.artist,
    spotify_preview_url: track.spotify_preview_url,
    spotify_id: track.spotify_id,
    tags: track.tags?.split(",").map((t) => t.trim()) || [],
    genre: track.genre || "Unknown",
    year: track.year,
    duration_ms: track.duration_ms || 0,
    danceability: track.danceability || 0,
    energy: track.energy || 0,
    key: track.key,
    loudness: track.loudness,
    mode: track.mode,
    speechiness: track.speechiness,
    acousticness: track.acousticness,
    instrumentalness: parseFloat(track.instrumentalness || "0"),
    liveness: track.liveness,
    valence: track.valence,
    tempo: track.tempo,
    time_signature: track.time_signature,
    mood: track.mood || "Neutral",
    // Derived fields
    bpm: Math.round(track.tempo || 0),
    energy_level: Math.round((track.energy || 0) * 10),
  };
}

// Calculate duration in MM:SS format
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// Get energy level label
export function getEnergyLabel(energy: number): string {
  if (energy >= 0.8) return "Very High";
  if (energy >= 0.6) return "High";
  if (energy >= 0.4) return "Medium";
  if (energy >= 0.2) return "Low";
  return "Very Low";
}

// Get mood from valence and energy (6 moods optimized for workout/focus)
export function getMoodFromAttributes(valence: number, energy: number): string {
  // High energy, high valence - upbeat and motivating
  if (energy >= 0.7 && valence >= 0.6) return "Happy";
  // High energy, low valence - intense and powerful
  if (energy >= 0.7 && valence < 0.4) return "Angry";
  // High energy, medium valence - exciting and dynamic
  if (energy >= 0.65 && valence >= 0.4 && valence < 0.6) return "Hype";
  // Medium-low energy, high valence - relaxed and positive
  if (energy < 0.5 && valence >= 0.5) return "Chill";
  // Low energy, low valence - melancholic
  if (energy < 0.5 && valence < 0.4) return "Sad";
  // Medium energy, any valence - concentration music
  return "Focus";
}

// All possible moods (6 moods for PaceBeats)
export const MOODS = [
  { name: "Happy", color: "#FCD34D", description: "Upbeat and joyful" },
  { name: "Sad", color: "#3B82F6", description: "Melancholic and emotional" },
  { name: "Chill", color: "#10B981", description: "Relaxed and calm" },
  { name: "Hype", color: "#F97316", description: "Energetic and exciting" },
  { name: "Focus", color: "#6366F1", description: "Concentration and flow" },
  { name: "Angry", color: "#DC2626", description: "Intense and aggressive" },
] as const;

// Common music genres with colors
export const GENRES = [
  { name: "Pop", color: "#EC4899" },
  { name: "Rock", color: "#EF4444" },
  { name: "Hip-Hop", color: "#8B5CF6" },
  { name: "Rap", color: "#7C3AED" },
  { name: "Electronic", color: "#06B6D4" },
  { name: "EDM", color: "#0EA5E9" },
  { name: "Dance", color: "#14B8A6" },
  { name: "R&B", color: "#F59E0B" },
  { name: "Soul", color: "#A855F7" },
  { name: "Country", color: "#84CC16" },
  { name: "Jazz", color: "#6366F1" },
  { name: "Classical", color: "#8B5CF6" },
  { name: "Reggae", color: "#10B981" },
  { name: "Latin", color: "#F97316" },
  { name: "Metal", color: "#DC2626" },
  { name: "Folk", color: "#059669" },
  { name: "Blues", color: "#3B82F6" },
  { name: "Indie", color: "#14B8A6" },
  { name: "Alternative", color: "#6366F1" },
  { name: "Punk", color: "#EF4444" },
] as const;

// Get mood color
export function getMoodColor(mood: string): string {
  const moodData = MOODS.find(
    (m) => m.name.toLowerCase() === mood.toLowerCase()
  );
  return moodData?.color || "#6B7280";
}

// Get genre color
export function getGenreColor(genre: string): string {
  const genreData = GENRES.find(
    (g) => g.name.toLowerCase() === genre.toLowerCase()
  );
  return genreData?.color || "#6B7280";
}
