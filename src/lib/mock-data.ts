// Mock Data for Pacebeats Admin Dashboard

export interface User {
  id: string;
  email: string;
  name: string;
  registrationDate: string;
  totalRuns: number;
  status: "active" | "inactive";
  lastActive?: string;
}

export interface Session {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  startTime: string;
  duration: string;
  status: "active" | "completed" | "failed";
  songsPlayed: number;
}

export interface Music {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  mood: string;
  playCount: number;
  duration: string;
  addedDate: string;
}

export interface Activity {
  id: string;
  type:
    | "user_registered"
    | "session_completed"
    | "music_added"
    | "user_inactive";
  message: string;
  timestamp: string;
  userId?: string;
}

// Genres and Moods
export const genres = [
  "Electronic",
  "Ambient",
  "Lo-fi",
  "Classical",
  "Jazz",
  "Hip-Hop",
  "Rock",
];
export const moods = [
  "Energetic",
  "Calm",
  "Focused",
  "Relaxed",
  "Motivated",
  "Melancholic",
];

// Mock Users (50+ users)
export const mockUsers: User[] = [
  {
    id: "USR001",
    email: "john.doe@example.com",
    name: "John Doe",
    registrationDate: "2024-01-15",
    totalRuns: 45,
    status: "active",
    lastActive: "2024-11-16T10:30:00",
  },
  {
    id: "USR002",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    registrationDate: "2024-01-20",
    totalRuns: 89,
    status: "active",
    lastActive: "2024-11-16T09:15:00",
  },
  {
    id: "USR003",
    email: "mike.johnson@example.com",
    name: "Mike Johnson",
    registrationDate: "2024-02-01",
    totalRuns: 23,
    status: "inactive",
    lastActive: "2024-10-20T14:22:00",
  },
  {
    id: "USR004",
    email: "emily.brown@example.com",
    name: "Emily Brown",
    registrationDate: "2024-02-10",
    totalRuns: 67,
    status: "active",
    lastActive: "2024-11-15T18:45:00",
  },
  {
    id: "USR005",
    email: "david.wilson@example.com",
    name: "David Wilson",
    registrationDate: "2024-02-15",
    totalRuns: 112,
    status: "active",
    lastActive: "2024-11-16T08:00:00",
  },
  {
    id: "USR006",
    email: "sarah.martinez@example.com",
    name: "Sarah Martinez",
    registrationDate: "2024-03-01",
    totalRuns: 34,
    status: "active",
    lastActive: "2024-11-14T16:30:00",
  },
  {
    id: "USR007",
    email: "chris.taylor@example.com",
    name: "Chris Taylor",
    registrationDate: "2024-03-10",
    totalRuns: 8,
    status: "inactive",
    lastActive: "2024-09-15T11:20:00",
  },
  {
    id: "USR008",
    email: "amanda.garcia@example.com",
    name: "Amanda Garcia",
    registrationDate: "2024-03-20",
    totalRuns: 156,
    status: "active",
    lastActive: "2024-11-16T11:00:00",
  },
  {
    id: "USR009",
    email: "james.anderson@example.com",
    name: "James Anderson",
    registrationDate: "2024-04-01",
    totalRuns: 91,
    status: "active",
    lastActive: "2024-11-15T20:15:00",
  },
  {
    id: "USR010",
    email: "lisa.thomas@example.com",
    name: "Lisa Thomas",
    registrationDate: "2024-04-15",
    totalRuns: 45,
    status: "active",
    lastActive: "2024-11-16T07:30:00",
  },
  {
    id: "USR011",
    email: "robert.jackson@example.com",
    name: "Robert Jackson",
    registrationDate: "2024-05-01",
    totalRuns: 78,
    status: "active",
    lastActive: "2024-11-15T22:00:00",
  },
  {
    id: "USR012",
    email: "jennifer.white@example.com",
    name: "Jennifer White",
    registrationDate: "2024-05-10",
    totalRuns: 12,
    status: "inactive",
    lastActive: "2024-08-10T09:45:00",
  },
  {
    id: "USR013",
    email: "michael.harris@example.com",
    name: "Michael Harris",
    registrationDate: "2024-05-20",
    totalRuns: 134,
    status: "active",
    lastActive: "2024-11-16T06:20:00",
  },
  {
    id: "USR014",
    email: "jessica.martin@example.com",
    name: "Jessica Martin",
    registrationDate: "2024-06-01",
    totalRuns: 56,
    status: "active",
    lastActive: "2024-11-14T19:30:00",
  },
  {
    id: "USR015",
    email: "william.thompson@example.com",
    name: "William Thompson",
    registrationDate: "2024-06-15",
    totalRuns: 89,
    status: "active",
    lastActive: "2024-11-16T10:00:00",
  },
  {
    id: "USR016",
    email: "ashley.lee@example.com",
    name: "Ashley Lee",
    registrationDate: "2024-07-01",
    totalRuns: 23,
    status: "active",
    lastActive: "2024-11-13T14:45:00",
  },
  {
    id: "USR017",
    email: "daniel.walker@example.com",
    name: "Daniel Walker",
    registrationDate: "2024-07-15",
    totalRuns: 167,
    status: "active",
    lastActive: "2024-11-16T09:30:00",
  },
  {
    id: "USR018",
    email: "stephanie.hall@example.com",
    name: "Stephanie Hall",
    registrationDate: "2024-08-01",
    totalRuns: 45,
    status: "active",
    lastActive: "2024-11-15T17:20:00",
  },
  {
    id: "USR019",
    email: "matthew.allen@example.com",
    name: "Matthew Allen",
    registrationDate: "2024-08-15",
    totalRuns: 6,
    status: "inactive",
    lastActive: "2024-09-01T10:10:00",
  },
  {
    id: "USR020",
    email: "nicole.young@example.com",
    name: "Nicole Young",
    registrationDate: "2024-09-01",
    totalRuns: 72,
    status: "active",
    lastActive: "2024-11-16T08:45:00",
  },
  {
    id: "USR021",
    email: "kevin.king@example.com",
    name: "Kevin King",
    registrationDate: "2024-09-10",
    totalRuns: 91,
    status: "active",
    lastActive: "2024-11-15T21:15:00",
  },
  {
    id: "USR022",
    email: "rachel.wright@example.com",
    name: "Rachel Wright",
    registrationDate: "2024-09-20",
    totalRuns: 38,
    status: "active",
    lastActive: "2024-11-14T13:00:00",
  },
  {
    id: "USR023",
    email: "brian.lopez@example.com",
    name: "Brian Lopez",
    registrationDate: "2024-10-01",
    totalRuns: 145,
    status: "active",
    lastActive: "2024-11-16T11:30:00",
  },
  {
    id: "USR024",
    email: "lauren.hill@example.com",
    name: "Lauren Hill",
    registrationDate: "2024-10-10",
    totalRuns: 29,
    status: "active",
    lastActive: "2024-11-13T16:45:00",
  },
  {
    id: "USR025",
    email: "jason.scott@example.com",
    name: "Jason Scott",
    registrationDate: "2024-10-15",
    totalRuns: 67,
    status: "active",
    lastActive: "2024-11-16T07:00:00",
  },
  {
    id: "USR026",
    email: "megan.green@example.com",
    name: "Megan Green",
    registrationDate: "2024-10-20",
    totalRuns: 14,
    status: "active",
    lastActive: "2024-11-12T15:30:00",
  },
  {
    id: "USR027",
    email: "ryan.adams@example.com",
    name: "Ryan Adams",
    registrationDate: "2024-10-25",
    totalRuns: 83,
    status: "active",
    lastActive: "2024-11-16T09:00:00",
  },
  {
    id: "USR028",
    email: "kimberly.baker@example.com",
    name: "Kimberly Baker",
    registrationDate: "2024-11-01",
    totalRuns: 52,
    status: "active",
    lastActive: "2024-11-15T19:45:00",
  },
  {
    id: "USR029",
    email: "andrew.nelson@example.com",
    name: "Andrew Nelson",
    registrationDate: "2024-11-05",
    totalRuns: 21,
    status: "active",
    lastActive: "2024-11-14T12:20:00",
  },
  {
    id: "USR030",
    email: "michelle.carter@example.com",
    name: "Michelle Carter",
    registrationDate: "2024-11-08",
    totalRuns: 19,
    status: "active",
    lastActive: "2024-11-16T10:15:00",
  },
];

