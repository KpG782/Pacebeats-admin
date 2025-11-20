/**
 * Supabase Query Functions
 * Reusable database queries for the admin dashboard
 */

import { supabase } from "./client";
import type {
  User,
  Music,
  RunningSession,
  SessionHeartRateData,
  ListeningEvent,
  RecommendationServed,
  ActiveRunner,
  HeartRateAlert,
  PaginationParams,
  PaginatedResponse,
} from "./types";

// ==================== USERS ====================

export async function getUsers(params?: PaginationParams) {
  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params) {
    const { page, limit } = params;
    const start = (page - 1) * limit;
    query = query.range(start, start + limit - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  if (params) {
    return {
      data: data as User[],
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit),
    } as PaginatedResponse<User>;
  }

  return data as User[];
}

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as User;
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

// ==================== MUSIC ====================

export async function getMusic(params?: PaginationParams) {
  let query = supabase
    .from("music")
    .select("*", { count: "exact" })
    .order("name", { ascending: true });

  if (params) {
    const { page, limit } = params;
    const start = (page - 1) * limit;
    query = query.range(start, start + limit - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  if (params) {
    return {
      data: data as Music[],
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit),
    } as PaginatedResponse<Music>;
  }

  return data as Music[];
}

export async function getMusicByTrackId(trackId: string) {
  const { data, error } = await supabase
    .from("music")
    .select("*")
    .eq("track_id", trackId)
    .single();

  if (error) throw error;
  return data as Music;
}

// ==================== RUNNING SESSIONS ====================

export async function getActiveSessions() {
  const { data, error } = await supabase
    .from("running_sessions")
    .select("*, users(id, username, email)")
    .eq("status", "active")
    .order("start_time", { ascending: false });

  if (error) throw error;
  return data as unknown as (RunningSession & { users: Partial<User> })[];
}

export async function getSessionById(sessionId: string) {
  const { data, error } = await supabase
    .from("running_sessions")
    .select("*, users(id, username, email)")
    .eq("id", sessionId)
    .single();

  if (error) throw error;
  return data as unknown as RunningSession & { users: Partial<User> };
}

export async function getSessionsByUserId(
  userId: string,
  params?: PaginationParams
) {
  let query = supabase
    .from("running_sessions")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("start_time", { ascending: false });

  if (params) {
    const { page, limit } = params;
    const start = (page - 1) * limit;
    query = query.range(start, start + limit - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  if (params) {
    return {
      data: data as RunningSession[],
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit),
    } as PaginatedResponse<RunningSession>;
  }

  return data as RunningSession[];
}

// ==================== HEART RATE DATA ====================

export async function getSessionHeartRateData(sessionId: string) {
  const { data, error } = await supabase
    .from("session_heart_rate_data")
    .select("*")
    .eq("session_id", sessionId)
    .order("timestamp_offset_seconds", { ascending: true });

  if (error) throw error;
  return data as SessionHeartRateData[];
}

export async function getLatestHeartRateBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("session_heart_rate_data")
    .select("*")
    .eq("session_id", sessionId)
    .order("timestamp_offset_seconds", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data as SessionHeartRateData;
}

// ==================== IOT MONITORING ====================

/**
 * Get all active runners with their latest heart rate data
 */
export async function getActiveRunners(): Promise<ActiveRunner[]> {
  // Get active sessions with user info
  const { data: sessions, error: sessionsError } = await supabase
    .from("running_sessions")
    .select(
      `
      id,
      user_id,
      start_time,
      distance_meters,
      duration_seconds,
      avg_pace_min_per_km,
      users!inner(id, username)
    `
    )
    .eq("status", "active");

  if (sessionsError) throw sessionsError;

  // For each session, get the latest heart rate
  const runners = await Promise.all(
    (sessions || []).map(async (session) => {
      const { data: hrData } = await supabase
        .from("session_heart_rate_data")
        .select("heart_rate_bpm, recorded_at")
        .eq("session_id", session.id)
        .order("timestamp_offset_seconds", { ascending: false })
        .limit(1)
        .single();

      const heartRate = hrData?.heart_rate_bpm || 0;
      let status: "NORMAL" | "HIGH" | "CRITICAL" | "LOW" = "NORMAL";

      if (heartRate > 180) status = "CRITICAL";
      else if (heartRate > 160) status = "HIGH";
      else if (heartRate < 50 && heartRate > 0) status = "LOW";

      return {
        user_id: session.user_id,
        username:
          (session.users as unknown as { username: string }).username ||
          "Unknown",
        session_id: session.id,
        heart_rate: heartRate,
        status,
        last_update: hrData?.recorded_at || new Date().toISOString(),
        duration_seconds: session.duration_seconds || 0,
        distance_meters: session.distance_meters || 0,
        avg_pace: session.avg_pace_min_per_km,
      } as ActiveRunner;
    })
  );

  return runners;
}

/**
 * Create a heart rate alert
 */
export async function createHeartRateAlert(
  alert: Omit<HeartRateAlert, "id" | "created_at">
) {
  // Note: You'll need to create a 'heart_rate_alerts' table in Supabase
  const { data, error } = await supabase
    .from("heart_rate_alerts")
    .insert({
      user_id: alert.user_id,
      username: alert.username,
      session_id: alert.session_id,
      heart_rate: alert.heart_rate,
      severity: alert.severity,
      resolved: alert.resolved,
      resolved_at: alert.resolved_at,
    })
    .select()
    .single();

  if (error) throw error;
  return data as HeartRateAlert;
}

/**
 * Get unresolved heart rate alerts
 */
export async function getActiveAlerts(): Promise<HeartRateAlert[]> {
  const { data, error } = await supabase
    .from("heart_rate_alerts")
    .select("*")
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as HeartRateAlert[];
}

/**
 * Resolve a heart rate alert
 */
export async function resolveAlert(alertId: string) {
  const { data, error } = await supabase
    .from("heart_rate_alerts")
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", alertId)
    .select()
    .single();

  if (error) throw error;
  return data as HeartRateAlert;
}

// ==================== LISTENING EVENTS ====================

export async function getListeningEventsBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("listening_events")
    .select("*, music(*)")
    .eq("session_id", sessionId)
    .order("ts_start", { ascending: true });

  if (error) throw error;
  return data as unknown as (ListeningEvent & { music: Music })[];
}

// ==================== RECOMMENDATIONS ====================

export async function getRecommendationsBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("recommendation_served")
    .select("*, music(*)")
    .eq("session_id", sessionId)
    .order("rank", { ascending: true });

  if (error) throw error;
  return data as unknown as (RecommendationServed & { music: Music })[];
}

// ==================== ANALYTICS ====================

export async function getTotalUsers() {
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

export async function getTotalSessions() {
  const { count, error } = await supabase
    .from("running_sessions")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

export async function getActiveSessionsCount() {
  const { count, error } = await supabase
    .from("running_sessions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  if (error) throw error;
  return count || 0;
}
