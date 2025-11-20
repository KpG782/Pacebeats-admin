/**
 * Supabase Database Type Definitions
 * Auto-generated type-safe database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
          age: number | null;
          weight_kg: number | null;
          height_cm: number | null;
          run_frequency: string | null;
          pump_up_genres: string[] | null;
          survey_completed: boolean;
          survey_completed_at: string | null;
          username: string | null;
          gender: string | null;
          provider: string | null;
          experience_duration: string | null;
          pace_band: string | null;
          unknown_pace: boolean;
          preferred_genres: string[] | null;
          spotify_access_token: string | null;
          spotify_refresh_token: string | null;
          spotify_connected_at: string | null;
          spotify_token_expires_at: string | null;
          spotify_user_id: string | null;
          height_unit: string;
          weight_unit: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          created_at?: string;
          age?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          run_frequency?: string | null;
          pump_up_genres?: string[] | null;
          survey_completed?: boolean;
          survey_completed_at?: string | null;
          username?: string | null;
          gender?: string | null;
          provider?: string | null;
          experience_duration?: string | null;
          pace_band?: string | null;
          unknown_pace?: boolean;
          preferred_genres?: string[] | null;
          spotify_access_token?: string | null;
          spotify_refresh_token?: string | null;
          spotify_connected_at?: string | null;
          spotify_token_expires_at?: string | null;
          spotify_user_id?: string | null;
          height_unit?: string;
          weight_unit?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
          age?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          run_frequency?: string | null;
          pump_up_genres?: string[] | null;
          survey_completed?: boolean;
          survey_completed_at?: string | null;
          username?: string | null;
          gender?: string | null;
          provider?: string | null;
          experience_duration?: string | null;
          pace_band?: string | null;
          unknown_pace?: boolean;
          preferred_genres?: string[] | null;
          spotify_access_token?: string | null;
          spotify_refresh_token?: string | null;
          spotify_connected_at?: string | null;
          spotify_token_expires_at?: string | null;
          spotify_user_id?: string | null;
          height_unit?: string;
          weight_unit?: string;
        };
      };
      music: {
        Row: {
          track_id: string;
          name: string | null;
          artist: string | null;
          spotify_preview_url: string | null;
          spotify_id: string | null;
          tags: string | null;
          genre: string | null;
          year: number | null;
          duration_ms: number | null;
          danceability: number | null;
          energy: number | null;
          key: string | null;
          loudness: number | null;
          mode: string | null;
          speechiness: number | null;
          acousticness: number | null;
          instrumentalness: string | null;
          liveness: number | null;
          valence: number | null;
          tempo: number | null;
          time_signature: number | null;
          mood: string | null;
        };
        Insert: {
          track_id?: string;
          name?: string | null;
          artist?: string | null;
          spotify_preview_url?: string | null;
          spotify_id?: string | null;
          tags?: string | null;
          genre?: string | null;
          year?: number | null;
          duration_ms?: number | null;
          danceability?: number | null;
          energy?: number | null;
          key?: string | null;
          loudness?: number | null;
          mode?: string | null;
          speechiness?: number | null;
          acousticness?: number | null;
          instrumentalness?: string | null;
          liveness?: number | null;
          valence?: number | null;
          tempo?: number | null;
          time_signature?: number | null;
          mood?: string | null;
        };
        Update: {
          track_id?: string;
          name?: string | null;
          artist?: string | null;
          spotify_preview_url?: string | null;
          spotify_id?: string | null;
          tags?: string | null;
          genre?: string | null;
          year?: number | null;
          duration_ms?: number | null;
          danceability?: number | null;
          energy?: number | null;
          key?: string | null;
          loudness?: number | null;
          mode?: string | null;
          speechiness?: number | null;
          acousticness?: number | null;
          instrumentalness?: string | null;
          liveness?: number | null;
          valence?: number | null;
          tempo?: number | null;
          time_signature?: number | null;
          mood?: string | null;
        };
      };
      listening_events: {
        Row: {
          session_id: string;
          user_id: string;
          ts_start: string;
          ts_end: string | null;
          track_id: string;
          played_ms: number | null;
          completed: boolean | null;
          skipped: boolean | null;
          liked: boolean | null;
          disliked: boolean | null;
        };
        Insert: {
          session_id: string;
          user_id: string;
          ts_start: string;
          ts_end?: string | null;
          track_id: string;
          played_ms?: number | null;
          completed?: boolean | null;
          skipped?: boolean | null;
          liked?: boolean | null;
          disliked?: boolean | null;
        };
        Update: {
          session_id?: string;
          user_id?: string;
          ts_start?: string;
          ts_end?: string | null;
          track_id?: string;
          played_ms?: number | null;
          completed?: boolean | null;
          skipped?: boolean | null;
          liked?: boolean | null;
          disliked?: boolean | null;
        };
      };
      recommendation_served: {
        Row: {
          session_id: string | null;
          user_id: string | null;
          ts: string | null;
          track_id: string | null;
          rank: number | null;
          bpm_center: number | null;
          pace_min: number | null;
          user_mood: string | null;
          candidate_score: number | null;
          run_mode: string | null;
          target_pace_min: number | null;
        };
        Insert: {
          session_id?: string | null;
          user_id?: string | null;
          ts?: string | null;
          track_id?: string | null;
          rank?: number | null;
          bpm_center?: number | null;
          pace_min?: number | null;
          user_mood?: string | null;
          candidate_score?: number | null;
          run_mode?: string | null;
          target_pace_min?: number | null;
        };
        Update: {
          session_id?: string | null;
          user_id?: string | null;
          ts?: string | null;
          track_id?: string | null;
          rank?: number | null;
          bpm_center?: number | null;
          pace_min?: number | null;
          user_mood?: string | null;
          candidate_score?: number | null;
          run_mode?: string | null;
          target_pace_min?: number | null;
        };
      };
      session_heart_rate_data: {
        Row: {
          id: number;
          session_id: string;
          timestamp_offset_seconds: number;
          heart_rate_bpm: number;
          is_connected: boolean | null;
          recorded_at: string | null;
        };
        Insert: {
          id?: number;
          session_id: string;
          timestamp_offset_seconds: number;
          heart_rate_bpm: number;
          is_connected?: boolean | null;
          recorded_at?: string | null;
        };
        Update: {
          id?: number;
          session_id?: string;
          timestamp_offset_seconds?: number;
          heart_rate_bpm?: number;
          is_connected?: boolean | null;
          recorded_at?: string | null;
        };
      };
      running_sessions: {
        Row: {
          id: string;
          user_id: string;
          start_time: string;
          end_time: string | null;
          distance_meters: number | null;
          duration_seconds: number | null;
          avg_pace_min_per_km: number | null;
          avg_heart_rate: number | null;
          calories_burned: number | null;
          route_polyline: string | null;
          status: "active" | "completed" | "paused" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_time: string;
          end_time?: string | null;
          distance_meters?: number | null;
          duration_seconds?: number | null;
          avg_pace_min_per_km?: number | null;
          avg_heart_rate?: number | null;
          calories_burned?: number | null;
          route_polyline?: string | null;
          status: "active" | "completed" | "paused" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_time?: string;
          end_time?: string | null;
          distance_meters?: number | null;
          duration_seconds?: number | null;
          avg_pace_min_per_km?: number | null;
          avg_heart_rate?: number | null;
          calories_burned?: number | null;
          route_polyline?: string | null;
          status?: "active" | "completed" | "paused" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
