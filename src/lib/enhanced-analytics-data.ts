import {
  enhancedMusicTracks,
  enhancedGenres,
  enhancedMoods,
} from "./enhanced-music-data";
import { enhancedMockUsers } from "./enhanced-mock-data";
import { enhancedMockSessions } from "./enhanced-session-data";
import type {
  AnalyticsData,
  DashboardStats,
  SongPopularity,
  GenreDistribution,
  MoodDistribution,
  BPMDistribution,
  UserActivityTrend,
  SessionMetrics,
  MusicEngagement,
  RecommendationAccuracy,
  PeakUsageHours,
} from "./types/analytics";

// Calculate Dashboard Stats from real data
export const dashboardStats: DashboardStats = {
  totalUsers: enhancedMockUsers.length,
  activeUsers: enhancedMockUsers.filter((u) => u.status === "active")
    .length,
  totalSessions: enhancedMockSessions.length,
  activeSessions: enhancedMockSessions.filter((s) => s.status === "active")
    .length,
  totalTracks: enhancedMusicTracks.length,
  totalPlays: enhancedMusicTracks.reduce(
    (sum, track) => sum + track.total_plays,
    0
  ),
  avgSessionDuration:
    enhancedMockSessions.reduce((sum: number, s) => sum + s.duration_seconds, 0) /
    enhancedMockSessions.length,
  userRetentionRate: 87.3,
  avgSongsPerSession: 12.4,
  avgCompletionRate:
    enhancedMusicTracks.reduce(
      (sum, track) => sum + (track.avg_completion_rate || 0),
      0
    ) / enhancedMusicTracks.length,
  userSatisfaction: 4.8,
};

// Top 10 Songs by Plays
export const songPopularity: SongPopularity[] = [...enhancedMusicTracks]
  .sort((a, b) => b.total_plays - a.total_plays)
  .slice(0, 10)
  .map((track) => ({
    id: track.id,
    name: track.track_name,
    artist: track.artist_name,
    plays: track.total_plays,
    listeners: track.unique_listeners,
    completionRate: track.avg_completion_rate || 0,
    genre: track.genre,
    bpm: track.bpm,
  }));

// Genre Distribution
export const genreDistribution: GenreDistribution[] = enhancedGenres
  .map((genre) => {
    const genreTracks = enhancedMusicTracks.filter(
      (t) => t.genre === genre.name
    );
    const totalPlays = genreTracks.reduce((sum, t) => sum + t.total_plays, 0);
    return {
      name: genre.name,
      value: genreTracks.length,
      color: genre.color || "#888888",
      tracks: genreTracks.length,
      avgPlays:
        genreTracks.length > 0
          ? Math.round(totalPlays / genreTracks.length)
          : 0,
    };
  })
  .filter((g) => g.tracks > 0);

// Mood Distribution
export const moodDistribution: MoodDistribution[] = enhancedMoods
  .map((mood) => {
    const moodTracks = enhancedMusicTracks.filter((t) => t.mood === mood.name);
    return {
      name: mood.name,
      value: moodTracks.length,
      color: mood.color || "#888888",
      tracks: moodTracks.length,
      energyLevel: mood.energy_range[0],
    };
  })
  .filter((m) => m.tracks > 0);

