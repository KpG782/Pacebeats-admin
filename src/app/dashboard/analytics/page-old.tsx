"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Activity,
  Users,
  TrendingUp,
  Music,
  Heart,
  Clock,
  MapPin,
  Zap,
  Target,
  Flame,
  Headphones,
  Radio,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  PieLabelRenderProps,
} from "recharts";
import {
  getAnalyticsSummary,
  getUserGrowthData,
  getSessionTrends,
  getMusicAnalytics,
  getRunTypeAnalytics,
  getTimeAnalytics,
  getPerformanceMetrics,
  type AnalyticsSummary,
  type UserGrowthData,
  type SessionTrendData,
  type MusicAnalytics,
  type RunTypeAnalytics,
  type TimeAnalytics,
  type PerformanceMetrics,
} from "@/lib/supabase/analytics-queries";

const COLORS = [
  "oklch(0.55 0.18 250)", // Pacebeats Blue
  "oklch(0.70 0.20 160)", // Green
  "oklch(0.65 0.22 40)", // Orange
  "oklch(0.75 0.18 200)", // Cyan
  "oklch(0.60 0.20 320)", // Purple
  "oklch(0.70 0.22 80)", // Yellow
];

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeRange = 30; // Default to 30 days

  // Data states
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [sessionTrends, setSessionTrends] = useState<SessionTrendData[]>([]);
  const [musicData, setMusicData] = useState<MusicAnalytics | null>(null);
  const [runTypeData, setRunTypeData] = useState<RunTypeAnalytics[]>([]);
  const [timeData, setTimeData] = useState<TimeAnalytics[]>([]);
  const [performanceData, setPerformanceData] =
    useState<PerformanceMetrics | null>(null);

  const loadAnalytics = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      console.log("📊 Loading analytics data...");

      // Load all data in parallel
      const [
        summaryData,
        growthData,
        trendsData,
        musicAnalytics,
        runTypes,
        timeAnalytics,
        performance,
      ] = await Promise.all([
        getAnalyticsSummary(),
        getUserGrowthData(timeRange),
        getSessionTrends(timeRange),
        getMusicAnalytics(),
        getRunTypeAnalytics(),
        getTimeAnalytics(),
        getPerformanceMetrics(),
      ]);

      setSummary(summaryData);
      setUserGrowth(growthData);
      setSessionTrends(trendsData);
      setMusicData(musicAnalytics);
      setRunTypeData(runTypes);
      setTimeData(timeAnalytics);
      setPerformanceData(performance);

      console.log("✅ All analytics data loaded successfully");

      if (showToast) {
        toast({
          title: "Analytics refreshed",
          description: "All data has been updated successfully.",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load analytics";
      console.error("❌ Analytics error:", err);
      setError(errorMessage);
      toast({
        title: "Error loading analytics",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => loadAnalytics(true)} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into user activity and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={summary.totalUsers.toString()}
            icon={Users}
            subtitle={`${summary.activeUsers} active in last 30 days`}
            trend="up"
            trendValue="+12%"
          />
          <StatsCard
            title="Total Sessions"
            value={summary.totalSessions.toString()}
            icon={Activity}
            subtitle={`Avg ${formatDuration(
              summary.avgSessionDuration
            )} per session`}
            trend="up"
            trendValue="+8%"
          />
          <StatsCard
            title="Total Distance"
            value={`${summary.totalDistance.toFixed(1)} km`}
            icon={MapPin}
            subtitle={`Avg ${summary.avgSessionDistance.toFixed(
              2
            )} km per session`}
            trend="up"
            trendValue="+15%"
          />
          <StatsCard
            title="Total Songs"
            value={summary.totalSongs.toString()}
            icon={Music}
            subtitle={`${summary.totalHeartRateData} heart rate readings`}
            trend="up"
            trendValue="+20%"
          />
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* User Growth & Session Trends */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip labelFormatter={formatDate} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="totalUsers"
                      name="Total Users"
                      stroke={COLORS[0]}
                      fill={COLORS[0]}
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="newUsers"
                      name="New Users"
                      stroke={COLORS[1]}
                      fill={COLORS[1]}
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Session Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={sessionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip labelFormatter={formatDate} />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="sessions"
                      name="Sessions"
                      fill={COLORS[0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgDistance"
                      name="Avg Distance (km)"
                      stroke={COLORS[2]}
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Run Types & Peak Hours */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Run Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={
                        runTypeData as unknown as Record<
                          string,
                          string | number
                        >[]
                      }
                      dataKey="count"
                      nameKey="runType"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry: PieLabelRenderProps) => {
                        const data = runTypeData[entry.index || 0];
                        return data
                          ? `${data.runType} (${data.percentage}%)`
                          : "";
                      }}
                    >
                      {runTypeData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Peak Activity Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                    <YAxis />
                    <Tooltip labelFormatter={(h) => `${h}:00`} />
                    <Legend />
                    <Bar dataKey="sessions" name="Sessions" fill={COLORS[0]} />
                    <Bar dataKey="users" name="Active Users" fill={COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          {performanceData && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Pace
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.avgPace.toFixed(2)} min/km
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Heart Rate
                  </CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.avgHeartRate} bpm
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Calories
                  </CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.totalCalories.toLocaleString()} kcal
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Steps
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.totalSteps.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Metrics Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={sessionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip labelFormatter={formatDate} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="sessions"
                    name="Sessions"
                    fill={COLORS[0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgDistance"
                    name="Avg Distance (km)"
                    stroke={COLORS[2]}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgPace"
                    name="Avg Pace (min/km)"
                    stroke={COLORS[4]}
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Run Type Details */}
          <Card>
            <CardHeader>
              <CardTitle>Run Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {runTypeData.map((runType, index) => (
                  <div key={runType.runType} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium capitalize">
                          {runType.runType}
                        </span>
                        <Badge variant="secondary">
                          {runType.count} sessions
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {runType.percentage}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Avg Duration:
                        </span>{" "}
                        <span className="font-medium">
                          {formatDuration(runType.avgDuration)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Avg Distance:
                        </span>{" "}
                        <span className="font-medium">
                          {runType.avgDistance.toFixed(2)} km
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Pace:</span>{" "}
                        <span className="font-medium">
                          {runType.avgPace > 0
                            ? `${runType.avgPace.toFixed(2)} min/km`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Music Tab */}
        <TabsContent value="music" className="space-y-6">
          {musicData && (
            <>
              {/* Music Overview Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Tracks
                    </CardTitle>
                    <Music className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {musicData.totalTracks}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {musicData.totalPlays} total plays
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Skip Rate
                    </CardTitle>
                    <Radio className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {musicData.skipRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {musicData.completionRate}% completion
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Like Rate
                    </CardTitle>
                    <Headphones className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {musicData.likeRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      User engagement
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg Plays
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {musicData.avgPlaysPerTrack}
                    </div>
                    <p className="text-xs text-muted-foreground">Per track</p>
                  </CardContent>
                </Card>
              </div>

              {/* BPM Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>BPM Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={musicData.bpmDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Tracks" fill={COLORS[0]} />
                      <Bar
                        dataKey="avgPlays"
                        name="Avg Plays"
                        fill={COLORS[2]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Tracks */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Tracks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {musicData.topTracks.map((track, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{track.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {track.artist}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Plays:
                            </span>{" "}
                            <span className="font-medium">{track.plays}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Completed:
                            </span>{" "}
                            <span className="font-medium">
                              {track.completions}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Skipped:
                            </span>{" "}
                            <span className="font-medium">{track.skips}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {performanceData && summary && (
            <>
              {/* Performance Summary */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Pace
                    </CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceData.avgPace.toFixed(2)} min/km
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all runs
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Heart Rate
                    </CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceData.avgHeartRate} bpm
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {summary.totalHeartRateData} readings
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Cadence
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceData.avgCadence} spm
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Steps per minute
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Speed
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceData.avgSpeed.toFixed(2)} km/h
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Overall speed
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Calories
                    </CardTitle>
                    <Flame className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceData.totalCalories.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Calories burned
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Steps
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceData.totalSteps.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {summary.totalGPSPoints.toLocaleString()} GPS points
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Total Distance
                        </span>
                        <span className="text-2xl font-bold">
                          {summary.totalDistance.toFixed(1)} km
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average {summary.avgSessionDistance.toFixed(2)} km per
                        session
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Total Duration
                        </span>
                        <span className="text-2xl font-bold">
                          {formatDuration(summary.totalDuration)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average {formatDuration(summary.avgSessionDuration)} per
                        session
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
