"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
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

// Database types
interface DatabaseUser {
  id: string;
  email: string;
  username: string | null;
  role: "user" | "admin" | "moderator";
  profile_picture_url: string | null;
  location: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  spotify_connected: boolean;
  spotify_user_id: string | null;
  total_runs: number;
  total_distance_km: number;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

interface RunningSession {
  id: string;
  user_id: string;
  start_time: string | null;
  end_time: string | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  avg_pace_min_per_km: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  calories_burned: number | null;
  status: "active" | "paused" | "completed" | "cancelled";
  created_at: string;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<DatabaseUser | null>(null);
  const [sessions, setSessions] = useState<RunningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching user data for ID: ${params.id}`);

      // Check if it's a mock user
      if (params.id.startsWith("mock-")) {
        console.log("📦 Mock user detected");
        toast({
          title: "Mock User",
          description: "This is sample data. Real user details not available.",
        });
        setNotFound(true);
        return;
      }

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", params.id)
        .single();

      if (userError || !userData) {
        console.error("❌ Error fetching user:", userError);
        setNotFound(true);
        return;
      }

      console.log("✅ User data loaded:", userData.username || userData.email);
      setUser(userData);

      // Fetch user's running sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("running_sessions")
        .select("*")
        .eq("user_id", params.id)
        .order("start_time", { ascending: false })
        .limit(20);

      if (sessionsError) {
        console.error("⚠️ Error fetching sessions:", sessionsError);
        // Don't fail if sessions error, just show empty
        setSessions([]);
      } else {
        console.log(`✅ Loaded ${sessionsData?.length || 0} sessions`);
        setSessions(sessionsData || []);
      }
    } catch (error) {
      console.error("❌ Unexpected error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

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
            The user you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/dashboard/users")}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const age = calculateAge(user.date_of_birth);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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
              View and manage user details
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

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-lg">
                  {user.profile_picture_url ? (
                    <Image
                      src={user.profile_picture_url}
                      alt={user.username || user.email}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
                      {(user.username || user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.username || user.email.split("@")[0]}
                    </h2>
                    <Badge className="bg-green-100 text-green-900 border border-green-300 font-semibold dark:bg-green-900/30 dark:text-green-400 dark:border-green-700">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {format(new Date(user.created_at), "MMM dd, yyyy")}
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {age && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Age
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {age} years
                      </p>
                    </div>
                  )}
                  {user.phone_number && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Phone
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.phone_number}
                      </p>
                    </div>
                  )}
                  {user.spotify_connected && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Spotify
                      </p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        Connected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Runs
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {user.total_runs}
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
                  {user.total_distance_km} km
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
                  {Math.floor(user.total_duration_minutes / 60)}h{" "}
                  {user.total_duration_minutes % 60}m
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
                  Total Sessions
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {sessions.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
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

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Running Sessions</CardTitle>
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
                            {session.start_time
                              ? format(
                                  new Date(session.start_time),
                                  "MMM dd, yyyy"
                                )
                              : "No date"}
                          </TableCell>
                          <TableCell>
                            {formatDuration(session.duration_seconds)}
                          </TableCell>
                          <TableCell>
                            {session.distance_meters
                              ? (session.distance_meters / 1000).toFixed(2)
                              : "0.00"}{" "}
                            km
                          </TableCell>
                          <TableCell>
                            {session.avg_pace_min_per_km
                              ? `${Math.floor(
                                  session.avg_pace_min_per_km / 60
                                )}:${(session.avg_pace_min_per_km % 60)
                                  .toString()
                                  .padStart(2, "0")} /km`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {session.avg_heart_rate ? (
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-red-500" />
                                {session.avg_heart_rate} bpm
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
                              {session.status}
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
