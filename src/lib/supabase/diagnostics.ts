/**
 * Database Diagnostic Tool
 * Check what tables exist and their structure
 */

import { supabase } from "./client";

export async function checkDatabaseStructure() {
  console.log("🔍 Checking database structure...");

  // Check if we can connect
  try {
    const { error: testError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ Cannot connect to users table:", testError);
    } else {
      console.log("✅ Connected to users table");
    }
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }

  // Check listening_events table
  try {
    const { data: events, error: eventsError } = await supabase
      .from("listening_events")
      .select("*")
      .limit(1);

    if (eventsError) {
      console.error("❌ Cannot read listening_events:", eventsError);
    } else {
      console.log("✅ listening_events table accessible");
      if (events && events.length > 0) {
        console.log("📊 Sample event columns:", Object.keys(events[0]));
      }
    }
  } catch (error) {
    console.error("❌ listening_events query failed:", error);
  }

  // Try to get table info from information_schema (if accessible)
  try {
    const { data: tables, error: tablesError } = await supabase.rpc(
      "get_tables_info"
    );

    if (!tablesError && tables) {
      console.log("📋 Available tables:", tables);
    }
  } catch {
    // Ignore - not all projects have this function
  }
}
