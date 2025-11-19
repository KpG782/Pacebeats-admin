// Enhanced Session Mock Data with complete schema
import {
  RunningSession,
  SessionGPSPoint,
  SessionHeartRate,
  SessionMusic,
} from "./types/session";
import { enhancedMockUsers } from "./enhanced-mock-data";

// Generate comprehensive running sessions
export const enhancedMockSessions: RunningSession[] = [
  {
    id: "SES001",
    user_id: "USR001",
    started_at: "2024-11-19T10:30:00Z",
    ended_at: "2024-11-19T11:00:00Z",
    duration_seconds: 1800,
    status: "completed",
    total_distance_meters: 5500,
    avg_pace_per_km: 327, // 5:27 min/km
    avg_heart_rate: 155,
    max_heart_rate: 172,
    calories_burned: 420,
    steps_count: 7200,
    start_location: { lat: 40.7128, lng: -74.006 },
    end_location: { lat: 40.7228, lng: -74.016 },
    route_polyline: "encoded_route_data_here",
    weather_condition: "Sunny",
    temperature: 22,
    created_at: "2024-11-19T11:00:00Z",
    user_name: "John Doe",
    user_email: "john.doe@example.com",
  },
  {
    id: "SES002",
    user_id: "USR002",
    started_at: "2024-11-19T09:15:00Z",
    ended_at: "2024-11-19T10:00:00Z",
    duration_seconds: 2700,
    status: "completed",
    total_distance_meters: 10000,
    avg_pace_per_km: 270, // 4:30 min/km
    avg_heart_rate: 165,
    max_heart_rate: 180,
    calories_burned: 650,
    steps_count: 13000,
    start_location: { lat: 40.758, lng: -73.9855 },
    end_location: { lat: 40.768, lng: -73.9755 },
    weather_condition: "Cloudy",
    temperature: 18,
    created_at: "2024-11-19T10:00:00Z",
    user_name: "Jane Smith",
    user_email: "jane.smith@example.com",
  },
  {
    id: "SES003",
    user_id: "USR004",
    started_at: "2024-11-19T11:45:00Z",
    ended_at: undefined,
    duration_seconds: 900,
    status: "active",
    total_distance_meters: 2800,
    avg_pace_per_km: 321, // 5:21 min/km
    avg_heart_rate: 148,
    max_heart_rate: 160,
    calories_burned: 180,
    steps_count: 3600,
    start_location: { lat: 34.0522, lng: -118.2437 },
    weather_condition: "Partly Cloudy",
    temperature: 25,
    created_at: "2024-11-19T11:45:00Z",
    user_name: "Emily Brown",
    user_email: "emily.brown@example.com",
  },
  {
    id: "SES004",
    user_id: "USR005",
    started_at: "2024-11-19T08:00:00Z",
    ended_at: "2024-11-19T09:00:00Z",
    duration_seconds: 3600,
    status: "completed",
    total_distance_meters: 15000,
    avg_pace_per_km: 240, // 4:00 min/km
    avg_heart_rate: 170,
    max_heart_rate: 185,
    calories_burned: 900,
    steps_count: 19500,
    start_location: { lat: 51.5074, lng: -0.1278 },
    end_location: { lat: 51.5174, lng: -0.1378 },
    weather_condition: "Rainy",
    temperature: 15,
    created_at: "2024-11-19T09:00:00Z",
    user_name: "David Wilson",
    user_email: "david.wilson@example.com",
  },
  {
    id: "SES005",
    user_id: "USR008",
    started_at: "2024-11-19T11:00:00Z",
    ended_at: "2024-11-19T11:01:00Z",
    duration_seconds: 60,
    status: "cancelled",
    total_distance_meters: 150,
    avg_pace_per_km: 400,
    calories_burned: 10,
    steps_count: 200,
    start_location: { lat: 37.7749, lng: -122.4194 },
    weather_condition: "Foggy",
    temperature: 14,
    created_at: "2024-11-19T11:01:00Z",
    user_name: "Amanda Garcia",
    user_email: "amanda.garcia@example.com",
  },
  {
    id: "SES006",
    user_id: "USR009",
    started_at: "2024-11-18T20:15:00Z",
    ended_at: "2024-11-18T20:45:00Z",
    duration_seconds: 1800,
    status: "completed",
    total_distance_meters: 6000,
    avg_pace_per_km: 300, // 5:00 min/km
    avg_heart_rate: 158,
    max_heart_rate: 175,
    calories_burned: 450,
    steps_count: 7800,
    start_location: { lat: 41.8781, lng: -87.6298 },
    end_location: { lat: 41.8881, lng: -87.6398 },
    weather_condition: "Clear",
    temperature: 20,
    created_at: "2024-11-18T20:45:00Z",
    user_name: "James Anderson",
    user_email: "james.anderson@example.com",
  },
  {
    id: "SES007",
    user_id: "USR010",
    started_at: "2024-11-19T07:30:00Z",
    ended_at: "2024-11-19T08:20:00Z",
    duration_seconds: 3000,
    status: "completed",
    total_distance_meters: 8500,
    avg_pace_per_km: 353, // 5:53 min/km
    avg_heart_rate: 152,
    max_heart_rate: 168,
    calories_burned: 520,
    steps_count: 11000,
    start_location: { lat: 48.8566, lng: 2.3522 },
    end_location: { lat: 48.8666, lng: 2.3622 },
    weather_condition: "Sunny",
    temperature: 21,
    created_at: "2024-11-19T08:20:00Z",
    user_name: "Lisa Thomas",
    user_email: "lisa.thomas@example.com",
  },
  {
    id: "SES008",
    user_id: "USR001",
    started_at: "2024-11-18T10:00:00Z",
    ended_at: "2024-11-18T10:40:00Z",
    duration_seconds: 2400,
    status: "completed",
    total_distance_meters: 7200,
    avg_pace_per_km: 333, // 5:33 min/km
    avg_heart_rate: 160,
    max_heart_rate: 175,
    calories_burned: 500,
    steps_count: 9400,
    weather_condition: "Windy",
    temperature: 19,
    created_at: "2024-11-18T10:40:00Z",
    user_name: "John Doe",
    user_email: "john.doe@example.com",
  },
  {
    id: "SES009",
    user_id: "USR002",
    started_at: "2024-11-19T14:00:00Z",
    ended_at: undefined,
    duration_seconds: 600,
    status: "active",
    total_distance_meters: 2100,
    avg_pace_per_km: 285, // 4:45 min/km
    avg_heart_rate: 162,
    max_heart_rate: 172,
    calories_burned: 120,
    steps_count: 2700,
    start_location: { lat: 35.6762, lng: 139.6503 },
    weather_condition: "Sunny",
    temperature: 24,
    created_at: "2024-11-19T14:00:00Z",
    user_name: "Jane Smith",
    user_email: "jane.smith@example.com",
  },
  {
    id: "SES010",
    user_id: "USR005",
    started_at: "2024-11-17T06:00:00Z",
    ended_at: "2024-11-17T07:30:00Z",
    duration_seconds: 5400,
    status: "completed",
    total_distance_meters: 21000,
    avg_pace_per_km: 257, // 4:17 min/km
    avg_heart_rate: 168,
    max_heart_rate: 182,
    calories_burned: 1200,
    steps_count: 27300,
    weather_condition: "Cool",
    temperature: 16,
    created_at: "2024-11-17T07:30:00Z",
    user_name: "David Wilson",
    user_email: "david.wilson@example.com",
  },
];

