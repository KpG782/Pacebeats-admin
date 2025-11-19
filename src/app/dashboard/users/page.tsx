"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import { Input } from "@/components/ui/input";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Ban,
  CheckCircle,
} from "lucide-react";
import { enhancedMockUsers } from "@/lib/enhanced-mock-data";
import { User, UserFormData } from "@/lib/types/user";
import { UserFormDialog } from "@/components/dashboard/user-form-dialog";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>(enhancedMockUsers);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);

  // Filter users by status
  const filteredUsers = useMemo(() => {
    if (statusFilter === "all") return users;
    return users.filter((user) => user.status === statusFilter);
  }, [users, statusFilter]);

  // CRUD Operations
  const handleAddUser = () => {
    setEditUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setShowUserForm(true);
  };

  const handleSaveUser = (data: UserFormData) => {
    if (editUser) {
      // Update existing user
      setUsers(
        users.map((u) =>
          u.id === editUser.id
            ? {
                ...u,
                ...data,
                updated_at: new Date().toISOString(),
              }
            : u
        )
      );
      toast({
        title: "User Updated",
        description: `${data.username} has been successfully updated.`,
        variant: "success",
      });
    } else {
      // Add new user
      const newUser: User = {
        id: `USR${(users.length + 1).toString().padStart(3, "0")}`,
        ...data,
        created_at: new Date().toISOString(),
        last_login_at: undefined,
        onboarding_completed: false,
        total_runs: 0,
        total_distance_km: 0,
        total_duration_minutes: 0,
        avg_pace: undefined,
      };
      setUsers([newUser, ...users]);
      toast({
        title: "User Created",
        description: `${data.username} has been successfully created.`,
        variant: "success",
      });
    }
    setShowUserForm(false);
    setEditUser(null);
  };

  const handleConfirmDelete = () => {
    if (deleteUser) {
      setUsers(users.filter((u) => u.id !== deleteUser.id));
      toast({
        title: "User Deleted",
        description: `${deleteUser.username} has been permanently deleted.`,
        variant: "destructive",
      });
      setDeleteUser(null);
    }
  };

  const handleSuspendUser = (user: User) => {
    setUsers(
      users.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "suspended" ? "active" : "suspended" }
          : u
      )
    );
    toast({
      title: user.status === "suspended" ? "User Activated" : "User Suspended",
      description: `${user.username} has been ${
        user.status === "suspended" ? "activated" : "suspended"
      }.`,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Username",
      "Email",
      "Status",
      "Total Runs",
      "Total Distance (km)",
      "Created At",
    ];
    const csvData = filteredUsers.map((user) => [
      user.id,
      user.username,
      user.email,
      user.status,
      user.total_runs,
      user.total_distance_km,
      format(new Date(user.created_at), "yyyy-MM-dd"),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredUsers.length} users to CSV.`,
      variant: "success",
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Username
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.getValue("username")}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Registration Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.getValue("created_at")), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "totalRuns",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Total Runs
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {row.getValue("totalRuns")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className={
              status === "active"
                ? "bg-green-100 text-green-900 border border-green-300 font-semibold dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                : "bg-gray-200 text-gray-900 border border-gray-400 font-semibold dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            }
          >
            {status}
          </Badge>
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
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/users/${user.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                {user.status === "suspended" ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate User
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend User
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setDeleteUser(user)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
            User Management
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Manage and monitor all registered users ({filteredUsers.length}{" "}
            total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="default" onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search users by name or email..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
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
        <Card className="bg-card border shadow-sm">
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
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-900"
                            : "bg-gray-50 dark:bg-gray-800"
                        }`}
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
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {table.getState().pagination.pageIndex * 10 + 1} to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * 10,
                  filteredUsers.length
                )}{" "}
                of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  variant="default"
                  className="disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user{" "}
              <span className="font-semibold">{deleteUser?.username}</span> and
              all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Form Dialog */}
      <UserFormDialog
        open={showUserForm}
        onOpenChange={setShowUserForm}
        user={editUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}
