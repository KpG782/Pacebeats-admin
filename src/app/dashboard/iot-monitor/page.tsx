"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Heart,
  AlertTriangle,
  Clock,
  Search,
  Play,
  Pause,
  User,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase/client";

// Interface for runner data
interface Runner {
  id: string;
  username: string;
  email: string;
  heart_rate: number;
  pace: number;
  status: "NORMAL" | "HIGH" | "CRITICAL" | "LOW";
  duration_minutes: number;
  distance_km: number;
  last_update: string;
}

// Helper to generate random heart rate based on activity level
const generateHeartRate = () => {
  const min = 120;
  const max = 185;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to generate random pace (min/km)
const generatePace = () => {
  const min = 4.5;
  const max = 7.0;
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Helper to determine status from heart rate
const getStatus = (hr: number): Runner["status"] => {
  if (hr > 180) return "CRITICAL";
  if (hr > 165) return "HIGH";
  if (hr < 100) return "LOW";
  return "NORMAL";
};

export default function IoTMonitorPage() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load real users from database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data: users, error } = await supabase
          .from("users")
          .select("id, username, email")
          .limit(20);

        if (error) throw error;

        if (users && users.length > 0) {
          // Generate sample running data for each user
          const runnersData: Runner[] = users.map((user) => {
            const heartRate = generateHeartRate();
            return {
              id: user.id,
              username: user.username || user.email.split("@")[0],
              email: user.email,
              heart_rate: heartRate,
              pace: generatePace(),
              status: getStatus(heartRate),
              duration_minutes: Math.floor(Math.random() * 60) + 10,
              distance_km: parseFloat((Math.random() * 8 + 2).toFixed(2)),
              last_update: new Date(
                Date.now() - Math.random() * 300000
              ).toISOString(),
            };
          });

          setRunners(runnersData);
        } else {
          toast({
            title: "No Users Found",
            description: "No users in database. Add users first.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          title: "Error",
          description: "Failed to load users from database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [toast]);

  // Simulate real-time heart rate updates
  useEffect(() => {
    if (!isMonitoring || runners.length === 0) return;

    const interval = setInterval(() => {
      setRunners((prev) =>
        prev.map((runner) => {
          // Random heart rate change (-5 to +5)
          const change = Math.floor(Math.random() * 11) - 5;
          const newHR = Math.max(90, Math.min(195, runner.heart_rate + change));
          const newStatus = getStatus(newHR);

          return {
            ...runner,
            heart_rate: newHR,
            status: newStatus,
            last_update: new Date().toISOString(),
          };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, runners.length]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "HIGH":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "LOW":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      default:
        return "bg-green-500 hover:bg-green-600 text-white";
    }
  };

  const getHeartColor = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "text-red-500";
      case "HIGH":
        return "text-amber-500";
      case "LOW":
        return "text-blue-500";
      default:
        return "text-green-500";
    }
  };

  const filteredRunners = runners.filter((runner) => {
    const matchesSearch =
      runner.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      runner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || runner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const criticalRunners = runners.filter((r) => r.status === "CRITICAL").length;
  const highRunners = runners.filter((r) => r.status === "HIGH").length;
  const normalRunners = runners.filter((r) => r.status === "NORMAL").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Loading runners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page Header - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 animate-pulse" />
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Live Monitor
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {runners.length} Active Runners
              </p>
            </div>
          </div>
          <Button
            variant={isMonitoring ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="flex items-center gap-1 sm:gap-2"
          >
            {isMonitoring ? (
              <>
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Start</span>
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats - Mobile Friendly */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4"
      >
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200">
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-bold text-green-700 dark:text-green-300">
                {normalRunners}
              </p>
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
                Normal
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-200">
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-bold text-amber-700 dark:text-amber-300">
                {highRunners}
              </p>
              <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-1">
                High
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-red-200">
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-bold text-red-700 dark:text-red-300">
                {criticalRunners}
              </p>
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1">
                Critical
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200">
          <CardContent className="p-3 sm:p-6">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-bold text-blue-700 dark:text-blue-300">
                {Math.round(
                  runners.reduce((sum, r) => sum + r.heart_rate, 0) /
                    runners.length || 0
                )}
              </p>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
                Avg BPM
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filter - Mobile Optimized */}
      <Card>
        <CardContent className="p-3 sm:p-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search runners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="whitespace-nowrap"
            >
              All ({runners.length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "CRITICAL" ? "destructive" : "outline"}
              onClick={() => setStatusFilter("CRITICAL")}
              className="whitespace-nowrap"
            >
              Critical ({criticalRunners})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "HIGH" ? "default" : "outline"}
              onClick={() => setStatusFilter("HIGH")}
              className="whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white"
            >
              High ({highRunners})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "NORMAL" ? "default" : "outline"}
              onClick={() => setStatusFilter("NORMAL")}
              className="whitespace-nowrap"
            >
              Normal ({normalRunners})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Runners List - Compact Mobile View */}
      <div className="space-y-2 sm:space-y-3">
        {filteredRunners.map((runner, index) => (
          <motion.div
            key={runner.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getStatusColor(
                        runner.status
                      )} flex items-center justify-center`}
                    >
                      <Heart
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          runner.status === "CRITICAL" ? "animate-pulse" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Runner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        {runner.username}
                      </h3>
                      <Badge
                        className={`${getStatusColor(
                          runner.status
                        )} text-xs shrink-0`}
                      >
                        {runner.status}
                      </Badge>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <Heart
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${getHeartColor(
                            runner.status
                          )}`}
                        />
                        <span className="font-bold">{runner.heart_rate}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          BPM
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                        <span className="font-semibold">{runner.pace}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          min/km
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">
                          {runner.duration_minutes}m
                        </span>
                      </div>
                    </div>

                    {/* Distance and Last Update */}
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>📍 {runner.distance_km} km</span>
                      <span>{formatTimeAgo(runner.last_update)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRunners.length === 0 && (
        <Card className="p-8 sm:p-12 text-center">
          <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-medium">
            No runners found
          </p>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-2">
            {searchQuery
              ? "Try adjusting your search"
              : "No runners match the selected filter"}
          </p>
        </Card>
      )}

      {/* Critical Alert Banner - Mobile Sticky */}
      {criticalRunners > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-50"
        >
          <Card className="bg-red-500 text-white border-red-600 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm sm:text-base">
                    Critical Alert!
                  </p>
                  <p className="text-xs sm:text-sm opacity-90">
                    {criticalRunners} runner
                    {criticalRunners > 1 ? "s" : ""} with critical heart rate
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStatusFilter("CRITICAL")}
                  className="shrink-0"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
