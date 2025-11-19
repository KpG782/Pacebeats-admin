"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { mockAnalytics } from "@/lib/mock-data";

const COLORS = [
  "oklch(0.55 0.18 250)", // Pacebeats Blue
  "oklch(0.65 0.15 200)", // Light Blue
  "oklch(0.70 0.12 180)", // Cyan
  "oklch(0.60 0.16 220)", // Medium Blue
  "oklch(0.50 0.20 260)", // Deep Blue
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("month");

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
            Analytics Dashboard
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Insights into your music platform performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="default">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Song Popularity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Top 10 Most Popular Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={mockAnalytics.songPopularity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="stroke-gray-200 dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "currentColor" }}
                  className="fill-gray-600 dark:fill-gray-400"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fill: "currentColor" }} className="fill-gray-600 dark:fill-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar
                  dataKey="plays"
                  fill="oklch(0.55 0.18 250)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood Distribution & BPM Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Mood Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockAnalytics.moodDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockAnalytics.moodDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid oklch(var(--gray-30))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                BPM Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockAnalytics.bpmDistribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="stroke-gray-200 dark:stroke-gray-700"
                  />
                  <XAxis
                    dataKey="range"
                    tick={{ fill: "currentColor" }}
                    className="fill-gray-600 dark:fill-gray-400"
                  />
                  <YAxis tick={{ fill: "currentColor" }} className="fill-gray-600 dark:fill-gray-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid oklch(var(--gray-30))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="oklch(0.55 0.18 250)"
                    strokeWidth={3}
                    dot={{ fill: "oklch(0.55 0.18 250)", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recommendation Accuracy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">
                Recommendation Accuracy Over Time
              </CardTitle>
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-semibold">+20% this year</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={mockAnalytics.recommendationAccuracy}>
                <defs>
                  <linearGradient
                    id="colorAccuracy"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="oklch(0.55 0.18 250)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.55 0.18 250)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="stroke-gray-200 dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "currentColor" }}
                  className="fill-gray-600 dark:fill-gray-400"
                />
                <YAxis
                  tick={{ fill: "currentColor" }}
                  className="fill-gray-600 dark:fill-gray-400"
                  domain={[70, 100]}
                  label={{
                    value: "Accuracy (%)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "currentColor",
                    className: "fill-gray-600 dark:fill-gray-400",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid oklch(var(--gray-30))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value}%`, "Accuracy"]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="oklch(0.55 0.18 250)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAccuracy)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">Avg. Session Length</p>
            <p className="text-3xl font-bold">32 min</p>
            <p className="text-xs opacity-75 mt-2">↑ 8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--chart-2)] to-[var(--chart-4)] text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">User Retention</p>
            <p className="text-3xl font-bold">87%</p>
            <p className="text-xs opacity-75 mt-2">↑ 3% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--chart-3)] to-[var(--chart-5)] text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">Avg. Songs per Session</p>
            <p className="text-3xl font-bold">12</p>
            <p className="text-xs opacity-75 mt-2">↑ 5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--chart-4)] to-[var(--chart-1)] text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm opacity-90 mb-2">User Satisfaction</p>
            <p className="text-3xl font-bold">4.8/5</p>
            <p className="text-xs opacity-75 mt-2">↑ 0.2 from last month</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
