"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  ArrowUpDown,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Music,
  Heart,
  Play,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  getUserSessions,
  deleteSession,
  SessionData,
} from "@/lib/supabase/session-queries";

interface UserSessionsPageProps {
  params: {
    id: string;
  };
}

export default function UserSessionsPage({ params }: UserSessionsPageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const fetchUserSessions = useCallback(async () => {
    setLoading(true);
    try {
      console.log(`🔍 Fetching sessions for user ${params.id}...`);

      const sessionsData = await getUserSessions(params.id);

      console.log(`✅ Loaded ${sessionsData.length} sessions`);
      setSessions(sessionsData);

      if (sessionsData.length === 0) {
        toast({
          title: "No Sessions Found",
          description: "This user has no running sessions yet.",
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("❌ Error fetching sessions:", err);
      toast({
        title: "Error Loading Sessions",
        description:
          err?.message || "Failed to fetch sessions. Please try again.",
        variant: "destructive",
      });
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [params.id, toast]);

  useEffect(() => {
    fetchUserSessions();
  }, [fetchUserSessions]);

  // Format helper functions
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0s";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDistance = (km: number | null) => {
    if (!km) return "0m";
    if (km < 1) return `${(km * 1000).toFixed(0)}m`;
    return `${km.toFixed(2)}km`;
  };

  // Calculate stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;
  const totalDistance = sessions.reduce(
    (sum, s) => sum + (s.distance_km || 0),
    0
  );
  const totalDuration = sessions.reduce(
    (sum, s) => sum + (s.duration_seconds || 0),
    0
  );
  const totalSongs = sessions.reduce((sum, s) => sum + s.total_songs, 0);
  const totalLiked = sessions.reduce((sum, s) => sum + s.liked_songs, 0);
  const avgHeartRate =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + (s.avg_heart_rate_bpm || 0), 0) /
            sessions.length
        )
      : 0;

  const userName = sessions.length > 0 ? sessions[0].user_name : "User";
  const userEmail = sessions.length > 0 ? sessions[0].user_email : "";

  const handleViewDetails = (sessionId: string) => {
    router.push(`/dashboard/sessions/${params.id}/session/${sessionId}`);
  };

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    try {
      await deleteSession(sessionToDelete);

      toast({
        title: "Session Deleted",
        description: "Session and all related data have been deleted.",
      });

      // Refresh sessions
      fetchUserSessions();
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error deleting session:", err);
      toast({
        title: "Error",
        description:
          err?.message || "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const columns: ColumnDef<SessionData>[] = [
    {
      accessorKey: "started_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Date & Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("started_at"));
        return (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {format(date, "MMM dd, yyyy")}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {format(date, "h:mm a")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "distance_km",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Distance
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {formatDistance(row.original.distance_km)}
        </span>
      ),
    },
    {
      accessorKey: "duration_seconds",
      header: "Duration",
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDuration(row.original.duration_seconds)}
        </span>
      ),
    },
    {
      accessorKey: "avg_pace_min_per_km",
      header: "Avg Pace",
      cell: ({ row }) => {
        const pace = row.original.avg_pace_min_per_km;
        return pace ? (
          <span className="text-sm font-medium">{pace.toFixed(2)} min/km</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "avg_heart_rate_bpm",
      header: "Avg HR",
      cell: ({ row }) => {
        const hr = row.original.avg_heart_rate_bpm;
        return hr ? (
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            ❤️ {hr}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "total_songs",
      header: "Music",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            🎵 {row.original.total_songs}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.completed_songs} completed
          </div>
        </div>
      ),
    },
    {
      accessorKey: "liked_songs",
      header: "Engagement",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-green-600">
            👍 {row.original.liked_songs}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            ⏭️ {row.original.skipped_songs}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        if (status === "active") {
          return (
            <Badge className="bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1 w-fit">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Active
            </Badge>
          );
        }

        if (status === "completed") {
          return (
            <Badge className="bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-400">
              Completed
            </Badge>
          );
        }

        return (
          <Badge className="bg-gray-100 text-gray-900 dark:bg-gray-900/30 dark:text-gray-400">
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleViewDetails(session.session_id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(session.session_id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading sessions...
          </p>
        </div>
      </div>
    );
  }

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
            onClick={() => router.push("/dashboard/sessions")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {userName}&apos;s Sessions
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mt-1">{userEmail}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedSessions} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Distance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDistance(totalDistance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatDistance(totalDistance / (totalSessions || 1))} per
              run
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(totalDuration)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg HR: {avgHeartRate > 0 ? `${avgHeartRate} BPM` : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Music</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{totalSongs}</div>
              <Heart className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{totalLiked}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">songs played</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search sessions..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="text-gray-700 dark:text-gray-300 font-semibold"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() =>
                          handleViewDetails(row.original.session_id)
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            onClick={(e) => {
                              if (cell.column.id === "actions") {
                                e.stopPropagation();
                              }
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-gray-600 dark:text-gray-400"
                      >
                        No sessions found for this user.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This will remove all
              session data including music history, GPS points, and heart rate
              data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
