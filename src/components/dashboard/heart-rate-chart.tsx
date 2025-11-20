"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionHeartRate } from "@/lib/types/session";
import { Heart } from "lucide-react";

interface HeartRateChartProps {
  heartRates: SessionHeartRate[];
  avgHeartRate?: number;
  maxHeartRate?: number;
}

export function HeartRateChart({
  heartRates,
  avgHeartRate,
  maxHeartRate,
}: HeartRateChartProps) {
  if (heartRates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Heart Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg h-[300px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                No heart rate data available
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const minHR = Math.min(...heartRates.map((hr) => hr.heart_rate));
  const maxHR = Math.max(...heartRates.map((hr) => hr.heart_rate));
  const range = maxHR - minHR;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heart Rate Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-xl font-bold">{avgHeartRate || "N/A"} bpm</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maximum</p>
              <p className="text-xl font-bold">{maxHeartRate || maxHR} bpm</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Minimum</p>
              <p className="text-xl font-bold">{minHR} bpm</p>
            </div>
          </div>

          {/* Simple visualization placeholder */}
          <div className="bg-muted rounded-lg h-[200px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-around p-4 gap-1">
              {heartRates.map((hr) => {
                const height = ((hr.heart_rate - minHR) / range) * 100;
                return (
                  <div
                    key={hr.id}
                    className="bg-red-500 rounded-t transition-all hover:bg-red-600"
                    style={{
                      height: `${Math.max(height, 5)}%`,
                      width: `${100 / heartRates.length - 0.5}%`,
                    }}
                    title={`${hr.heart_rate} bpm at ${new Date(
                      hr.timestamp
                    ).toLocaleTimeString()}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Heart Rate Zones */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className="h-2 bg-blue-400 rounded mb-1"></div>
              <p className="text-muted-foreground">Light</p>
              <p className="font-medium">&lt;130</p>
            </div>
            <div className="text-center">
              <div className="h-2 bg-green-400 rounded mb-1"></div>
              <p className="text-muted-foreground">Moderate</p>
              <p className="font-medium">130-150</p>
            </div>
            <div className="text-center">
              <div className="h-2 bg-yellow-400 rounded mb-1"></div>
              <p className="text-muted-foreground">Hard</p>
              <p className="font-medium">150-170</p>
            </div>
            <div className="text-center">
              <div className="h-2 bg-red-400 rounded mb-1"></div>
              <p className="text-muted-foreground">Maximum</p>
              <p className="font-medium">&gt;170</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Full Recharts integration coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