// Generate GPS points for sessions
export const mockSessionGPSPoints: SessionGPSPoint[] = [
  // Session 1 (SES001) - 5.5km route
  {
    id: "GPS001",
    session_id: "SES001",
    latitude: 40.7128,
    longitude: -74.006,
    altitude: 10,
    accuracy: 5,
    timestamp: "2024-11-19T10:30:00Z",
    created_at: "2024-11-19T10:30:00Z",
  },
  {
    id: "GPS002",
    session_id: "SES001",
    latitude: 40.7138,
    longitude: -74.007,
    altitude: 12,
    accuracy: 5,
    timestamp: "2024-11-19T10:32:00Z",
    created_at: "2024-11-19T10:32:00Z",
  },
  {
    id: "GPS003",
    session_id: "SES001",
    latitude: 40.7148,
    longitude: -74.008,
    altitude: 15,
    accuracy: 4,
    timestamp: "2024-11-19T10:34:00Z",
    created_at: "2024-11-19T10:34:00Z",
  },
  {
    id: "GPS004",
    session_id: "SES001",
    latitude: 40.7158,
    longitude: -74.009,
    altitude: 18,
    accuracy: 5,
    timestamp: "2024-11-19T10:36:00Z",
    created_at: "2024-11-19T10:36:00Z",
  },
  {
    id: "GPS005",
    session_id: "SES001",
    latitude: 40.7168,
    longitude: -74.01,
    altitude: 20,
    accuracy: 6,
    timestamp: "2024-11-19T10:38:00Z",
    created_at: "2024-11-19T10:38:00Z",
  },
  {
    id: "GPS006",
    session_id: "SES001",
    latitude: 40.7178,
    longitude: -74.011,
    altitude: 22,
    accuracy: 5,
    timestamp: "2024-11-19T10:40:00Z",
    created_at: "2024-11-19T10:40:00Z",
  },
  {
    id: "GPS007",
    session_id: "SES001",
    latitude: 40.7188,
    longitude: -74.012,
    altitude: 25,
    accuracy: 4,
    timestamp: "2024-11-19T10:42:00Z",
    created_at: "2024-11-19T10:42:00Z",
  },
  {
    id: "GPS008",
    session_id: "SES001",
    latitude: 40.7198,
    longitude: -74.013,
    altitude: 28,
    accuracy: 5,
    timestamp: "2024-11-19T10:44:00Z",
    created_at: "2024-11-19T10:44:00Z",
  },
  {
    id: "GPS009",
    session_id: "SES001",
    latitude: 40.7208,
    longitude: -74.014,
    altitude: 30,
    accuracy: 5,
    timestamp: "2024-11-19T10:46:00Z",
    created_at: "2024-11-19T10:46:00Z",
  },
  {
    id: "GPS010",
    session_id: "SES001",
    latitude: 40.7218,
    longitude: -74.015,
    altitude: 32,
    accuracy: 6,
    timestamp: "2024-11-19T10:48:00Z",
    created_at: "2024-11-19T10:48:00Z",
  },
  {
    id: "GPS011",
    session_id: "SES001",
    latitude: 40.7228,
    longitude: -74.016,
    altitude: 35,
    accuracy: 5,
    timestamp: "2024-11-19T11:00:00Z",
    created_at: "2024-11-19T11:00:00Z",
  },
];

