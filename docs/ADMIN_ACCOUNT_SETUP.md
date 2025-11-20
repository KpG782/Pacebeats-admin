# Admin Account Setup Guide

This guide will walk you through creating an admin account in Supabase and configuring proper access to all dashboard features.

---

## 📋 Prerequisites

- Supabase project created and running
- Database schema already executed (see `SUPABASE_SETUP.md`)
- Supabase Dashboard access: https://supabase.com/dashboard/project/mxhnswymqijymrwvsybm

---

## 🔐 Step 1: Create Admin User in Supabase Auth

### Option A: Using Supabase Dashboard (Recommended)

1. **Navigate to Authentication**

   - Go to https://supabase.com/dashboard/project/mxhnswymqijymrwvsybm
   - Click **Authentication** in the left sidebar
   - Click **Users**

2. **Add New Admin User**

   - Click **Add User** button (top right)
   - Select **Create New User**
   - Fill in the details:
     ```
     Email: admin@pacebeats.com
     Password: admin123
     Auto Confirm User: ✅ (Check this box)
     ```
   - Click **Create User**

3. **Note the User ID**
   - Copy the generated User ID (UUID format)
   - Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - You'll need this for Step 2

### Option B: Using SQL (Alternative)

```sql
-- Create admin user via SQL
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), -- This will be your admin user ID
  'authenticated',
  'authenticated',
  'admin@pacebeats.com',
  crypt('admin123', gen_salt('bf')), -- Encrypted password
  NOW(),
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"role":"admin","full_name":"Admin User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

---

## 👤 Step 2: Insert Admin Profile in Users Table

Once you have the User ID from Step 1, insert the admin profile into the `users` table:

```sql
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from Step 1
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  profile_picture_url,
  location,
  phone_number,
  date_of_birth,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE', -- Use the UUID from Step 1
  'admin@pacebeats.com',
  'Admin User',
  'admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  'San Francisco, CA',
  '+1 (555) 123-4567',
  '1990-01-01',
  NOW(),
  NOW()
);
```

**Example with real UUID:**

```sql
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  profile_picture_url,
  location,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'admin@pacebeats.com',
  'Admin User',
  'admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  'San Francisco, CA',
  NOW(),
  NOW()
);
```

---

## 🔒 Step 3: Configure Row Level Security (RLS) Policies

### Check Existing Policies

```sql
-- View all policies for users table
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### Update RLS Policies for Admin Access

```sql
-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create admin-friendly policies
-- Policy 1: Allow authenticated users to view all users
CREATE POLICY "Authenticated users can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Allow authenticated users to update all users (admin privilege)
CREATE POLICY "Authenticated users can update all users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 3: Allow authenticated users to insert users
CREATE POLICY "Authenticated users can insert users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete users (admin privilege)
CREATE POLICY "Authenticated users can delete users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (true);
```

### Configure RLS for Other Tables

```sql
-- Running Sessions
CREATE POLICY "Authenticated users can view all sessions"
  ON public.running_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage all sessions"
  ON public.running_sessions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Heart Rate Data
CREATE POLICY "Authenticated users can view all heart rate data"
  ON public.session_heart_rate_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage heart rate data"
  ON public.session_heart_rate_data
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Heart Rate Alerts
CREATE POLICY "Authenticated users can view all alerts"
  ON public.heart_rate_alerts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage alerts"
  ON public.heart_rate_alerts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Music
CREATE POLICY "Authenticated users can view all music"
  ON public.music
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage music"
  ON public.music
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Listening Events
CREATE POLICY "Authenticated users can view all listening events"
  ON public.listening_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage listening events"
  ON public.listening_events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Recommendation Served
CREATE POLICY "Authenticated users can view all recommendations"
  ON public.recommendation_served
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage recommendations"
  ON public.recommendation_served
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

---

## 🧪 Step 4: Verify Admin Access

### Test 1: Query Users Table

```sql
-- This should return all users including the admin
SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC;
```

### Test 2: Test Admin Login

1. **Open your application**: http://localhost:3000/login
2. **Enter credentials**:
   - Email: `admin@pacebeats.com`
   - Password: `admin123`
3. **Click Sign In**
4. **Verify redirect** to `/dashboard`
5. **Check all dashboard pages**:
   - ✅ Users page shows all users
   - ✅ Sessions page accessible
   - ✅ Music page accessible
   - ✅ Analytics page accessible
   - ✅ IoT Monitor page accessible

---

## 📊 Step 5: Enable Realtime for Dashboard

### Enable Realtime Replication

1. **Navigate to Database**

   - Go to https://supabase.com/dashboard/project/mxhnswymqijymrwvsybm
   - Click **Database** → **Replication**

2. **Enable Realtime for Tables**

   - Toggle ON for these tables:
     - ✅ `users`
     - ✅ `running_sessions`
     - ✅ `session_heart_rate_data`
     - ✅ `heart_rate_alerts`
     - ✅ `music`
     - ✅ `listening_events`
     - ✅ `recommendation_served`

3. **Configure Publication**
   ```sql
   -- Verify realtime publication
   SELECT * FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime';
   ```

---

## 🎯 Step 6: Populate Test Data (Optional)

### Add Test Users

```sql
-- Insert test users for the dashboard
INSERT INTO public.users (id, email, full_name, role, location, created_at, updated_at) VALUES
  (gen_random_uuid(), 'john.doe@example.com', 'John Doe', 'user', 'New York, NY', NOW(), NOW()),
  (gen_random_uuid(), 'jane.smith@example.com', 'Jane Smith', 'user', 'Los Angeles, CA', NOW(), NOW()),
  (gen_random_uuid(), 'bob.wilson@example.com', 'Bob Wilson', 'user', 'Chicago, IL', NOW(), NOW()),
  (gen_random_uuid(), 'alice.johnson@example.com', 'Alice Johnson', 'user', 'Houston, TX', NOW(), NOW()),
  (gen_random_uuid(), 'charlie.brown@example.com', 'Charlie Brown', 'user', 'Phoenix, AZ', NOW(), NOW());
