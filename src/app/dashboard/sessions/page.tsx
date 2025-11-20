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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Download,
  ArrowUpDown,
  Search,
  MoreVertical,
  Eye,
  User,
  Music,
  TrendingUp,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { UserWithSessions } from "@/lib/supabase/session-queries";
import { debugSessionsQuery } from "@/lib/supabase/debug-sessions";

export default function SessionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithSessions[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch users with their session stats
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching users with sessions...");

      // ✅ Use API route instead of direct database query
      const response = await fetch("/api/sessions/users");

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const { users: usersData } = await response.json();

      console.log(`✅ Loaded ${usersData.length} users`);
      setUsers(usersData);

      // Show info if no users found
      if (usersData.length === 0) {
        toast({
          title: "No Users Found",
          description:
            "No users found in the database. Users will appear here once they register.",
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("❌ Error fetching users:", {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
      });
      toast({
        title: "Error Loading Users",
        description:
          err?.message ||
          "Failed to fetch users. Please check your database connection.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Debug function
  const handleDebug = async () => {
    console.log("🔍 Running debug diagnostics...");
    toast({
      title: "Running Diagnostics",
      description: "Check the browser console for detailed results.",
    });
    await debugSessionsQuery();
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Format helper functions
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return "< 1m";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDistance = (km: number) => {
    if (km < 1) return `${(km * 1000).toFixed(0)}m`;
    return `${km.toFixed(2)}km`;
  };

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.total_sessions > 0).length;
  const totalSessions = users.reduce((sum, u) => sum + u.total_sessions, 0);
  const totalDistance = users.reduce((sum, u) => sum + u.total_distance_km, 0);
  const totalSongs = users.reduce((sum, u) => sum + u.total_songs, 0);

  const handleViewUserSessions = (userId: string) => {
    router.push(`/dashboard/sessions/${userId}`);
  };

  const handleExportCSV = () => {
    const headers = [
      "User ID",
      "Email",
      "Username",
      "Total Sessions",
      "Total Distance (km)",
      "Total Duration (seconds)",
      "Avg Heart Rate (BPM)",
      "Total Songs",
      "Last Session",
      "Created At",
    ];

    const rows = users.map((user) => [
      user.user_id,
      user.user_email,
      user.user_name,
      user.total_sessions,
      user.total_distance_km.toFixed(2),
      user.total_duration_seconds,
      user.avg_heart_rate_bpm,
      user.total_songs,
      user.last_session_date,
      user.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `users_sessions_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${users.length} users to CSV.`,
    });
  };

  const columns: ColumnDef<UserWithSessions>[] = [
    {
      accessorKey: "user_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            User
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.user_name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.original.user_email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_sessions",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Sessions
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-center">
          <Badge
            variant={row.original.total_sessions > 0 ? "default" : "outline"}
            className="text-sm"
          >
            {row.original.total_sessions}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "total_distance_km",
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
          {formatDistance(row.original.total_distance_km)}
        </span>
      ),
    },
    {
      accessorKey: "total_duration_seconds",
      header: "Duration",
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDuration(row.original.total_duration_seconds)}
        </span>
      ),
    },
    {
      accessorKey: "avg_heart_rate_bpm",
      header: "Avg HR",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.avg_heart_rate_bpm > 0 ? (
            <Badge
              variant="outline"
              className="flex items-center gap-1 w-fit mx-auto"
            >
              ❤️ {row.original.avg_heart_rate_bpm}
            </Badge>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "total_songs",
      header: "Songs",
      cell: ({ row }) => (
        <div className="text-center text-sm">
          {row.original.total_songs > 0 ? (
            <span className="flex items-center gap-1 justify-center">
              🎵 {row.original.total_songs}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "last_session_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Last Activity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.original.last_session_date);
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
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleViewUserSessions(user.user_id)}
                disabled={user.total_sessions === 0}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Sessions ({user.total_sessions})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
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
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Sessions
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            View user running sessions and post-run details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDebug}>
            <Activity className="mr-2 h-4 w-4" />
            Debug Connection
          </Button>
          <Button variant="default" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalUsers}
                </p>
              </div>
              <User className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeUsers}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalSessions}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Distance
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatDistance(totalDistance)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Songs
                </p>
                <p className="text-2xl font-bold text-pink-600">{totalSongs}</p>
              </div>
              <Music className="h-8 w-8 text-pink-600 opacity-50" />
            </div>
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
            placeholder="Search by user name, email, or ID..."
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
                          row.original.total_sessions > 0 &&
                          handleViewUserSessions(row.original.user_id)
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            onClick={(e) => {
                              // Prevent row click when clicking action dropdown
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
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