// Generate heart rate data for sessions
export const mockSessionHeartRates: SessionHeartRate[] = [
  // Session 1 (SES001) heart rate progression
  {
    id: "HR001",
    session_id: "SES001",
    heart_rate: 120,
    timestamp: "2024-11-19T10:30:00Z",
    created_at: "2024-11-19T10:30:00Z",
  },
  {
    id: "HR002",
    session_id: "SES001",
    heart_rate: 135,
    timestamp: "2024-11-19T10:32:00Z",
    created_at: "2024-11-19T10:32:00Z",
  },
  {
    id: "HR003",
    session_id: "SES001",
    heart_rate: 148,
    timestamp: "2024-11-19T10:34:00Z",
    created_at: "2024-11-19T10:34:00Z",
  },
  {
    id: "HR004",
    session_id: "SES001",
    heart_rate: 155,
    timestamp: "2024-11-19T10:36:00Z",
    created_at: "2024-11-19T10:36:00Z",
  },
  {
    id: "HR005",
    session_id: "SES001",
    heart_rate: 160,
    timestamp: "2024-11-19T10:38:00Z",
    created_at: "2024-11-19T10:38:00Z",
  },
  {
    id: "HR006",
    session_id: "SES001",
    heart_rate: 165,
    timestamp: "2024-11-19T10:40:00Z",
    created_at: "2024-11-19T10:40:00Z",
  },
  {
    id: "HR007",
    session_id: "SES001",
    heart_rate: 172,
    timestamp: "2024-11-19T10:42:00Z",
    created_at: "2024-11-19T10:42:00Z",
  },
  {
    id: "HR008",
    session_id: "SES001",
    heart_rate: 168,
    timestamp: "2024-11-19T10:44:00Z",
    created_at: "2024-11-19T10:44:00Z",
  },
  {
    id: "HR009",
    session_id: "SES001",
    heart_rate: 162,
    timestamp: "2024-11-19T10:46:00Z",
    created_at: "2024-11-19T10:46:00Z",
  },
  {
    id: "HR010",
    session_id: "SES001",
    heart_rate: 155,
    timestamp: "2024-11-19T10:48:00Z",
    created_at: "2024-11-19T10:48:00Z",
  },
  {
    id: "HR011",
    session_id: "SES001",
    heart_rate: 145,
    timestamp: "2024-11-19T10:50:00Z",
    created_at: "2024-11-19T10:50:00Z",
  },
  {
    id: "HR012",
    session_id: "SES001",
    heart_rate: 138,
    timestamp: "2024-11-19T10:52:00Z",
    created_at: "2024-11-19T10:52:00Z",
  },
  {
    id: "HR013",
    session_id: "SES001",
    heart_rate: 130,
    timestamp: "2024-11-19T10:54:00Z",
    created_at: "2024-11-19T10:54:00Z",
  },
  {
    id: "HR014",
    session_id: "SES001",
    heart_rate: 125,
    timestamp: "2024-11-19T10:56:00Z",
    created_at: "2024-11-19T10:56:00Z",
  },
  {
    id: "HR015",
    session_id: "SES001",
    heart_rate: 118,
    timestamp: "2024-11-19T11:00:00Z",
    created_at: "2024-11-19T11:00:00Z",
  },
];

