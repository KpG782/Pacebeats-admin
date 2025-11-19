// Complete Music types matching admin.md schema and Supabase tables

// Mood type - only 6 allowed moods
export type MoodType = "happy" | "sad" | "chill" | "hype" | "focus" | "angry";

export interface MusicTrack {
  // Core
  id: string;
  track_name: string;
  artist_name: string;
  album_name?: string;

  // Audio Properties
  duration_ms: number;
  spotify_id?: string;
  preview_url?: string;

  // Categorization
  genre: string;
  sub_genre?: string;
  mood: MoodType;
  energy_level: number; // 1-10

  // Running Metrics
  bpm: number;
  optimal_pace_min?: number; // seconds per km
  optimal_pace_max?: number;

  // Metadata
  release_date?: string;
  cover_image_url?: string;
  added_at: string;
  updated_at: string;

  // Stats (computed)
  total_plays: number;
  unique_listeners: number;
  avg_completion_rate?: number; // 0-100%
  is_active: boolean;
}

export interface ListeningEvent {
  id: string;
  session_id: string;
  track_id: string;
  user_id: string;

  // Playback Details
  played_at: string;
  play_duration_ms: number;
  completion_percentage: number;
  skipped: boolean;

  // Context
  user_pace_at_play?: number; // seconds per km
  user_heart_rate_at_play?: number;

  created_at: string;
}

export interface Genre {
  id: string;
  name: string;
  description?: string;
  track_count: number;
  color?: string; // for UI visualization
}

export interface Mood {
  id: string;
  name: MoodType;
  description?: string;
  energy_range: [number, number]; // min-max energy level
  track_count: number;
  color?: string;
}

// Statistics for music analytics
export interface MusicStats {
  total_tracks: number;
  total_plays: number;
  total_unique_listeners: number;
  avg_completion_rate: number;
  most_played_genre: string;
  most_played_mood: string;
  avg_bpm: number;
}

// Filter types
export interface MusicFilters {
  search?: string;
  genre?: string;
  mood?: MoodType;
  bpm_min?: number;
  bpm_max?: number;
  energy_min?: number;
  energy_max?: number;
  is_active?: boolean;
  sort_by?: "track_name" | "artist_name" | "total_plays" | "bpm" | "added_at";
  sort_order?: "asc" | "desc";
}

// Form data for creating/editing tracks
export interface MusicTrackFormData {
  track_name: string;
  artist_name: string;
  album_name?: string;
  duration_ms: number;
  spotify_id?: string;
  preview_url?: string;
  genre: string;
  sub_genre?: string;
  mood: MoodType;
  energy_level: number;
  bpm: number;
  optimal_pace_min?: number;
  optimal_pace_max?: number;
  release_date?: string;
  cover_image_url?: string;
  is_active: boolean;
}