// BPM Distribution
export const bpmDistribution: BPMDistribution[] = [
  {
    range: "60-80",
    count: enhancedMusicTracks.filter((t) => t.bpm >= 60 && t.bpm < 80).length,
    avgPlays: Math.round(
      enhancedMusicTracks
        .filter((t) => t.bpm >= 60 && t.bpm < 80)
        .reduce((sum, t) => sum + t.total_plays, 0) /
        Math.max(
          1,
          enhancedMusicTracks.filter((t) => t.bpm >= 60 && t.bpm < 80).length
        )
    ),
    popularGenres: ["Lo-fi", "Ambient", "Jazz"],
  },
  {
    range: "80-100",
    count: enhancedMusicTracks.filter((t) => t.bpm >= 80 && t.bpm < 100).length,
    avgPlays: Math.round(
      enhancedMusicTracks
        .filter((t) => t.bpm >= 80 && t.bpm < 100)
        .reduce((sum, t) => sum + t.total_plays, 0) /
        Math.max(
          1,
          enhancedMusicTracks.filter((t) => t.bpm >= 80 && t.bpm < 100).length
        )
    ),
    popularGenres: ["R&B", "Pop", "Indie"],
  },
  {
    range: "100-120",
    count: enhancedMusicTracks.filter((t) => t.bpm >= 100 && t.bpm < 120)
      .length,
    avgPlays: Math.round(
      enhancedMusicTracks
        .filter((t) => t.bpm >= 100 && t.bpm < 120)
        .reduce((sum, t) => sum + t.total_plays, 0) /
        Math.max(
          1,
          enhancedMusicTracks.filter((t) => t.bpm >= 100 && t.bpm < 120).length
        )
    ),
    popularGenres: ["Pop", "Rock", "Indie"],
  },
  {
    range: "120-140",
    count: enhancedMusicTracks.filter((t) => t.bpm >= 120 && t.bpm < 140)
      .length,
    avgPlays: Math.round(
      enhancedMusicTracks
        .filter((t) => t.bpm >= 120 && t.bpm < 140)
        .reduce((sum, t) => sum + t.total_plays, 0) /
        Math.max(
          1,
          enhancedMusicTracks.filter((t) => t.bpm >= 120 && t.bpm < 140).length
        )
    ),
    popularGenres: ["Electronic", "Hip-Hop", "Rock"],
  },
  {
    range: "140-160",
    count: enhancedMusicTracks.filter((t) => t.bpm >= 140 && t.bpm < 160)
      .length,
    avgPlays: Math.round(
      enhancedMusicTracks
        .filter((t) => t.bpm >= 140 && t.bpm < 160)
        .reduce((sum, t) => sum + t.total_plays, 0) /
        Math.max(
          1,
          enhancedMusicTracks.filter((t) => t.bpm >= 140 && t.bpm < 160).length
        )
    ),
    popularGenres: ["Electronic", "Hip-Hop"],
  },
  {
    range: "160+",
    count: enhancedMusicTracks.filter((t) => t.bpm >= 160).length,
    avgPlays: Math.round(
      enhancedMusicTracks
        .filter((t) => t.bpm >= 160)
        .reduce((sum, t) => sum + t.total_plays, 0) /
        Math.max(1, enhancedMusicTracks.filter((t) => t.bpm >= 160).length)
    ),
    popularGenres: ["Electronic"],
  },
];

// User Activity Trend (Last 30 days)
export const userActivityTrend: UserActivityTrend[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split("T")[0],
      activeUsers: Math.floor(Math.random() * 50) + 150,
      newUsers: Math.floor(Math.random() * 10) + 5,
      sessions: Math.floor(Math.random() * 80) + 200,
      avgDuration: Math.floor(Math.random() * 600) + 1800,
    };
  }
);

// Session Metrics (Last 12 months)
export const sessionMetrics: SessionMetrics[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
].map((month) => ({
  month,
  totalSessions: Math.floor(Math.random() * 1000) + 2000,
  avgDuration: Math.floor(Math.random() * 600) + 1800,
  completedSessions: Math.floor(Math.random() * 800) + 1500,
  avgDistance: Math.floor(Math.random() * 2) + 5,
}));

// Music Engagement (Last 12 months)
export const musicEngagement: MusicEngagement[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
].map((month) => ({
  month,
  plays: Math.floor(Math.random() * 10000) + 20000,
  uniqueListeners: Math.floor(Math.random() * 500) + 1000,
  avgCompletionRate: Math.floor(Math.random() * 15) + 75,
  skipRate: Math.floor(Math.random() * 10) + 5,
}));

