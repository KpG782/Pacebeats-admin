export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  activeSessions: number;
  totalTracks: number;
  totalPlays: number;
  avgSessionDuration: number;
  userRetentionRate: number;
  avgSongsPerSession: number;
  avgCompletionRate: number;
  userSatisfaction: number;
}

export interface SongPopularity {
  id: string;
  name: string;
  artist: string;
  plays: number;
  listeners: number;
  completionRate: number;
  genre: string;
  bpm: number;
}

export interface GenreDistribution {
  name: string;
  value: number;
  color: string;
  tracks: number;
  avgPlays: number;
}

export interface MoodDistribution {
  name: string;
  value: number;
  color: string;
  tracks: number;
  energyLevel: number;
}

export interface BPMDistribution {
  range: string;
  count: number;
  avgPlays: number;
  popularGenres: string[];
}

export interface UserActivityTrend {
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  avgDuration: number;
}

export interface SessionMetrics {
  month: string;
  totalSessions: number;
  avgDuration: number;
  completedSessions: number;
  avgDistance: number;
}

export interface MusicEngagement {
  month: string;
  plays: number;
  uniqueListeners: number;
  avgCompletionRate: number;
  skipRate: number;
}

export interface RecommendationAccuracy {
  month: string;
  accuracy: number;
  totalRecommendations: number;
  acceptedRecommendations: number;
}

export interface PeakUsageHours {
  hour: string;
  sessions: number;
  plays: number;
  users: number;
}

export interface GeographicDistribution {
  country: string;
  users: number;
  sessions: number;
  avgDuration: number;
  popularGenre: string;
}

export interface AnalyticsData {
  dashboardStats: DashboardStats;
  songPopularity: SongPopularity[];
  genreDistribution: GenreDistribution[];
  moodDistribution: MoodDistribution[];
  bpmDistribution: BPMDistribution[];
  userActivityTrend: UserActivityTrend[];
  sessionMetrics: SessionMetrics[];
  musicEngagement: MusicEngagement[];
  recommendationAccuracy: RecommendationAccuracy[];
  peakUsageHours: PeakUsageHours[];
  geographicDistribution: GeographicDistribution[];
}

export interface AnalyticsFilters {
  dateRange: "week" | "month" | "quarter" | "year" | "custom";
  startDate?: string;
  endDate?: string;
  genre?: string;
  userType?: "all" | "active" | "new" | "inactive";
  metricType?: "users" | "sessions" | "music" | "all";
}

export interface ExportOptions {
  format: "csv" | "xlsx" | "pdf" | "json";
  includeCharts: boolean;
  dateRange: string;
  selectedMetrics: string[];
}
