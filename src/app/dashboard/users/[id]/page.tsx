"use client";

import { use, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Activity,
  MapPin,
  Heart,
  Flame,
  Clock,
  TrendingUp,
  Edit,
  Ban,
  Trash2,
  MoreHorizontal,
  UserCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";

interface UserRow {
  id: string;
  email: string;
  username: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string | null;
  age: number | null;
  gender: string | null;
  provider: string | null;
  spotify_user_id: string | null;
  survey_completed: boolean | null;
  run_frequency: string | null;
  pace_band: string | null;
  preferred_genres: string[] | null;
  pump_up_genres: string[] | null;
}

interface RunningSession {
  id: string;
  user_id: string;
  session_start_time: string;
  session_end_time: string | null;
  session_duration_seconds: number | null;
  total_distance_km: number | null;
  total_steps: number | null;
  avg_pace_min_per_km: number | null;
  avg_heart_rate_bpm: number | null;
  calories_burned: number | null;
  status: string | null;
  run_type: string | null;
  selected_emotion: string | null;
  selected_playlist: string | null;
  created_at: string | null;
}

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatPace(minutesPerKm: number | null) {
  if (!minutesPerKm || minutesPerKm <= 0) return "N/A";

  const wholeMinutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - wholeMinutes) * 60);
  return `${wholeMinutes}:${seconds.toString().padStart(2, "0")} /km`;
}

function isLikelyUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<UserRow | null>(null);
  const [sessions, setSessions] = useState<RunningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setNotFound(false);

        if (!id) {
          setNotFound(true);
          return;
        }

        if (id.startsWith("mock-")) {
          toast({
            title: "Mock User",
            description: "This is sample data. Real user details are not available.",
          });
          setNotFound(true);
          return;
        }

        if (!isLikelyUuid(id)) {
          toast({
            title: "Invalid user ID",
            description: "The user ID format is not valid.",
            variant: "destructive",
          });
          setNotFound(true);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select(
            "id, email, username, role, avatar_url, created_at, age, gender, provider, spotify_user_id, survey_completed, run_frequency, pace_band, preferred_genres, pump_up_genres"
          )
          .eq("id", id)
          .single();

        if (userError || !userData) {
          console.error("Error fetching user:", {
            message: userError?.message,
            details: userError?.details,
            hint: userError?.hint,
            code: userError?.code,
          });
          setNotFound(true);
          return;
        }

        setUser(userData as UserRow);

        const { data: sessionsData, error: sessionsError } = await supabase
          .from("running_sessions")
          .select(
            "id, user_id, session_start_time, session_end_time, session_duration_seconds, total_distance_km, total_steps, avg_pace_min_per_km, avg_heart_rate_bpm, calories_burned, status, run_type, selected_emotion, selected_playlist, created_at"
          )
          .eq("user_id", id)
          .order("session_start_time", { ascending: false })
          .limit(20);

        if (sessionsError) {
          console.error("Error fetching sessions:", {
            message: sessionsError.message,
            details: sessionsError.details,
            hint: sessionsError.hint,
            code: sessionsError.code,
          });
          setSessions([]);
        } else {
          setSessions((sessionsData || []) as RunningSession[]);
        }
      } catch (error) {
        console.error("Unexpected error fetching user data:", {
          message:
            error instanceof Error
              ? error.message
              : typeof error === "object" && error !== null && "message" in error
              ? String((error as { message: unknown }).message)
              : String(error),
          error,
        });
        toast({
          title: "Error",
          description: "Failed to load user data.",
          variant: "destructive",
        });
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [id, toast]);

  const stats = useMemo(() => {
    const totalRuns = sessions.length;
    const totalDistance = sessions.reduce(
      (sum, session) => sum + Number(session.total_distance_km || 0),
      0
    );
    const totalDurationMinutes = Math.round(
      sessions.reduce(
        (sum, session) => sum + Number(session.session_duration_seconds || 0),
        0
      ) / 60
    );
    const avgHeartRateSessions = sessions.filter(
      (session) => typeof session.avg_heart_rate_bpm === "number"
    );
    const avgHeartRate =
      avgHeartRateSessions.length > 0
        ? Math.round(
            avgHeartRateSessions.reduce(
              (sum, session) => sum + Number(session.avg_heart_rate_bpm || 0),
              0
            ) / avgHeartRateSessions.length
          )
        : null;

    return {
      totalRuns,
      totalDistance: totalDistance.toFixed(2),
      totalDurationMinutes,
      avgHeartRate,
    };
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading user details...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            User Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The user you&apos;re looking for doesn&apos;t exist or cannot be loaded.
          </p>
          <Button onClick={() => router.push("/dashboard/users")}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/users")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              User Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View profile details and recent running sessions
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Ban className="mr-2 h-4 w-4" />
              Suspend Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-lg">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username || user.email} />
                  ) : (
                    <div className="h-full w-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
                      {(user.username || user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.username || user.email.split("@")[0]}
                    </h2>
                    <Badge className="bg-green-100 text-green-900 border border-green-300 font-semibold dark:bg-green-900/30 dark:text-green-400 dark:border-green-700">
                      {user.role || "user"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined{" "}
                      {user.created_at
                        ? format(new Date(user.created_at), "MMM dd, yyyy")
                        : "Unknown"}
                    </div>
                    {user.provider && (
                      <div className="flex items-center gap-1">
                        <UserCircle2 className="h-4 w-4" />
                        {user.provider}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {typeof user.age === "number" && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Age
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.age} years
                      </p>
                    </div>
                  )}
                  {user.gender && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Gender
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.gender}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Spotify
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.spotify_user_id ? "Connected" : "Not connected"}
                    </p>
                  </div>
                  {user.run_frequency && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Run Frequency
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.run_frequency}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Runs</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalRuns}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Distance
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalDistance} km
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Duration
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {Math.floor(stats.totalDurationMinutes / 60)}h{" "}
                  {stats.totalDurationMinutes % 60}m
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Heart Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.avgHeartRate ? `${stats.avgHeartRate} bpm` : "N/A"}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">
              Running Sessions ({sessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Running Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Avg Pace</TableHead>
                        <TableHead>Heart Rate</TableHead>
                        <TableHead>Calories</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            {format(new Date(session.session_start_time), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {formatDuration(session.session_duration_seconds)}
                          </TableCell>
                          <TableCell>
                            {Number(session.total_distance_km || 0).toFixed(2)} km
                          </TableCell>
                          <TableCell>{formatPace(session.avg_pace_min_per_km)}</TableCell>
                          <TableCell>
                            {session.avg_heart_rate_bpm ? (
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-red-500" />
                                {session.avg_heart_rate_bpm} bpm
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            {session.calories_burned ? (
                              <div className="flex items-center gap-1">
                                <Flame className="h-4 w-4 text-orange-500" />
                                {session.calories_burned}
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                session.status === "completed"
                                  ? "bg-green-100 text-green-900 border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                                  : "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700"
                              }
                            >
                              {session.status || "completed"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    No sessions found for this user.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
