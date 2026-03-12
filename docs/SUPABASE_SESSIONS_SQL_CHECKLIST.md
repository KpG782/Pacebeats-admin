# Supabase Sessions SQL Checklist

Run these in the Supabase SQL editor one by one and paste the results back.

This checklist is focused on what the current admin dashboard expects for:

- Sessions list page
- Session detail page
- Dashboard session metrics

## What The Admin Currently Expects

The sessions pages currently query these tables:

- `users`
- `running_sessions`
- `session_music_history`
- `session_heart_rate_data`
- `session_gps_points`
- `session_pace_intervals`

The most important relationship is:

- `running_sessions.user_id -> users.id`

Without that relationship, this query pattern will break:

```sql
select
  *,
  users ( email, username )
from running_sessions
```

## 1. Confirm The Core Tables Exist

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'users',
    'running_sessions',
    'session_music_history',
    'session_heart_rate_data',
    'session_gps_points',
    'session_pace_intervals'
  )
order by table_name;
```

## 2. Check `users` Columns

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'users'
order by ordinal_position;
```

The admin expects at least:

- `id`
- `email`
- `username`

## 3. Check `running_sessions` Columns

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'running_sessions'
order by ordinal_position;
```

The admin sessions pages currently expect these columns to exist:

- `id`
- `user_id`
- `start_time`
- `end_time`
- `duration_seconds`
- `distance_meters`
- `status`
- `created_at`
- `run_type`
- `selected_emotion`
- `selected_playlist`
- `total_steps`
- `avg_pace_min_per_km`
- `avg_cadence_spm`
- `avg_heart_rate`
- `avg_heart_rate_bpm`
- `max_heart_rate_bpm`
- `min_heart_rate_bpm`
- `avg_speed_kmh`

## 4. Check `session_music_history` Columns

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'session_music_history'
order by ordinal_position;
```

The admin expects at least:

- `id`
- `session_id`
- `track_title`
- `track_artist`
- `track_bpm`
- `play_order`
- `played_duration_seconds`
- `was_skipped`
- `was_liked`

## 5. Check `session_heart_rate_data` Columns

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'session_heart_rate_data'
order by ordinal_position;
```

The admin expects at least:

- `id`
- `session_id`
- `timestamp_offset_seconds`
- `heart_rate_bpm`
- `is_connected`
- `recorded_at`

## 6. Check `session_gps_points` Columns

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'session_gps_points'
order by ordinal_position;
```

The admin expects at least:

- `id`
- `session_id`
- `timestamp_offset_seconds`
- `latitude`
- `longitude`
- `altitude_m`
- `accuracy_m`
- `speed_mps`
- `distance_from_prev_m`
- `recorded_at`

## 7. Check `session_pace_intervals` Columns

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'session_pace_intervals'
order by ordinal_position;
```

The admin expects at least:

- `id`
- `session_id`
- `interval_number`
- `start_offset_seconds`
- `end_offset_seconds`
- `steps`
- `distance_km`
- `pace_min_per_km`
- `cadence_spm`
- `avg_heart_rate_bpm`
- `pace_source`
- `created_at`

## 8. Verify Foreign Keys From `running_sessions`

```sql
select
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
  and ccu.table_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and tc.table_name = 'running_sessions';
```

You want to see:

- `user_id -> users.id`

## 9. Verify Foreign Keys For The Detail Tables

```sql
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
  and ccu.table_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and tc.table_name in (
    'session_music_history',
    'session_heart_rate_data',
    'session_gps_points',
    'session_pace_intervals'
  )
order by tc.table_name, kcu.column_name;
```

You want to see each of those tables linked by:

- `session_id -> running_sessions.id`

## 10. Check That `running_sessions` Actually Has Data

```sql
select count(*) as running_sessions_count
from public.running_sessions;
```

## 11. Check A Sample Of `running_sessions`

```sql
select
  id,
  user_id,
  start_time,
  end_time,
  duration_seconds,
  distance_meters,
  status,
  run_type,
  selected_emotion,
  selected_playlist,
  total_steps,
  avg_pace_min_per_km,
  avg_cadence_spm,
  avg_heart_rate,
  avg_heart_rate_bpm,
  max_heart_rate_bpm,
  min_heart_rate_bpm,
  avg_speed_kmh,
  created_at
from public.running_sessions
order by start_time desc
limit 10;
```

## 12. Check That `users` Matches Those Sessions

```sql
select
  u.id,
  u.email,
  u.username
from public.users u
where u.id in (
  select distinct user_id
  from public.running_sessions
  limit 20
)
order by u.email;
```

## 13. Test The Exact Join The Admin Needs

This is the most important check.

```sql
select
  rs.id,
  rs.user_id,
  rs.start_time,
  rs.status,
  u.email,
  u.username
from public.running_sessions rs
left join public.users u
  on u.id = rs.user_id
order by rs.start_time desc
limit 20;
```

If `email` and `username` are null for rows that should have users, the relationship/data is wrong.

## 14. Find Sessions That Point To Missing Users

```sql
select
  rs.id as session_id,
  rs.user_id
from public.running_sessions rs
left join public.users u
  on u.id = rs.user_id
where u.id is null
order by rs.start_time desc
limit 50;
```

If this returns rows, those sessions are orphaned.

## 15. Check `session_music_history` Has Data

```sql
select count(*) as session_music_history_count
from public.session_music_history;
```

## 16. Check `session_heart_rate_data` Has Data

```sql
select count(*) as session_heart_rate_data_count
from public.session_heart_rate_data;
```

## 17. Check `session_gps_points` Has Data

```sql
select count(*) as session_gps_points_count
from public.session_gps_points;
```

## 18. Check `session_pace_intervals` Has Data

```sql
select count(*) as session_pace_intervals_count
from public.session_pace_intervals;
```

## 19. Check RLS Status On The Sessions Tables

```sql
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'users',
    'running_sessions',
    'session_music_history',
    'session_heart_rate_data',
    'session_gps_points',
    'session_pace_intervals'
  )
order by tablename;
```

## 20. Check Policies On The Sessions Tables

```sql
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'users',
    'running_sessions',
    'session_music_history',
    'session_heart_rate_data',
    'session_gps_points',
    'session_pace_intervals'
  )
order by tablename, policyname;
```

## 21. Quick Direct Error Check For The Sessions Query

This tests the exact base fetch the page depends on.

```sql
select
  rs.*
from public.running_sessions rs
order by rs.start_time desc
limit 20;
```

## 22. Quick Direct Error Check For Session Detail Children

Pick one real session ID from command 11 and replace `YOUR_SESSION_ID_HERE`.

```sql
select * from public.session_music_history
where session_id = 'YOUR_SESSION_ID_HERE'
order by play_order asc;
```

```sql
select * from public.session_heart_rate_data
where session_id = 'YOUR_SESSION_ID_HERE'
order by timestamp_offset_seconds asc;
```

```sql
select * from public.session_gps_points
where session_id = 'YOUR_SESSION_ID_HERE'
order by timestamp_offset_seconds asc;
```

```sql
select * from public.session_pace_intervals
where session_id = 'YOUR_SESSION_ID_HERE'
order by interval_number asc;
```

## What To Send Back

Paste back the results for these first if you want me to diagnose it quickly:

1. Command 1
2. Command 3
3. Command 8
4. Command 11
5. Command 13
6. Command 14
7. Command 19
8. Command 20

If any command errors in Supabase, send me the exact error text.