// Generate music played during sessions
export const mockSessionMusic: SessionMusic[] = [
  {
    id: "SM001",
    session_id: "SES001",
    track_id: "TRK001",
    track_name: "Power Run",
    artist_name: "DJ Energy",
    played_at: "2024-11-19T10:30:00Z",
    duration_ms: 210000,
    completed: true,
  },
  {
    id: "SM002",
    session_id: "SES001",
    track_id: "TRK002",
    track_name: "Beat Drop",
    artist_name: "Electronic Vibes",
    played_at: "2024-11-19T10:33:30Z",
    duration_ms: 195000,
    completed: true,
  },
  {
    id: "SM003",
    session_id: "SES001",
    track_id: "TRK003",
    track_name: "Running Wild",
    artist_name: "Speed Beats",
    played_at: "2024-11-19T10:36:45Z",
    duration_ms: 220000,
    completed: true,
  },
  {
    id: "SM004",
    session_id: "SES001",
    track_id: "TRK004",
    track_name: "High Tempo",
    artist_name: "Gym Anthems",
    played_at: "2024-11-19T10:40:25Z",
    duration_ms: 200000,
    completed: true,
  },
  {
    id: "SM005",
    session_id: "SES001",
    track_id: "TRK005",
    track_name: "Final Sprint",
    artist_name: "Motivation Music",
    played_at: "2024-11-19T10:43:45Z",
    duration_ms: 240000,
    completed: true,
  },
  {
    id: "SM006",
    session_id: "SES001",
    track_id: "TRK006",
    track_name: "Cool Down",
    artist_name: "Chill Beats",
    played_at: "2024-11-19T10:47:45Z",
    duration_ms: 180000,
    completed: true,
  },
];

// Helper functions
export const getSessionById = (id: string): RunningSession | undefined => {
  return enhancedMockSessions.find((session) => session.id === id);
};

export const getSessionsByUserId = (userId: string): RunningSession[] => {
  return enhancedMockSessions.filter((session) => session.user_id === userId);
};

export const getGPSPointsBySessionId = (
  sessionId: string
): SessionGPSPoint[] => {
  return mockSessionGPSPoints.filter((point) => point.session_id === sessionId);
};

export const getHeartRateBySessionId = (
  sessionId: string
): SessionHeartRate[] => {
  return mockSessionHeartRates.filter((hr) => hr.session_id === sessionId);
};

export const getMusicBySessionId = (sessionId: string): SessionMusic[] => {
  return mockSessionMusic.filter((music) => music.session_id === sessionId);
};

export const getActiveSessions = (): RunningSession[] => {
  return enhancedMockSessions.filter((session) => session.status === "active");
};

export const getCompletedSessions = (): RunningSession[] => {
  return enhancedMockSessions.filter(
    (session) => session.status === "completed"
  );
};
