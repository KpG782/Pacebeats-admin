"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Play,
  MapPin,
  Heart,
  Music,
  TrendingUp,
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
  getSessionById,
  getGPSPointsBySessionId,
  getHeartRateBySessionId,
  getMusicBySessionId,
} from "@/lib/enhanced-session-data";

interface SessionDetailPageProps {
  params: {
    id: string;
  };
}

export default function SessionDetailPage({ params }: SessionDetailPageProps) {
  const router = useRouter();
  const session = getSessionById(params.id);

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Session Not Found</h1>
        </div>
        <p>The requested session could not be found.</p>
      </div>
    );
  }

  const gpsPoints = getGPSPointsBySessionId(params.id);
  const heartRates = getHeartRateBySessionId(params.id);
  const musicTracks = getMusicBySessionId(params.id);

  // Format functions
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatPace = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")} /km`;
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2) + " km";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "paused":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Session {session.id}</h1>
              <Badge className={getStatusColor(session.status)}>
                {session.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {session.user_name} • {formatDate(session.started_at)}
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
            <DropdownMenuItem>View User Profile</DropdownMenuItem>
            <DropdownMenuItem>Export Session Data</DropdownMenuItem>
            <DropdownMenuItem>Download GPS Track</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Distance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDistance(session.total_distance_meters)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {session.steps_count
                ? `${session.steps_count.toLocaleString()} steps`
                : "No step data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(session.duration_seconds)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg Pace: {formatPace(session.avg_pace_per_km)}
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
              {session.avg_heart_rate || "N/A"}{" "}
              {session.avg_heart_rate && "bpm"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Max: {session.max_heart_rate || "N/A"} bpm
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {session.calories_burned || "N/A"}{" "}
              {session.calories_burned && "kcal"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {session.weather_condition || "No weather data"}
              {session.temperature ? ` • ${session.temperature}°C` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="route" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="route">
            <MapPin className="h-4 w-4 mr-2" />
            Route & GPS
          </TabsTrigger>
          <TabsTrigger value="heartrate">
            <Heart className="h-4 w-4 mr-2" />
            Heart Rate
          </TabsTrigger>
          <TabsTrigger value="music">
            <Music className="h-4 w-4 mr-2" />
            Music
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="route" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GPS Route</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg h-[400px] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">GPS Map Visualization</p>
                  <p className="text-sm text-muted-foreground">
                    (Leaflet integration pending)
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Start Location</p>
                  <p className="text-sm text-muted-foreground">
                    {session.start_location
                      ? `${session.start_location.lat.toFixed(
                          4
                        )}, ${session.start_location.lng.toFixed(4)}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">End Location</p>
                  <p className="text-sm text-muted-foreground">
                    {session.end_location
                      ? `${session.end_location.lat.toFixed(
                          4
                        )}, ${session.end_location.lng.toFixed(4)}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {gpsPoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>GPS Points ({gpsPoints.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Latitude</TableHead>
                      <TableHead>Longitude</TableHead>
                      <TableHead>Altitude</TableHead>
                      <TableHead>Accuracy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gpsPoints.slice(0, 10).map((point) => (
                      <TableRow key={point.id}>
                        <TableCell>
                          {new Date(point.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>{point.latitude.toFixed(5)}</TableCell>
                        <TableCell>{point.longitude.toFixed(5)}</TableCell>
                        <TableCell>
                          {point.altitude ? `${point.altitude}m` : "N/A"}
                        </TableCell>
                        <TableCell>
                          {point.accuracy ? `±${point.accuracy}m` : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {gpsPoints.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Showing 10 of {gpsPoints.length} GPS points
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="heartrate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Heart Rate Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg h-[400px] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Heart Rate Chart</p>
                  <p className="text-sm text-muted-foreground">
                    (Recharts integration pending)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {heartRates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Heart Rate Data ({heartRates.length} readings)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">
                      {session.avg_heart_rate} bpm
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Maximum</p>
                    <p className="text-2xl font-bold">
                      {session.max_heart_rate} bpm
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Minimum</p>
                    <p className="text-2xl font-bold">
                      {Math.min(...heartRates.map((hr) => hr.heart_rate))} bpm
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Heart Rate</TableHead>
                      <TableHead>Zone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {heartRates.map((hr) => {
                      const zone =
                        hr.heart_rate > 170
                          ? "Maximum"
                          : hr.heart_rate > 150
                          ? "Hard"
                          : hr.heart_rate > 130
                          ? "Moderate"
                          : "Light";
                      return (
                        <TableRow key={hr.id}>
                          <TableCell>
                            {new Date(hr.timestamp).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>{hr.heart_rate} bpm</TableCell>
                          <TableCell>
                            <Badge variant="outline">{zone}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="music" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Music Played During Session</CardTitle>
            </CardHeader>
            <CardContent>
              {musicTracks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Track</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {musicTracks.map((track) => (
                      <TableRow key={track.id}>
                        <TableCell>
                          {new Date(track.played_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {track.track_name}
                        </TableCell>
                        <TableCell>{track.artist_name}</TableCell>
                        <TableCell>
                          {Math.floor(track.duration_ms / 60000)}:
                          {((track.duration_ms % 60000) / 1000)
                            .toFixed(0)
                            .padStart(2, "0")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={track.completed ? "default" : "outline"}
                          >
                            {track.completed ? "Completed" : "Skipped"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Music className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No music data for this session
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Session ID</p>
                  <p className="text-sm text-muted-foreground">{session.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user_id}
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
                    {session.ended_at
                      ? formatDate(session.ended_at)
                      : "In Progress"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {session.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created At</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(session.created_at)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Weather</p>
                  <p className="text-sm text-muted-foreground">
                    {session.weather_condition || "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Temperature</p>
                  <p className="text-sm text-muted-foreground">
                    {session.temperature
                      ? `${session.temperature}°C`
                      : "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">GPS Points</p>
                  <p className="text-sm text-muted-foreground">
                    {gpsPoints.length} recorded
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Heart Rate Readings</p>
                  <p className="text-sm text-muted-foreground">
                    {heartRates.length} recorded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
