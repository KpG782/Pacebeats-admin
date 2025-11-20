"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Heart,
  AlertTriangle,
  Clock,
  Search,
  Play,
  Pause,
  User,
  TrendingUp,
  Zap,
  MapPin,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase/client";

// Interface for real runner data from database
interface Runner {
  session_id: string;
  user_id: string;
  username: string;
  email: string;
  heart_rate: number | null;
  pace: number | null;
  speed: number | null;
  status: "NORMAL" | "HIGH" | "CRITICAL" | "LOW";
  duration_seconds: number;
  distance_km: number | null;
  last_update: string;
  connection_status: "LIVE" | "SLOW" | "LOST";
  session_status: string;
  alert_count: number;
  latest_alert_severity: string | null;
}

// Helper to determine status from heart rate
const getHRStatus = (hr: number | null): Runner["status"] => {
  if (!hr || hr === 0) return "LOW";
  if (hr > 180) return "CRITICAL";
  if (hr > 165) return "HIGH";
  if (hr < 100) return "LOW";
  return "NORMAL";
};

export default function IoTMonitorPage() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Load active runners from database
  const loadActiveRunners = useCallback(async () => {
    try {
      console.log("🔍 Loading active runners...");

      // Get active sessions with user info
      // FIXED: Query both current_* (real-time) and total_* (aggregate) columns
      const { data: sessions, error: sessionsError } = await supabase
        .from("running_sessions")
        .select(
          `
          id,
          user_id,
          session_start_time,
          session_duration_seconds,
          elapsed_time_seconds,
          total_distance_km,
          current_distance_km,
          avg_pace_min_per_km,
          current_pace_min_per_km,
          avg_heart_rate_bpm,
          avg_speed_kmh,
          status,
          last_heartbeat_at,
          users!inner (
            username,
            email
          )
        `
        )
        .eq("status", "active")
        .order("last_heartbeat_at", { ascending: false })
        .limit(50);

      if (sessionsError) {
        console.error("❌ Sessions query error:", sessionsError);
        throw sessionsError;
      }

      console.log(`📊 Found ${sessions?.length || 0} active sessions`);

      if (!sessions || sessions.length === 0) {
        setRunners([]);
        console.log("ℹ️ No active runners found");
        setLoading(false);
        return;
      }

      // Get latest heart rate for each session
      const sessionIds = sessions.map((s) => s.id);

      const { data: latestHR, error: hrError } = await supabase
        .from("session_heart_rate_data")
        .select("session_id, heart_rate_bpm, recorded_at")
        .in("session_id", sessionIds)
        .order("recorded_at", { ascending: false });

      if (hrError) {
        console.error("❌ HR query error:", hrError);
      } else {
        console.log(`💓 Found ${latestHR?.length || 0} heart rate readings`);
      }

      // Get alerts for each session
      const { data: alerts, error: alertsError } = await supabase
        .from("heart_rate_alerts")
        .select("session_id, severity")
        .in("session_id", sessionIds)
        .eq("resolved", false);

      if (alertsError) {
        console.error("❌ Alerts query error:", alertsError);
      } else {
        console.log(`🚨 Found ${alerts?.length || 0} unresolved alerts`);
      }

      // Map to latest HR per session
      const hrMap = new Map();
      latestHR?.forEach((hr) => {
        if (!hrMap.has(hr.session_id)) {
          hrMap.set(hr.session_id, hr);
        }
      });

      // Map alerts per session
      const alertsMap = new Map<
        string,
        { count: number; latestSeverity: string | null }
      >();
      alerts?.forEach((alert) => {
        const existing = alertsMap.get(alert.session_id) || {
          count: 0,
          latestSeverity: null,
        };
        alertsMap.set(alert.session_id, {
          count: existing.count + 1,
          latestSeverity: alert.severity,
        });
      });

      const mappedRunners: Runner[] = sessions.map(
        (session: {
          id: string;
          user_id: string;
          session_start_time: string;
          session_duration_seconds: number;
          elapsed_time_seconds: number;
          total_distance_km: number;
          current_distance_km: number;
          avg_pace_min_per_km: number;
          current_pace_min_per_km: number;
          avg_heart_rate_bpm: number;
          avg_speed_kmh: number;
          status: string;
          last_heartbeat_at: string;
          users: { username: string; email: string }[];
        }) => {
          const latestHRData = hrMap.get(session.id);
          const heartRate =
            latestHRData?.heart_rate_bpm || session.avg_heart_rate_bpm || 0;
          const lastHRTime =
            latestHRData?.recorded_at ||
            session.last_heartbeat_at ||
            session.session_start_time;
          const secondsSinceUpdate = Math.floor(
            (Date.now() - new Date(lastHRTime).getTime()) / 1000
          );

          let connectionStatus: "LIVE" | "SLOW" | "LOST" = "LOST";
          if (secondsSinceUpdate < 10) connectionStatus = "LIVE";
          else if (secondsSinceUpdate < 30) connectionStatus = "SLOW";

          // Use current_* for real-time data (from Android app), fallback to total_* for aggregate
          const distanceKm =
            session.current_distance_km || session.total_distance_km || 0;
          const pace =
            session.current_pace_min_per_km || session.avg_pace_min_per_km;
          const speed = pace ? 60 / pace : session.avg_speed_kmh || 0;
          const duration =
            session.elapsed_time_seconds ||
            session.session_duration_seconds ||
            0;

          const sessionAlerts = alertsMap.get(session.id);
          const user = Array.isArray(session.users)
            ? session.users[0]
            : session.users;

          return {
            session_id: session.id,
            user_id: session.user_id,
            username: user?.username || user?.email?.split("@")[0] || "Unknown",
            email: user?.email || "",
            heart_rate: heartRate,
            pace: pace,
            speed: speed,
            status: getHRStatus(heartRate),
            duration_seconds: duration,
            distance_km: distanceKm,
            last_update: lastHRTime,
            connection_status: connectionStatus,
            session_status: session.status,
            alert_count: sessionAlerts?.count || 0,
            latest_alert_severity: sessionAlerts?.latestSeverity || null,
          };
        }
      );

      setRunners(mappedRunners);
      setLastUpdate(new Date());
      console.log(`✅ Loaded ${mappedRunners.length} active runners`);
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        code?: string;
        details?: string;
        hint?: string;
      };
      console.error("❌ Error loading runners:", error);
      console.error("Error details:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
      });
      toast({
        title: "Error Loading Runners",
        description: err?.message || "Failed to load active runners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    loadActiveRunners();
  }, [loadActiveRunners]);

  // Real-time subscription for instant updates - SEPARATE CHANNELS
  useEffect(() => {
    if (!isMonitoring) return;

    console.log("🔔 Setting up realtime subscriptions...");

    // Subscribe to running_sessions updates
    const sessionsChannel = supabase
      .channel("db-changes-sessions")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "running_sessions",
        },
        (payload) => {
          console.log("🔄 Session change:", payload.eventType, payload);
          loadActiveRunners(); // Refresh data
        }
      )
      .subscribe((status) => {
        console.log("📡 Sessions channel status:", status);
      });

    // Subscribe to heart_rate updates
    const heartRateChannel = supabase
      .channel("db-changes-heart-rate")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_heart_rate_data",
        },
        (payload) => {
          console.log("💓 Heart rate update:", payload.new);
          // Update specific runner's HR in real-time
          const hrData = payload.new as {
            session_id: string;
            heart_rate_bpm: number;
          };
          setRunners((prev) =>
            prev.map((runner) => {
              if (runner.session_id === hrData.session_id) {
                const newHR = hrData.heart_rate_bpm;
                return {
                  ...runner,
                  heart_rate: newHR,
                  status: getHRStatus(newHR),
                  last_update: new Date().toISOString(),
                  connection_status: "LIVE" as const,
                };
              }
              return runner;
            })
          );
          setLastUpdate(new Date());
        }
      )
      .subscribe((status) => {
        console.log("📡 Heart rate channel status:", status);
      });

    // Subscribe to alerts
    const alertsChannel = supabase
      .channel("db-changes-alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "heart_rate_alerts",
        },
        (payload) => {
          console.log("🚨 Alert received:", payload.new);
          const alert = payload.new as {
            session_id: string;
            username: string;
            heart_rate: number;
            severity: string;
          };

          // Update runner's alert count
          setRunners((prev) =>
            prev.map((runner) => {
              if (runner.session_id === alert.session_id) {
                return {
                  ...runner,
                  alert_count: runner.alert_count + 1,
                  latest_alert_severity: alert.severity,
                };
              }
              return runner;
            })
          );

          // Show toast notification for critical alerts
          if (alert.severity === "CRITICAL") {
            toast({
              title: "Critical Heart Rate Alert!",
              description: `${
                alert.username || "Runner"
              } has critical heart rate: ${alert.heart_rate} bpm`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Alerts channel status:", status);
      });

    return () => {
      console.log("🔌 Unsubscribing from all realtime channels");
      sessionsChannel.unsubscribe();
      heartRateChannel.unsubscribe();
      alertsChannel.unsubscribe();
    };
  }, [isMonitoring, loadActiveRunners, toast]);

  // Fallback polling every 5 seconds
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      loadActiveRunners();
    }, 5000); // 5 second updates

    return () => clearInterval(interval);
  }, [isMonitoring, loadActiveRunners]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "HIGH":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "LOW":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      default:
        return "bg-green-500 hover:bg-green-600 text-white";
    }
  };

  const getHeartColor = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "text-red-500";
      case "HIGH":
        return "text-amber-500";
      case "LOW":
        return "text-blue-500";
      default:
        return "text-green-500";
    }
  };

  const getConnectionColor = (status: string) => {
    switch (status) {
      case "LIVE":
        return "bg-green-500";
      case "SLOW":
        return "bg-yellow-500 animate-pulse";
      case "LOST":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredRunners = runners.filter((runner) => {
    const matchesSearch =
      runner.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      runner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || runner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(timestamp).getTime()) / 1000
    );
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const criticalRunners = runners.filter((r) => r.status === "CRITICAL").length;
  const highRunners = runners.filter((r) => r.status === "HIGH").length;
  const normalRunners = runners.filter((r) => r.status === "NORMAL").length;
  const avgHR =
    runners.length > 0
      ? Math.round(
          runners.reduce((sum, r) => sum + (r.heart_rate || 0), 0) /
            runners.length
        )
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Loading live runners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page Header - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 animate-pulse" />
              {isMonitoring && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Live Monitor
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {runners.length} Active Runners • Updated{" "}
                {formatTimeAgo(lastUpdate.toISOString())}
              </p>
            </div>
          </div>
          <Button
            variant={isMonitoring ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="flex items-center gap-1 sm:gap-2"
          >
            {isMonitoring ? (
              <>
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Start</span>
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats - Mobile Friendly */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4"
      >
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200">
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-bold text-green-700 dark:text-green-300">
                {normalRunners}
              </p>
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
                Normal
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-200">
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-bold text-amber-700 dark:text-amber-300">
                {highRunners}
              </p>
              <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-1">
                High
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-red-200">
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-bold text-red-700 dark:text-red-300">
                {criticalRunners}
              </p>
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1">
                Critical
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200">
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-bold text-blue-700 dark:text-blue-300">
                {avgHR}
              </p>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
                Avg BPM
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filter - Mobile Optimized */}
      <Card>
        <CardContent className="p-3 sm:p-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search runners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="whitespace-nowrap"
            >
              All ({runners.length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "CRITICAL" ? "destructive" : "outline"}
              onClick={() => setStatusFilter("CRITICAL")}
              className="whitespace-nowrap"
            >
              Critical ({criticalRunners})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "HIGH" ? "default" : "outline"}
              onClick={() => setStatusFilter("HIGH")}
              className="whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white"
            >
              High ({highRunners})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "NORMAL" ? "default" : "outline"}
              onClick={() => setStatusFilter("NORMAL")}
              className="whitespace-nowrap"
            >
              Normal ({normalRunners})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Runners List - Compact Mobile View */}
      <div className="space-y-2 sm:space-y-3">
        {filteredRunners.map((runner, index) => (
          <motion.div
            key={runner.session_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  <div className="flex-shrink-0 relative">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getStatusColor(
                        runner.status
                      )} flex items-center justify-center`}
                    >
                      <Heart
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          runner.status === "CRITICAL" ? "animate-pulse" : ""
                        }`}
                      />
                    </div>
                    {/* Connection Status Dot */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getConnectionColor(
                        runner.connection_status
                      )} border-2 border-white dark:border-gray-800`}
                      title={runner.connection_status}
                    />
                  </div>

                  {/* Runner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        {runner.username}
                      </h3>
                      <Badge
                        className={`${getStatusColor(
                          runner.status
                        )} text-xs shrink-0`}
                      >
                        {runner.status}
                      </Badge>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <Heart
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${getHeartColor(
                            runner.status
                          )}`}
                        />
                        <span className="font-bold">
                          {runner.heart_rate || 0}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          BPM
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                        <span className="font-semibold">
                          {runner.pace?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          min/km
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatDuration(runner.duration_seconds)}
                        </span>
                      </div>
                    </div>

                    {/* Distance and Last Update */}
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {runner.distance_km?.toFixed(2) || "0.00"} km
                        </span>
                        {runner.connection_status === "LIVE" && (
                          <Zap className="h-3 w-3 text-green-500 animate-pulse" />
                        )}
                        {runner.alert_count > 0 && (
                          <Badge
                            variant="destructive"
                            className="text-xs px-1 py-0"
                          >
                            {runner.alert_count} alert
                            {runner.alert_count > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <span>{formatTimeAgo(runner.last_update)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRunners.length === 0 && (
        <Card className="p-8 sm:p-12 text-center">
          <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-medium">
            {runners.length === 0 ? "No active runners" : "No runners found"}
          </p>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-2">
            {runners.length === 0
              ? "Start a running session on your mobile app to see live data"
              : searchQuery
              ? "Try adjusting your search"
              : "No runners match the selected filter"}
          </p>
        </Card>
      )}

      {/* Critical Alert Banner - Mobile Sticky */}
      {criticalRunners > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-50"
        >
          <Card className="bg-red-500 text-white border-red-600 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm sm:text-base">
                    Critical Alert!
                  </p>
                  <p className="text-xs sm:text-sm opacity-90">
                    {criticalRunners} runner
                    {criticalRunners > 1 ? "s" : ""} with critical heart rate
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStatusFilter("CRITICAL")}
                  className="shrink-0"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
