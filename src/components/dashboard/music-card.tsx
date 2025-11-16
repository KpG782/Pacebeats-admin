"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music as MusicIcon, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Music } from "@/lib/mock-data";

interface MusicCardProps {
  track: Music;
  index: number;
  onEdit?: (track: Music) => void;
  onDelete?: (track: Music) => void;
}

export function MusicCard({ track, index, onEdit, onDelete }: MusicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="bg-card border hover:shadow-lg transition-all overflow-hidden">
        {/* Album Cover Placeholder */}
        <div className="relative h-48 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <MusicIcon className="h-16 w-16 text-primary-foreground opacity-50" />

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => onEdit?.(track)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => onDelete?.(track)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title & Artist */}
          <h3 className="font-semibold text-foreground truncate">
            {track.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate mb-3">
            {track.artist}
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
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{track.bpm} BPM</span>
            <span>{track.playCount.toLocaleString()} plays</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
