"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  Download,
  Music,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAnalyticsData,
  type AnalyticsData,
  type AnalyticsRange,
} from "@/lib/supabase/analytics-queries";

const COLORS = [
  "oklch(0.55 0.18 250)",
  "oklch(0.65 0.15 200)",
  "oklch(0.70 0.12 180)",
  "oklch(0.60 0.16 220)",
  "oklch(0.50 0.20 260)",
  "oklch(0.75 0.10 200)",
];

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<AnalyticsRange>("month");
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(
    async (showToast = false) => {
      try {
        if (analytics) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await getAnalyticsData(dateRange);
        setAnalytics(data);

        if (showToast) {
          toast({
            title: "Analytics refreshed",
            description: "Dashboard metrics reloaded from Supabase.",
          });
        }
      } catch (error) {
        console.error("Error loading analytics:", {
          message:
            error instanceof Error
              ? error.message
              : typeof error === "object" && error !== null && "message" in error
              ? String((error as { message: unknown }).message)
              : String(error),
          error,
        });
        toast({
          title: "Analytics unavailable",
          description: "Could not load analytics data from Supabase.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [analytics, dateRange, toast]
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const completionTrendDelta = useMemo(() => {
    if (!analytics || analytics.completionTrend.length < 2) return 0;
    const latest = analytics.completionTrend[analytics.completionTrend.length - 1];
    const previous = analytics.completionTrend[analytics.completionTrend.length - 2];
    return latest.completionRate - previous.completionRate;
  }, [analytics]);

  const topGenres = useMemo(
    () => (analytics ? analytics.genreDistribution.slice(0, 3) : []),
    [analytics]
  );

  const handleExportData = () => {
    if (!analytics) return;

    const rows = [
      ["Metric", "Value"],
      ["Total Users", analytics.stats.totalUsers],
      ["Active Users", analytics.stats.activeUsers],
      ["Total Sessions", analytics.stats.totalSessions],
      ["Total Plays", analytics.stats.totalPlays],
      ["Avg Session Minutes", analytics.stats.avgSessionDurationMinutes],
      ["User Retention Rate", analytics.stats.userRetentionRate],
      ["Avg Tracks Per Session", analytics.stats.avgTracksPerSession],
      ["Avg Completion Rate", analytics.stats.avgCompletionRate],
    ];

    const content =
      "data:text/csv;charset=utf-8," +
      rows.map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `analytics_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export complete",
      description: "Analytics summary downloaded as CSV.",
    });
  };

  if (loading && !analytics) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-[440px] w-full" />
      </div>
    );
  }

  const data = analytics;

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">
              Analytics data could not be loaded.
            </p>
            <Button onClick={() => loadAnalytics(true)}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Analytics Dashboard
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Real usage, music, and session analytics from Supabase
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={dateRange}
            onValueChange={(value) => setDateRange(value as AnalyticsRange)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last 12 Months</SelectItem>
              <SelectItem value="custom">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          title="Active Users"
          value={data.stats.activeUsers.toLocaleString()}
          subtitle="Users with sessions or plays in this range"
          icon={Users}
        />
        <StatsCard
          title="Total Sessions"
          value={data.stats.totalSessions.toLocaleString()}
          subtitle={`${data.stats.avgSessionDurationMinutes} min average`}
          icon={Activity}
        />
        <StatsCard
          title="Total Plays"
          value={data.stats.totalPlays.toLocaleString()}
          subtitle={`${data.stats.avgCompletionRate}% completion`}
          icon={Music}
        />
        <StatsCard
          title="Avg Session"
          value={`${data.stats.avgSessionDurationMinutes}m`}
          subtitle={`${data.stats.avgTracksPerSession} tracks per session`}
          icon={Clock}
        />
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ChartCard title="Top 10 Most Played Songs">
            {data.topSongs.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.topSongs}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" height={90} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="plays" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No listening events found for this range." />
            )}
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Genre Distribution">
              {data.genreDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={data.genreDistribution as never[]}
                      cx="50%"
                      cy="45%"
                      outerRadius={110}
                      innerRadius={55}
                      dataKey="value"
                      labelLine={false}
                    >
                      {data.genreDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [value, name]} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No genre data found." />
              )}
            </ChartCard>

            <ChartCard title="Mood Distribution">
              {data.moodDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={data.moodDistribution as never[]}
                      cx="50%"
                      cy="45%"
                      outerRadius={110}
                      innerRadius={55}
                      dataKey="value"
                      labelLine={false}
                    >
                      {data.moodDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [value, name]} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No mood data found." />
              )}
            </ChartCard>
          </div>

          <ChartCard title="Completion Rate Over Time">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Based on `listening_events.completed`
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>{completionTrendDelta >= 0 ? "+" : ""}{completionTrendDelta.toFixed(1)} pts</span>
              </div>
            </div>
            {data.completionTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data.completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="completionRate"
                    stroke={COLORS[0]}
                    fill={COLORS[1]}
                    fillOpacity={0.35}
                    name="Completion Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="likedRate"
                    stroke={COLORS[2]}
                    strokeWidth={2}
                    name="Like Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No completion data found." />
            )}
          </ChartCard>
        </TabsContent>

        <TabsContent value="music" className="space-y-6">
          <ChartCard title="BPM Distribution and Average Plays">
            {data.bpmDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data.bpmDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="range" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill={COLORS[0]} name="Track Count" radius={[8, 8, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="avgPlays" stroke={COLORS[2]} strokeWidth={3} name="Avg Plays" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No BPM data found." />
            )}
          </ChartCard>

          <ChartCard title="Music Engagement Trends">
            {data.musicEngagement.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data.musicEngagement}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="label" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="plays" fill={COLORS[1]} fillOpacity={0.4} stroke={COLORS[0]} name="Total Plays" />
                  <Line yAxisId="right" type="monotone" dataKey="avgCompletionRate" stroke={COLORS[2]} strokeWidth={3} name="Completion Rate (%)" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No engagement data found." />
            )}
          </ChartCard>

          <ChartCard title="Top Performing Genres">
            {topGenres.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topGenres.map((genre, index) => (
                  <div
                    key={genre.name}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {genre.name}
                      </h3>
                      <Badge style={{ backgroundColor: genre.color }}>#{index + 1}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Tracks: {genre.tracks}</p>
                    <p className="text-sm text-muted-foreground">Total plays: {genre.value}</p>
                    <p className="text-sm text-muted-foreground">Avg plays: {genre.avgPlays}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyChart message="No genre performance data found." />
            )}
          </ChartCard>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <ChartCard title="User Activity Trend">
            {data.userActivityTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data.userActivityTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="label" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="activeUsers" fill={COLORS[1]} fillOpacity={0.4} stroke={COLORS[0]} name="Active Users" />
                  <Line yAxisId="right" type="monotone" dataKey="newUsers" stroke={COLORS[2]} strokeWidth={3} name="New Users" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No user activity data found." />
            )}
          </ChartCard>

          <ChartCard title="Peak Usage Hours">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.peakUsageHours}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="hour" interval={1} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill={COLORS[0]} name="Sessions" radius={[4, 4, 0, 0]} />
                <Bar dataKey="users" fill={COLORS[2]} name="Users" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <ChartCard title="Session Metrics Over Time">
            {data.sessionMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data.sessionMetrics}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="label" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalSessions" fill={COLORS[0]} name="Total Sessions" radius={[8, 8, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="avgDuration" stroke={COLORS[2]} strokeWidth={3} name="Avg Duration (sec)" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No session data found." />
            )}
          </ChartCard>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">Avg Session Length</p>
            <p className="text-3xl font-bold">{data.stats.avgSessionDurationMinutes} min</p>
            <p className="text-xs opacity-80 mt-2">From running_sessions.session_duration_seconds</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[oklch(0.65_0.15_200)] to-[oklch(0.60_0.16_220)] text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">Active Users</p>
            <p className="text-3xl font-bold">{data.stats.activeUsers}</p>
            <p className="text-xs opacity-80 mt-2">Users with sessions or plays in range</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[oklch(0.70_0.12_180)] to-[oklch(0.65_0.15_200)] text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">Avg Tracks per Session</p>
            <p className="text-3xl font-bold">{data.stats.avgTracksPerSession}</p>
            <p className="text-xs opacity-80 mt-2">From listening_events grouped by session</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[oklch(0.60_0.16_220)] to-[oklch(0.55_0.18_250)] text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">Completion Rate</p>
            <p className="text-3xl font-bold">{data.stats.avgCompletionRate}%</p>
            <p className="text-xs opacity-80 mt-2">From listening_events.completed</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
