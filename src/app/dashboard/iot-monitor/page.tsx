"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Heart,
  AlertTriangle,
  MapPin,
  Clock,
  Search,
  Download,
  Bell,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  subscribeToTable,
  unsubscribeChannel,
} from "@/lib/supabase/client";
import {
  getActiveRunners,
  getActiveAlerts,
  resolveAlert,
} from "@/lib/supabase/queries";
import type { ActiveRunner, HeartRateAlert } from "@/lib/supabase/types";

// Interface for component state
interface Runner extends ActiveRunner {
  id: number;
  device_model: string;
  latitude: number | null;
  longitude: number | null;
  avatar_url?: string;
  pace: number | null;
}

interface Alert {
  id: string;
  user_id: string;
  username: string;
  session_id: string;
  heart_rate: number;
  severity: "LOW" | "HIGH" | "CRITICAL";
  message: string;
  created_at: string;
  resolved: boolean;
  resolved_at: string | null;
}

// Mock data for development/fallback - Remove or comment out when backend is ready
const mockRunners: Runner[] = [
  {
    id: 1,
    user_id: "user_001",
    username: "john_runner",
    heart_rate: 165,
    pace: 5.2,
    status: "HIGH",
    last_update: new Date(Date.now() - 30000).toISOString(),
    device_model: "Galaxy Watch 7",
    latitude: 14.5995,
    longitude: 120.9842,
    session_id: "session_001",
    duration_seconds: 1800,
    distance_meters: 5000,
    avg_pace: 5.2,
  },
  {
    id: 2,
    user_id: "user_002",
    username: "sarah_athlete",
    heart_rate: 142,
    pace: 5.8,
    status: "NORMAL",
    last_update: new Date(Date.now() - 45000).toISOString(),
    device_model: "Galaxy Watch 7",
    latitude: 14.5995,
    longitude: 120.9842,
    session_id: "session_002",
    duration_seconds: 2400,
    distance_meters: 6500,
    avg_pace: 5.8,
  },
  {
    id: 3,
    user_id: "user_003",
    username: "mike_sprinter",
    heart_rate: 188,
    pace: 4.5,
    status: "CRITICAL",
    last_update: new Date(Date.now() - 15000).toISOString(),
    device_model: "Galaxy Watch 7",
    latitude: 14.5995,
    longitude: 120.9842,
    session_id: "session_003",
    duration_seconds: 1200,
    distance_meters: 4000,
    avg_pace: 4.5,
  },
  {
    id: 4,
    user_id: "user_004",
    username: "emma_jogger",
    heart_rate: 128,
    pace: 6.3,
    status: "NORMAL",
    last_update: new Date(Date.now() - 60000).toISOString(),
    device_model: "Galaxy Watch 7",
    latitude: 14.5995,
    longitude: 120.9842,
    session_id: "session_004",
    duration_seconds: 3000,
    distance_meters: 7000,
    avg_pace: 6.3,
  },
];

const mockAlerts: Alert[] = [
  {
    id: "alert_1",
    user_id: "user_003",
    username: "mike_sprinter",
    session_id: "session_003",
    heart_rate: 188,
    severity: "CRITICAL",
    message: "⚠️ CRITICAL: Heart rate dangerously high (188 BPM)",
    created_at: new Date(Date.now() - 15000).toISOString(),
    resolved: false,
    resolved_at: null,
  },
  {
    id: "alert_2",
    user_id: "user_001",
    username: "john_runner",
    session_id: "session_001",
    heart_rate: 165,
    severity: "HIGH",
    message: "⚠️ WARNING: Heart rate elevated (165 BPM)",
    created_at: new Date(Date.now() - 30000).toISOString(),
    resolved: false,
    resolved_at: null,
  },
];

