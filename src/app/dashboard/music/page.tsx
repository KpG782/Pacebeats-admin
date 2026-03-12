"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Search,
  ArrowUpDown,
  Music,
  PlayCircle,
  BarChart3,
  Gauge,
  RefreshCw,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useToast } from "@/components/ui/use-toast";
import {
  getMusicLibraryData,
  type MusicLibraryTrack,
} from "@/lib/supabase/music-queries";

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function MusicPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [moodFilter, setMoodFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tracks, setTracks] = useState<MusicLibraryTrack[]>([]);

  const loadMusic = useCallback(
    async (showToast = false) => {
      try {
        if (tracks.length > 0) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await getMusicLibraryData();
        setTracks(data.tracks);

        if (showToast) {
          toast({
            title: "Music refreshed",
            description: "Music library data reloaded from Supabase.",
          });
        }
      } catch (error) {
        console.error("Error loading music library:", {
          message:
            error instanceof Error
              ? error.message
              : typeof error === "object" && error !== null && "message" in error
              ? String((error as { message: unknown }).message)
              : String(error),
          error,
        });
        toast({
          title: "Music library unavailable",
          description: "Could not load music data from Supabase.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast, tracks.length]
  );

  useEffect(() => {
    loadMusic();
  }, [loadMusic]);

  const filteredMusic = useMemo(() => {
    return tracks.filter((track) => {
      const matchesSearch =
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.track_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = genreFilter === "all" || track.genre === genreFilter;
      const matchesMood = moodFilter === "all" || track.mood === moodFilter;

      return matchesSearch && matchesGenre && matchesMood;
    });
  }, [genreFilter, moodFilter, searchQuery, tracks]);

  const genreOptions = useMemo(
    () => [...new Set(tracks.map((track) => track.genre))].sort(),
    [tracks]
  );
  const moodOptions = useMemo(
    () => [...new Set(tracks.map((track) => track.mood))].sort(),
    [tracks]
  );

  const stats = useMemo(() => {
    const totalPlays = filteredMusic.reduce(
      (sum, track) => sum + track.total_plays,
      0
    );
    const avgTempo =
      filteredMusic.filter((track) => typeof track.tempo === "number").length > 0
        ? (
            filteredMusic.reduce((sum, track) => sum + (track.tempo || 0), 0) /
            filteredMusic.filter((track) => typeof track.tempo === "number")
              .length
          ).toFixed(1)
        : "0.0";
    const avgEnergy =
      filteredMusic.filter((track) => typeof track.energy === "number").length > 0
        ? (
            filteredMusic.reduce((sum, track) => sum + (track.energy || 0), 0) /
            filteredMusic.filter((track) => typeof track.energy === "number")
              .length
          ).toFixed(2)
        : "0.00";
    const totalLikes = filteredMusic.reduce((sum, track) => sum + track.likes, 0);

    return { totalPlays, avgTempo, avgEnergy, totalLikes };
  }, [filteredMusic]);

  const handleViewDetails = (trackId: string) => {
    router.push(`/dashboard/music/${trackId}`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Track ID",
      "Name",
      "Artist",
      "Genre",
      "Mood",
      "Duration (ms)",
      "Tempo",
      "Energy",
      "Year",
      "Total Plays",
      "Unique Listeners",
      "Completion Rate",
      "Likes",
    ];

    const rows = filteredMusic.map((track) => [
      track.track_id,
      track.name,
      track.artist,
      track.genre,
      track.mood,
      track.duration_ms,
      track.tempo ?? "",
      track.energy ?? "",
      track.year ?? "",
      track.total_plays,
      track.unique_listeners,
      track.completion_rate,
      track.likes,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `music_library_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export complete",
      description: `Exported ${filteredMusic.length} tracks.`,
    });
  };

  const columns: ColumnDef<MusicLibraryTrack>[] = [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Track
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div
            className="cursor-pointer"
            onClick={() => handleViewDetails(row.original.track_id)}
          >
            <div className="font-medium text-gray-900 dark:text-white">
              {row.original.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {row.original.artist}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
              {row.original.track_id}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "genre",
        header: "Genre",
        cell: ({ row }) => <Badge variant="secondary">{row.original.genre}</Badge>,
      },
      {
        accessorKey: "mood",
        header: "Mood",
        cell: ({ row }) => <Badge variant="outline">{row.original.mood}</Badge>,
      },
      {
        accessorKey: "tempo",
        header: "Tempo",
        cell: ({ row }) => (
          <span>{row.original.tempo ? `${Math.round(row.original.tempo)} BPM` : "N/A"}</span>
        ),
      },
      {
        accessorKey: "energy",
        header: "Energy",
        cell: ({ row }) => (
          <span>
            {typeof row.original.energy === "number"
              ? row.original.energy.toFixed(2)
              : "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "duration_ms",
        header: "Duration",
        cell: ({ row }) => <span>{formatDuration(row.original.duration_ms)}</span>,
      },
      {
        accessorKey: "total_plays",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Plays
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-primary">
            {row.original.total_plays.toLocaleString()}
          </span>
        ),
      },
    ];

  const table = useReactTable({
    data: filteredMusic,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading music library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Music Library
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Real tracks from `public.music` ({filteredMusic.length} shown)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadMusic(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="default" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          title="Tracks Shown"
          value={filteredMusic.length.toString()}
          icon={Music}
          trend="neutral"
          trendValue="From public.music"
        />
        <StatsCard
          title="Total Plays"
          value={stats.totalPlays.toLocaleString()}
          icon={PlayCircle}
          trend="neutral"
          trendValue="Derived from listening_events"
        />
        <StatsCard
          title="Avg Tempo"
          value={`${stats.avgTempo} BPM`}
          icon={Gauge}
          trend="neutral"
          trendValue="Using music.tempo"
        />
        <StatsCard
          title="Total Likes"
          value={stats.totalLikes.toLocaleString()}
          icon={BarChart3}
          trend="neutral"
          trendValue={`Avg energy ${stats.avgEnergy}`}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search by track, artist, or track ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genreOptions.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={moodFilter} onValueChange={setMoodFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Moods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  {moodOptions.map((mood) => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer"
                        onClick={() => handleViewDetails(row.original.track_id)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No tracks found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
