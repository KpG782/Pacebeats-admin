"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
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
  Upload,
  Search,
  Grid3x3,
  List,
  Music,
  Download,
  TrendingUp,
  PlayCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMusicTracks,
  getGenres,
  getMusicStats,
} from "@/lib/supabase/music-queries";
import {
  MusicTrack,
  formatDuration,
  getMoodColor,
  getGenreColor,
  MOODS,
  GENRES,
} from "@/lib/supabase/music-types";

const PAGE_SIZE = 50; // Load 50 tracks per page for optimal performance

export default function MusicPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [moodFilter, setMoodFilter] = useState<string>("all");
  const [tempoMin, setTempoMin] = useState<number | undefined>();
  const [tempoMax, setTempoMax] = useState<number | undefined>();
  const [energyMin, setEnergyMin] = useState<number | undefined>();
  const [energyMax, setEnergyMax] = useState<number | undefined>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTracks, setTotalTracks] = useState(0);

  // Data state
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalGenres: 0,
    totalMoods: 0,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Load initial data (filters and stats) - runs once
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [genresData, statsData] = await Promise.all([
          getGenres(),
          getMusicStats(),
        ]);
        setGenres(genresData);
        setStats(statsData);
      } catch (error: unknown) {
        const err = error as Error;
        toast({
          title: "Error Loading Filters",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoadingFilters(false);
      }
    };
    loadInitialData();
  }, [toast]);

  // Load tracks based on filters and pagination
  const loadTracks = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = {
        search: searchQuery || undefined,
        genre: genreFilter !== "all" ? genreFilter : undefined,
        mood: moodFilter !== "all" ? moodFilter : undefined,
        minTempo: tempoMin,
        maxTempo: tempoMax,
        minEnergy: energyMin,
        maxEnergy: energyMax,
        limit: PAGE_SIZE,
        offset: (currentPage - 1) * PAGE_SIZE,
      };

      const result = await getMusicTracks(filters);
      setTracks(result.tracks);
      setTotalTracks(result.total);
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error Loading Tracks",
        description: err.message,
        variant: "destructive",
      });
      setTracks([]);
      setTotalTracks(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    genreFilter,
    moodFilter,
    tempoMin,
    tempoMax,
    energyMin,
    energyMax,
    currentPage,
    toast,
  ]);

  // Load tracks when filters or page changes
  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    genreFilter,
    moodFilter,
    tempoMin,
    tempoMax,
    energyMin,
    energyMax,
  ]);

  const handleViewDetails = (trackId: string) => {
    router.push(`/dashboard/music/${trackId}`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Track ID",
      "Title",
      "Artist",
      "Genre",
      "Mood",
      "Tempo (BPM)",
      "Energy",
      "Duration",
      "Year",
    ];
    const rows = tracks.map((track) => [
      track.track_id,
      track.name,
      track.artist,
      track.genre || "N/A",
      track.mood || "N/A",
      track.tempo || "N/A",
      track.energy || "N/A",
      formatDuration(track.duration_ms || 0),
      track.year || "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `music_library_${new Date().toISOString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${tracks.length} tracks to CSV.`,
    });
  };

  const handleBpmFilterChange = (value: string) => {
    if (value === "all") {
      setTempoMin(undefined);
      setTempoMax(undefined);
    } else {
      const [min, max] = value.split("-").map(Number);
      setTempoMin(min);
      setTempoMax(max || 999);
    }
  };

  const handleEnergyFilterChange = (value: string) => {
    if (value === "all") {
      setEnergyMin(undefined);
      setEnergyMax(undefined);
    } else {
      const level = parseFloat(value);
      setEnergyMin(level);
      setEnergyMax(level + 0.3);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalTracks / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalTracks);

  const columns: ColumnDef<MusicTrack>[] = [
    {
      accessorKey: "name",
      header: "Title",
      cell: ({ row }) => (
        <div
          className="cursor-pointer hover:underline"
          onClick={() => handleViewDetails(row.original.track_id)}
        >
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.original.artist}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "genre",
      header: "Genre",
      cell: ({ row }) => {
        const genre = row.original.genre;
        return genre ? (
          <Badge
            variant="secondary"
            style={{
              backgroundColor: `${getGenreColor(genre)}20`,
              color: getGenreColor(genre),
              borderColor: getGenreColor(genre),
            }}
          >
            {genre}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "mood",
      header: "Mood",
      cell: ({ row }) => {
        const mood = row.original.mood;
        return mood ? (
          <Badge
            variant="outline"
            style={{
              backgroundColor: `${getMoodColor(mood)}15`,
              color: getMoodColor(mood),
              borderColor: getMoodColor(mood),
            }}
          >
            {mood}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "tempo",
      header: "BPM",
      cell: ({ row }) => {
        const tempo = row.original.tempo;
        return tempo ? (
          <span>{Math.round(tempo)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "energy",
      header: "Energy",
      cell: ({ row }) => {
        const energy = row.original.energy;
        if (!energy) return <span className="text-gray-400">-</span>;
        const percentage = Math.round(energy * 100);
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm">{percentage}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "duration_ms",
      header: "Duration",
      cell: ({ row }) => (
        <span>{formatDuration(row.original.duration_ms || 0)}</span>
      ),
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ row }) => {
        const year = row.original.year;
        return year ? (
          <span>{year}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tracks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
            Music Library
          </h1>
          {isLoadingFilters ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              Manage your music collection ({stats.totalTracks.toLocaleString()}{" "}
              tracks total)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="default"
            onClick={() =>
              window.open(
                "https://www.kaggle.com/datasets/music-dataset",
                "_blank"
              )
            }
          >
            <Upload className="mr-2 h-4 w-4" />
            Get Music Data (Kaggle)
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoadingFilters ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Tracks"
              value={stats.totalTracks.toLocaleString()}
              icon={Music}
              trend="neutral"
            />
            <StatsCard
              title="Genres"
              value={stats.totalGenres.toString()}
              icon={PlayCircle}
              trend="neutral"
            />
            <StatsCard
              title="Moods"
              value={stats.totalMoods.toString()}
              icon={TrendingUp}
              trend="neutral"
            />
            <StatsCard
              title="Showing"
              value={`${startIndex}-${endIndex}`}
              icon={BarChart3}
              trend="neutral"
            />
          </>
        )}
      </motion.div>

      {/* Filters & View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4 space-y-4">
            {/* Mood Filter Chips */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Mood
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={moodFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMoodFilter("all")}
                  disabled={isLoadingFilters}
                >
                  All Moods
                </Button>
                {MOODS.map((mood) => (
                  <Button
                    key={mood.name}
                    variant={moodFilter === mood.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMoodFilter(mood.name)}
                    disabled={isLoadingFilters}
                    style={
                      moodFilter === mood.name
                        ? {
                            backgroundColor: mood.color,
                            borderColor: mood.color,
                            color: "#ffffff",
                          }
                        : {
                            borderColor: mood.color,
                            color: mood.color,
                          }
                    }
                  >
                    {mood.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Other Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search by title or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  disabled={isLoadingFilters}
                />
              </div>

              {/* Genre Filter */}
              <Select
                value={genreFilter}
                onValueChange={setGenreFilter}
                disabled={isLoadingFilters}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre.name} value={genre.name}>
                      {genre.name}
                    </SelectItem>
                  ))}
                  {genres
                    .filter(
                      (g) =>
                        g &&
                        g.trim() &&
                        !GENRES.some((genre) => genre.name === g)
                    )
                    .map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* BPM Filter */}
              <Select
                value={
                  tempoMin
                    ? tempoMax === 999
                      ? `${tempoMin}-999`
                      : `${tempoMin}-${tempoMax}`
                    : "all"
                }
                onValueChange={handleBpmFilterChange}
                disabled={isLoadingFilters}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All BPM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All BPM</SelectItem>
                  <SelectItem value="60-80">60-80 BPM (Slow)</SelectItem>
                  <SelectItem value="80-100">80-100 BPM (Relaxed)</SelectItem>
                  <SelectItem value="100-120">
                    100-120 BPM (Moderate)
                  </SelectItem>
                  <SelectItem value="120-140">
                    120-140 BPM (Energetic)
                  </SelectItem>
                  <SelectItem value="140-999">140+ BPM (Fast)</SelectItem>
                </SelectContent>
              </Select>

              {/* Energy Filter */}
              <Select
                value={energyMin?.toString() || "all"}
                onValueChange={handleEnergyFilterChange}
                disabled={isLoadingFilters}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Energy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Energy</SelectItem>
                  <SelectItem value="0">Low (0-30%)</SelectItem>
                  <SelectItem value="0.3">Medium (30-60%)</SelectItem>
                  <SelectItem value="0.6">High (60-90%)</SelectItem>
                  <SelectItem value="0.9">Very High (90%+)</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={view === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setView("grid")}
                  disabled={isLoading}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setView("table")}
                  disabled={isLoading}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Filters Display */}
      {(searchQuery ||
        genreFilter !== "all" ||
        moodFilter !== "all" ||
        tempoMin ||
        energyMin) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active Filters:
          </span>
          {searchQuery && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300"
              onClick={() => setSearchQuery("")}
            >
              Search: {searchQuery} ×
            </Badge>
          )}
          {genreFilter !== "all" && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300"
              onClick={() => setGenreFilter("all")}
              style={{
                backgroundColor: `${getGenreColor(genreFilter)}20`,
                color: getGenreColor(genreFilter),
                borderColor: getGenreColor(genreFilter),
              }}
            >
              Genre: {genreFilter} ×
            </Badge>
          )}
          {moodFilter !== "all" && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-gray-300"
              onClick={() => setMoodFilter("all")}
              style={{
                backgroundColor: `${getMoodColor(moodFilter)}15`,
                color: getMoodColor(moodFilter),
                borderColor: getMoodColor(moodFilter),
              }}
            >
              Mood: {moodFilter} ×
            </Badge>
          )}
          {tempoMin && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300"
              onClick={() => {
                setTempoMin(undefined);
                setTempoMax(undefined);
              }}
            >
              BPM: {tempoMin}-{tempoMax === 999 ? "+" : tempoMax} ×
            </Badge>
          )}
          {energyMin !== undefined && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300"
              onClick={() => {
                setEnergyMin(undefined);
                setEnergyMax(undefined);
              }}
            >
              Energy: {Math.round(energyMin * 100)}%+ ×
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setGenreFilter("all");
              setMoodFilter("all");
              setTempoMin(undefined);
              setTempoMax(undefined);
              setEnergyMin(undefined);
              setEnergyMax(undefined);
            }}
            className="text-sm"
          >
            Clear All
          </Button>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading tracks...
            </span>
          </div>
        ) : tracks.length === 0 ? (
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-12 text-center">
              <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No tracks found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search query.
              </p>
            </CardContent>
          </Card>
        ) : view === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tracks.map((track, idx) => (
              <motion.div
                key={track.track_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
              >
                <Card
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(track.track_id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {track.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {track.genre && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: `${getGenreColor(
                                track.genre
                              )}20`,
                              color: getGenreColor(track.genre),
                              borderColor: getGenreColor(track.genre),
                            }}
                          >
                            {track.genre}
                          </Badge>
                        )}
                        {track.mood && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: `${getMoodColor(track.mood)}15`,
                              color: getMoodColor(track.mood),
                              borderColor: getMoodColor(track.mood),
                            }}
                          >
                            {track.mood}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          {track.tempo ? `${Math.round(track.tempo)} BPM` : "-"}
                        </span>
                        <span>{formatDuration(track.duration_ms || 0)}</span>
                      </div>
                      {track.energy !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Energy</span>
                            <span>{Math.round(track.energy * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${track.energy * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Table View */
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="text-gray-700 dark:text-gray-300 font-semibold"
                          >
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
                    {table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Pagination */}
      {!isLoading && totalTracks > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex} to {endIndex} of {totalTracks.toLocaleString()}{" "}
            tracks
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
