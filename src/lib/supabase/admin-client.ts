/**
 * ============================================
 * SUPABASE ADMIN CLIENT (Server-Side Only)
 * ============================================
 *
 * This client uses the SERVICE_ROLE_KEY which:
 * ✅ Bypasses Row Level Security (RLS)
 * ✅ Has full admin privileges
 * ✅ Can read/write ALL data
 *
 * ⚠️ SECURITY WARNING:
 * - NEVER expose this key to the client
 * - Only use in API routes or server components
 * - Do NOT import in client components
 */

import { createClient } from "@supabase/supabase-js";

// Check if we're on the server side
const isServer = typeof window === "undefined";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only validate and initialize on the server side
let adminClient: ReturnType<typeof createClient> | null = null;

if (isServer) {
  if (!supabaseUrl) {
    console.error("❌ Missing env.NEXT_PUBLIC_SUPABASE_URL");
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseServiceKey) {
    console.error("❌ Missing env.SUPABASE_SERVICE_ROLE_KEY");
    throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");
  }

  console.log("✅ Admin client initialized with service_role_key");

  adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  // Client-side: throw a helpful error if accidentally used
  console.warn("⚠️ Admin client should not be used on the client side!");
}

/**
 * Admin Supabase client with full privileges
 *
 * Use this for:
 * - Admin dashboard queries (viewing all sessions)
 * - IoT Monitor (viewing all active runners)
 * - Analytics (aggregating all user data)
 * - User management (CRUD operations)
 *
 * @example
 * ```ts
 * import { supabaseAdmin } from '@/lib/supabase/admin-client';
 *
 * // Get all sessions (bypasses RLS)
 * const { data } = await supabaseAdmin
 *   .from('running_sessions')
 *   .select('*');
 * ```
 */
export const supabaseAdmin = adminClient as ReturnType<typeof createClient>;

export default supabaseAdmin;
