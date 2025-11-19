import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface GPSMapPlaceholderProps {
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
  gpsPointsCount: number;
}

export function GPSMapPlaceholder({
  startLocation,
  endLocation,
  gpsPointsCount,
}: GPSMapPlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>GPS Route Map</span>
          <span className="text-sm font-normal text-muted-foreground">
            {gpsPointsCount} GPS points
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="text-center space-y-3">
            <MapPin className="h-16 w-16 mx-auto text-primary" />
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Interactive Map Coming Soon
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Leaflet.js integration for route visualization
              </p>
            </div>
            {startLocation && endLocation && (
              <div className="mt-4 space-y-2 text-left bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start:
                  </span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {startLocation.lat.toFixed(4)},{" "}
                    {startLocation.lng.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    End:
                  </span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {endLocation.lat.toFixed(4)}, {endLocation.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