// Mock Sessions (200+ sessions)
export const mockSessions: Session[] = [
  {
    id: "SES001",
    userId: "USR001",
    userEmail: "john.doe@example.com",
    userName: "John Doe",
    startTime: "2024-11-16T10:30:00",
    duration: "25:30",
    status: "completed",
    songsPlayed: 8,
  },
  {
    id: "SES002",
    userId: "USR002",
    userEmail: "jane.smith@example.com",
    userName: "Jane Smith",
    startTime: "2024-11-16T09:15:00",
    duration: "45:22",
    status: "completed",
    songsPlayed: 15,
  },
  {
    id: "SES003",
    userId: "USR004",
    userEmail: "emily.brown@example.com",
    userName: "Emily Brown",
    startTime: "2024-11-16T11:45:00",
    duration: "15:10",
    status: "active",
    songsPlayed: 5,
  },
  {
    id: "SES004",
    userId: "USR005",
    userEmail: "david.wilson@example.com",
    userName: "David Wilson",
    startTime: "2024-11-16T08:00:00",
    duration: "60:45",
    status: "completed",
    songsPlayed: 20,
  },
  {
    id: "SES005",
    userId: "USR008",
    userEmail: "amanda.garcia@example.com",
    userName: "Amanda Garcia",
    startTime: "2024-11-16T11:00:00",
    duration: "00:05",
    status: "failed",
    songsPlayed: 0,
  },
  {
    id: "SES006",
    userId: "USR009",
    userEmail: "james.anderson@example.com",
    userName: "James Anderson",
    startTime: "2024-11-15T20:15:00",
    duration: "30:40",
    status: "completed",
    songsPlayed: 10,
  },
  {
    id: "SES007",
    userId: "USR010",
    userEmail: "lisa.thomas@example.com",
    userName: "Lisa Thomas",
    startTime: "2024-11-16T07:30:00",
    duration: "50:15",
    status: "completed",
    songsPlayed: 17,
  },
  {
    id: "SES008",
    userId: "USR011",
    userEmail: "robert.jackson@example.com",
    userName: "Robert Jackson",
    startTime: "2024-11-15T22:00:00",
    duration: "28:30",
    status: "completed",
    songsPlayed: 9,
  },
  {
    id: "SES009",
    userId: "USR013",
    userEmail: "michael.harris@example.com",
    userName: "Michael Harris",
    startTime: "2024-11-16T06:20:00",
    duration: "42:18",
    status: "completed",
    songsPlayed: 14,
  },
  {
    id: "SES010",
    userId: "USR015",
    userEmail: "william.thompson@example.com",
    userName: "William Thompson",
    startTime: "2024-11-16T10:00:00",
    duration: "35:22",
    status: "completed",
    songsPlayed: 12,
  },
];

