# 🎯 PaceBeats Admin Dashboard - Complete Implementation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Essential Data Structure](#essential-data-structure)
3. [Core Features & Modules](#core-features--modules)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Folder Structure](#folder-structure)
7. [Implementation Phases](#implementation-phases)

---

## 🎯 Overview

This guide outlines the **essential features and data structure** for the PaceBeats Admin Dashboard. We'll start with the **MVP (Minimum Viable Product)** features that every admin dashboard needs, then expand to advanced features.

### Core Purpose
- Monitor platform health and user activity
- Manage users and their data
- Track running sessions and music listening events
- Analyze user behavior and app performance
- Handle support tickets and moderation

---

## 📊 Essential Data Structure

### 1. **User Data** (Primary Focus)
Core information admins need to manage users effectively.

```typescript
interface User {
  // Identity
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  
  // Profile (from onboarding)
  gender?: string;
  age?: number;
  height?: number;
  height_unit?: 'cm' | 'ft';
  weight?: number;
  weight_unit?: 'kg' | 'lbs';
  
  // Running preferences
  running_experience?: 'beginner' | 'intermediate' | 'advanced';
  pace_band?: string; // e.g., "5:00-6:00 min/km"
  preferred_genres?: string[]; // ["Electronic", "Hip Hop"]
  
  // Status & Metadata
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  created_at: Date;
  last_login_at?: Date;
  onboarding_completed: boolean;
  
  // Statistics (computed)
  total_runs: number;
  total_distance_km: number;
  total_duration_minutes: number;
  avg_pace?: string;
}
```

### 2. **Running Session Data** (Activity Tracking)
Track user workouts and performance.

```typescript
interface RunningSession {
  // Core
  id: string;
  user_id: string;
  
  // Session Details
  started_at: Date;
  ended_at?: Date;
  duration_seconds: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Performance Metrics
  total_distance_meters: number;
  avg_pace_per_km: number; // seconds
  avg_heart_rate?: number;
  max_heart_rate?: number;
  calories_burned?: number;
  steps_count?: number;
  
  // GPS & Route
  start_location?: { lat: number; lng: number };
  end_location?: { lat: number; lng: number };
  route_polyline?: string; // encoded GPS points
  
  // Environment
  weather_condition?: string;
  temperature?: number;
  
  // Metadata
  created_at: Date;
}
```

### 3. **Music Listening Events** (Engagement Tracking)
Track what users listen to during runs.

```typescript
interface ListeningEvent {
  // Core
  id: string;
  user_id: string;
  session_id?: string; // linked to running session
  
  // Track Information
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name?: string;
  track_uri?: string; // Spotify URI
  
  // Playback
  played_at: Date;
  duration_ms: number;
  play_count: number;
  completed: boolean; // did user listen to the full track?
  
  // Context
  source: 'spotify' | 'local' | 'youtube_music';
  playlist_name?: string;
  
  // Analytics
  bpm?: number;
  genre?: string;
  mood?: string;
  energy_level?: number; // 0-100
  
  // Metadata
  created_at: Date;
}
```

### 4. **Music Track Library** (Content Management)
Manage music recommendations and library.

```typescript
interface MusicTrack {
  // Identity
  id: string;
  spotify_id?: string;
  youtube_music_id?: string;
  
  // Track Info
  title: string;
  artist: string;
  album?: string;
  duration_seconds: number;
  release_date?: Date;
  
  // Audio Features
  bpm: number;
  genre: string;
  mood: string; // 'energetic' | 'calm' | 'focus' | 'upbeat' | 'chill' | 'intense'
  energy_level: number; // 0-100
  danceability?: number; // 0-100
  valence?: number; // 0-100 (happiness)
  
  // Assets
  album_art_url?: string;
  preview_url?: string;
  
  // Engagement
  play_count: number;
  like_count: number;
  skip_count: number;
  avg_completion_rate: number; // 0-100%
  
  // Recommendation
  recommended_for_paces?: string[]; // ["4:00-5:00", "5:00-6:00"]
  
  // Status
  is_active: boolean;
  is_featured: boolean;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}
```

### 5. **System Analytics** (Dashboard Metrics)
Aggregated stats for the dashboard home.

```typescript
interface DashboardStats {
  // User Metrics
  total_users: number;
  active_users_today: number;
  active_users_this_week: number;
  new_users_this_month: number;
  
  // Session Metrics
  total_sessions: number;
  sessions_today: number;
  active_sessions_now: number;
  avg_session_duration_minutes: number;
  total_distance_km: number;
  
  // Music Metrics
  total_tracks: number;
  tracks_played_today: number;
  most_popular_genre: string;
  avg_songs_per_session: number;
  
  // System Health
  api_status: 'operational' | 'degraded' | 'down';
  database_status: 'operational' | 'degraded' | 'down';
  spotify_api_status: 'operational' | 'degraded' | 'down';
  
  // Timestamp
  last_updated: Date;
}
```

---

## 🎯 Core Features & Modules

### Phase 1: Essential MVP Features

#### 1. **Dashboard Home** 📊
**Priority: HIGH** - First thing admins see

**Features:**
- [ ] Real-time statistics cards:
  - Total users (with % change from last week)
  - Active sessions right now
  - Sessions completed today
  - Most popular genre
- [ ] Recent activity feed (last 20 events):
  - User registrations
  - Completed sessions
  - Support tickets
  - System alerts
- [ ] Quick actions:
  - View all users
  - View active sessions
  - Export daily report
  - System settings
- [ ] System health indicators:
  - API Server status
  - Database status
  - Spotify API status
  - Supabase status

**Data Needed:**
```sql
-- Dashboard stats query
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 1 END) as active_users_week,
  (SELECT COUNT(*) FROM running_sessions WHERE status = 'active') as active_sessions,
  (SELECT COUNT(*) FROM running_sessions WHERE DATE(created_at) = CURRENT_DATE) as sessions_today
FROM users;
```

---

#### 2. **User Management** 👥
**Priority: HIGH** - Core admin functionality

**Features:**
- [ ] User list table with:
  - ID, Name, Email, Status
  - Registration date
  - Last login
  - Total runs
  - Total distance
- [ ] Search & filters:
  - Search by name/email
  - Filter by status (active/inactive/suspended)
  - Filter by registration date range
  - Filter by running experience level
- [ ] User actions:
  - View full profile
  - Edit user details
  - Suspend/activate account
  - Delete account (with confirmation)
  - Reset password
  - Send notification
- [ ] Bulk actions:
  - Export selected users to CSV
  - Bulk suspend
  - Bulk delete
- [ ] User details page:
  - Profile information
  - Running statistics
  - Session history
  - Music preferences
  - Recent activity

**Data Needed:**
```typescript
// User list with pagination
interface UserListRequest {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  date_from?: Date;
  date_to?: Date;
  sort_by?: 'created_at' | 'last_login_at' | 'total_runs';
  sort_order?: 'asc' | 'desc';
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}
```

---

#### 3. **Session Management** 🏃‍♂️
**Priority: HIGH** - Monitor active workouts

**Features:**
- [ ] Live session monitoring:
  - Active sessions with real-time status
  - User info, start time, duration
  - Current location (if available)
  - Heart rate (if available)
- [ ] Session list table:
  - User, Date, Duration, Distance, Status
  - Sortable columns
  - Status badges (active/completed/cancelled)
- [ ] Filters:
  - Status (active/completed/paused/cancelled)
  - Date range
  - User
  - Distance range
  - Duration range
- [ ] Session details:
  - Full metrics (pace, HR, calories)
  - GPS route map
  - Music played during session
  - Session timeline
- [ ] Export options:
  - Export session data to CSV
  - Export GPS data (GPX format)

**Data Needed:**
```sql
-- Active sessions query
SELECT 
  rs.id,
  rs.user_id,
  u.username,
  u.email,
  rs.started_at,
  rs.duration_seconds,
  rs.total_distance_meters,
  rs.avg_pace_per_km,
  rs.status
FROM running_sessions rs
JOIN users u ON rs.user_id = u.id
WHERE rs.status = 'active'
ORDER BY rs.started_at DESC;
```

---

#### 4. **Music Library** 🎵
**Priority: MEDIUM** - Content management

**Features:**
- [ ] Track list with grid/table view:
  - Album art, Title, Artist, Genre, BPM
  - Play count, Duration
  - Status (active/inactive)
- [ ] Filters:
  - Genre filter
  - Mood filter
  - BPM range slider
  - Search by track/artist name
- [ ] Track management:
  - Add new track
  - Edit track details
  - Set as featured
  - Deactivate/activate
  - Delete track
- [ ] Bulk operations:
  - Import tracks from CSV
  - Bulk edit genres/moods
  - Export library
- [ ] Track details:
  - Full audio features
  - Play count over time
  - User engagement (likes, skips)
  - Recommended pace ranges

**Data Needed:**
```typescript
interface MusicLibraryRequest {
  page: number;
  limit: number;
  search?: string;
  genre?: string[];
  mood?: string[];
  bpm_min?: number;
  bpm_max?: number;
  is_active?: boolean;
  sort_by?: 'play_count' | 'title' | 'created_at';
}
```

---

### Phase 2: Advanced Features

#### 5. **Analytics Dashboard** 📈
**Priority: MEDIUM** - Data insights

**Features:**
- [ ] Charts & visualizations:
  - Sessions over time (line chart)
  - Top 10 most popular songs (bar chart)
  - Genre distribution (pie chart)
  - User growth chart
  - Average pace trends
  - Heart rate zones distribution
- [ ] Metrics cards:
  - Total distance all users
  - Average session duration
  - User retention rate
  - Music engagement rate
- [ ] Date range selector
- [ ] Export reports (PDF/CSV)
- [ ] Custom metric builder

---

#### 6. **User Activity Log** 📝
**Priority: LOW** - Audit trail

**Features:**
- [ ] Activity timeline:
  - Login/logout events
  - Profile updates
  - Session starts/ends
  - Music plays
  - Settings changes
- [ ] Filters:
  - User
  - Event type
  - Date range
- [ ] Export logs

---

#### 7. **System Settings** ⚙️
**Priority: LOW** - Configuration

**Features:**
- [ ] General settings:
  - App name & logo
  - Support email
  - Terms & privacy URLs
- [ ] Music settings:
  - Spotify API credentials
  - Default playlist settings
  - BPM recommendation algorithm
- [ ] Notification settings:
  - Email templates
  - Push notification settings
- [ ] Feature flags:
  - Enable/disable features
  - A/B test configurations

---

## 🗄️ Database Schema

### Supabase Tables Structure

```sql
-- 1. Users table (core user data)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  
  -- Profile
  gender TEXT,
  age INTEGER,
  height NUMERIC,
  height_unit TEXT CHECK (height_unit IN ('cm', 'ft')),
  weight NUMERIC,
  weight_unit TEXT CHECK (weight_unit IN ('kg', 'lbs')),
  
  -- Running preferences
  running_experience TEXT CHECK (running_experience IN ('beginner', 'intermediate', 'advanced')),
  pace_band TEXT,
  preferred_genres TEXT[],
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Running sessions table
CREATE TABLE running_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session timing
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  
  -- Metrics
  total_distance_meters NUMERIC,
  avg_pace_per_km NUMERIC,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  calories_burned INTEGER,
  steps_count INTEGER,
  
  -- Location
  start_location JSONB, -- {lat: number, lng: number}
  end_location JSONB,
  route_polyline TEXT,
  
  -- Environment
  weather_condition TEXT,
  temperature NUMERIC,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Session GPS points (for route visualization)
CREATE TABLE session_gps_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES running_sessions(id) ON DELETE CASCADE,
  
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude NUMERIC,
  accuracy NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Session heart rate data
CREATE TABLE session_heart_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES running_sessions(id) ON DELETE CASCADE,
  
  heart_rate INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Music tracks table
CREATE TABLE music_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spotify_id TEXT UNIQUE,
  youtube_music_id TEXT,
  
  -- Track info
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration_seconds INTEGER NOT NULL,
  release_date DATE,
  
  -- Audio features
  bpm INTEGER,
  genre TEXT,
  mood TEXT,
  energy_level INTEGER CHECK (energy_level BETWEEN 0 AND 100),
  danceability INTEGER CHECK (danceability BETWEEN 0 AND 100),
  valence INTEGER CHECK (valence BETWEEN 0 AND 100),
  
  -- Assets
  album_art_url TEXT,
  preview_url TEXT,
  
  -- Engagement (computed)
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  skip_count INTEGER DEFAULT 0,
  avg_completion_rate NUMERIC DEFAULT 0,
  
  -- Recommendation
  recommended_for_paces TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Listening events table
CREATE TABLE listening_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES running_sessions(id) ON DELETE SET NULL,
  track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
  
  -- Playback
  played_at TIMESTAMPTZ NOT NULL,
  duration_ms INTEGER NOT NULL,
  play_count INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  
  -- Context
  source TEXT CHECK (source IN ('spotify', 'local', 'youtube_music')),
  playlist_name TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. User activity log (audit trail)
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL, -- 'login', 'logout', 'profile_update', 'session_start', etc.
  event_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_sessions_user_id ON running_sessions(user_id);
CREATE INDEX idx_sessions_status ON running_sessions(status);
CREATE INDEX idx_sessions_started_at ON running_sessions(started_at);

CREATE INDEX idx_listening_events_user_id ON listening_events(user_id);
CREATE INDEX idx_listening_events_track_id ON listening_events(track_id);
CREATE INDEX idx_listening_events_session_id ON listening_events(session_id);

CREATE INDEX idx_music_tracks_genre ON music_tracks(genre);
CREATE INDEX idx_music_tracks_bpm ON music_tracks(bpm);
CREATE INDEX idx_music_tracks_is_active ON music_tracks(is_active);
```

---

## 🔌 API Endpoints

### Authentication
```typescript
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
GET    /api/admin/auth/me
```

### Dashboard
```typescript
GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/recent-activity
GET    /api/admin/dashboard/system-health
```

### Users
```typescript
GET    /api/admin/users              // List with pagination & filters
GET    /api/admin/users/:id          // User details
PATCH  /api/admin/users/:id          // Update user
DELETE /api/admin/users/:id          // Delete user
POST   /api/admin/users/:id/suspend  // Suspend user
POST   /api/admin/users/:id/activate // Activate user
GET    /api/admin/users/:id/sessions // User's sessions
GET    /api/admin/users/:id/activity // User's activity log
POST   /api/admin/users/export       // Export users CSV
```

### Sessions
```typescript
GET    /api/admin/sessions           // List with filters
GET    /api/admin/sessions/active    // Active sessions
GET    /api/admin/sessions/:id       // Session details
GET    /api/admin/sessions/:id/gps   // GPS points
GET    /api/admin/sessions/:id/music // Music played
POST   /api/admin/sessions/export    // Export sessions
```

### Music
```typescript
GET    /api/admin/music/tracks       // List tracks
POST   /api/admin/music/tracks       // Add track
GET    /api/admin/music/tracks/:id   // Track details
PATCH  /api/admin/music/tracks/:id   // Update track
DELETE /api/admin/music/tracks/:id   // Delete track
POST   /api/admin/music/tracks/bulk  // Bulk import
GET    /api/admin/music/analytics    // Music analytics
```

### Analytics
```typescript
GET    /api/admin/analytics/overview
GET    /api/admin/analytics/users
GET    /api/admin/analytics/sessions
GET    /api/admin/analytics/music
POST   /api/admin/analytics/export
```

---

## 📁 Recommended Folder Structure

```
pacebeats-admin/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── admin/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── sessions/
│   │   │   │   ├── music/
│   │   │   │   ├── analytics/
│   │   │   │   └── dashboard/
│   │   │
│   │   ├── dashboard/              # Admin pages
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── users/
│   │   │   │   ├── page.tsx       # User list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # User details
│   │   │   ├── sessions/
│   │   │   │   ├── page.tsx       # Session list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Session details
│   │   │   ├── music/
│   │   │   │   ├── page.tsx       # Music library
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Track details
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx       # Analytics dashboard
│   │   │   ├── settings/
│   │   │   │   └── page.tsx       # Settings
│   │   │   └── layout.tsx         # Dashboard layout
│   │   │
│   │   └── login/
│   │       └── page.tsx            # Login page
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── stats-card.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   └── system-health.tsx
│   │   │
│   │   └── ui/                     # shadcn components
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Supabase client
│   │   │   ├── server.ts          # Server-side client
│   │   │   └── queries/           # Database queries
│   │   │       ├── users.ts
│   │   │       ├── sessions.ts
│   │   │       ├── music.ts
│   │   │       └── analytics.ts
│   │   │
│   │   ├── api/
│   │   │   └── client.ts          # API client
│   │   │
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── session.ts
│   │   │   ├── music.ts
│   │   │   └── analytics.ts
│   │   │
│   │   └── utils.ts
│   │
│   └── hooks/
│       ├── use-users.ts
│       ├── use-sessions.ts
│       ├── use-music.ts
│       └── use-analytics.ts
│
├── public/
├── .env.local
└── package.json
```

---

## 🚀 Implementation Phases

### **Phase 1: Foundation** (Week 1-2)
**Goal: Get basic admin dashboard working with real data**

**Tasks:**
1. ✅ Setup project structure
2. ✅ Create UI components (already done)
3. 🔲 Setup Supabase client
4. 🔲 Create database tables
5. 🔲 Implement authentication
6. 🔲 Connect Dashboard Home to real data
7. 🔲 Connect User Management to real data

**Deliverables:**
- Working login
- Dashboard showing real stats
- User list with CRUD operations

---

### **Phase 2: Core Features** (Week 3-4)
**Goal: Complete essential admin functionality**

**Tasks:**
1. 🔲 Implement Session Management
2. 🔲 Add session details page
3. 🔲 Implement Music Library
4. 🔲 Add track management
5. 🔲 Create API endpoints
6. 🔲 Add search & filters

**Deliverables:**
- Session monitoring
- Music library management
- Working search & filters

---

### **Phase 3: Analytics** (Week 5-6)
**Goal: Add data insights and reporting**

**Tasks:**
1. 🔲 Create analytics queries
2. 🔲 Build charts & visualizations
3. 🔲 Add export functionality
4. 🔲 Create automated reports

**Deliverables:**
- Analytics dashboard
- Export reports
- Email reports

---

### **Phase 4: Polish** (Week 7-8)
**Goal: Improve UX and add advanced features**

**Tasks:**
1. 🔲 Add activity log
2. 🔲 Implement settings
3. 🔲 Add bulk operations
4. 🔲 Optimize performance
5. 🔲 Add error handling
6. 🔲 Write documentation

**Deliverables:**
- Polished UI
- Complete feature set
- Documentation

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│   Mobile App    │
│   (Android)     │
└────────┬────────┘
         │
         │ Running sessions
         │ Music events
         │ User data
         ▼
┌─────────────────┐
│    Supabase     │
│   (Database)    │
└────────┬────────┘
         │
         │ REST API
         │ Real-time
         ▼
┌─────────────────┐
│  Admin Dashboard│
│   (Next.js)     │
└─────────────────┘
```

---

## 🎯 Priority Matrix

| Feature | Priority | Complexity | Value |
|---------|----------|------------|-------|
| Dashboard Home | HIGH | Low | High |
| User Management | HIGH | Medium | High |
| Session Management | HIGH | Medium | High |
| Music Library | MEDIUM | Medium | Medium |
| Analytics | MEDIUM | High | Medium |
| Activity Log | LOW | Medium | Low |
| Settings | LOW | Low | Low |

---

## ✅ Next Steps

1. **Review this guide** with your team
2. **Setup Supabase tables** using the schema provided
3. **Create API endpoints** starting with dashboard stats
4. **Connect UI to real data** starting with Dashboard Home
5. **Test thoroughly** with real data from mobile app
6. **Iterate based on feedback**

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TanStack Table](https://tanstack.com/table)
- [Recharts](https://recharts.org/en-US/)

---

**Built with 💓 by the PaceBeats Team**
