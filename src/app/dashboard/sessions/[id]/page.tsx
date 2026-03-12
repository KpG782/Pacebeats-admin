"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MapPin,
  MoreVertical,
  Music,
  Route,
  Timer,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteSession,
  getSessionDetail,
  type SessionDetail,
} from "@/lib/supabase/session-queries";
import { useToast } from "@/components/ui/use-toast";

interface SessionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) return "0s";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatPlayTime(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(date: string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleString();
}

function formatPace(minutesPerKm: number | null) {
  if (!minutesPerKm || minutesPerKm <= 0) return "N/A";
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-400";
    case "completed":
      return "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-400";
    case "paused":
      return "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "cancelled":
      return "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-900 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

export default function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadSessionData() {
      setLoading(true);

      try {
        const sessionDetail = await getSessionDetail(id);

        if (!sessionDetail) {
          toast({
            title: "Not found",
            description: "Session not found in database.",
            variant: "destructive",
          });
          return;
        }

        setSession(sessionDetail);
      } catch (error) {
        console.error("Error loading session:", error);
        toast({
          title: "Error",
          description: "Failed to load session details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadSessionData();
  }, [id, toast]);

  const latestHeartRate = useMemo(() => {
    if (!session?.heart_rate_data.length) return null;
    return session.heart_rate_data[session.heart_rate_data.length - 1];
  }, [session]);

  const routeSummary = useMemo(() => {
    if (!session?.gps_points.length) return null;
    const first = session.gps_points[0];
    const last = session.gps_points[session.gps_points.length - 1];
    return { first, last, total: session.gps_points.length };
  }, [session]);

  const handleExportSession = () => {
    if (!session) return;

    const rows = [
      ["Session ID", session.session_id],
      ["User", session.user_name],
      ["Email", session.user_email],
      ["Status", session.status],
      ["Started At", session.started_at],
      ["Ended At", session.ended_at || ""],
      ["Duration Seconds", String(session.duration_seconds || 0)],
      ["Distance Km", String(session.distance_km || 0)],
      ["Total Steps", String(session.total_steps || 0)],
      ["Avg Pace", String(session.avg_pace_min_per_km || "")],
      ["Avg Heart Rate", String(session.avg_heart_rate_bpm || "")],
      ["Max Heart Rate", String(session.max_heart_rate_bpm || "")],
      ["Total Songs", String(session.total_songs)],
      ["Completed Songs", String(session.completed_songs)],
      ["Skipped Songs", String(session.skipped_songs)],
      ["Liked Songs", String(session.liked_songs)],
      ["Selected Playlist", session.selected_playlist || ""],
      ["Selected Emotion", session.selected_emotion || ""],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `session_${session.session_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export complete",
      description: "Session detail export downloaded.",
    });
  };

  const handleDeleteSession = async () => {
    if (!session) return;

    try {
      setDeleting(true);
      await deleteSession(session.session_id);
      toast({
        title: "Session deleted",
        description: "The session and related records were removed.",
      });
      router.push("/dashboard/sessions");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete this session.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Session Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              The requested session could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold">Session Details</h1>
              <Badge className={getStatusBadgeClass(session.status)}>
                {session.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {session.user_name} ({session.user_email})
            </p>
            <p className="text-sm text-muted-foreground">
              Started {formatDate(session.started_at)}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${session.user_id}`)}>
              <User className="mr-2 h-4 w-4" />
              View User Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportSession}>
              Export Session Data
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteSession}
              className="text-red-600"
              disabled={deleting}
            >
              Delete Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Distance</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(session.distance_km || 0).toFixed(2)} km
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {session.total_steps.toLocaleString()} total steps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(session.duration_seconds)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total play time: {formatPlayTime(session.total_time_ms)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Pace</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPace(session.avg_pace_min_per_km)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Speed: {session.avg_speed_kmh ? `${session.avg_speed_kmh.toFixed(1)} km/h` : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {session.avg_heart_rate_bpm || latestHeartRate?.heart_rate_bpm || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Max {session.max_heart_rate_bpm || "N/A"} • Min {session.min_heart_rate_bpm || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Music</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session.total_songs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {session.completed_songs} completed • {session.skipped_songs} skipped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Route Points</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session.gps_points.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {session.pace_intervals.length} pace intervals
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="heart-rate">Heart Rate</TabsTrigger>
          <TabsTrigger value="route">Route</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Session ID</p>
                  <p className="text-sm text-muted-foreground font-mono break-all">
                    {session.session_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Run Type</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {session.run_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Selected Emotion</p>
                  <p className="text-sm text-muted-foreground">
                    {session.selected_emotion || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Selected Playlist</p>
                  <p className="text-sm text-muted-foreground">
                    {session.selected_playlist || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Started At</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(session.started_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Ended At</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(session.ended_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Avg Cadence</p>
                  <p className="text-sm text-muted-foreground">
                    {session.avg_cadence_spm ? `${session.avg_cadence_spm} spm` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Avg Speed</p>
                  <p className="text-sm text-muted-foreground">
                    {session.avg_speed_kmh ? `${session.avg_speed_kmh.toFixed(1)} km/h` : "N/A"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Liked Songs</p>
                  <p className="text-sm text-muted-foreground">{session.liked_songs}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Disliked Songs</p>
                  <p className="text-sm text-muted-foreground">{session.disliked_songs}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Heart Rate Samples</p>
                  <p className="text-sm text-muted-foreground">{session.heart_rate_data.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">GPS Samples</p>
                  <p className="text-sm text-muted-foreground">{session.gps_points.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pace Intervals</CardTitle>
            </CardHeader>
            <CardContent>
              {session.pace_intervals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Interval</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Pace</TableHead>
                      <TableHead>Cadence</TableHead>
                      <TableHead>Avg HR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.pace_intervals.map((interval) => (
                      <TableRow key={interval.id}>
                        <TableCell>{interval.interval_number}</TableCell>
                        <TableCell>{interval.distance_km ? `${interval.distance_km.toFixed(2)} km` : "N/A"}</TableCell>
                        <TableCell>{formatPace(interval.pace_min_per_km)}</TableCell>
                        <TableCell>{interval.cadence_spm ? `${interval.cadence_spm} spm` : "N/A"}</TableCell>
                        <TableCell>{interval.avg_heart_rate_bpm || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No pace interval data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="music" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Music Played ({session.music_history.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {session.music_history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Track</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>BPM</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.music_history.map((track) => (
                      <TableRow key={track.id}>
                        <TableCell>{track.play_order}</TableCell>
                        <TableCell className="font-medium">{track.track_title}</TableCell>
                        <TableCell>{track.track_artist || "Unknown"}</TableCell>
                        <TableCell>
                          {track.played_duration_seconds
                            ? formatDuration(track.played_duration_seconds)
                            : "N/A"}
                        </TableCell>
                        <TableCell>{track.track_bpm || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={track.was_skipped ? "outline" : "default"}>
                            {track.was_skipped
                              ? "Skipped"
                              : track.was_liked
                              ? "Liked"
                              : "Completed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No music data for this session.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heart-rate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Heart Rate Samples</CardTitle>
            </CardHeader>
            <CardContent>
              {session.heart_rate_data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Offset</TableHead>
                      <TableHead>Heart Rate</TableHead>
                      <TableHead>Connected</TableHead>
                      <TableHead>Recorded At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.heart_rate_data.map((sample) => (
                      <TableRow key={sample.id}>
                        <TableCell>{sample.timestamp_offset_seconds}s</TableCell>
                        <TableCell>{sample.heart_rate_bpm} bpm</TableCell>
                        <TableCell>{sample.is_connected === false ? "No" : "Yes"}</TableCell>
                        <TableCell>{formatDate(sample.recorded_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No heart rate data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="route" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {routeSummary ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Total GPS Points</p>
                      <p className="text-sm text-muted-foreground">{routeSummary.total}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Start Coordinate</p>
                      <p className="text-sm text-muted-foreground">
                        {routeSummary.first.latitude.toFixed(5)}, {routeSummary.first.longitude.toFixed(5)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">End Coordinate</p>
                      <p className="text-sm text-muted-foreground">
                        {routeSummary.last.latitude.toFixed(5)}, {routeSummary.last.longitude.toFixed(5)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Offset</TableHead>
                        <TableHead>Latitude</TableHead>
                        <TableHead>Longitude</TableHead>
                        <TableHead>Speed</TableHead>
                        <TableHead>Accuracy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.gps_points.slice(0, 25).map((point) => (
                        <TableRow key={point.id}>
                          <TableCell>{point.timestamp_offset_seconds}s</TableCell>
                          <TableCell>{point.latitude.toFixed(5)}</TableCell>
                          <TableCell>{point.longitude.toFixed(5)}</TableCell>
                          <TableCell>
                            {typeof point.speed_mps === "number"
                              ? `${point.speed_mps.toFixed(2)} m/s`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {typeof point.accuracy_m === "number"
                              ? `${point.accuracy_m.toFixed(1)} m`
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No GPS route data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
