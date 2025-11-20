/**
 * Supabase Client Configuration
 * Handles authentication and database connections
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

/**
 * Create a new Supabase client instance
 * Useful for creating fresh client instances when needed
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

/**
 * Supabase client for browser-side operations
 * This client respects Row Level Security (RLS) policies
 */
export const supabase = createClient();

/**
 * Create a Supabase client for server-side rendering
 * Use this in API routes and server components
 */
export const createServerClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

// ==================== AUTH HELPERS ====================

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

// ==================== REALTIME HELPERS ====================

/**
 * Subscribe to real-time changes on a table
 */
export function subscribeToTable<T>(
  table: string,
  callback: (payload: {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    new: T;
    old: Partial<T>;
  }) => void,
  filter?: string
) {
  const channel = supabase.channel(`${table}-changes`);

  if (filter) {
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
          new: payload.new as T,
          old: payload.old as Partial<T>,
        });
      }
    );
  } else {
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
          new: payload.new as T,
          old: payload.old as Partial<T>,
        });
      }
    );
  }

  channel.subscribe();

  return channel;
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribeChannel(
  channel: ReturnType<typeof supabase.channel>
) {
  await supabase.removeChannel(channel);
}

// ==================== ERROR HANDLING ====================

/**
 * Format Supabase error for display
 */
export function formatSupabaseError(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as { message: string }).message;
  }
  return "An unknown error occurred";
}
