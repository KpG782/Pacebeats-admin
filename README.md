# 🎵 Pacebeats Admin Dashboard

A modern, fully-featured admin dashboard for the Pacebeats music recommendation platform. Built with Next.js 15, TypeScript, shadcn/ui, Framer Motion, and Tailwind CSS with explicit light/dark mode support.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&style=flat-square) ![React](https://img.shields.io/badge/React-19-61dafb?logo=react&style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&style=flat-square) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&style=flat-square)

## ✨ Features

### 🔐 Authentication

- **Login Page** with split-screen design (image left, form right)
- Form validation with real-time feedback
- Password visibility toggle
- Auto-fill credentials feature
- Dark mode toggle with localStorage persistence
- Responsive mobile-first design
- Smooth animations with Framer Motion

### 📊 Dashboard Pages

#### 1. **Dashboard Home**

- Real-time statistics cards with Lucide icons
- Total users, sessions completed, popular genres, active sessions
- Recent activity feed with timestamps and icon badges
- Quick action buttons (Add User, Upload Music, View Sessions, Analytics Report)
- System status indicators (API Server, Database, Storage, CDN)
- Staggered animations on page load

#### 2. **User Management**

- Advanced data table with @tanstack/react-table
- Search by name or email (real-time filtering)
- Filter by active/inactive status
- Sortable columns (ID, Name, Registration Date, Total Runs, Status)
- Alternating row backgrounds for better readability
- Status badges (Active: green, Inactive: gray)
- Pagination controls (Previous/Next)
- User actions dropdown: View, Edit, Delete
- Delete confirmation dialog with warnings

#### 3. **Sessions Management**

- Real-time session monitoring
- Live status indicators with pulse animation
- Statistics cards (Active Sessions, Total Today, Avg Duration, Completion Rate)
- Advanced filtering (Status, Date Range)
- Export functionality
- Sortable data table
- Session details (User, Duration, Genre, Mood, BPM)
- Status badges with dark mode support

#### 4. **Music Library**

- **Grid View**: Beautiful music cards with album art and hover effects
- **Table View**: Sortable data table with all track details
- Multi-filter support (Genre, Mood, BPM range)
- Search functionality (track name, artist)
- Upload music button
- Play count and duration tracking
- View toggle (Grid/Table)
- Responsive card layout

#### 5. **Analytics Dashboard**

- **Bar Chart**: Top 10 most popular songs with play counts
- **Pie Chart**: Mood distribution across all tracks
- **Line Chart**: BPM distribution visualization
- **Area Chart**: Recommendation accuracy over time
- Date range selector for filtering
- Export reports functionality
- Summary statistics cards
- Recharts integration with light/dark mode support
- Theme-aware chart colors using currentColor

## 🎨 Design System

### Dark Mode Support

The dashboard features a complete dark mode implementation:

- **Toggle**: Available in header and login page
- **Persistence**: Uses localStorage to remember user preference
- **CSS Classes**: `.dark` class applied to document root
- **Colors**: Explicit Tailwind gray-* classes for consistent theming

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
git clone <repository-url>
cd pacebeats-admin
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Login Credentials

Use the auto-fill button or enter:
- Email: `admin@pacebeats.com`
- Password: `admin123` (or any 6+ characters)

## 📁 Project Structure

```
pacebeats-admin/
├── public/
│   └── logo.png                  # Pacebeats logo
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx      # Analytics with Recharts
│   │   │   ├── music/
│   │   │   │   └── page.tsx      # Music library (grid/table)
│   │   │   ├── sessions/
│   │   │   │   └── page.tsx      # Sessions monitoring
│   │   │   ├── users/
│   │   │   │   └── page.tsx      # User management table
│   │   │   ├── layout.tsx        # Dashboard layout (sidebar + header)
│   │   │   └── page.tsx          # Dashboard home
│   │   ├── login/
│   │   │   └── page.tsx          # Login page with dark mode toggle
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
│   │   └── ui/                   # shadcn/ui components (20 components)
│   │       ├── alert-dialog.tsx  # Confirmation dialogs
│   │       ├── avatar.tsx        # User avatars
│   │       ├── badge.tsx         # Status badges
│   │       ├── button.tsx        # Button variants
│   │       ├── calendar.tsx      # Date picker
│   │       ├── card.tsx          # Card container
│   │       ├── checkbox.tsx      # Checkboxes
│   │       ├── dialog.tsx        # Modal dialogs
│   │       ├── dropdown-menu.tsx # Dropdown menus
│   │       ├── input.tsx         # Text inputs
│   │       ├── label.tsx         # Form labels
│   │       ├── popover.tsx       # Popovers
│   │       ├── scroll-area.tsx   # Scrollable areas
│   │       ├── select.tsx        # Select dropdowns
│   │       ├── separator.tsx     # Dividers
│   │       ├── sheet.tsx         # Side sheets (mobile menu)
│   │       ├── skeleton.tsx      # Loading skeletons
│   │       ├── table.tsx         # Table components
│   │       ├── tabs.tsx          # Tab navigation
│   │       └── tooltip.tsx       # Tooltips
│   └── lib/
│       ├── mock-data.ts          # Mock data (30 users, 200 sessions, 100 tracks)
│       └── utils.ts              # Utility functions (cn, etc.)
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

The application includes comprehensive, realistic mock data:

- **30 Users** with:
  - Registration dates (May 2024 - November 2024)
  - Activity levels (6-167 total runs)
  - Status (active/inactive)
  - Email addresses
  
- **200+ Sessions** with:
  - Real-time status (Active with pulse animation, Completed, Paused)
  - User associations
  - Duration tracking (15-60 minutes)
  - Genre and mood preferences
  - BPM ranges (80-180)
  - Timestamps

- **100 Music Tracks** with:
  - Album artwork URLs
  - Artist names
  - Track titles
  - Genres (Electronic, Hip Hop, Rock, Pop, Jazz, Classical)
  - Moods (Energetic, Calm, Focus, Upbeat, Chill, Intense)
  - BPM (80-180)
  - Duration (2-6 minutes)
  - Play counts (85k-1.2M)

- **Analytics Data** including:
  - Top 10 popular songs chart
  - Mood distribution pie chart
  - BPM distribution line chart
  - Recommendation accuracy over time

Edit `/src/lib/mock-data.ts` to customize or add more data.

## 🛠️ Tech Stack

### Core
- **Framework**: Next.js 15.5.4 (App Router, React Server Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with explicit dark mode classes
- **Build Tool**: Turbopack (Next.js dev mode)

### UI & Components
- **Component Library**: shadcn/ui (20 components)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts (Bar, Pie, Line, Area charts)

### Data & Forms
- **Table Management**: @tanstack/react-table (sorting, filtering, pagination)
- **Date Handling**: date-fns (formatting, relative times)
- **Form Validation**: Custom validation logic
- **State Management**: React hooks (useState, useEffect, useMemo)

### Developer Experience
- **Type Safety**: Full TypeScript coverage with strict mode
- **Linting**: ESLint with Next.js configuration
- **Code Quality**: Prettier-compatible formatting
- **Package Manager**: npm

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript checks
```

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
- Lazy loading and code splitting
- Efficient re-renders with React.memo where needed
- Turbopack for fast development builds

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
className="bg-purple-600 hover:bg-purple-700"
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
# Deploy to Vercel
vercel
```

### Docker

```bash
# Build Docker image
docker build -t pacebeats-admin .

# Run container
docker run -p 3000:3000 pacebeats-admin
```

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

Future enhancements planned:
- [ ] Real API integration
- [ ] User authentication with JWT
- [ ] Advanced analytics filters
- [ ] Export data to CSV/PDF
- [ ] Email notifications
- [ ] Role-based access control
- [ ] Mobile app companion
- [ ] Real-time WebSocket updates

---

**Built with ❤️ by the Pacebeats Team | © 2025 Pacebeats Admin**
