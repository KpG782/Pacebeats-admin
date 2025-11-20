import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SessionMusic } from "@/lib/types/session";
import { Music, Play, SkipForward } from "lucide-react";

interface MusicPlayedListProps {
  musicTracks: SessionMusic[];
}

export function MusicPlayedList({ musicTracks }: MusicPlayedListProps) {
  if (musicTracks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Music Played</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg h-[200px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Music className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                No music data for this session
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Music Played During Session</span>
          <span className="text-sm font-normal text-muted-foreground">
            {musicTracks.length} {musicTracks.length === 1 ? "track" : "tracks"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Time</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead className="w-[100px]">Duration</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {musicTracks.map((track) => (
              <TableRow key={track.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(track.played_at).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {track.completed ? (
                      <Play className="h-4 w-4 text-green-500" />
                    ) : (
                      <SkipForward className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{track.track_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {track.artist_name}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatDuration(track.duration_ms)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={track.completed ? "default" : "outline"}
                    className={
                      track.completed
                        ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }
                  >
                    {track.completed ? "Played" : "Skipped"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
