"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
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
  Upload,
  Search,
  Grid3x3,
  List,
  ArrowUpDown,
  Music,
  Download,
  TrendingUp,
  PlayCircle,
  BarChart3,
} from "lucide-react";
import {
  enhancedMusicTracks,
  enhancedGenres,
  enhancedMoods,
} from "@/lib/enhanced-music-data";
import { MusicTrack } from "@/lib/types/music";
import { MusicCard } from "@/components/dashboard/music-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useToast } from "@/components/ui/use-toast";

export default function MusicPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<"grid" | "table">("grid");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [moodFilter, setMoodFilter] = useState<string>("all");
  const [bpmFilter, setBpmFilter] = useState<string>("all");
  const [energyFilter, setEnergyFilter] = useState<string>("all");

  // Filter music based on search and filters
  const filteredMusic = enhancedMusicTracks.filter((track) => {
    const matchesSearch =
      track.track_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = genreFilter === "all" || track.genre === genreFilter;
    const matchesMood = moodFilter === "all" || track.mood === moodFilter;

    // BPM filter
    let matchesBPM = true;
    if (bpmFilter !== "all") {
      const [min, max] = bpmFilter.split("-").map(Number);
      if (max) {
        matchesBPM = track.bpm >= min && track.bpm <= max;
      } else {
        matchesBPM = track.bpm >= min;
      }
    }

    // Energy filter
    let matchesEnergy = true;
    if (energyFilter !== "all") {
      const energyLevel = parseInt(energyFilter);
      matchesEnergy =
        track.energy_level >= energyLevel &&
        track.energy_level < energyLevel + 3;
    }

    return (
      matchesSearch &&
      matchesGenre &&
      matchesMood &&
      matchesBPM &&
      matchesEnergy
    );
  });

  const handleViewDetails = (trackId: string) => {
    router.push(`/dashboard/music/${trackId}`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Track ID",
      "Title",
      "Artist",
      "Album",
      "Genre",
      "Mood",
      "BPM",
      "Energy",
      "Duration",
      "Plays",
      "Listeners",
    ];
    const rows = filteredMusic.map((track) => [
      track.id,
      track.track_name,
      track.artist_name,
      track.album_name || "N/A",
      track.genre,
      track.mood,
      track.bpm,
      track.energy_level,
      Math.floor(track.duration_ms / 60000) +
        ":" +
        ((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, "0"),
      track.total_plays,
      track.unique_listeners,
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
      description: `Exported ${filteredMusic.length} tracks to CSV.`,
    });
  };

  // Calculate stats
  const totalPlays = filteredMusic.reduce(
    (sum, track) => sum + track.total_plays,
    0
  );
  const avgCompletionRate =
    filteredMusic.reduce(
      (sum, track) => sum + (track.avg_completion_rate || 0),
      0
    ) / filteredMusic.length;
  const activeTracks = filteredMusic.filter((t) => t.is_active).length;

  const columns: ColumnDef<MusicTrack>[] = [
    {
      accessorKey: "track_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => handleViewDetails(row.original.id)}
        >
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.track_name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.original.artist_name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "genre",
      header: "Genre",
      cell: ({ row }) => {
        const genre = enhancedGenres.find((g) => g.name === row.original.genre);
        return (
          <Badge
            variant="secondary"
            style={{ borderColor: genre?.color, color: genre?.color }}
          >
            {row.original.genre}
          </Badge>
        );
      },
    },
    {
      accessorKey: "mood",
      header: "Mood",
      cell: ({ row }) => {
        const mood = enhancedMoods.find((m) => m.name === row.original.mood);
        return (
          <Badge variant="outline" style={{ color: mood?.color }}>
            {row.original.mood}
          </Badge>
        );
      },
    },
    {
      accessorKey: "bpm",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            BPM
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <span>{row.original.bpm}</span>,
    },
    {
      accessorKey: "duration_ms",
      header: "Duration",
      cell: ({ row }) => {
        const ms = row.original.duration_ms;
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0).padStart(2, "0");
        return (
          <span>
            {minutes}:{seconds}
          </span>
        );
      },
    },
    {
      accessorKey: "total_plays",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Plays
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
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
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
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
          <p className="text-gray-700 dark:text-gray-300">
            Manage your music collection ({filteredMusic.length} tracks)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="default">
            <Upload className="mr-2 h-4 w-4" />
            Upload Music
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
        <StatsCard
          title="Total Tracks"
          value={filteredMusic.length.toString()}
          icon={Music}
          trend="up"
          trendValue="+12%"
        />
        <StatsCard
          title="Total Plays"
          value={totalPlays.toLocaleString()}
          icon={PlayCircle}
          trend="up"
          trendValue="+8.5%"
        />
        <StatsCard
          title="Active Tracks"
          value={activeTracks.toString()}
          icon={TrendingUp}
          trend="up"
          trendValue="+5%"
        />
        <StatsCard
          title="Avg Completion"
          value={`${avgCompletionRate.toFixed(1)}%`}
          icon={BarChart3}
          trend="up"
          trendValue="+3.2%"
        />
      </motion.div>

      {/* Filters & View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search by title or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              {/* Genre Filter */}
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {enhancedGenres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.name}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mood Filter */}
              <Select value={moodFilter} onValueChange={setMoodFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Moods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  {enhancedMoods.map((mood) => (
                    <SelectItem key={mood.id} value={mood.name}>
                      {mood.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* BPM Filter */}
              <Select value={bpmFilter} onValueChange={setBpmFilter}>
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
              <Select value={energyFilter} onValueChange={setEnergyFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Energy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Energy</SelectItem>
                  <SelectItem value="1">Low (1-3)</SelectItem>
                  <SelectItem value="4">Medium (4-6)</SelectItem>
                  <SelectItem value="7">High (7-9)</SelectItem>
                  <SelectItem value="10">Very High (10)</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={view === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setView("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setView("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {view === "grid" ? (
          /* Grid View */
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredMusic.map((track, idx) => (
              <MusicCard key={track.id} track={track} index={idx} />
            ))}
          </motion.div>
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
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center text-gray-600 dark:text-gray-400"
                        >
                          No tracks found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