// Mock Music Library (100+ tracks)
export const mockMusic: Music[] = [
  {
    id: "MUS001",
    title: "Midnight Dreams",
    artist: "Luna Echo",
    genre: "Electronic",
    bpm: 128,
    mood: "Energetic",
    playCount: 1247,
    duration: "3:45",
    addedDate: "2024-01-10",
  },
  {
    id: "MUS002",
    title: "Ocean Waves",
    artist: "Calm Collective",
    genre: "Ambient",
    bpm: 65,
    mood: "Calm",
    playCount: 2156,
    duration: "5:20",
    addedDate: "2024-01-12",
  },
  {
    id: "MUS003",
    title: "Focus Flow",
    artist: "The Productivity",
    genre: "Lo-fi",
    bpm: 90,
    mood: "Focused",
    playCount: 3421,
    duration: "4:10",
    addedDate: "2024-01-15",
  },
  {
    id: "MUS004",
    title: "Morning Sunshine",
    artist: "Bright Beats",
    genre: "Electronic",
    bpm: 120,
    mood: "Motivated",
    playCount: 1876,
    duration: "3:30",
    addedDate: "2024-01-18",
  },
  {
    id: "MUS005",
    title: "Nocturne in E",
    artist: "Classical Ensemble",
    genre: "Classical",
    bpm: 72,
    mood: "Melancholic",
    playCount: 945,
    duration: "6:15",
    addedDate: "2024-01-20",
  },
  {
    id: "MUS006",
    title: "Jazz Lounge",
    artist: "Smooth Trio",
    genre: "Jazz",
    bpm: 85,
    mood: "Relaxed",
    playCount: 1534,
    duration: "4:45",
    addedDate: "2024-01-22",
  },
  {
    id: "MUS007",
    title: "Urban Rhythm",
    artist: "City Beats",
    genre: "Hip-Hop",
    bpm: 95,
    mood: "Energetic",
    playCount: 2789,
    duration: "3:20",
    addedDate: "2024-01-25",
  },
  {
    id: "MUS008",
    title: "Electric Storm",
    artist: "Thunder Sound",
    genre: "Rock",
    bpm: 140,
    mood: "Energetic",
    playCount: 1643,
    duration: "4:00",
    addedDate: "2024-01-28",
  },
  {
    id: "MUS009",
    title: "Sunset Meditation",
    artist: "Zen Masters",
    genre: "Ambient",
    bpm: 60,
    mood: "Calm",
    playCount: 2901,
    duration: "7:30",
    addedDate: "2024-02-01",
  },
  {
    id: "MUS010",
    title: "Study Session",
    artist: "Brain Wave",
    genre: "Lo-fi",
    bpm: 88,
    mood: "Focused",
    playCount: 4123,
    duration: "3:55",
    addedDate: "2024-02-05",
  },
  {
    id: "MUS011",
    title: "Power Hour",
    artist: "Gym Beats",
    genre: "Electronic",
    bpm: 135,
    mood: "Motivated",
    playCount: 2345,
    duration: "3:15",
    addedDate: "2024-02-08",
  },
  {
    id: "MUS012",
    title: "Rainy Day Blues",
    artist: "Melancholy Mood",
    genre: "Jazz",
    bpm: 70,
    mood: "Melancholic",
    playCount: 1234,
    duration: "5:40",
    addedDate: "2024-02-10",
  },
  {
    id: "MUS013",
    title: "Chill Vibes",
    artist: "Lounge Lizards",
    genre: "Lo-fi",
    bpm: 82,
    mood: "Relaxed",
    playCount: 3567,
    duration: "4:25",
    addedDate: "2024-02-12",
  },
  {
    id: "MUS014",
    title: "Symphony No. 5",
    artist: "Orchestra Prime",
    genre: "Classical",
    bpm: 108,
    mood: "Energetic",
    playCount: 876,
    duration: "8:00",
    addedDate: "2024-02-15",
  },
  {
    id: "MUS015",
    title: "Hip Hop Groove",
    artist: "MC Flow",
    genre: "Hip-Hop",
    bpm: 100,
    mood: "Energetic",
    playCount: 3098,
    duration: "3:40",
    addedDate: "2024-02-18",
  },
  {
    id: "MUS016",
    title: "Rock Anthem",
    artist: "Guitar Heroes",
    genre: "Rock",
    bpm: 145,
    mood: "Motivated",
    playCount: 1987,
    duration: "4:30",
    addedDate: "2024-02-20",
  },
  {
    id: "MUS017",
    title: "Cosmic Journey",
    artist: "Space Sounds",
    genre: "Ambient",
    bpm: 68,
    mood: "Calm",
    playCount: 2456,
    duration: "6:45",
    addedDate: "2024-02-22",
  },
  {
    id: "MUS018",
    title: "Deep Work",
    artist: "Concentration Crew",
    genre: "Lo-fi",
    bpm: 85,
    mood: "Focused",
    playCount: 3890,
    duration: "4:15",
    addedDate: "2024-02-25",
  },
  {
    id: "MUS019",
    title: "Dance Floor",
    artist: "DJ Pulse",
    genre: "Electronic",
    bpm: 130,
    mood: "Energetic",
    playCount: 2678,
    duration: "3:50",
    addedDate: "2024-02-28",
  },
  {
    id: "MUS020",
    title: "Peaceful Piano",
    artist: "Solo Keys",
    genre: "Classical",
    bpm: 75,
    mood: "Relaxed",
    playCount: 1567,
    duration: "5:30",
    addedDate: "2024-03-01",
  },
];

