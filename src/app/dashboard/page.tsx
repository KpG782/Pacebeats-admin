"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock,
  Headphones,
  Music,
  PlayCircle,
  Radio,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import {
  getDashboardData,
  type DashboardActivityItem,
  type DashboardData,
} from "@/lib/supabase/dashboard-queries";

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

function getActivityIcon(type: DashboardActivityItem["type"]) {
  switch (type) {
    case "user_registered":
      return Users;
    case "session_completed":
      return Activity;
    case "music_played":
      return Music;
    default:
      return Activity;
  }
}

function getActivityColor(type: DashboardActivityItem["type"]) {
  switch (type) {
    case "user_registered":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "session_completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "music_played":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(
    async (showToast = false) => {
      try {
        if (dashboardData) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await getDashboardData();
        setDashboardData(data);

        if (showToast) {
          toast({
            title: "Dashboard refreshed",
            description: "Latest metrics have been loaded from Supabase.",
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast({
          title: "Dashboard unavailable",
          description: "Could not load live dashboard metrics.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dashboardData, toast]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading && !dashboardData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Dashboard unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The admin dashboard could not load live data from Supabase.
            </p>
            <Button onClick={() => loadDashboard(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { metrics, recentActivity, topTracks, statuses } = dashboardData;

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Live metrics from users, sessions, music, and listening events.
          </p>
        </div>
        <Button variant="outline" onClick={() => loadDashboard(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Users"
          value={metrics.totalUsers}
          subtitle={`${metrics.activeUsers} active in last 30 days`}
          icon={Users}
          trend="neutral"
          trendValue="Based on recent session activity"
          delay={0}
        />
        <StatsCard
          title="Total Sessions"
          value={metrics.totalSessions}
          subtitle={`${metrics.activeSessions} currently active`}
          icon={Activity}
          trend="neutral"
          trendValue="Live count from running_sessions"
          delay={0.1}
        />
        <StatsCard
          title="Music Library"
          value={metrics.totalTracks}
          subtitle={`${metrics.totalPlays.toLocaleString()} listening events`}
          icon={Music}
          trend="neutral"
          trendValue={`${metrics.topGenre} is the largest genre`}
          delay={0.2}
        />
        <StatsCard
          title="Avg Session Duration"
          value={`${metrics.avgSessionDurationMinutes} min`}
          subtitle={`${metrics.avgSongsPerSession} songs per session`}
          icon={TrendingUp}
          trend="neutral"
          trendValue={`${metrics.avgCompletionRate}% completion rate`}
          delay={0.3}
        />
      </motion.div>

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
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {metrics.topGenreTrackCount}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {metrics.topGenre} tracks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {metrics.topMoodTrackCount}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {metrics.topMood} mood tracks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {metrics.userRetentionRate}%
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Active user retention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">
                Recent Activity
              </CardTitle>
              <Link href="/dashboard/sessions">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  View Sessions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No recent activity available yet.
                  </p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${getActivityColor(
                            activity.type
                          )}`}
                        >
                          {(() => {
                            const Icon = getActivityIcon(activity.type);
                            return <Icon className="h-5 w-5" />;
                          })()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
              <Link href="/dashboard/users">
                <Button variant="default" className="w-full justify-start">
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

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                Top Tracks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topTracks.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No listening events available yet.
                </p>
              ) : (
                topTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 font-medium w-4">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-900 dark:text-white font-medium truncate">
                          {track.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {track.plays.toLocaleString()}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statuses.map((status) => (
                <div key={status.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {status.label}
                  </span>
                  <Badge
                    className={
                      status.status === "Operational"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }
                  >
                    {status.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
