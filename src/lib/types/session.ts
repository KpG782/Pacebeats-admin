// Complete Session types matching admin.md schema

export interface RunningSession {
  // Core
  id: string;
  user_id: string;

  // Session Details
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  status: "active" | "paused" | "completed" | "cancelled";

  // Performance Metrics
  total_distance_meters: number;
  avg_pace_per_km: number; // seconds
  avg_heart_rate?: number;
  max_heart_rate?: number;
  calories_burned?: number;
  steps_count?: number;

  // GPS & Route
  start_location?: { lat: number; lng: number };
  end_location?: { lat: number; lng: number };
  route_polyline?: string; // encoded GPS points

  // Environment
  weather_condition?: string;
  temperature?: number;

  // Metadata
  created_at: string;

  // Populated fields (not in DB)
  user_name?: string;
  user_email?: string;
}

export interface SessionGPSPoint {
  id: string;
  session_id: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: string;
  created_at: string;
}

export interface SessionHeartRate {
  id: string;
  session_id: string;
  heart_rate: number;
  timestamp: string;
  created_at: string;
}

export interface SessionMusic {
  id: string;
  session_id: string;
  track_id: string;
  track_name: string;
  artist_name: string;
  played_at: string;
  duration_ms: number;
  completed: boolean;
}

// Session statistics for dashboard
export interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  failed_sessions: number;
  avg_duration_minutes: number;
  total_distance_km: number;
}

// Filter types
export interface SessionFilters {
  status?: "all" | "active" | "completed" | "paused" | "cancelled";
  date_from?: Date;
  date_to?: Date;
  user_id?: string;
  search?: string;
}
