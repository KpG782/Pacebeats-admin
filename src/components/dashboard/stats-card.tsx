"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && trendValue && (
            <div
              className={`text-xs font-medium mt-2 ${
                trend === "up"
                  ? "text-green-600 dark:text-green-400"
                  : trend === "down"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
