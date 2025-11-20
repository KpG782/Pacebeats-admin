"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MusicTrack } from "@/lib/types/music";
import { useRouter } from "next/navigation";

interface MusicCardProps {
  track: MusicTrack;
  index: number;
  onEdit?: (track: MusicTrack) => void;
  onDelete?: (track: MusicTrack) => void;
}

export function MusicCard({ track, index, onEdit, onDelete }: MusicCardProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
      onClick={() => router.push(`/dashboard/music/${track.id}`)}
    >
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all overflow-hidden">
        {/* Album Cover */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={track.cover_image_url || "/placeholder-album.png"}
            alt={track.track_name}
            fill
            className="object-cover"
          />

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(track);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(track);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title & Artist */}
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {track.track_name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-3">
            {track.artist_name}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge
              variant="secondary"
              className="bg-accent text-primary text-xs"
            >
              {track.genre}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {track.mood}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Energy: {track.energy_level}/10
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{track.bpm} BPM</span>
            <span>{track.total_plays.toLocaleString()} plays</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
