# Database Schema Reference

## Core Tables Used By The Admin App

### `users`

Used for:

- Authentication-linked profile rows
- Admin role checks
- User lists and user detail pages

Key fields:

- `id`
- `email`
- `username`
- `created_at`
- `role`

### `running_sessions`

Used for:

- Dashboard metrics
- Sessions list
- Session details

Key fields:

- `id`
- `user_id`
- `start_time`
- `end_time`
- `distance_meters`
- `duration_seconds`
- `status`

### `music`

Used for:

- Music library
- Genre and mood summaries
- Track metadata lookups

Key fields:

- `track_id`
- `name`
- `artist`
- `genre`
- `mood`
- `duration_ms`
- `tempo`

### `listening_events`

Used for:

- Dashboard recent activity
- Top track calculations
- Music analytics

Key fields:

- `id`
- `session_id`
- `user_id`
- `track_id`
- `ts_start`
- `completed`
- `liked`
- `skipped`

### `recommendation_served`

Used for:

- Recommendation reporting
- Future analytics and evaluation work

## Supporting Session Detail Tables

The session detail view may also rely on additional tables such as:

- `session_heart_rate_data`
- `session_music_history`
- `session_gps_points`
- `session_pace_intervals`

These support drilldowns for a session inside the admin app.
