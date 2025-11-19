"use client";

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
  Clock,
  PlayCircle,
  Headphones,
  Radio,
  BarChart3,
} from "lucide-react";
import { enhancedAnalyticsData } from "@/lib/enhanced-analytics-data";
import {
  enhancedMusicTracks,
} from "@/lib/enhanced-music-data";
import { enhancedMockUsers } from "@/lib/enhanced-mock-data";
import { enhancedMockSessions } from "@/lib/enhanced-session-data";
import { formatDistanceToNow } from "date-fns";
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

export default function DashboardPage() {
  const stats = enhancedAnalyticsData.dashboardStats;
  const topTracks = enhancedAnalyticsData.songPopularity.slice(0, 5);
  const topGenres = enhancedAnalyticsData.genreDistribution
    .sort((a, b) => b.avgPlays - a.avgPlays)
    .slice(0, 3);
  const topMoods = enhancedAnalyticsData.moodDistribution
    .sort((a, b) => b.tracks - a.tracks)
    .slice(0, 3);

  // Get recent activity from tracks, users, sessions
  const recentActivity = [
    ...enhancedMusicTracks.slice(0, 3).map((track) => ({
      id: track.id,
      type: "music_added",
      message: `New track added: ${track.track_name} by ${track.artist_name}`,
      timestamp: track.added_at,
    })),
    ...enhancedMockUsers.slice(0, 2).map((user) => ({
      id: user.id,
      type: user.status === "active" ? "user_registered" : "user_inactive",
      message: `User ${user.username} ${
        user.status === "active" ? "is active" : "went inactive"
      }`,
      timestamp: user.created_at,
    })),
    ...enhancedMockSessions.slice(0, 2).map((session) => ({
      id: session.id,
      type: "session_completed",
      message: `Session completed: ${(
        session.total_distance_meters / 1000
      ).toFixed(1)}km in ${Math.round(session.duration_seconds / 60)} min`,
      timestamp: session.started_at,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 6);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
        return Users;
      case "session_completed":
        return Activity;
      case "music_added":
        return Music;
      case "user_inactive":
        return Clock;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user_registered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "session_completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "music_added":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "user_inactive":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-muted text-muted-foreground";
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
          Welcome back! Here&apos;s what&apos;s happening with your music
          platform today.
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
          trendValue="+12.5% from last month"
          delay={0}
        />
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          subtitle={`${stats.activeSessions} currently active`}
          icon={Activity}
          trend="up"
          trendValue="+8.3% from last week"
          delay={0.1}
        />
        <StatsCard
          title="Music Library"
          value={stats.totalTracks}
          subtitle={`${stats.totalPlays.toLocaleString()} total plays`}
          icon={Music}
          trend="up"
          trendValue={`${topGenres[0]?.name || "Electronic"} is trending`}
          delay={0.2}
        />
        <StatsCard
          title="Avg Session Duration"
          value={`${Math.round(stats.avgSessionDuration / 60)} min`}
          subtitle={`${stats.avgSongsPerSession.toFixed(1)} songs/session`}
          icon={TrendingUp}
          trend="up"
          trendValue={`${stats.avgCompletionRate.toFixed(0)}% completion rate`}
          delay={0.3}
        />
      </motion.div>

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
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {topGenres[0]?.tracks || 0}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {topGenres[0]?.name || "Electronic"} Tracks
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
                  {topMoods[0]?.tracks || 0}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {topMoods[0]?.name || "happy"} mood tracks
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
                  {stats.userRetentionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  User Retention Rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
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
              <Link href="/dashboard/analytics">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
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
                ))}
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

          {/* Top Tracks */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                Top Tracks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between text-sm"
                >
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
              ))}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  API Server
                </span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Database
                </span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Music Service
                </span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  CDN
                </span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Operational
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
