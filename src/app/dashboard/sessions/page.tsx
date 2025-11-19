"use client";

import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Download,
  Calendar as CalendarIcon,
  ArrowUpDown,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
} from "lucide-react";
import {
  enhancedMockSessions,
  getActiveSessions,
} from "@/lib/enhanced-session-data";
import { RunningSession } from "@/lib/types/session";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function SessionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [date, setDate] = useState<Date>();

  // Format helper functions
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2) + " km";
  };

  // Filter sessions based on status
  const filteredData = enhancedMockSessions.filter((session) => {
    if (statusFilter === "all") return true;
    return session.status === statusFilter;
  });

  const handleViewDetails = (sessionId: string) => {
    router.push(`/dashboard/sessions/${sessionId}`);
  };

  const handleDeleteSession = (sessionId: string) => {
    toast({
      title: "Session Deleted",
      description: `Session ${sessionId} has been deleted successfully.`,
      variant: "default",
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Session ID",
      "User",
      "Started At",
      "Duration",
      "Distance",
      "Status",
      "Calories",
    ];
    const rows = filteredData.map((session) => [
      session.id,
      session.user_name,
      new Date(session.started_at).toLocaleString(),
      formatDuration(session.duration_seconds),
      formatDistance(session.total_distance_meters),
      session.status,
      session.calories_burned || "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sessions_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredData.length} sessions to CSV.`,
    });
  };

  const columns: ColumnDef<RunningSession>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Session ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("id")}</span>
      ),
    },
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
      accessorKey: "started_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Start Time
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
      accessorKey: "duration_seconds",
      header: "Duration",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {formatDuration(row.getValue("duration_seconds"))}
        </span>
      ),
    },
    {
      accessorKey: "total_distance_meters",
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
        <span className="text-sm font-medium">
          {formatDistance(row.getValue("total_distance_meters"))}
        </span>
      ),
    },
    {
      accessorKey: "calories_burned",
      header: "Calories",
      cell: ({ row }) => {
        const calories = row.getValue("calories_burned") as number | undefined;
        return (
          <span className="text-sm">
            {calories ? `${calories} kcal` : "N/A"}
          </span>
        );
      },
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

        if (status === "paused") {
          return (
            <Badge className="bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-400">
              Paused
            </Badge>
          );
        }

        return (
          <Badge className="bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-400">
            Cancelled
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
              <DropdownMenuItem onClick={() => handleViewDetails(session.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteSession(session.id)}>
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
    data: filteredData,
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
            Sessions Management
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Monitor and manage all running sessions
          </p>
        </div>
        <div className="flex gap-2">
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
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {enhancedMockSessions.length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Now
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {getActiveSessions().length}
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    enhancedMockSessions.filter((s) => s.status === "completed")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cancelled
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    enhancedMockSessions.filter((s) => s.status === "cancelled")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by user name, email, or session ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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
                        onClick={() => handleViewDetails(row.original.id)}
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
                        No sessions found.
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
