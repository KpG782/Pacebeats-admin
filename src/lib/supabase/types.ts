/**
 * Supabase Database Schema Types
 * Generated from Supabase table definitions
 */

// ==================== USERS ====================
export interface User {
  id: string; // uuid - auth.uid()
  email: string | null;
  created_at: string; // timestamptz
  age: number | null; // int2
  weight_kg: number | null; // float4
  height_cm: number | null; // float4
  run_frequency: string | null;
  pump_up_genres: string[] | null; // text array
  survey_completed: boolean; // default: false
  survey_completed_at: string | null; // timestamp
  username: string | null;
  gender: string | null;
  provider: string | null;
  experience_duration: string | null;
  pace_band: string | null;
  unknown_pace: boolean; // default: false
  preferred_genres: string[] | null; // text array
  spotify_access_token: string | null;
  spotify_refresh_token: string | null;
  spotify_connected_at: string | null;
  spotify_token_expires_at: string | null;
  spotify_user_id: string | null;
  height_unit: string; // default: 'cm'
  weight_unit: string; // default: 'kg'
}

export type UserInsert = Omit<User, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type UserUpdate = Partial<UserInsert>;

// ==================== MUSIC ====================
export interface Music {
  track_id: string; // text - PRIMARY KEY
  name: string | null;
  artist: string | null;
  spotify_preview_url: string | null;
  spotify_id: string | null;
  tags: string | null;
  genre: string | null;
  year: number | null; // int8
  duration_ms: number | null; // int8
  danceability: number | null; // float8
  energy: number | null; // float8
  key: string | null;
  loudness: number | null; // float8
  mode: string | null;
  speechiness: number | null; // float8
  acousticness: number | null; // float8
  instrumentalness: string | null;
  liveness: number | null; // float8
  valence: number | null; // float8
  tempo: number | null; // float8
  time_signature: number | null; // int8
  mood: string | null; // varchar
}

export type MusicInsert = Omit<Music, 'track_id'> & {
  track_id?: string;
};

export type MusicUpdate = Partial<Music>;

// ==================== LISTENING EVENTS ====================
export interface ListeningEvent {
  session_id: string; // uuid - composite primary key
  user_id: string; // uuid - composite primary key
  ts_start: string; // timestamptz - composite primary key
  ts_end: string | null; // timestamptz - composite primary key
  track_id: string; // text - composite primary key
  played_ms: number | null; // int4
  completed: boolean | null;
  skipped: boolean | null;
  liked: boolean | null;
  disliked: boolean | null;
}

export type ListeningEventInsert = ListeningEvent;

export type ListeningEventUpdate = Partial<ListeningEvent>;

// ==================== RECOMMENDATION SERVED ====================
export interface RecommendationServed {
  session_id: string | null; // uuid
  user_id: string | null; // uuid
  ts: string | null; // timestamptz - default: now()
  track_id: string | null;
  rank: number | null; // integer
  bpm_center: number | null; // numeric
  pace_min: number | null; // numeric
  user_mood: string | null;
  candidate_score: number | null; // numeric
  run_mode: string | null;
  target_pace_min: number | null; // numeric
}

export type RecommendationServedInsert = Partial<RecommendationServed>;

export type RecommendationServedUpdate = Partial<RecommendationServed>;

// ==================== SESSION HEART RATE DATA ====================
export interface SessionHeartRateData {
  id: number; // bigserial - PRIMARY KEY
  session_id: string; // uuid - NOT NULL, foreign key to running_sessions
  timestamp_offset_seconds: number; // integer - NOT NULL
  heart_rate_bpm: number; // integer - NOT NULL, check: >= 40 AND <= 220
  is_connected: boolean | null; // default: true
  recorded_at: string | null; // timestamptz - default: now()
}

export interface SessionHeartRateDataInsert
  extends Omit<SessionHeartRateData, "id" | "recorded_at"> {
  id?: number;
  recorded_at?: string;
}

export type SessionHeartRateDataUpdate = Partial<SessionHeartRateDataInsert>;

// ==================== RUNNING SESSIONS ====================
// Note: This table is referenced by session_heart_rate_data
export interface RunningSession {
  id: string; // uuid - PRIMARY KEY
  user_id: string; // uuid - foreign key to users
  start_time: string; // timestamptz
  end_time: string | null; // timestamptz
  distance_meters: number | null; // float
  duration_seconds: number | null; // integer
  avg_pace_min_per_km: number | null; // numeric
  avg_heart_rate: number | null; // integer
  calories_burned: number | null; // integer
  route_polyline: string | null; // text (encoded polyline)
  status: "active" | "completed" | "paused" | "cancelled";
  created_at: string; // timestamptz - default: now()
  updated_at: string; // timestamptz - default: now()
}

export interface RunningSessionInsert
  extends Omit<RunningSession, "id" | "created_at" | "updated_at"> {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export type RunningSessionUpdate = Partial<RunningSessionInsert>;

// ==================== IOT MONITORING (Real-time Dashboard) ====================
// Extended types for IoT monitor dashboard
export interface ActiveRunner {
  user_id: string;
  username: string;
  session_id: string;
  heart_rate: number;
  status: "NORMAL" | "HIGH" | "CRITICAL" | "LOW";
  last_update: string;
  duration_seconds: number;
  distance_meters: number;
  avg_pace: number | null;
}

export interface HeartRateAlert {
  id: string;
  user_id: string;
  username: string;
  session_id: string;
  heart_rate: number;
  severity: "CRITICAL" | "HIGH" | "LOW";
  created_at: string;
  resolved: boolean;
  resolved_at: string | null;
}

// ==================== REALTIME SUBSCRIPTIONS ====================
export type RealtimeChannel =
  | "active_runners"
  | "heart_rate_alerts"
  | "sessions"
  | "listening_events";

export interface RealtimePayload<T> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: Partial<T>;
  errors: string[] | null;
}

// ==================== DATABASE ENUMS ====================
export type SessionStatus = "active" | "completed" | "paused" | "cancelled";
export type HeartRateStatus = "NORMAL" | "HIGH" | "CRITICAL" | "LOW";
export type AlertSeverity = "CRITICAL" | "HIGH" | "LOW";

// ==================== UTILITY TYPES ====================
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}
