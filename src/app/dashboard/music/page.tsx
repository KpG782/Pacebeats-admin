"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Music as MusicIcon,
  Upload,
  Search,
  Grid3x3,
  List,
  ArrowUpDown,
} from "lucide-react";
import { mockMusic, genres, moods, type Music } from "@/lib/mock-data";
import { MusicCard } from "@/components/dashboard/music-card";

export default function MusicPage() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [moodFilter, setMoodFilter] = useState<string>("all");

  // Filter music based on search and filters
  const filteredMusic = mockMusic.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = genreFilter === "all" || track.genre === genreFilter;
    const matchesMood = moodFilter === "all" || track.mood === moodFilter;
    return matchesSearch && matchesGenre && matchesMood;
  });

  const columns: ColumnDef<Music>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-muted/50"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">
            {row.getValue("title")}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.artist}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "genre",
      header: "Genre",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="bg-[var(--accent-subtle)] text-[var(--primary-70)]"
        >
          {row.getValue("genre")}
        </Badge>
      ),
    },
    {
      accessorKey: "mood",
      header: "Mood",
      cell: ({ row }) => (
        <Badge variant="outline" className="border-input">
          {row.getValue("mood")}
        </Badge>
      ),
    },
    {
      accessorKey: "bpm",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-muted/50"
          >
            BPM
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <span>{row.getValue("bpm")}</span>,
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => <span>{row.getValue("duration")}</span>,
    },
    {
      accessorKey: "playCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-muted/50"
          >
            Plays
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {(row.getValue("playCount") as number).toLocaleString()}
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Music Library
          </h1>
          <p className="text-muted-foreground">
            Manage your music collection ({filteredMusic.length} tracks)
          </p>
        </div>
        <Button variant="default">
          <Upload className="mr-2 h-4 w-4" />
          Upload Music
        </Button>
      </motion.div>

      {/* Filters & View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-input focus-visible:border-ring text-foreground"
                />
              </div>

              {/* Genre Filter */}
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-full lg:w-48 border-input">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mood Filter */}
              <Select value={moodFilter} onValueChange={setMoodFilter}>
                <SelectTrigger className="w-full lg:w-48 border-input">
                  <SelectValue placeholder="All Moods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  {moods.map((mood) => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={view === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setView("grid")}
                  className={
                    view === "grid"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setView("table")}
                  className={
                    view === "table"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }
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
            {filteredMusic.map((track, index) => (
              <MusicCard key={track.id} track={track} index={index} />
            ))}
          </motion.div>
        ) : (
          /* Table View */
          <Card className="bg-card border shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        className="bg-muted hover:bg-muted"
                      >
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="text-muted-foreground"
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
                      table.getRowModel().rows.map((row, index) => (
                        <TableRow
                          key={row.id}
                          className={`${
                            index % 2 === 0 ? "bg-card" : "bg-muted"
                          } hover:bg-muted/50`}
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
                          className="h-24 text-center text-muted-foreground"
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
