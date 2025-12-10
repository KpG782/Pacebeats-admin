# Quick Start Guide - Backend Integration

## 🚀 Get Started in 5 Minutes

### Step 1: Environment Setup (1 min)

Your `.env` file is already configured with Supabase credentials. Verify it contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 2: Run Database Schema (2 min)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** → **New Query**
3. Copy/paste contents of `supabase-schema.sql`
4. Click **Run** ▶️
5. Wait for success message ✅

### Step 3: Create Admin User (1 min)

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Email: `admin@pacebeats.com`
4. Password: `your-secure-password`
5. Click **Create user**

### Step 4: Test Login (1 min)

1. Start dev server: `npm run dev`
2. Open: `http://localhost:3000/login`
3. Login with admin credentials
4. Should redirect to dashboard ✅

### Step 5: Test IoT Monitor (Optional)

1. Go to **IoT Monitor** in sidebar
2. Currently shows **🎭 Mock Data** (simulated)
3. Click button to switch to **🔗 Live Data**
4. Insert test data:

```sql
-- Quick test: Insert active session
INSERT INTO running_sessions (id, user_id, start_time, status)
SELECT
  gen_random_uuid(),
  id,
  NOW(),
  'active'
FROM users
LIMIT 1;

-- Get session ID from above, then insert heart rate
INSERT INTO session_heart_rate_data (session_id, timestamp_offset_seconds, heart_rate_bpm)
VALUES ('YOUR_SESSION_ID', 0, 185);
```

Watch the IoT Monitor update in real-time! 🎉

## 📚 Full Documentation

- **Complete Setup:** `docs/SUPABASE_SETUP.md`
- **Integration Details:** `docs/BACKEND_INTEGRATION_COMPLETE.md`
- **Database Schema:** `supabase-schema.sql`

## ✅ What's Integrated

- ✅ Login page with Supabase authentication
- ✅ IoT Monitor with real-time heart rate tracking
- ✅ All database tables with TypeScript types
- ✅ Real-time subscriptions for live updates
- ✅ Automatic alert creation (HR > 180 BPM)
- ✅ Alert resolution system

## 🎯 What's Next

All other pages (Users, Sessions, Music, Analytics) have the query functions ready - just replace mock data with Supabase queries!

Example:

```typescript
// Before (mock)
const users = mockUsers;

// After (Supabase)
import { getUsers } from "@/lib/supabase/queries";
const users = await getUsers();
```

## 🆘 Need Help?

Check `docs/SUPABASE_SETUP.md` for:

- Troubleshooting common issues
- Android app integration guide
- API reference and examples
- Security best practices
