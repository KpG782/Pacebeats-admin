"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Play,
  Heart,
  TrendingUp,
  Users,
  Clock,
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
  getTrackById,
  getListeningEventsByTrackId,
} from "@/lib/enhanced-music-data";

interface MusicDetailPageProps {
  params: {
    id: string;
  };
}

export default function MusicDetailPage({ params }: MusicDetailPageProps) {
  const router = useRouter();
  const track = getTrackById(params.id);

  if (!track) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Track Not Found</h1>
        </div>
        <p>The requested music track could not be found.</p>
      </div>
    );
  }

  const listeningEvents = getListeningEventsByTrackId(params.id);

  // Format functions
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEnergyLabel = (level: number) => {
    if (level >= 9) return "Very High";
    if (level >= 7) return "High";
    if (level >= 5) return "Medium";
    if (level >= 3) return "Low";
    return "Very Low";
  };

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      Energetic: "bg-red-500",
      Motivated: "bg-orange-500",
      Focused: "bg-blue-500",
      Calm: "bg-cyan-500",
      Uplifting: "bg-green-500",
      Intense: "bg-red-600",
      Chill: "bg-purple-500",
    };
    return colors[mood] || "bg-gray-500";
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
              <h1 className="text-3xl font-bold">{track.track_name}</h1>
              <Badge variant={track.is_active ? "default" : "secondary"}>
                {track.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {track.artist_name} {track.album_name && `• ${track.album_name}`}
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
            <DropdownMenuItem>Edit Track</DropdownMenuItem>
            <DropdownMenuItem>View on Spotify</DropdownMenuItem>
            <DropdownMenuItem>Download Report</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              {track.is_active ? "Deactivate" : "Activate"} Track
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Track Cover & Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-4">
              {track.cover_image_url ? (
                <img
                  src={track.cover_image_url}
                  alt={track.track_name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Play className="h-24 w-24 text-primary opacity-50" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Genre</span>
                <Badge variant="outline">{track.genre}</Badge>
              </div>
              {track.sub_genre && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Sub-genre
                  </span>
                  <Badge variant="outline">{track.sub_genre}</Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mood</span>
                <Badge className={getMoodColor(track.mood)}>{track.mood}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Energy</span>
                <span className="text-sm font-medium">
                  {getEnergyLabel(track.energy_level)} ({track.energy_level}/10)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Track Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Play className="h-4 w-4" />
                  <span className="text-sm">Total Plays</span>
                </div>
                <p className="text-2xl font-bold">
                  {track.total_plays.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Listeners</span>
                </div>
                <p className="text-2xl font-bold">
                  {track.unique_listeners.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Completion</span>
                </div>
                <p className="text-2xl font-bold">
                  {track.avg_completion_rate || 0}%
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">BPM</span>
                </div>
                <p className="text-2xl font-bold">{track.bpm}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="font-medium">
                  {formatDuration(track.duration_ms)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Release Date
                </p>
                <p className="font-medium">
                  {track.release_date ? formatDate(track.release_date) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Optimal Pace
                </p>
                <p className="font-medium">
                  {track.optimal_pace_min && track.optimal_pace_max
                    ? `${Math.floor(track.optimal_pace_min / 60)}:${(
                        track.optimal_pace_min % 60
                      )
                        .toString()
                        .padStart(2, "0")} - ${Math.floor(
                        track.optimal_pace_max / 60
                      )}:${(track.optimal_pace_max % 60)
                        .toString()
                        .padStart(2, "0")} /km`
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Added Date</p>
                <p className="font-medium">{formatDate(track.added_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="listening" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listening">
            <Clock className="h-4 w-4 mr-2" />
            Listening History
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="listening" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Listening Events</CardTitle>
            </CardHeader>
            <CardContent>
              {listeningEvents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Played At</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Pace</TableHead>
                      <TableHead>Heart Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listeningEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {new Date(event.played_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {event.user_id}
                        </TableCell>
                        <TableCell>
                          {formatDuration(event.play_duration_ms)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-full"
                                style={{
                                  width: `${event.completion_percentage}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {event.completion_percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.user_pace_at_play
                            ? `${Math.floor(event.user_pace_at_play / 60)}:${(
                                event.user_pace_at_play % 60
                              )
                                .toString()
                                .padStart(2, "0")} /km`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {event.user_heart_rate_at_play
                            ? `${event.user_heart_rate_at_play} bpm`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No listening events recorded yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Average Completion Rate
                      </span>
                      <span className="font-medium">
                        {track.avg_completion_rate}%
                      </span>
                    </div>
                    <div className="bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: `${track.avg_completion_rate}%` }}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Plays per Listener
                      </span>
                      <span className="font-medium">
                        {(track.total_plays / track.unique_listeners).toFixed(
                          2
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Skip Rate
                      </span>
                      <span className="font-medium">
                        {(100 - (track.avg_completion_rate || 0)).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Popularity Rank</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      #{/* Calculate rank based on total_plays */}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Best For</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {track.optimal_pace_min && track.optimal_pace_max
                        ? "Medium to fast paced runs"
                        : "All pace levels"}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Recommended Time</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {track.energy_level >= 7
                        ? "Morning/Evening high-intensity runs"
                        : "Easy recovery runs"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Track Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Track ID</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {track.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Spotify ID</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {track.spotify_id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Track Name</p>
                  <p className="text-sm text-muted-foreground">
                    {track.track_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Artist</p>
                  <p className="text-sm text-muted-foreground">
                    {track.artist_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Album</p>
                  <p className="text-sm text-muted-foreground">
                    {track.album_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(track.duration_ms)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">BPM</p>
                  <p className="text-sm text-muted-foreground">{track.bpm}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Energy Level</p>
                  <p className="text-sm text-muted-foreground">
                    {track.energy_level}/10
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Added At</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(track.added_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(track.updated_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {track.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Preview URL</p>
                  <p className="text-sm text-muted-foreground">
                    {track.preview_url ? "Available" : "N/A"}
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
