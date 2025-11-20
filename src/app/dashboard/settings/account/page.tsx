"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Globe, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccountSettingsPage() {
  const { toast } = useToast();

  // Notification preferences - TODO: Load from API
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newUsers: true,
    newSessions: true,
    systemAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
  });

  // Account preferences - TODO: Load from API
  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications({ ...notifications, [key]: value });

    // TODO: Save to API
    toast({
      title: "Notification settings updated",
      description: "Your preferences have been saved.",
    });
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences({ ...preferences, [key]: value });

    // TODO: Save to API
    toast({
      title: "Preferences updated",
      description: "Your settings have been saved.",
    });
  };

  const handleDeactivateAccount = () => {
    // TODO: Implement account deactivation API call
    toast({
      title: "Account Deactivation",
      description: "This feature will be implemented with backend integration",
      variant: "destructive",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Account Settings
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Manage your account preferences and notifications
        </p>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <Label
                    htmlFor="email-notifications"
                    className="text-sm font-medium"
                  >
                    Email Notifications
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.emailNotifications}
                onCheckedChange={(checked: boolean) =>
                  handleNotificationChange("emailNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-gray-400" />
                <div>
                  <Label
                    htmlFor="push-notifications"
                    className="text-sm font-medium"
                  >
                    Push Notifications
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive push notifications in browser
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.pushNotifications}
                onCheckedChange={(checked: boolean) =>
                  handleNotificationChange("pushNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <Label htmlFor="new-users" className="text-sm font-medium">
                  New User Registrations
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get notified when a new user joins
                </p>
              </div>
              <Switch
                id="new-users"
                checked={notifications.newUsers}
                onCheckedChange={(checked: boolean) =>
                  handleNotificationChange("newUsers", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <Label htmlFor="new-sessions" className="text-sm font-medium">
                  New Sessions
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get notified about session activities
                </p>
              </div>
              <Switch
                id="new-sessions"
                checked={notifications.newSessions}
                onCheckedChange={(checked: boolean) =>
                  handleNotificationChange("newSessions", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <Label htmlFor="system-alerts" className="text-sm font-medium">
                  System Alerts
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Important system notifications and updates
                </p>
              </div>
              <Switch
                id="system-alerts"
                checked={notifications.systemAlerts}
                onCheckedChange={(checked: boolean) =>
                  handleNotificationChange("systemAlerts", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <Label htmlFor="weekly-reports" className="text-sm font-medium">
                  Weekly Reports
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive weekly analytics reports
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={notifications.weeklyReports}
                onCheckedChange={(checked: boolean) =>
                  handleNotificationChange("weeklyReports", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <Label
                  htmlFor="monthly-reports"
                  className="text-sm font-medium"
                >
                  Monthly Reports
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive monthly analytics reports
                </p>
              </div>
              <Switch
                id="monthly-reports"
                checked={notifications.monthlyReports}
                onCheckedChange={(checked: boolean) =>
                  handleNotificationChange("monthlyReports", checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Regional Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Regional Preferences
            </CardTitle>
            <CardDescription>
              Set your language, timezone, and date format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) =>
                    handlePreferenceChange("language", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) =>
                    handlePreferenceChange("timezone", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">
                      Eastern Time (ET)
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time (CT)
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time (MT)
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time (PT)
                    </SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select
                  value={preferences.dateFormat}
                  onValueChange={(value) =>
                    handlePreferenceChange("dateFormat", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-format">Time Format</Label>
                <Select
                  value={preferences.timeFormat}
                  onValueChange={(value) =>
                    handlePreferenceChange("timeFormat", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Deactivate Account
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Temporarily disable your account. You can reactivate it later.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deactivate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will temporarily deactivate your account. You can
                      reactivate it by logging in again. All your data will be
                      preserved.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeactivateAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Deactivate Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
