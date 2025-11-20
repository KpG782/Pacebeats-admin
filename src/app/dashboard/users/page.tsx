"use client";

import { useState, useMemo, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { User, UserFormData } from "@/lib/types/user";
import { UserFormDialog } from "@/components/dashboard/user-form-dialog";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Mock users for testing
const MOCK_USERS: User[] = [
  {
    id: "mock-user-1",
    email: "admin@pacebeats.com",
    username: "Admin User",
    status: "active",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    onboarding_completed: true,
    total_runs: 15,
    total_distance_km: 75.5,
    total_duration_minutes: 450,
  },
  {
    id: "mock-user-2",
    email: "test@pacebeats.com",
    username: "Test Runner",
    status: "active",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    onboarding_completed: true,
    total_runs: 8,
    total_distance_km: 40.2,
    total_duration_minutes: 240,
  },
];

// Database User type matching the actual schema
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

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);

  // Fetch users from Supabase on component mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert database user to app user format
  const convertDatabaseUser = (dbUser: DatabaseUser): User => {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username || dbUser.email.split("@")[0],
      avatar_url: dbUser.profile_picture_url || undefined,
      gender: undefined, // Not in current schema
      age: dbUser.date_of_birth
        ? new Date().getFullYear() -
          new Date(dbUser.date_of_birth).getFullYear()
        : undefined,
      height: undefined, // Not in current schema
      height_unit: undefined,
      weight: undefined,
      weight_unit: undefined,
      running_experience: undefined, // Not in current schema
      pace_band: undefined,
      preferred_genres: undefined, // Not in current schema
      status: "active", // Default status (not in schema, but using role as proxy)
      created_at: dbUser.created_at,
      last_login_at: undefined, // Not tracking in schema yet
      onboarding_completed: true, // Assume completed if in database
      total_runs: dbUser.total_runs,
      total_distance_km: Number(dbUser.total_distance_km),
      total_duration_minutes: dbUser.total_duration_minutes,
      avg_pace: undefined, // Could calculate from sessions
    };
  };

  // Fetch all users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching users...");

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching users:", error);
        console.log("📦 Using mock users data");
        setUsers(MOCK_USERS);
        toast({
          title: "Using Mock Data",
          description: "Database error. Showing sample users.",
        });
        return;
      }

      if (!data || data.length === 0) {
        console.log("⚠️ No users found in database");
        console.log("📦 Using mock users data");
        setUsers(MOCK_USERS);
        toast({
          title: "No Users Found",
          description: "Database is empty. Showing sample users.",
        });
        return;
      }

      console.log(`✅ Loaded ${data.length} users from database`);
      const convertedUsers = data.map(convertDatabaseUser);
      setUsers(convertedUsers);
    } catch (error) {
      console.error("❌ Unexpected error fetching users:", error);
      console.log("📦 Using mock users data");
      setUsers(MOCK_USERS);
      toast({
        title: "Error Loading Users",
        description: "Using mock data instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users by status
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    return filtered;
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

  const handleSaveUser = async (data: UserFormData) => {
    try {
      if (editUser) {
        // Check if it's a mock user
        if (editUser.id.startsWith("mock-")) {
          throw new Error(
            "Cannot edit mock users. Please add real users to the database."
          );
        }

        // Update existing user in Supabase
        const { error } = await supabase
          .from("users")
          .update({
            email: data.email,
            username: data.username,
            profile_picture_url: data.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editUser.id);

        if (error) throw error;

        // Update local state
        setUsers(
          users.map((u) =>
            u.id === editUser.id
              ? {
                  ...u,
                  email: data.email,
                  username: data.username,
                  avatar_url: data.avatar_url,
                }
              : u
          )
        );

        toast({
          title: "User Updated",
          description: `${data.username} has been successfully updated.`,
        });
      } else {
        // Create new user in Supabase Auth first
        const randomPassword = Math.random().toString(36).slice(-8) + "Aa1!";

        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email: data.email,
            password: randomPassword,
            email_confirm: true,
          });

        if (authError) throw authError;

        if (!authData.user) {
          throw new Error("Failed to create user in authentication system");
        }

        // Then create user profile in users table
        const { error: profileError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: data.email,
          username: data.username,
          profile_picture_url: data.avatar_url,
          role: "user",
          created_at: new Date().toISOString(),
        });

        if (profileError) throw profileError;

        // Refresh users list
        await fetchUsers();

        toast({
          title: "User Created",
          description: `${data.username} has been successfully created. Temporary password: ${randomPassword}`,
        });
      }

      setShowUserForm(false);
      setEditUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error Saving User",
        description:
          error instanceof Error ? error.message : "Failed to save user",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    try {
      // Check if it's a mock user
      if (deleteUser.id.startsWith("mock-")) {
        throw new Error("Cannot delete mock users.");
      }

      // Delete from users table (cascades to related data)
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", deleteUser.id);

      if (error) throw error;

      // Also delete from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        deleteUser.id
      );

      if (authError) {
        console.warn("Failed to delete from auth:", authError);
      }

      // Update local state
      setUsers(users.filter((u) => u.id !== deleteUser.id));

      toast({
        title: "User Deleted",
        description: `${deleteUser.username} has been permanently deleted.`,
        variant: "destructive",
      });

      setDeleteUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error Deleting User",
        description:
          error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleSuspendUser = async () => {
    try {
      // In real implementation, you might want to add a 'status' column to the users table
      // For now, we'll just show a toast
      toast({
        title: "Feature Coming Soon",
        description:
          "User suspension will be available once the status column is added to the database schema.",
      });
    } catch (error) {
      console.error("Error suspending user:", error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Username",
      "Email",
      "Status",
      "Total Runs",
      "Total Distance (km)",
      "Total Duration (min)",
      "Created At",
    ];
    const csvData = filteredUsers.map((user) => [
      user.id,
      user.username,
      user.email,
      user.status,
      user.total_runs,
      user.total_distance_km.toFixed(2),
      user.total_duration_minutes,
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
    a.download = `pacebeats_users_export_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredUsers.length} users to CSV.`,
    });
  };

  // Table configuration
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
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
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
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
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
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
        accessorKey: "total_runs",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Total Runs
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <span className="font-semibold text-primary">
            {row.getValue("total_runs")}
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
                <DropdownMenuItem onClick={() => handleSuspendUser()}>
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  );

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

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading users from database...
          </p>
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
            User Management
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Manage and monitor all registered users ({filteredUsers.length}{" "}
            total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
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
