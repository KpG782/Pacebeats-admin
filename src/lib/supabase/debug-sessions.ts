/**
 * Debug Script for Sessions Query Issues
 * Run this to diagnose why sessions aren't loading
 */

import { supabase } from "./client";

export async function debugSessionsQuery() {
  console.log("🔍 Starting Sessions Query Debug...\n");

  // Test 1: Check authentication
  console.log("TEST 1: Authentication Status");
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) {
    console.error("❌ Auth Error:", authError);
    return { success: false, error: "Not authenticated" };
  }
  console.log("✅ Authenticated as:", user?.email || "Unknown");
  console.log("");

  // Test 2: Check if users table is accessible
  console.log("TEST 2: Users Table Access");
  const {
    data: usersData,
    error: usersError,
    count: usersCount,
  } = await supabase
    .from("users")
    .select("*", { count: "exact", head: false })
    .limit(1);

  if (usersError) {
    console.error("❌ Users Error:", {
      message: usersError.message,
      code: usersError.code,
      details: usersError.details,
      hint: usersError.hint,
    });
  } else {
    console.log("✅ Users table accessible");
    console.log(`   Total users: ${usersCount}`);
    console.log(`   Sample user:`, usersData?.[0] || "No data");
  }
  console.log("");

  // Test 3: Check running_sessions table
  console.log("TEST 3: Running Sessions Table Access");
  const {
    data: sessionsData,
    error: sessionsError,
    count: sessionsCount,
  } = await supabase
    .from("running_sessions")
    .select("*", { count: "exact", head: false })
    .limit(1);

  if (sessionsError) {
    console.error("❌ Sessions Error:", {
      message: sessionsError.message,
      code: sessionsError.code,
      details: sessionsError.details,
      hint: sessionsError.hint,
    });
  } else {
    console.log("✅ Running sessions table accessible");
    console.log(`   Total sessions: ${sessionsCount}`);
    console.log(`   Sample session:`, sessionsData?.[0] || "No data");
  }
  console.log("");

  // Test 4: Check session_music_history table
  console.log("TEST 4: Session Music History Table Access");
  const {
    data: musicData,
    error: musicError,
    count: musicCount,
  } = await supabase
    .from("session_music_history")
    .select("*", { count: "exact", head: false })
    .limit(1);

  if (musicError) {
    console.error("❌ Music History Error:", {
      message: musicError.message,
      code: musicError.code,
      details: musicError.details,
      hint: musicError.hint,
    });
  } else {
    console.log("✅ Session music history table accessible");
    console.log(`   Total records: ${musicCount}`);
    console.log(`   Sample record:`, musicData?.[0] || "No data");
  }
  console.log("");

  // Test 5: Check session_heart_rate_data table
  console.log("TEST 5: Heart Rate Data Table Access");
  const {
    data: hrData,
    error: hrError,
    count: hrCount,
  } = await supabase
    .from("session_heart_rate_data")
    .select("*", { count: "exact", head: false })
    .limit(1);

  if (hrError) {
    console.error("❌ Heart Rate Error:", {
      message: hrError.message,
      code: hrError.code,
      details: hrError.details,
      hint: hrError.hint,
    });
  } else {
    console.log("✅ Session heart rate data table accessible");
    console.log(`   Total records: ${hrCount}`);
    console.log(`   Sample record:`, hrData?.[0] || "No data");
  }
  console.log("");

  // Test 6: Check RLS status (via a simple query)
  console.log("TEST 6: Testing Join Query (Users + Sessions)");
  const { data: joinData, error: joinError } = await supabase
    .from("running_sessions")
    .select(
      `
      id,
      user_id,
      start_time,
      users (
        email,
        username
      )
    `
    )
    .limit(1);

  if (joinError) {
    console.error("❌ Join Query Error:", {
      message: joinError.message,
      code: joinError.code,
      details: joinError.details,
      hint: joinError.hint,
    });
  } else {
    console.log("✅ Join query successful");
    console.log(`   Sample data:`, joinData?.[0] || "No data");
  }
  console.log("");

  // Summary
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));
  const allPassed =
    !authError &&
    !usersError &&
    !sessionsError &&
    !musicError &&
    !hrError &&
    !joinError;

  if (allPassed) {
    console.log("✅ All tests passed!");
    console.log("   Your database is accessible and has data.");
    console.log("   If sessions page still doesn't work, check:");
    console.log("   1. Component rendering logic");
    console.log("   2. TypeScript type mismatches");
    console.log("   3. Column name differences (start_time vs started_at)");
  } else {
    console.log("❌ Some tests failed!");
    console.log("   Recommendations:");
    if (authError) console.log("   - Make sure you're logged in");
    if (usersError || sessionsError)
      console.log("   - Run disable-rls.sql in Supabase SQL Editor");
    if (sessionsCount === 0)
      console.log("   - No sessions in database - add test data");
    console.log(
      "   - Check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  console.log("=".repeat(50));

  return {
    success: allPassed,
    counts: {
      users: usersCount,
      sessions: sessionsCount,
      music: musicCount,
      heartRate: hrCount,
    },
  };
}
