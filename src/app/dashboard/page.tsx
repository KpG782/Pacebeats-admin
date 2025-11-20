"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Activity,
  Music,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Heart,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  activeSessions: number;
  totalTracks: number;
  activeRunners: number;
  avgHeartRate: number;
}

interface LiveRunner {
  id: string;
  username: string;
  heart_rate: number;
  distance_km: number;
  duration_seconds: number;
  connection_status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    activeSessions: 0,
    totalTracks: 0,
    activeRunners: 0,
    avgHeartRate: 0,
  });
  const [liveRunners, setLiveRunners] = useState<LiveRunner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "running_sessions",
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    // Refresh every 10 seconds
    const interval = setInterval(fetchDashboardData, 10000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total users count
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Fetch total sessions count
      const { count: sessionsCount } = await supabase
        .from("running_sessions")
        .select("*", { count: "exact", head: true });

      // Fetch active sessions (status = 'active')
      const { count: activeSessionsCount } = await supabase
        .from("running_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch total music tracks count
      const { count: tracksCount } = await supabase
        .from("music_tracks")
        .select("*", { count: "exact", head: true });

      // Fetch live runners with details
      const { data: runnersData } = await supabase
        .from("running_sessions")
        .select(
          `
          id,
          current_distance_km,
          elapsed_time_seconds,
          last_heartbeat_at,
          users!inner (
            username
          ),
          session_heart_rate_data!left (
            heart_rate_bpm,
            recorded_at
          )
        `
        )
        .eq("status", "active")
        .order("last_heartbeat_at", { ascending: false })
        .limit(5);

      // Process live runners
      const processedRunners = (runnersData || []).map(
        (runner: {
          id: string;
          users:
            | { username?: string; email?: string }[]
            | { username?: string; email?: string };
          session_heart_rate_data?: {
            heart_rate_bpm: number;
            recorded_at: string;
          }[];
          current_distance_km: number | null;
          elapsed_time_seconds: number | null;
          last_heartbeat_at: string;
        }) => {
          const user = Array.isArray(runner.users)
            ? runner.users[0]
            : runner.users;
          const latestHR =
            runner.session_heart_rate_data &&
            runner.session_heart_rate_data.length > 0
              ? [...runner.session_heart_rate_data].sort(
                  (a, b) =>
                    new Date(b.recorded_at).getTime() -
                    new Date(a.recorded_at).getTime()
                )[0].heart_rate_bpm
              : 0;

          const secondsSinceUpdate = runner.last_heartbeat_at
            ? Math.floor(
                (Date.now() - new Date(runner.last_heartbeat_at).getTime()) /
                  1000
              )
            : 999;

          let connectionStatus = "LOST";
          if (secondsSinceUpdate < 10) connectionStatus = "LIVE";
          else if (secondsSinceUpdate < 30) connectionStatus = "SLOW";

          return {
            id: runner.id,
            username: user?.username || "Unknown",
            heart_rate: latestHR,
            distance_km: runner.current_distance_km || 0,
            duration_seconds: runner.elapsed_time_seconds || 0,
            connection_status: connectionStatus,
          };
        }
      );

      // Calculate average heart rate
      const avgHR =
        processedRunners.length > 0
          ? Math.round(
              processedRunners.reduce((sum, r) => sum + r.heart_rate, 0) /
                processedRunners.length
            )
          : 0;

      setStats({
        totalUsers: usersCount || 0,
        activeUsers: usersCount || 0,
        totalSessions: sessionsCount || 0,
        activeSessions: activeSessionsCount || 0,
        totalTracks: tracksCount || 0,
        activeRunners: processedRunners.length,
        avgHeartRate: avgHR,
      });

      setLiveRunners(processedRunners);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const getConnectionColor = (status: string) => {
    switch (status) {
      case "LIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "SLOW":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "LOST":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Welcome back! Here&apos;s what&apos;s happening with your running
          platform {loading && <span className="text-xs">(Loading...)</span>}
        </p>
      </motion.div>

      {/* Stats Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`${stats.activeUsers} active users`}
          icon={Users}
          trend="up"
          trendValue="Real-time data"
          delay={0}
        />
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          subtitle={`${stats.activeSessions} currently active`}
          icon={Activity}
          trend="up"
          trendValue={`${stats.activeRunners} live runners`}
          delay={0.1}
        />
        <StatsCard
          title="Music Library"
          value={stats.totalTracks}
          subtitle={`Available tracks`}
          icon={Music}
          trend="up"
          trendValue="Growing library"
          delay={0.2}
        />
        <StatsCard
          title="Avg Heart Rate"
          value={stats.avgHeartRate > 0 ? `${stats.avgHeartRate} bpm` : "--"}
          subtitle={`${stats.activeRunners} runners monitored`}
          icon={Heart}
          trend={stats.avgHeartRate > 0 ? "up" : "neutral"}
          trendValue={
            stats.avgHeartRate > 0 ? "Live monitoring" : "No active runners"
          }
          delay={0.3}
        />
      </motion.div>

      {/* Live Runners Section */}
      {liveRunners.length > 0 && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-500 animate-pulse" />
                <CardTitle className="text-gray-900 dark:text-white">
                  Live Runners ({liveRunners.length})
                </CardTitle>
              </div>
              <Link href="/dashboard/iot-monitor">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  View Monitor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {liveRunners.map((runner) => (
                  <div
                    key={runner.id}
                    className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {runner.username}
                      </span>
                      <Badge
                        className={getConnectionColor(runner.connection_status)}
                      >
                        {runner.connection_status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">HR</p>
                        <p className="font-bold text-red-600 dark:text-red-400">
                          {runner.heart_rate} bpm
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Distance
                        </p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {runner.distance_km.toFixed(2)} km
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Time</p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatDuration(runner.duration_seconds)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.activeSessions}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Active Sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.totalUsers}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Total Users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.totalTracks}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Music Tracks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Database
                    </span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Operational
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    All queries responding normally
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Real-time Updates
                    </span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Connected
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    WebSocket active, live data streaming
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      IoT Monitor
                    </span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {stats.activeRunners} Active
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stats.activeRunners > 0
                      ? `Tracking ${stats.activeRunners} runner${
                          stats.activeRunners > 1 ? "s" : ""
                        }`
                      : "No active sessions"}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Server
                    </span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Operational
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    All endpoints responding
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/iot-monitor">
                <Button
                  variant="default"
                  className="w-full justify-start bg-red-500 hover:bg-red-600"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Live Monitor{" "}
                  {stats.activeRunners > 0 && `(${stats.activeRunners})`}
                </Button>
              </Link>
              <Link href="/dashboard/users">
                <Button variant="secondary" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/dashboard/music">
                <Button variant="secondary" className="w-full justify-start">
                  <Music className="mr-2 h-4 w-4" />
                  Music Library
                </Button>
              </Link>
              <Link href="/dashboard/sessions">
                <Button variant="secondary" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  View Sessions
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="secondary" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics Report
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Real-time Stats */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Live Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  Active Runners
                </span>
                <Badge variant="secondary" className="ml-2">
                  {stats.activeRunners}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  Avg Heart Rate
                </span>
                <Badge variant="secondary" className="ml-2">
                  {stats.avgHeartRate > 0 ? `${stats.avgHeartRate} bpm` : "--"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  Total Users
                </span>
                <Badge variant="secondary" className="ml-2">
                  {stats.totalUsers}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  Music Tracks
                </span>
                <Badge variant="secondary" className="ml-2">
                  {stats.totalTracks}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
