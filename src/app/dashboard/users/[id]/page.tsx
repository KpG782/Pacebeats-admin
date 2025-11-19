"use client";
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
import {
  getUserById,
  getSessionsByUserId,
  getActivitiesByUserId,
} from "@/lib/enhanced-mock-data";
import { format } from "date-fns";

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const user = getUserById(params.id);
  const sessions = getSessionsByUserId(params.id);
  const activities = getActivitiesByUserId(params.id);

  if (!user) {
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

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
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} />
                  ) : (
                    <div className="h-full w-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.username}
                    </h2>
                    <Badge
                      className={
                        user.status === "active"
                          ? "bg-green-100 text-green-900 border border-green-300 font-semibold dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                          : "bg-gray-200 text-gray-900 border border-gray-400 font-semibold dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      }
                    >
                      {user.status}
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
                    {user.last_login_at && (
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        Last active{" "}
                        {format(new Date(user.last_login_at), "MMM dd, yyyy")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {user.age && (
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
                      <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {user.gender}
                      </p>
                    </div>
                  )}
                  {user.height && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Height
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.height} {user.height_unit}
                      </p>
                    </div>
                  )}
                  {user.weight && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Weight
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.weight} {user.weight_unit}
                      </p>
                    </div>
                  )}
                </div>

                {/* Running Preferences */}
                {user.running_experience && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline" className="capitalize">
                      {user.running_experience} Runner
                    </Badge>
                    {user.pace_band && (
                      <Badge variant="outline">{user.pace_band}</Badge>
                    )}
                    {user.preferred_genres?.map((genre) => (
                      <Badge key={genre} variant="outline">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
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
                  Avg Pace
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {user.avg_pace || "N/A"}
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
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
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
                            {format(
                              new Date(session.started_at),
                              "MMM dd, yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDuration(session.duration_seconds)}
                          </TableCell>
                          <TableCell>
                            {(session.total_distance_meters / 1000).toFixed(2)}{" "}
                            km
                          </TableCell>
                          <TableCell>
                            {Math.floor(session.avg_pace_per_km / 60)}:
                            {(session.avg_pace_per_km % 60)
                              .toString()
                              .padStart(2, "0")}{" "}
                            /km
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

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {activity.event_type.replace("_", " ")}
                          </p>
                          {activity.event_data && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {JSON.stringify(activity.event_data, null, 2)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {format(
                              new Date(activity.created_at),
                              "MMM dd, yyyy 'at' h:mm a"
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    No activity logged for this user.
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