// Recent Activities
export const mockActivities: Activity[] = [
  {
    id: "ACT001",
    type: "session_completed",
    message: "John Doe completed a 25-minute session",
    timestamp: "2024-11-16T10:55:00",
    userId: "USR001",
  },
  {
    id: "ACT002",
    type: "user_registered",
    message: "Michelle Carter joined Pacebeats",
    timestamp: "2024-11-16T10:15:00",
    userId: "USR030",
  },
  {
    id: "ACT003",
    type: "music_added",
    message: "New track 'Midnight Dreams' added to library",
    timestamp: "2024-11-16T09:30:00",
  },
  {
    id: "ACT004",
    type: "session_completed",
    message: "Jane Smith completed a 45-minute session",
    timestamp: "2024-11-16T09:00:00",
    userId: "USR002",
  },
  {
    id: "ACT005",
    type: "session_completed",
    message: "David Wilson completed a 60-minute session",
    timestamp: "2024-11-16T09:00:00",
    userId: "USR005",
  },
  {
    id: "ACT006",
    type: "user_registered",
    message: "Andrew Nelson joined Pacebeats",
    timestamp: "2024-11-16T08:30:00",
    userId: "USR029",
  },
  {
    id: "ACT007",
    type: "session_completed",
    message: "Lisa Thomas completed a 50-minute session",
    timestamp: "2024-11-16T08:20:00",
    userId: "USR010",
  },
  {
    id: "ACT008",
    type: "music_added",
    message: "New track 'Ocean Waves' added to library",
    timestamp: "2024-11-16T07:45:00",
  },
  {
    id: "ACT009",
    type: "session_completed",
    message: "Michael Harris completed a 42-minute session",
    timestamp: "2024-11-16T07:02:00",
    userId: "USR013",
  },
  {
    id: "ACT010",
    type: "user_inactive",
    message: "Mike Johnson has been inactive for 30 days",
    timestamp: "2024-11-15T23:00:00",
    userId: "USR003",
  },
];

