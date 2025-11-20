"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface TestResults {
  timestamp?: string;
  envVars?: {
    url: string;
    key: string;
  };
  users?: {
    count: number;
    sample: unknown[];
    error?: string;
    status?: string;
  };
  sessions?: {
    count: number;
    sample: unknown[];
    error?: string;
    status?: string;
  };
  music?: {
    count: number;
    sample: unknown[];
    error?: string;
    status?: string;
  };
  listening_events?: {
    count: number;
    sample: unknown[];
    error?: string;
    status?: string;
  };
  connection?: {
    status: string;
    error?: string;
  };
}

export default function TestDatabasePage() {
  const [results, setResults] = useState<TestResults>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testDatabase() {
      const testResults: TestResults = {
        timestamp: new Date().toISOString(),
      };

      // Test 1: Check environment variables
      testResults.envVars = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ SET" : "❌ MISSING",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? "✅ SET"
          : "❌ MISSING",
      };

      // Test 2: Test users table
      try {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*")
          .limit(5);

        testResults.users = {
          status: usersError ? "❌ ERROR" : "✅ SUCCESS",
          count: usersData?.length || 0,
          error: usersError?.message,
          sample: usersData?.[0] ? Object.keys(usersData[0]) : [],
        };
      } catch (error: unknown) {
        const err = error as Error;
        testResults.users = {
          status: "❌ EXCEPTION",
          count: 0,
          sample: [],
          error: err.message,
        };
      }

      // Test 3: Test listening_events table
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from("listening_events")
          .select("*")
          .limit(5);

        testResults.listening_events = {
          status: eventsError ? "❌ ERROR" : "✅ SUCCESS",
          count: eventsData?.length || 0,
          error: eventsError?.message,
          sample: eventsData?.[0] ? Object.keys(eventsData[0]) : [],
        };
      } catch (error: unknown) {
        const err = error as Error;
        testResults.listening_events = {
          status: "❌ EXCEPTION",
          count: 0,
          sample: [],
          error: err.message,
        };
      }

      // Test 4: Test session grouping
      try {
        const { data: events } = await supabase
          .from("listening_events")
          .select("session_id, user_id, started_at")
          .limit(100);

        const sessionIds = [...new Set(events?.map((e) => e.session_id) || [])];

        testResults.sessions = {
          status: "✅ SUCCESS",
          count: events?.length || 0,
          sample: sessionIds,
        };
      } catch (error: unknown) {
        const err = error as Error;
        testResults.sessions = {
          status: "❌ EXCEPTION",
          count: 0,
          sample: [],
          error: err.message,
        };
      }

      setResults(testResults);
      setLoading(false);
    }

    testDatabase();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        <p>Testing database connection...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>

      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Environment Variables</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(results.envVars, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Users Table</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(results.users, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Listening Events Table</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(results.listening_events, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Session Grouping</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(results.sessions, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">Next Steps:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            If env vars are missing: Create `.env.local` file with Supabase
            credentials
          </li>
          <li>If tables show errors: Check Supabase RLS policies</li>
          <li>
            If no data found: Insert test data into `listening_events` table
          </li>
          <li>If everything is ✅: Go back to sessions page</li>
        </ul>
      </div>
    </div>
  );
}
