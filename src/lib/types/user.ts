// Complete User type matching admin.md schema
export interface User {
  // Identity
  id: string;
  email: string;
  username: string;
  avatar_url?: string;

  // Profile (from onboarding)
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  age?: number;
  height?: number;
  height_unit?: "cm" | "ft";
  weight?: number;
  weight_unit?: "kg" | "lbs";

  // Running preferences
  running_experience?: "beginner" | "intermediate" | "advanced";
  pace_band?: string; // e.g., "5:00-6:00 min/km"
  preferred_genres?: string[]; // ["Electronic", "Hip Hop"]

  // Status & Metadata
  status: "active" | "inactive" | "suspended" | "deleted";
  created_at: string;
  last_login_at?: string;
  onboarding_completed: boolean;

  // Statistics (computed)
  total_runs: number;
  total_distance_km: number;
  total_duration_minutes: number;
  avg_pace?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  status: "active" | "paused" | "completed" | "cancelled";
  total_distance_meters: number;
  avg_pace_per_km: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  calories_burned?: number;
  steps_count?: number;
}

export interface UserActivity {
  id: string;
  user_id: string;
  event_type:
    | "login"
    | "logout"
    | "profile_update"
    | "session_start"
    | "session_complete"
    | "settings_change";
  event_data?: any;
  created_at: string;
}

export interface UserFormData {
  email: string;
  username: string;
  avatar_url?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  age?: number;
  height?: number;
  height_unit?: "cm" | "ft";
  weight?: number;
  weight_unit?: "kg" | "lbs";
  running_experience?: "beginner" | "intermediate" | "advanced";
  pace_band?: string;
  preferred_genres?: string[];
  status: "active" | "inactive" | "suspended" | "deleted";
}