// Recommendation Accuracy (Last 12 months)
export const recommendationAccuracy: RecommendationAccuracy[] = [
  {
    month: "Jan",
    accuracy: 78.5,
    totalRecommendations: 12500,
    acceptedRecommendations: 9813,
  },
  {
    month: "Feb",
    accuracy: 80.2,
    totalRecommendations: 13200,
    acceptedRecommendations: 10586,
  },
  {
    month: "Mar",
    accuracy: 82.1,
    totalRecommendations: 14100,
    acceptedRecommendations: 11577,
  },
  {
    month: "Apr",
    accuracy: 83.8,
    totalRecommendations: 15000,
    acceptedRecommendations: 12570,
  },
  {
    month: "May",
    accuracy: 85.3,
    totalRecommendations: 15800,
    acceptedRecommendations: 13477,
  },
  {
    month: "Jun",
    accuracy: 86.9,
    totalRecommendations: 16500,
    acceptedRecommendations: 14339,
  },
  {
    month: "Jul",
    accuracy: 88.2,
    totalRecommendations: 17200,
    acceptedRecommendations: 15170,
  },
  {
    month: "Aug",
    accuracy: 89.5,
    totalRecommendations: 18000,
    acceptedRecommendations: 16110,
  },
  {
    month: "Sep",
    accuracy: 90.8,
    totalRecommendations: 18700,
    acceptedRecommendations: 16980,
  },
  {
    month: "Oct",
    accuracy: 92.1,
    totalRecommendations: 19500,
    acceptedRecommendations: 17960,
  },
  {
    month: "Nov",
    accuracy: 93.4,
    totalRecommendations: 20100,
    acceptedRecommendations: 18773,
  },
  {
    month: "Dec",
    accuracy: 94.2,
    totalRecommendations: 20800,
    acceptedRecommendations: 19594,
  },
];

// Peak Usage Hours
export const peakUsageHours: PeakUsageHours[] = Array.from(
  { length: 24 },
  (_, hour) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    sessions:
      hour >= 6 && hour <= 9
        ? Math.floor(Math.random() * 150) + 200
        : hour >= 17 && hour <= 20
        ? Math.floor(Math.random() * 180) + 220
        : Math.floor(Math.random() * 50) + 30,
    plays:
      hour >= 6 && hour <= 9
        ? Math.floor(Math.random() * 1500) + 2000
        : hour >= 17 && hour <= 20
        ? Math.floor(Math.random() * 1800) + 2200
        : Math.floor(Math.random() * 500) + 300,
    users:
      hour >= 6 && hour <= 9
        ? Math.floor(Math.random() * 100) + 150
        : hour >= 17 && hour <= 20
        ? Math.floor(Math.random() * 120) + 170
        : Math.floor(Math.random() * 40) + 20,
  })
);

// Combined Analytics Data
export const enhancedAnalyticsData: AnalyticsData = {
  dashboardStats,
  songPopularity,
  genreDistribution,
  moodDistribution,
  bpmDistribution,
  userActivityTrend,
  sessionMetrics,
  musicEngagement,
  recommendationAccuracy,
  peakUsageHours,
  geographicDistribution: [],
};

// Helper Functions
export const getTopGenres = (limit: number = 5): GenreDistribution[] => {
  return [...genreDistribution]
    .sort((a, b) => b.avgPlays - a.avgPlays)
    .slice(0, limit);
};

export const getTopMoods = (limit: number = 5): MoodDistribution[] => {
  return [...moodDistribution]
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

export const getTotalPlays = (): number => {
  return enhancedMusicTracks.reduce((sum, track) => sum + track.total_plays, 0);
};

export const getAverageSessionDuration = (): number => {
  return (
    enhancedMockSessions.reduce((sum: number, s) => sum + s.duration_seconds, 0) /
    enhancedMockSessions.length
  );
};

export const getActiveUsersCount = (): number => {
  return enhancedMockUsers.filter((u) => u.status === "active").length;
};

export const getUserGrowthRate = (): number => {
  // Mock calculation - would need historical data
  return 12.5;
};

export const getRecommendationTrend = (): number => {
  const recent = recommendationAccuracy.slice(-3);
  const older = recommendationAccuracy.slice(-6, -3);
  const recentAvg =
    recent.reduce((sum, r) => sum + r.accuracy, 0) / recent.length;
  const olderAvg = older.reduce((sum, r) => sum + r.accuracy, 0) / older.length;
  return ((recentAvg - olderAvg) / olderAvg) * 100;
};
