"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Mock notifications - TODO: Replace with API call
interface Notification {
  id: string;
  type: "user" | "session" | "music" | "system" | "alert";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
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
    },
    {
      id: "NOT005",
      type: "user",
      title: "User account suspended",
      message: "Account for john.doe@example.com has been suspended",
      timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
      read: true,
      action_url: "/dashboard/users",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const [activeTab, setActiveTab] = useState("all");

  const markAsRead = (id: string) => {
    // TODO: Call API to mark as read
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    // TODO: Call API to mark all as read
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    // TODO: Call API to delete notification
    setNotifications(notifications.filter((n) => n.id !== id));
  };

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

  const getNotificationBadgeColor = (type: Notification["type"]) => {
    switch (type) {
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "session":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "music":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "alert":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "system":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === activeTab);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Notifications
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="user">Users</TabsTrigger>
            <TabsTrigger value="session">Sessions</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="alert">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    No notifications to display
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`hover:shadow-md transition-shadow ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <Bell
                          className={`h-5 w-5 mt-1 ${getNotificationColor(
                            notification.type
                          )}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <Badge
                              className={getNotificationBadgeColor(
                                notification.type
                              )}
                            >
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDistanceToNow(
                              new Date(notification.timestamp),
                              {
                                addSuffix: true,
                              }
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
