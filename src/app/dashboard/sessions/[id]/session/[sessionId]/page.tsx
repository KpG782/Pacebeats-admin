"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Play,
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
  getSessionDetail,
  type SessionDetail,
} from "@/lib/supabase/session-queries";
import { useToast } from "@/components/ui/use-toast";

interface SessionDetailPageProps {
  params: {
    id: string;
    sessionId: string;
  };
}

export default function SessionDetailPage({ params }: SessionDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessionData() {
      setLoading(true);

      try {
        console.log(
          `🔍 Fetching session ${params.sessionId} for user ${params.id}...`
        );

        const sessionDetail = await getSessionDetail(params.sessionId);

        if (!sessionDetail) {
          toast({
            title: "Not Found",
            description: "Session not found in database.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Verify the session belongs to the user
        if (sessionDetail.user_id !== params.id) {
          console.error("❌ Session does not belong to this user");
          toast({
            title: "Access Denied",
            description: "This session does not belong to the specified user.",
            variant: "destructive",
          });
          router.push(`/dashboard/sessions/${params.id}`);
          return;
        }

        setSession(sessionDetail);
        console.log("✅ Session loaded:", sessionDetail);
      } catch (error: unknown) {
        const err = error as Error;
        console.error("Error loading session:", err);
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
  }, [params.sessionId, params.id, toast, router]);

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/sessions/${params.id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Session Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              The requested session could not be found.
            </p>
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => router.push(`/dashboard/sessions/${params.id}`)}
              >
                Back to User Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format functions
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0s";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/sessions/${params.id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Session Details</h1>
              <Badge className={getStatusColor(session.status)}>
                {session.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {session.user_name} ({session.user_email}) •{" "}
              {formatDate(session.started_at)}
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
            <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session.total_songs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {session.completed_songs} completed
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
              Total play time: {formatTime(session.total_time_ms)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">
                👍 {session.liked_songs}
              </div>
              <div className="text-2xl font-bold text-red-600">
                👎 {session.disliked_songs}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {session.skipped_songs} skipped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {session.status}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {session.status === "active"
                ? "Session in progress"
                : "Session completed"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="music" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="music">
            <Music className="h-4 w-4 mr-2" />
            Listening Events
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Music Played ({session.music_history.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.music_history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Track</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>BPM</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.music_history.map((track) => (
                      <TableRow key={track.id}>
                        <TableCell className="font-medium">
                          {track.track_title}
                        </TableCell>
                        <TableCell>{track.track_artist || "Unknown"}</TableCell>
                        <TableCell>
                          {track.played_duration_seconds
                            ? formatTime(track.played_duration_seconds * 1000)
                            : "N/A"}
                        </TableCell>
                        <TableCell>{track.track_bpm || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={track.was_skipped ? "outline" : "default"}
                          >
                            {track.was_skipped ? "Skipped" : "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {track.was_liked && (
                              <span className="text-green-600">👍</span>
                            )}
                          </div>
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
                  <p className="text-sm text-muted-foreground font-mono">
                    {session.session_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">User</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user_email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {session.status}
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
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Songs</p>
                  <p className="text-sm text-muted-foreground">
                    {session.total_songs}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Completed Songs</p>
                  <p className="text-sm text-muted-foreground">
                    {session.completed_songs}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Skipped Songs</p>
                  <p className="text-sm text-muted-foreground">
                    {session.skipped_songs}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Engagement</p>
                  <p className="text-sm text-muted-foreground">
                    👍 {session.liked_songs} • 👎 {session.disliked_songs}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(session.duration_seconds)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Play Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(session.total_time_ms)}
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
