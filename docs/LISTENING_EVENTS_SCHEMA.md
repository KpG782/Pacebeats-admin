# Listening Events Database Schema

## Table: `listening_events`

This table stores all music playback events during running sessions.

### Columns

| Column       | Type        | Description                                    |
| ------------ | ----------- | ---------------------------------------------- |
| `id`         | UUID        | Primary key                                    |
| `session_id` | UUID        | Groups all songs played in one running session |
| `user_id`    | UUID        | Foreign key to users table                     |
| `track_id`   | TEXT        | Spotify track ID                               |
| `played_ms`  | BIGINT      | How long the song was played (milliseconds)    |
| `completed`  | BOOLEAN     | Whether the song was completed (>30s)          |
| `skipped`    | BOOLEAN     | Whether the song was skipped                   |
| `liked`      | BOOLEAN     | Whether the user liked the song                |
| `disliked`   | BOOLEAN     | Whether the user disliked the song             |
| `started_at` | TIMESTAMPTZ | When the song started playing                  |
| `ended_at`   | TIMESTAMPTZ | When the song stopped playing                  |

### Important Notes

⚠️ **Column Names:**

- Use `started_at` and `ended_at` (NOT `created_at`)
- These represent the actual playback times

### Session Grouping Logic

All songs played during one running session share the same `session_id`:

```typescript
// Example: One running session with 3 songs
listening_events:
- { session_id: "abc-123", track_id: "song1", started_at: "10:00:00" }
- { session_id: "abc-123", track_id: "song2", started_at: "10:03:45" }
- { session_id: "abc-123", track_id: "song3", started_at: "10:07:20" }

// Admin dashboard groups by session_id:
Session abc-123:
  - Started: 10:00:00
  - Ended: 10:10:45 (last song ended)
  - Total Songs: 3
  - Duration: ~11 minutes
```

### Query Example

```typescript
// Fetch all events for a session
const { data } = await supabase
  .from("listening_events")
  .select("*")
  .eq("session_id", sessionId)
  .order("started_at", { ascending: true });

// Calculate session duration
const firstSong = data[0];
const lastSong = data[data.length - 1];
const duration = new Date(lastSong.ended_at) - new Date(firstSong.started_at);
```

### Related Tables

- `users` - User information (email, username)
- `running_sessions` - Full running session data (distance, pace, HR)
- `session_heart_rate_data` - Heart rate readings during session
- `session_gps_points` - GPS coordinates during session

### Data Flow

```
Mobile App (Run Start)
    ↓
Generate session_id = UUID.randomUUID()
    ↓
User runs + listens to music
    ↓
Each song played → INSERT into listening_events
    - session_id: [same UUID for all songs in this run]
    - started_at: when song started
    - ended_at: when song ended
    - completed/skipped/liked: user interactions
    ↓
Admin Dashboard
    - Groups by session_id
    - Shows all songs in that running session
    - Calculates total duration, likes, skips, etc.
```
