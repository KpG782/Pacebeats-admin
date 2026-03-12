"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Headphones,
  Heart,
  MoreVertical,
  Play,
  Tags,
  TrendingUp,
  Users,
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
  getMusicTrackDetail,
  type MusicTrackDetail,
} from "@/lib/supabase/music-queries";
import { useToast } from "@/components/ui/use-toast";

interface MusicDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatEventDuration(ms: number | null) {
  if (!ms || ms <= 0) return "N/A";
  return formatDuration(ms);
}

function TrackStatusBadges({
  completed,
  skipped,
  liked,
}: {
  completed: boolean | null;
  skipped: boolean | null;
  liked: boolean | null;
}) {
  return (
    <div className="flex gap-2">
      {completed ? <Badge>Completed</Badge> : null}
      {skipped ? <Badge variant="outline">Skipped</Badge> : null}
      {liked ? <Badge variant="secondary">Liked</Badge> : null}
    </div>
  );
}

export default function MusicDetailPage({ params }: MusicDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [track, setTrack] = useState<MusicTrackDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrack() {
      setLoading(true);

      try {
        const detail = await getMusicTrackDetail(id);
        setTrack(detail);
      } catch (error) {
        console.error("Error loading music detail:", error);
        toast({
          title: "Music detail unavailable",
          description: "Could not load this track from Supabase.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadTrack();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading track...</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Track Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{track.name}</h1>
              <Badge variant="outline">{track.track_id}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{track.artist}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View on Spotify</DropdownMenuItem>
            <DropdownMenuItem>Export Track Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{track.total_plays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From listening_events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Listeners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{track.unique_listeners}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique user IDs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{track.completion_rate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed listens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{track.likes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Positive reactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">
            <Clock className="h-4 w-4 mr-2" />
            Listening Events
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Tags className="h-4 w-4 mr-2" />
            Metadata
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Track Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium">Genre</p>
                <p className="text-sm text-muted-foreground">{track.genre}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Mood</p>
                <p className="text-sm text-muted-foreground">{track.mood}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(track.duration_ms)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Tempo</p>
                <p className="text-sm text-muted-foreground">
                  {track.tempo ? `${Math.round(track.tempo)} BPM` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Energy</p>
                <p className="text-sm text-muted-foreground">
                  {typeof track.energy === "number" ? track.energy.toFixed(2) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Year</p>
                <p className="text-sm text-muted-foreground">{track.year || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Spotify ID</p>
                <p className="text-sm text-muted-foreground break-all">
                  {track.spotify_id || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Preview URL</p>
                <p className="text-sm text-muted-foreground break-all">
                  {track.spotify_preview_url || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listening Events</CardTitle>
            </CardHeader>
            <CardContent>
              {track.events.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Played At</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Played</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {track.events.map((event) => (
                      <TableRow key={event.event_key}>
                        <TableCell>{new Date(event.ts_start).toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs">{event.user_id || "N/A"}</TableCell>
                        <TableCell className="font-mono text-xs">{event.session_id || "N/A"}</TableCell>
                        <TableCell>{formatEventDuration(event.played_ms)}</TableCell>
                        <TableCell>
                          <TrackStatusBadges
                            completed={event.completed}
                            skipped={event.skipped}
                            liked={event.liked}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No listening events recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raw Music Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Track ID</p>
                <p className="text-sm text-muted-foreground font-mono">{track.track_id}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">Tags</p>
                <p className="text-sm text-muted-foreground">{track.tags || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Mood / Genre</p>
                <p className="text-sm text-muted-foreground">
                  {track.mood} / {track.genre}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
