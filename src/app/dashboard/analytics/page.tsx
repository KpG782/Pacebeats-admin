"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingUp, TrendingDown, Users, Music, Activity, BarChart3, Clock, Target, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
} from "recharts";
import {
  enhancedAnalyticsData,
  getTopGenres,
  getTopMoods,
  getRecommendationTrend,
} from "@/lib/enhanced-analytics-data";
import { useToast } from "@/components/ui/use-toast";
import { StatsCard } from "@/components/dashboard/stats-card";

const COLORS = [
  "oklch(0.55 0.18 250)", // Pacebeats Blue
  "oklch(0.65 0.15 200)", // Light Blue
  "oklch(0.70 0.12 180)", // Cyan
  "oklch(0.60 0.16 220)", // Medium Blue
  "oklch(0.50 0.20 260)", // Deep Blue
  "oklch(0.75 0.10 200)", // Very Light Blue
  "oklch(0.58 0.17 240)", // Mid Blue
  "oklch(0.52 0.19 255)", // Deep Blue 2
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const { 
    dashboardStats, 
    songPopularity, 
    genreDistribution, 
    moodDistribution, 
    bpmDistribution,
    userActivityTrend,
    sessionMetrics,
    musicEngagement,
    recommendationAccuracy,
    peakUsageHours,
  } = enhancedAnalyticsData;

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Analytics data is being exported to CSV...",
    });
    
    // Mock export logic
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Analytics report has been downloaded successfully.",
      });
    }, 1500);
  };

  const recommendationTrend = getRecommendationTrend();

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Insights into your music platform performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="default" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          title="Total Users"
          value={dashboardStats.totalUsers.toString()}
          icon={Users}
          trend="up"
          trendValue="+12.5%"
        />
        <StatsCard
          title="Total Sessions"
          value={dashboardStats.totalSessions.toLocaleString()}
          icon={Activity}
          trend="up"
          trendValue="+8.2%"
        />
        <StatsCard
          title="Total Plays"
          value={dashboardStats.totalPlays.toLocaleString()}
          icon={Music}
          trend="up"
          trendValue="+15.3%"
        />
        <StatsCard
          title="Avg Session"
          value={`${Math.round(dashboardStats.avgSessionDuration / 60)}m`}
          icon={Clock}
          trend="up"
          trendValue="+5.1%"
        />
      </motion.div>

      {/* Tabs for Different Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top Songs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Top 10 Most Popular Songs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={songPopularity}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "currentColor" }}
                      className="fill-gray-600 dark:fill-gray-400"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis tick={{ fill: "currentColor" }} className="fill-gray-600 dark:fill-gray-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar
                      dataKey="plays"
                      fill="oklch(0.55 0.18 250)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Genre & Mood Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Genre Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genreDistribution as any[]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value})`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genreDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Mood Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={moodDistribution as any[]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value})`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {moodDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recommendation Accuracy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 dark:text-white">
                    Recommendation Accuracy Over Time
                  </CardTitle>
                  <div className={`flex items-center gap-2 ${recommendationTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {recommendationTrend >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    <span className="text-sm font-semibold">
                      {recommendationTrend >= 0 ? '+' : ''}{recommendationTrend.toFixed(1)}% this year
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={recommendationAccuracy}>
                    <defs>
                      <linearGradient
                        id="colorAccuracy"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.55 0.18 250)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.55 0.18 250)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "currentColor" }}
                      className="fill-gray-600 dark:fill-gray-400"
                    />
                    <YAxis
                      tick={{ fill: "currentColor" }}
                      className="fill-gray-600 dark:fill-gray-400"
                      domain={[70, 100]}
                      label={{
                        value: "Accuracy (%)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "currentColor",
                        className: "fill-gray-600 dark:fill-gray-400",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`${value}%`, "Accuracy"]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="oklch(0.55 0.18 250)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAccuracy)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* MUSIC TAB */}
        <TabsContent value="music" className="space-y-6">
          {/* BPM Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  BPM Distribution & Popularity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={bpmDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="range"
                      tick={{ fill: "currentColor" }}
                      className="fill-gray-600 dark:fill-gray-400"
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: "currentColor" }} 
                      className="fill-gray-600 dark:fill-gray-400" 
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: "currentColor" }} 
                      className="fill-gray-600 dark:fill-gray-400" 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="count"
                      fill="oklch(0.55 0.18 250)"
                      name="Track Count"
                      radius={[8, 8, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgPlays"
                      stroke="oklch(0.70 0.12 180)"
                      strokeWidth={3}
                      name="Avg Plays"
                      dot={{ fill: "oklch(0.70 0.12 180)", r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Music Engagement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Music Engagement Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={musicEngagement}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "currentColor" }}
                      className="fill-gray-600 dark:fill-gray-400"
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: "currentColor" }} 
                      className="fill-gray-600 dark:fill-gray-400" 
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: "currentColor" }} 
                      className="fill-gray-600 dark:fill-gray-400" 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="plays"
                      fill="oklch(0.55 0.18 250)"
                      fillOpacity={0.6}
                      stroke="oklch(0.55 0.18 250)"
                      name="Total Plays"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgCompletionRate"
                      stroke="oklch(0.70 0.12 180)"
                      strokeWidth={3}
                      name="Completion Rate (%)"
                      dot={{ fill: "oklch(0.70 0.12 180)", r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Genres Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Top Performing Genres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTopGenres().map((genre, index) => (
                    <div
                      key={genre.name}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {genre.name}
                        </h3>
                        <Badge style={{ backgroundColor: genre.color }}>
                          #{index + 1}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Tracks: {genre.tracks}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Avg Plays: {genre.avgPlays.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-6">
          {/* User Activity Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  User Activity Trend (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={userActivityTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "currentColor" }}
                      className="fill-gray-600 dark:fill-gray-400"
                      tickFormatter={(date) => new Date(date).getDate().toString()}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: "currentColor" }} 
                      className="fill-gray-600 dark:fill-gray-400" 
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: "currentColor" }} 
                      className="fill-gray-600 dark:fill-gray-400" 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="activeUsers"
                      fill="oklch(0.55 0.18 250)"
                      fillOpacity={0.6}
                      stroke="oklch(0.55 0.18 250)"
                      name="Active Users"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="newUsers"
                      stroke="oklch(0.70 0.12 180)"
                      strokeWidth={3}
                      name="New Users"
                      dot={{ fill: "oklch(0.70 0.12 180)", r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Peak Usage Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Peak Usage Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={peakUsageHours}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: "currentColor" }}
                      className="fill-gray-600 dark:fill-gray-400"
                    />
                    <YAxis tick={{ fill: "currentColor" }} className="fill-gray-600 dark:fill-gray-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="sessions"
                      fill="oklch(0.55 0.18 250)"
                      name="Sessions"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="users"
                      fill="oklch(0.70 0.12 180)"
                      name="Active Users"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* SESSIONS TAB */}
        <TabsContent value="sessions" className="space-y-6">
          {/* Session Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Session Metrics Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={sessionMetrics}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "currentColor" }}
                      className="fill-gray-600 dark:fill-gray-400"
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: "currentColor" }} 
                      className="fill-gray-600 dark:fill-gray-400" 
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: "currentColor" }} 
                      className="fill-gray-600 dark:fill-gray-400" 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="totalSessions"
                      fill="oklch(0.55 0.18 250)"
                      name="Total Sessions"
                      radius={[8, 8, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgDuration"
                      stroke="oklch(0.70 0.12 180)"
                      strokeWidth={3}
                      name="Avg Duration (s)"
                      dot={{ fill: "oklch(0.70 0.12 180)", r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">Avg. Session Length</p>
            <p className="text-3xl font-bold">{Math.round(dashboardStats.avgSessionDuration / 60)} min</p>
            <p className="text-xs opacity-75 mt-2">↑ 8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[oklch(0.65_0.15_200)] to-[oklch(0.60_0.16_220)] text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">User Retention</p>
            <p className="text-3xl font-bold">{dashboardStats.userRetentionRate.toFixed(1)}%</p>
            <p className="text-xs opacity-75 mt-2">↑ 3% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[oklch(0.70_0.12_180)] to-[oklch(0.65_0.15_200)] text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">Avg. Songs per Session</p>
            <p className="text-3xl font-bold">{dashboardStats.avgSongsPerSession.toFixed(1)}</p>
            <p className="text-xs opacity-75 mt-2">↑ 5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[oklch(0.60_0.16_220)] to-[oklch(0.55_0.18_250)] text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">User Satisfaction</p>
            <p className="text-3xl font-bold">{dashboardStats.userSatisfaction.toFixed(1)}/5</p>
            <p className="text-xs opacity-75 mt-2">↑ 0.2 from last month</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
