"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Activity,
  Download,
  Calendar as CalendarIcon,
  ArrowUpDown,
} from "lucide-react";
import { mockSessions, type Session } from "@/lib/mock-data";
import { format } from "date-fns";

export default function SessionsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [date, setDate] = useState<Date>();

  const columns: ColumnDef<Session>[] = [
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
      accessorKey: "userName",
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
            {row.getValue("userName")}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.original.userEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "startTime",
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
        const date = new Date(row.getValue("startTime"));
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
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {row.getValue("duration")}
        </span>
      ),
    },
    {
      accessorKey: "songsPlayed",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Songs
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("songsPlayed")}</span>
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
          <Badge className="bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-400">
            Failed
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable({
    data: mockSessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
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
            Monitor and manage all user sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
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
          <Button variant="default">
            <Download className="mr-2 h-4 w-4" />
            Export
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
                  {mockSessions.length}
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
                  {mockSessions.filter((s) => s.status === "active").length}
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
                  {mockSessions.filter((s) => s.status === "completed").length}
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
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {mockSessions.filter((s) => s.status === "failed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
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