export default function IoTMonitorPage() {
  const [runners, setRunners] = useState<Runner[]>(mockRunners);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [useBackend, setUseBackend] = useState(false); // Toggle between mock and real data
  const { toast } = useToast();

  // Load initial data from Supabase
  useEffect(() => {
    if (!useBackend) return;

    const loadData = async () => {
      try {
        const [runnersData, alertsData] = await Promise.all([
          getActiveRunners(),
          getActiveAlerts(),
        ]);

        // Transform Supabase data to component format
        const transformedRunners: Runner[] = runnersData.map((runner, idx) => ({
          id: idx + 1,
          ...runner,
          pace: runner.avg_pace,
          device_model: "Galaxy Watch 7",
          latitude: null,
          longitude: null,
          timestamp: runner.last_update,
        }));

        const transformedAlerts: Alert[] = alertsData.map((alert) => ({
          ...alert,
          message: `⚠️ ${alert.severity}: Heart rate ${
            alert.severity === "CRITICAL" ? "dangerously high" : "elevated"
          } (${alert.heart_rate} BPM)`,
        }));

        setRunners(transformedRunners);
        setAlerts(transformedAlerts);
      } catch (error) {
        console.error("Error loading IoT data:", error);
        toast({
          title: "Error",
          description: "Failed to load real-time data. Using mock data.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [useBackend, toast]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!useBackend || !isMonitoring) return;

    // Subscribe to heart rate data changes
    const hrChannel = subscribeToTable<{
      session_id: string;
      heart_rate_bpm: number;
      recorded_at: string;
    }>("session_heart_rate_data", (payload) => {
      if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
        // Update runner's heart rate
        setRunners((prev) =>
          prev.map((runner) => {
            if (runner.session_id === payload.new.session_id) {
              const newHR = payload.new.heart_rate_bpm;
              const newStatus = getStatus(newHR);

              // Create alert if needed
              if (newStatus === "HIGH" || newStatus === "CRITICAL") {
                // Note: Alert creation should be handled by backend trigger
                // This is just for immediate UI feedback
              }

              return {
                ...runner,
                heart_rate: newHR,
                status: newStatus,
                last_update: payload.new.recorded_at,
              };
            }
            return runner;
          })
        );
      }
    });

    // Subscribe to alert changes
    const alertChannel = subscribeToTable<HeartRateAlert>(
      "heart_rate_alerts",
      (payload) => {
        if (payload.eventType === "INSERT") {
          const newAlert: Alert = {
            ...payload.new,
            message: `⚠️ ${payload.new.severity}: Heart rate ${
              payload.new.severity === "CRITICAL"
                ? "dangerously high"
                : "elevated"
            } (${payload.new.heart_rate} BPM)`,
          };

          setAlerts((prev) => [newAlert, ...prev]);

          toast({
            title: "New Alert",
            description: newAlert.message,
            variant:
              payload.new.severity === "CRITICAL" ? "destructive" : "default",
          });
        } else if (payload.eventType === "UPDATE" && payload.new.resolved) {
          // Update alert status
          setAlerts((prev) =>
            prev.map((alert) =>
              alert.id === payload.new.id
                ? { ...alert, resolved: true, resolved_at: payload.new.resolved_at }
                : alert
            )
          );
        }
      }
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeChannel(hrChannel);
      unsubscribeChannel(alertChannel);
    };
  }, [useBackend, isMonitoring, toast]);

  // Mock alert creation function
  const createMockAlert = useCallback(
    (
      userId: string,
      username: string,
      hr: number,
      status: "HIGH" | "CRITICAL"
    ) => {
      const newAlert: Alert = {
        id: `alert_${Date.now()}`,
        user_id: userId,
        username,
        session_id: "mock_session",
        heart_rate: hr,
        severity: status,
        message:
          status === "CRITICAL"
            ? `⚠️ CRITICAL: Heart rate dangerously high (${hr} BPM)`
            : `⚠️ WARNING: Heart rate elevated (${hr} BPM)`,
        created_at: new Date().toISOString(),
        resolved: false,
        resolved_at: null,
      };

      setAlerts((prev) => [newAlert, ...prev]);

      toast({
        title: "New Alert",
        description: newAlert.message,
        variant: status === "CRITICAL" ? "destructive" : "default",
      });
    },
    [toast]
  );

  // Simulate real-time updates (MOCK MODE ONLY)
  useEffect(() => {
    if (!isMonitoring || useBackend) return;

    const interval = setInterval(() => {
      setRunners((prev) =>
        prev.map((runner) => {
          // Randomly update heart rate
          const change = Math.floor(Math.random() * 10) - 5;
          const newHR = Math.max(60, Math.min(200, runner.heart_rate + change));
          const newStatus = getStatus(newHR);

          // Create alert if status changed to HIGH or CRITICAL
          if (
            (newStatus === "HIGH" || newStatus === "CRITICAL") &&
            runner.status !== newStatus
          ) {
            createMockAlert(runner.user_id, runner.username, newHR, newStatus);
          }

          return {
            ...runner,
            heart_rate: newHR,
            status: newStatus,
            last_update: new Date().toISOString(),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring, useBackend, createMockAlert]);

  const getStatus = (hr: number): Runner["status"] => {
    if (hr > 180) return "CRITICAL";
    if (hr > 160) return "HIGH";
    if (hr < 50) return "LOW";
    return "NORMAL";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-amber-500 text-white";
      case "LOW":
        return "bg-blue-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return;

    try {
      if (useBackend) {
        // Use Supabase to resolve alert
        await resolveAlert(alertId);
      }

      // Update local state
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, resolved: true, resolved_at: new Date().toISOString() } : a
        )
      );

      toast({
        title: "Alert Resolved",
        description: "Alert has been marked as resolved",
      });
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const filteredRunners = runners.filter((runner) => {
    const matchesSearch =
      runner.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      runner.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || runner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeAlerts = alerts.filter((alert) => !alert.resolved);

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(timestamp).getTime()) / 1000
    );
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 animate-pulse" />
            IoT Heart Rate Monitor
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Real-time monitoring of all active runners
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={useBackend ? "default" : "outline"}
            onClick={() => setUseBackend(!useBackend)}
            className="hidden sm:flex"
          >
            {useBackend ? "🔗 Live Data" : "🎭 Mock Data"}
          </Button>
          <Button
            variant={isMonitoring ? "default" : "outline"}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </>
            )}
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Active Runners
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {runners.length}
                </p>
              </div>
              <Activity className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Active Alerts
                </p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                  {activeAlerts.length}
                </p>
              </div>
              <Bell className="h-10 w-10 text-red-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Avg Heart Rate
                </p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {Math.round(
                    runners.reduce((sum, r) => sum + r.heart_rate, 0) /
                      runners.length
                  )}
                </p>
              </div>
              <Heart className="h-10 w-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Normal Status
                </p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {runners.filter((r) => r.status === "NORMAL").length}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="monitor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts ({activeAlerts.length})
          </TabsTrigger>
        </TabsList>

        {/* Live Monitor Tab */}
        <TabsContent value="monitor" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by username or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={
                      statusFilter === "CRITICAL" ? "destructive" : "outline"
                    }
                    onClick={() => setStatusFilter("CRITICAL")}
                  >
                    Critical
                  </Button>
                  <Button
                    variant={statusFilter === "HIGH" ? "default" : "outline"}
                    onClick={() => setStatusFilter("HIGH")}
                  >
                    High
                  </Button>
                  <Button
                    variant={statusFilter === "NORMAL" ? "default" : "outline"}
                    onClick={() => setStatusFilter("NORMAL")}
                  >
                    Normal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Runners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRunners.map((runner, index) => (
              <motion.div
                key={runner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          {runner.username}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {runner.device_model}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          ID: {runner.user_id}
                        </p>
                      </div>
                      <Badge className={getStatusColor(runner.status)}>
                        {runner.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Heart Rate */}
                      <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Heart Rate
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">
                          {runner.heart_rate}
                        </span>
                      </div>

                      {/* Pace */}
                      {runner.pace && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            🏃 Pace
                          </span>
                          <span className="font-semibold">
                            {runner.pace.toFixed(2)} min/km
                          </span>
                        </div>
                      )}

                      {/* Location */}
                      {runner.latitude && runner.longitude && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            Location
                          </span>
                          <span className="text-sm">
                            {runner.latitude.toFixed(4)},{" "}
                            {runner.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Last Update
                        </span>
                        <span className="text-gray-500">
                          {formatTimeAgo(runner.last_update)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredRunners.length === 0 && (
            <Card className="p-12 text-center">
              <Activity className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                No runners found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                {searchQuery
                  ? "Try adjusting your search filters"
                  : "Waiting for runners to start their workouts..."}
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {activeAlerts.length > 0 ? (
            activeAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`border-2 ${
                    alert.severity === "CRITICAL"
                      ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
                      : "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle
                            className={`h-6 w-6 ${
                              alert.severity === "CRITICAL"
                                ? "text-red-500"
                                : "text-amber-500"
                            }`}
                          />
                          <div>
                            <h3 className="font-semibold text-lg">
                              {alert.username}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {alert.user_id}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-900 dark:text-white mb-3">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTimeAgo(alert.created_at)}
                          </span>
                          <Badge
                            variant={
                              alert.severity === "CRITICAL"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                No active alerts
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                All runners are within normal heart rate ranges
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