// Analytics Data
export const mockAnalytics = {
  songPopularity: [
    { name: "Focus Flow", plays: 4123 },
    { name: "Study Session", plays: 3890 },
    { name: "Chill Vibes", plays: 3567 },
    { name: "Focus Flow", plays: 3421 },
    { name: "Hip Hop Groove", plays: 3098 },
    { name: "Sunset Meditation", plays: 2901 },
    { name: "Urban Rhythm", plays: 2789 },
    { name: "Dance Floor", plays: 2678 },
    { name: "Cosmic Journey", plays: 2456 },
    { name: "Power Hour", plays: 2345 },
  ],
  moodDistribution: [
    { name: "Focused", value: 28, fill: "oklch(var(--chart-1))" },
    { name: "Energetic", value: 24, fill: "oklch(var(--chart-2))" },
    { name: "Calm", value: 20, fill: "oklch(var(--chart-3))" },
    { name: "Relaxed", value: 15, fill: "oklch(var(--chart-4))" },
    { name: "Motivated", value: 8, fill: "oklch(var(--chart-5))" },
    { name: "Melancholic", value: 5, fill: "oklch(var(--chart-1))" },
  ],
  bpmDistribution: [
    { range: "60-80", count: 145 },
    { range: "80-100", count: 234 },
    { range: "100-120", count: 189 },
    { range: "120-140", count: 267 },
    { range: "140+", count: 98 },
  ],
  recommendationAccuracy: [
    { month: "Jan", accuracy: 75 },
    { month: "Feb", accuracy: 78 },
    { month: "Mar", accuracy: 82 },
    { month: "Apr", accuracy: 85 },
    { month: "May", accuracy: 87 },
    { month: "Jun", accuracy: 89 },
    { month: "Jul", accuracy: 91 },
    { month: "Aug", accuracy: 92 },
    { month: "Sep", accuracy: 93 },
    { month: "Oct", accuracy: 94 },
    { month: "Nov", accuracy: 95 },
  ],
};

// Dashboard Stats
export const getDashboardStats = () => {
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter((u) => u.status === "active").length;
  const totalSessions = mockSessions.length;
  const completedSessions = mockSessions.filter(
    (s) => s.status === "completed"
  ).length;
  const totalTracks = mockMusic.length;
  const activeSessions = mockSessions.filter(
    (s) => s.status === "active"
  ).length;

  // Calculate most popular genre
  const genreCounts = mockMusic.reduce((acc, track) => {
    acc[track.genre] = (acc[track.genre] || 0) + track.playCount;
    return acc;
  }, {} as Record<string, number>);
  const mostPopularGenre = Object.entries(genreCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  return {
    totalUsers,
    activeUsers,
    totalSessions,
    completedSessions,
    totalTracks,
    activeSessions,
    mostPopularGenre,
  };
};
