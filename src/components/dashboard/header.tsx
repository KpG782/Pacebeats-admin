"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  Moon,
  Sun,
  ChevronRight,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Activity,
  Music,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Mock admin user data - Ready for backend integration
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "moderator";
  avatar_url?: string;
  created_at: string;
  last_login_at: string;
}

// Mock notifications - Ready for backend integration
interface Notification {
  id: string;
  type: "user" | "session" | "music" | "system" | "alert";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
}

const mockAdminUser: AdminUser = {
  id: "ADM001",
  name: "Admin User",
  email: "admin@pacebeats.com",
  role: "super_admin",
  avatar_url: undefined, // Set to actual URL when backend is ready
  created_at: "2024-01-15T10:00:00Z",
  last_login_at: new Date().toISOString(),
};

const mockNotifications: Notification[] = [
  {
    id: "NOT001",
    type: "user",
    title: "New user registered",
    message: "Michelle Carter joined the platform",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    read: false,
    action_url: "/dashboard/users",
  },
  {
    id: "NOT002",
    type: "session",
    title: "High activity detected",
    message: "15 sessions completed in the last hour",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false,
    action_url: "/dashboard/sessions",
  },
  {
    id: "NOT003",
    type: "music",
    title: "New track added",
    message: "Midnight Dreams by DJ Pulse added to library",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    read: true,
    action_url: "/dashboard/music",
  },
  {
    id: "NOT004",
    type: "alert",
    title: "System update available",
    message: "Version 2.1.0 is ready to install",
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    read: true,
    action_url: "/dashboard",
  },
];

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Sessions", href: "/dashboard/sessions", icon: Activity },
  { name: "Music Library", href: "/dashboard/music", icon: Music },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(mockNotifications);
  const [adminUser] = useState(mockAdminUser);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Handle search - Ready for backend integration
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement global search across users, sessions, music
      console.log("Searching for:", searchQuery);
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Mark notification as read - Ready for backend integration
  const markAsRead = (notificationId: string) => {
    // TODO: Call API to mark notification as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  // Mark all notifications as read - Ready for backend integration
  const markAllAsRead = () => {
    // TODO: Call API to mark all notifications as read
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Handle logout - Ready for backend integration
  const handleLogout = () => {
    // TODO: Call API to logout and clear session
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  // Navigate to profile settings - Ready for backend integration
  const handleProfileSettings = () => {
    // TODO: Navigate to profile settings page
    router.push("/dashboard/settings/profile");
  };

  // Navigate to account settings - Ready for backend integration
  const handleAccountSettings = () => {
    // TODO: Navigate to account settings page
    router.push("/dashboard/settings/account");
  };

  // Navigate to security settings - Ready for backend integration
  const handleSecuritySettings = () => {
    // TODO: Navigate to security settings page
    router.push("/dashboard/settings/security");
  };

  // Navigate to help & support - Ready for backend integration
  const handleHelpSupport = () => {
    // TODO: Navigate to help & support page or open help modal
    router.push("/dashboard/help");
  };

  // Navigate to notifications page - Ready for backend integration
  const handleViewAllNotifications = () => {
    // TODO: Navigate to notifications page
    router.push("/dashboard/notifications");
  };

  // Get notification icon color based on type
  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "user":
        return "text-blue-500";
      case "session":
        return "text-green-500";
      case "music":
        return "text-purple-500";
      case "alert":
        return "text-orange-500";
      case "system":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    name: segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " "),
    href: "/" + pathSegments.slice(0, index + 1).join("/"),
  }));

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      {" "}
      <div className="flex items-center justify-between">
        {/* Left Side - Mobile Menu & Breadcrumbs */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Pacebeats Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-xl"
                  />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                      Pacebeats
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Admin Dashboard
                    </p>
                  </div>
                </Link>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
                <Link
                  href={crumb.href}
                  className={`${
                    index === breadcrumbs.length - 1
                      ? "text-gray-900 dark:text-white font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  } transition-colors`}
                >
                  {crumb.name}
                </Link>
              </div>
            ))}
          </nav>
        </div>
        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search - Hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <Input
              placeholder="Search users, tracks, sessions..."
              className="pl-9 w-72"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-black dark:hover:text-white"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-white" />
            ) : (
              <Moon className="h-5 w-5 text-gray-400" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <div className="flex items-center justify-between px-2 py-2">
                <DropdownMenuLabel className="p-0">
                  Notifications ({unreadCount} unread)
                </DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs text-primary"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex flex-col items-start py-3 px-4 cursor-pointer ${
                        !notification.read
                          ? "bg-blue-50 dark:bg-blue-950/20"
                          : ""
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.action_url) {
                          router.push(notification.action_url);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Bell
                          className={`h-4 w-4 mt-0.5 ${getNotificationColor(
                            notification.type
                          )}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDistanceToNow(
                              new Date(notification.timestamp),
                              {
                                addSuffix: true,
                              }
                            )}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary font-medium cursor-pointer">
                <button
                  onClick={handleViewAllNotifications}
                  className="w-full text-center"
                >
                  View all notifications
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={adminUser.avatar_url}
                    alt={adminUser.name}
                  />
                  <AvatarFallback className="bg-primary text-white text-sm font-semibold">
                    {getUserInitials(adminUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {adminUser.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {adminUser.role.replace("_", " ")}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={adminUser.avatar_url}
                      alt={adminUser.name}
                    />
                    <AvatarFallback className="bg-primary text-white">
                      {getUserInitials(adminUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {adminUser.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {adminUser.email}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {adminUser.role.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleProfileSettings}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleAccountSettings}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleSecuritySettings}
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>Security & Privacy</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleHelpSupport}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last login:{" "}
                  {formatDistanceToNow(new Date(adminUser.last_login_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 cursor-pointer font-medium"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
