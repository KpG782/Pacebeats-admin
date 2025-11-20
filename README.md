# 🎵 Pacebeats Admin Dashboard

A modern, fully-featured admin dashboard for the Pacebeats music recommendation platform. Built with Next.js 15, TypeScript, Supabase, shadcn/ui, Framer Motion, and Tailwind CSS with full backend integration and real-time IoT monitoring.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&style=flat-square) ![React](https://img.shields.io/badge/React-19-61dafb?logo=react&style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&style=flat-square) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&style=flat-square) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&style=flat-square)

## ✨ Features

### 🔐 Authentication & Backend

- **Supabase Integration** with full PostgreSQL database backend
- **Real Authentication** with email/password via Supabase Auth
- **Sign Up & Sign In** functionality with proper user management
- **Admin Account Setup** with role-based access control
- **Row Level Security (RLS)** policies for data protection
- **Session Persistence** with automatic token refresh
- **User Profile Management** linked to authentication
- Password visibility toggle and form validation
- Dark mode toggle with localStorage persistence
- Responsive mobile-first design with smooth animations

### 🚨 IoT Real-Time Monitoring

- **Live Heart Rate Monitoring** from Galaxy Watch 7 devices
- **Dual-Mode Operation**: Toggle between Mock Data and Live Backend
- **Real-time WebSocket Subscriptions** for heart rate updates
- **Automatic Alert System** for critical heart rate thresholds:
  - CRITICAL: HR ≥ 180 bpm (red alert)
  - HIGH: HR ≥ 160 bpm (yellow warning)
  - LOW: HR < 50 bpm (blue alert)
- **Active Runners Dashboard** with live session tracking
- **GPS Location Display** with coordinates
- **Device Information** (e.g., "Galaxy Watch 7")
- **Alert Management** with resolve functionality
- **Heart Rate Charts** with real-time updates
- **Session Status Tracking** (Active, Paused, Completed)

### 📊 Dashboard Pages

#### 1. **Dashboard Home**

- Real-time statistics cards with Lucide icons
- Total users, sessions completed, popular genres, active sessions
- Recent activity feed with timestamps and icon badges
- Quick action buttons (Add User, Upload Music, View Sessions, Analytics Report)
- System status indicators (API Server, Database, Storage, CDN)
- Staggered animations on page load

#### 2. **User Management**

- **Supabase Integration**: Real-time user data from PostgreSQL
- Advanced data table with @tanstack/react-table
- Search by name or email (real-time filtering)
- Filter by active/inactive status and role (user/admin)
- Sortable columns (ID, Name, Email, Registration Date, Total Runs, Status)
- User profile management with edit capabilities
- Role-based access control (Admin/User/Moderator)
- Delete confirmation with cascade handling
- Status badges (Active: green, Inactive: gray)
- Pagination controls with row count
- Backend-connected CRUD operations

#### 3. **Sessions Management**

- **Backend Integration**: Live session data from Supabase
- **Real-time Updates**: WebSocket subscriptions for session changes
- Live status indicators with pulse animation
- Statistics cards (Active Sessions, Total Today, Avg Duration, Completion Rate)
- Advanced filtering (Status, Date Range, User)
- Export functionality for reports
- Sortable data table with all session details
- Session details (User, Duration, Distance, Pace, Heart Rate)
- Route data visualization with GeoJSON support
- Status badges (Active, Paused, Completed, Cancelled)
- Heart rate monitoring integration
- Device tracking (Galaxy Watch 7, etc.)

#### 4. **Music Library**

- **Spotify Integration Ready**: Complete music catalog management
- **Backend Storage**: All tracks stored in Supabase PostgreSQL
- **Grid View**: Beautiful music cards with album art and hover effects
- **Table View**: Sortable data table with all track details
- Multi-filter support (Genre, Mood, BPM range, Energy, Valence)
- Search functionality (track name, artist, album)
- Upload and manage music metadata
- Audio features tracking (Tempo, Energy, Danceability, Acousticness)
- Play count and popularity metrics
- Recommendation algorithm integration
- Preview URL support
- Explicit content filtering
- View toggle (Grid/Table)
- Responsive card layout

#### 5. **Analytics Dashboard**

- **Real-time Analytics**: Live data from Supabase aggregations
- **Bar Chart**: Top 10 most popular songs with play counts
- **Pie Chart**: Mood distribution across all tracks
- **Line Chart**: BPM distribution visualization
- **Area Chart**: Recommendation accuracy over time
- **User Growth Metrics**: Registration trends and active users
- **Session Analytics**: Completion rates, average duration, distance
- **Music Performance**: Skip rates, recommendation acceptance
- **Heart Rate Insights**: Average HR, zone distribution, alert frequency
- Date range selector for filtering
- Export reports functionality (CSV/PDF ready)
- Summary statistics cards
- Recharts integration with light/dark mode support
- Theme-aware chart colors using currentColor

## 🗄️ Backend Architecture

### Supabase PostgreSQL Database

**7 Core Tables:**

1. **users** - User profiles with Spotify integration
2. **running_sessions** - Running activity tracking
3. **session_heart_rate_data** - Time-series heart rate data
4. **heart_rate_alerts** - Critical HR alert notifications
5. **music** - Spotify track catalog with audio features
6. **listening_events** - Music playback history
7. **recommendation_served** - AI recommendation tracking

### Real-time Features

- **WebSocket Subscriptions**: Live data updates via Supabase Realtime
- **Automatic Triggers**: Heart rate alert generation on threshold breach
- **Row Level Security**: Policy-based data access control
- **Cascading Deletes**: Referential integrity maintained
- **Auto-timestamps**: Created/updated tracking on all tables
- **Database Views**: Optimized queries for analytics

### API Integration Points

- **Authentication**: Supabase Auth with JWT tokens
- **CRUD Operations**: Type-safe queries via generated types
- **File Storage**: Ready for profile pictures and music files
- **Edge Functions**: Serverless functions for complex operations

## 🎨 Design System

### Dark Mode Support

The dashboard features a complete dark mode implementation:

- **Toggle**: Available in header and login page
- **Persistence**: Uses localStorage to remember user preference
- **CSS Classes**: `.dark` class applied to document root
- **Colors**: Explicit Tailwind gray-\* classes for consistent theming

### Color System

**Light Mode:**

- Backgrounds: `bg-white`, `bg-gray-50`
- Text: `text-gray-900` (headings), `text-gray-700` (body), `text-gray-600` (muted)
- Borders: `border-gray-200`, `border-gray-300`
- Hover: `hover:bg-gray-100`, `hover:bg-blue-50` (sidebar)

**Dark Mode:**

- Backgrounds: `bg-gray-900`, `bg-gray-800`
- Text: `text-white` (headings), `text-gray-300` (body), `text-gray-400` (muted)
- Borders: `border-gray-800`, `border-gray-700`
- Hover: `hover:bg-gray-800`, `hover:bg-black` (dark mode toggle)

**Semantic Colors:**

- Primary: Blue (`bg-primary`, `text-primary`) for CTAs and active states
- Success: Green badges for active/operational status
- Warning: Amber for warnings
- Error: Red for destructive actions

### Usage Examples

```tsx
// Card with proper light/dark mode
<Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
  <CardHeader>
    <CardTitle className="text-gray-900 dark:text-white">Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-gray-700 dark:text-gray-300">Content</p>
  </CardContent>
</Card>

// Button with hover states
<Button className="hover:bg-gray-100 dark:hover:bg-gray-800">
  Click Me
</Button>

// Status badge
<Badge className="bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-400">
  Active
</Badge>
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/KpG782/pacebeats-admin.git
cd pacebeats-admin
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard.

4. **Set up the database**

Follow the detailed setup guide in [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md):

- Execute the SQL schema (`supabase-schema.sql`)
- Enable realtime replication for all tables
- Configure Row Level Security policies

5. **Create an admin account**

Follow [`docs/ADMIN_ACCOUNT_SETUP.md`](docs/ADMIN_ACCOUNT_SETUP.md) to:

- Create your admin user in Supabase Auth
- Link the user to the users table
- Configure admin access permissions

6. **Run the development server**

```bash
npm run dev
```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Login Credentials

After setting up your admin account in Supabase:

- Email: `admin@pacebeats.com` (or your custom email)
- Password: Your secure password

**Quick Setup:** Use the Sign Up button on the login page to create your first admin account!

## 📁 Project Structure

```
pacebeats-admin/
├── public/
│   └── logo.png                  # Pacebeats logo
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx      # Analytics with Recharts
│   │   │   │   └── loading.tsx   # Loading state
│   │   │   ├── iot-monitor/
│   │   │   │   ├── page.tsx      # Real-time IoT monitoring
│   │   │   │   └── loading.tsx   # Loading state
│   │   │   ├── music/
│   │   │   │   ├── page.tsx      # Music library (grid/table)
│   │   │   │   ├── loading.tsx   # Loading state
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Music track details
│   │   │   ├── sessions/
│   │   │   │   ├── page.tsx      # Sessions monitoring
│   │   │   │   ├── loading.tsx   # Loading state
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Session details
│   │   │   ├── users/
│   │   │   │   ├── page.tsx      # User management table
│   │   │   │   ├── loading.tsx   # Loading state
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # User profile details
│   │   │   ├── settings/
│   │   │   │   ├── account/
│   │   │   │   ├── profile/
│   │   │   │   └── security/
│   │   │   ├── layout.tsx        # Dashboard layout (sidebar + header)
│   │   │   ├── loading.tsx       # Dashboard loading state
│   │   │   └── page.tsx          # Dashboard home
│   │   ├── login/
│   │   │   └── page.tsx          # Login/Sign up page
│   │   ├── favicon.ico           # Favicon
│   │   ├── globals.css           # Global styles + Tailwind
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Root redirect
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── data-table.tsx    # Reusable data table component
│   │   │   ├── header.tsx        # Top header with breadcrumbs & dark mode
│   │   │   ├── music-card.tsx    # Music grid card component
│   │   │   ├── sidebar.tsx       # Navigation sidebar
│   │   │   └── stats-card.tsx    # Statistics card component
│   │   └── ui/                   # shadcn/ui components (22 components)
│   │       ├── loading-spinner.tsx # Loading animations
│   │       └── ... (20+ other components)
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts         # Supabase client configuration
│       │   ├── types.ts          # TypeScript interfaces
│       │   ├── database.types.ts # Auto-generated DB types
│       │   └── queries.ts        # Reusable query functions
│       ├── types/
│       │   ├── analytics.ts      # Analytics type definitions
│       │   ├── music.ts          # Music type definitions
│       │   ├── session.ts        # Session type definitions
│       │   └── user.ts           # User type definitions
│       ├── mock-data.ts          # Mock data (fallback)
│       ├── enhanced-*.ts         # Enhanced mock data files
│       └── utils.ts              # Utility functions (cn, etc.)
├── docs/
│   ├── SUPABASE_SETUP.md         # Complete database setup guide
│   ├── ADMIN_ACCOUNT_SETUP.md    # Admin user configuration
│   ├── DATABASE_SCHEMA_REFERENCE.md # Complete schema documentation
│   ├── BACKEND_INTEGRATION_COMPLETE.md # Integration guide
│   └── QUICKSTART.md             # 5-minute quick start
├── supabase-schema.sql           # Database schema SQL
├── .env                          # Environment variables (create this)
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore rules
├── eslint.config.mjs             # ESLint config
├── next-env.d.ts                 # Next.js types
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS config
├── README.md                     # This file
└── tsconfig.json                 # TypeScript configuration
```

## 🎭 Animation Features (Framer Motion)

- **Page entrance**: Smooth fade-in and slide-up animations with stagger
- **Staggered cards**: Sequential animation for statistics cards and lists
- **Hover effects**: Scale and lift on card hover (music cards, buttons)
- **Button feedback**: Scale down on press for tactile feedback
- **Layout animations**: Smooth transitions between grid/table views
- **Activity feed**: Sequential reveal with delay for each item
- **Pulse animations**: Live indicators for active sessions
- **Loading states**: Skeleton loaders for async data

## 🌓 Dark Mode Features

- **Toggle Locations**: Header (all pages) and login page
- **Persistence**: localStorage saves user preference across sessions
- **Auto-initialization**: Loads saved preference on page load
- **Icon System**:
  - Light mode: Gray moon icon, hover to darker gray
  - Dark mode: White sun icon, hover to black background with white text
- **Smooth Transitions**: CSS transitions for theme changes
- **Complete Coverage**: All components support both light and dark modes
- **Chart Support**: Recharts with theme-aware colors using currentColor

## 📊 Mock Data

The application includes comprehensive mock data for offline development and testing, but primarily uses **real-time data from Supabase**:

### Backend Data (Production)

- **Users**: Real user profiles from Supabase Auth + users table
- **Sessions**: Live running sessions with heart rate tracking
- **Music**: Spotify catalog with audio features
- **Analytics**: Real-time aggregations from listening events

### Mock Data (Fallback)

- **30 Users** with registration dates and activity levels
- **200+ Sessions** with status tracking and metrics
- **100 Music Tracks** with Spotify metadata
- **Analytics Data** for charts and visualizations

The IoT Monitor page includes a **toggle switch** to switch between Mock Data and Live Backend mode.

Edit `/src/lib/mock-data.ts` and `/src/lib/enhanced-*.ts` to customize mock data.

## 🛠️ Tech Stack

### Core

- **Framework**: Next.js 15.5.4 (App Router, React Server Components)
- **Language**: TypeScript 5 (Strict mode)
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Database**: PostgreSQL with 7 tables and RLS policies
- **Styling**: Tailwind CSS 4 with explicit dark mode classes
- **Build Tool**: Turbopack (Next.js dev mode)

### Backend & Data

- **Authentication**: Supabase Auth with JWT tokens
- **Database ORM**: Supabase JS Client (Type-safe queries)
- **Real-time**: Supabase Realtime (WebSocket subscriptions)
- **Storage**: Supabase Storage (Ready for file uploads)
- **API**: RESTful via Supabase auto-generated APIs

### UI & Components

- **Component Library**: shadcn/ui (22 components)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts (Bar, Pie, Line, Area charts)
- **Loading States**: Custom loading spinners with animations

### Data & Forms

- **Table Management**: @tanstack/react-table (sorting, filtering, pagination)
- **Date Handling**: date-fns (formatting, relative times)
- **Form Validation**: Custom validation with Supabase integration
- **State Management**: React hooks (useState, useEffect, useMemo, useCallback)

### Developer Experience

- **Type Safety**: Full TypeScript coverage with auto-generated DB types
- **Linting**: ESLint with Next.js configuration
- **Code Quality**: Prettier-compatible formatting
- **Package Manager**: npm
- **Git Workflow**: Feature branching (feat/backend, feat/IoT)

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run dev:clean    # Clean .next cache and start dev server

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript checks

# Database
# See docs/SUPABASE_SETUP.md for SQL commands
```

## 🔗 Important Documentation

- **[Supabase Setup Guide](docs/SUPABASE_SETUP.md)** - Complete database setup with SQL schema
- **[Admin Account Setup](docs/ADMIN_ACCOUNT_SETUP.md)** - Create admin users with proper permissions
- **[Database Schema Reference](docs/DATABASE_SCHEMA_REFERENCE.md)** - Complete schema documentation
- **[Backend Integration Guide](docs/BACKEND_INTEGRATION_COMPLETE.md)** - Integration overview
- **[Quick Start Guide](QUICKSTART.md)** - Get started in 5 minutes

## 🎯 Key Features Implementation

### Responsive Design

- Mobile-first approach with breakpoints (sm, md, lg, xl)
- Collapsible sidebar on mobile using Sheet component
- Responsive grids (1-col mobile, 2-col tablet, 4-col desktop)
- Responsive tables with horizontal scroll
- Touch-friendly button sizes and spacing
- Adaptive navigation (hamburger menu on mobile)

### Dark Mode Implementation

- Class-based dark mode (`.dark` on document root)
- localStorage persistence across sessions
- Toggle in header and login page
- Explicit Tailwind classes for all components
- Theme-aware charts using currentColor
- Smooth transitions between themes
- WCAG AA compliant contrast ratios

### Performance Optimizations

- Server-side rendering for static content
- Client components only where needed ('use client')
- Optimized images with Next.js Image component
- Lazy loading with Next.js 15 loading.tsx files
- Code splitting and route-based chunking
- Efficient re-renders with React.memo and useCallback
- Turbopack for fast development builds
- Real-time subscriptions with automatic cleanup
- Optimized Supabase queries with indexes
- Connection pooling for database efficiency

### Accessibility (a11y)

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Focus management in modals and dropdowns
- Screen reader friendly announcements
- Proper heading hierarchy (h1-h3)
- Color contrast meeting WCAG AA standards
- Focus visible indicators

### Type Safety

- Full TypeScript coverage (100%)
- Strict mode enabled in tsconfig.json
- Proper type definitions for all data models
- Type-safe component props with interfaces
- No 'any' types (except where explicitly needed)
- Custom type guards for data validation

## 🎨 Customization

### Updating Colors

The application uses explicit Tailwind classes. To change the color scheme:

**Primary Color (Blue):**
Edit `tailwind.config.js` or use Tailwind's built-in colors:

```tsx
// Current: bg-primary uses blue
// Change to purple:
className = "bg-purple-600 hover:bg-purple-700";
```

**Background Colors:**

```tsx
// Light mode backgrounds
bg-white         → bg-gray-50 (softer)
bg-gray-50       → bg-blue-50 (tinted)

// Dark mode backgrounds
dark:bg-gray-900 → dark:bg-slate-900 (cooler)
dark:bg-gray-800 → dark:bg-slate-800
```

**Text Colors:**

```tsx
// Adjust contrast levels
text-gray-900 dark:text-white      // Headings
text-gray-700 dark:text-gray-300   // Body
text-gray-600 dark:text-gray-400   // Muted
```

### Adding New Pages

1. Create new page file:

```bash
src/app/dashboard/your-page/page.tsx
```

2. Add navigation item in `src/components/dashboard/sidebar.tsx`:

```tsx
const navItems = [
  // ... existing items
  { name: "Your Page", href: "/dashboard/your-page", icon: YourIcon },
];
```

3. The page will automatically use the dashboard layout.

### Customizing Mock Data

Edit `src/lib/mock-data.ts`:

```typescript
// Add more users
export const mockUsers: User[] = [
  {
    id: "R031",
    name: "Your Name",
    email: "email@example.com",
    registrationDate: "2024-11-15",
    totalRuns: 50,
    status: "active",
  },
  // ... more users
];

// Add more tracks
export const mockMusicTracks: MusicTrack[] = [
  {
    id: "T101",
    title: "Your Song",
    artist: "Your Artist",
    genre: "Electronic",
    mood: "Energetic",
    bpm: 128,
    duration: 210, // seconds
    playCount: 500000,
    imageUrl: "/path/to/image.jpg",
  },
  // ... more tracks
];
```

### Modifying Components

All components are in `src/components/`:

**Stat Cards:** `dashboard/stats-card.tsx`

- Change icons, colors, or layout

**Music Cards:** `dashboard/music-card.tsx`

- Adjust card design, hover effects

**Data Table:** `dashboard/data-table.tsx`

- Modify column definitions, add features

**UI Components:** `ui/` folder

- Customize shadcn components (buttons, badges, etc.)

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Add environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Docker

```bash
# Build Docker image
docker build -t pacebeats-admin .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  pacebeats-admin
```

### Environment Variables

Ensure these are set in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Security Note**: The anon key is safe to expose as it's protected by Row Level Security policies.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:

- Passes TypeScript checks (`npm run type-check`)
- Passes ESLint (`npm run lint`)
- Follows the existing code style
- Includes proper dark mode support

## 📧 Support

For support:

- Email: admin@pacebeats.com
- GitHub Issues: [Open an issue](https://github.com/KpG782/pacebeats-admin/issues)
- Documentation: Check this README

## 🎯 Roadmap

### ✅ Completed

- [x] Full Supabase backend integration
- [x] Real-time IoT heart rate monitoring
- [x] User authentication with sign up/sign in
- [x] Admin account setup with RLS policies
- [x] WebSocket subscriptions for live data
- [x] Automatic heart rate alert system
- [x] Complete database schema with 7 tables
- [x] Type-safe queries with generated types
- [x] Loading states for all pages
- [x] Dark mode support across all pages

### 🚧 In Progress

- [ ] Enhanced music recommendation algorithm
- [ ] Advanced analytics filters and exports
- [ ] User profile editing interface
- [ ] Session route visualization with maps

### 🔮 Future Enhancements

- [ ] Email notifications for critical alerts
- [ ] Role-based access control (Admin/Moderator/User)
- [ ] Advanced search with Elasticsearch
- [ ] Mobile app companion (React Native)
- [ ] Push notifications via FCM
- [ ] CSV/PDF export for all data tables
- [ ] Bulk operations (batch delete, update)
- [ ] Audit logs for admin actions
- [ ] Two-factor authentication (2FA)
- [ ] API rate limiting and monitoring
- [ ] Custom dashboard widgets
- [ ] Internationalization (i18n)
- [ ] Webhook integrations
- [ ] Spotify API live integration
- [ ] Galaxy Watch SDK integration

---

**Built with ❤️ by the Pacebeats Team | © 2025 Pacebeats Admin**