```

### Add Test Running Sessions

```sql
-- Get a user ID first
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get first non-admin user
  SELECT id INTO user_id FROM public.users WHERE email != 'admin@pacebeats.com' LIMIT 1;

  -- Insert test session
  INSERT INTO public.running_sessions (
    id, user_id, start_time, end_time,
    distance_meters, duration_seconds,
    avg_pace_min_per_km, status
  ) VALUES (
    gen_random_uuid(),
    user_id,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '30 minutes',
    5000,
    1800,
    6.0,
    'completed'
  );
END $$;
```

### Add Test Music

```sql
-- Insert test music tracks
INSERT INTO public.music (spotify_track_id, track_name, artist_name, album_name, duration_ms, tempo_bpm, energy, valence, danceability, release_date) VALUES
  ('track001', 'Eye of the Tiger', 'Survivor', 'Eye of the Tiger', 245000, 109, 0.89, 0.65, 0.72, '1982-05-01'),
  ('track002', 'Lose Yourself', 'Eminem', '8 Mile Soundtrack', 326000, 171, 0.88, 0.41, 0.76, '2002-10-28'),
  ('track003', 'Stronger', 'Kanye West', 'Graduation', 311000, 104, 0.82, 0.62, 0.68, '2007-09-11'),
  ('track004', "Can't Hold Us", 'Macklemore & Ryan Lewis', 'The Heist', 259000, 146, 0.91, 0.75, 0.81, '2011-10-09'),
  ('track005', 'Till I Collapse', 'Eminem', 'The Eminem Show', 297000, 171, 0.93, 0.33, 0.74, '2002-05-26');
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Admin user created in Supabase Auth
- [ ] Admin profile exists in `users` table with `role = 'admin'`
- [ ] Can login at http://localhost:3000/login
- [ ] Redirects to `/dashboard` after successful login
- [ ] Users page shows all users (not just own profile)
- [ ] Can access all dashboard pages without errors
- [ ] Realtime enabled for all necessary tables
- [ ] RLS policies allow admin to view/edit all data
- [ ] IoT Monitor shows live data when toggled
- [ ] No console errors in browser dev tools

---

## 🔧 Troubleshooting

### Issue: "Invalid login credentials"

**Solution:**

- Verify user exists in Supabase Auth → Users
- Check "Auto Confirm User" was enabled
- Try resetting password in Supabase Dashboard

### Issue: "No users showing in dashboard"

**Solution:**

- Check RLS policies are configured correctly
- Verify admin user has `role = 'admin'` in users table
- Run: `SELECT * FROM public.users;` in SQL Editor

### Issue: "Cannot access IoT Monitor"

**Solution:**

- Enable realtime replication for all tables
- Check browser console for WebSocket errors
- Verify environment variables in `.env` file

### Issue: "Session expires immediately"

**Solution:**

- Check `persistSession: true` in `src/lib/supabase/client.ts`
- Clear browser localStorage and cookies
- Try incognito/private browsing mode

---

## 📚 Related Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Backend Integration Guide](./BACKEND_INTEGRATION_COMPLETE.md)
- [Quick Start Guide](../QUICKSTART.md)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)

---

## 🎉 Success!

Your admin account is now fully configured with access to all dashboard features and real-time data monitoring!

**Next Steps:**

1. Test all dashboard pages
2. Create additional admin users if needed
3. Start monitoring real-time IoT data
4. Customize user roles and permissions as needed

---

**Last Updated:** November 20, 2025  
**Version:** 1.0.0
