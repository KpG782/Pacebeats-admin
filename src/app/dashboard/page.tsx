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
} from "lucide-react";
import { getDashboardStats, mockActivities } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

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
  const stats = getDashboardStats();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
        return "👋";
      case "session_completed":
        return "✅";
      case "music_added":
        return "🎵";
      case "user_inactive":
        return "⚠️";
      default:
        return "📌";
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
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your music platform today.
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
          trendValue="+12% from last month"
          delay={0}
        />
        <StatsCard
          title="Sessions Completed"
          value={stats.completedSessions}
          subtitle={`${stats.activeSessions} currently active`}
          icon={Activity}
          trend="up"
          trendValue="+8% from last week"
          delay={0.1}
        />
        <StatsCard
          title="Most Popular Genre"
          value={stats.mostPopularGenre}
          subtitle={`${stats.totalTracks} total tracks`}
          icon={Music}
          trend="neutral"
          delay={0.2}
        />
        <StatsCard
          title="Active Sessions"
          value={stats.activeSessions}
          subtitle="Real-time active users"
          icon={TrendingUp}
          trend="up"
          trendValue="+3 from an hour ago"
          delay={0.3}
        />
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
          <Card className="bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${getActivityColor(
                          activity.type
                        )}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
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
        >
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="default" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Add New User
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Music className="mr-2 h-4 w-4" />
                Upload Music
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                View Sessions
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics Report
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-card border shadow-sm mt-6">
            <CardHeader>
              <CardTitle className="text-foreground">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  API Server
                </span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CDN</span>
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
