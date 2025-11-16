# 🎵 Pacebeats Admin Dashboard

A modern, fully-featured admin dashboard for the Pacebeats music recommendation platform. Built with Next.js 15, TypeScript, shadcn/ui, Framer Motion, and Tailwind CSS v4 using OKLCH colors.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&style=flat-square) ![React](https://img.shields.io/badge/React-19-61dafb?logo=react&style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&style=flat-square) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&style=flat-square)

## ✨ Features

### 🔐 Authentication
- **Login Page** with form validation, animations, and modern design
- Email and password authentication
- Remember me functionality
- Responsive mobile-first design

### 📊 Dashboard Pages

#### 1. **Dashboard Home**
- Real-time statistics cards with animations
- Total users, sessions completed, popular genres, active sessions
- Recent activity feed with timestamps
- Quick action buttons
- System status indicators

#### 2. **User Management**
- Advanced data table with sorting and filtering
- Search by name or email
- Filter by active/inactive status
- Pagination controls
- User actions: View, Edit, Delete
- Delete confirmation dialogs

#### 3. **Sessions Management**
- Real-time session monitoring
- Live status indicators (Active with pulse animation)
- Date range filtering
- Export functionality
- Session statistics cards
- Sortable columns

#### 4. **Music Library**
- **Grid View**: Beautiful music cards with hover effects
- **Table View**: Sortable data table
- Multi-filter support (Genre, Mood, BPM)
- Search functionality
- Upload music button
- Play count tracking

#### 5. **Analytics Dashboard**
- **Bar Chart**: Top 10 most popular songs
- **Pie Chart**: Mood distribution
- **Line Chart**: BPM distribution
- **Area Chart**: Recommendation accuracy over time
- Date range selector
- Export reports
- Summary statistics cards

## 🎨 Design System

### OKLCH Color Palette

The dashboard uses a modern OKLCH color system defined in `globals.css`:

**Primary Blues (Actions & CTAs)**
```css
var(--primary-60)  /* Main buttons, links */
var(--primary-70)  /* Hover states */
var(--primary-80)  /* Active states */
```

**Grays (Backgrounds & Text)**
```css
var(--gray-10)     /* Card backgrounds */
var(--gray-20)     /* Borders, dividers */
var(--gray-50)     /* Secondary text */
var(--gray-60)     /* Body text */
var(--gray-90)     /* Headings */
```

**Usage Example**
```tsx
<div className="bg-[var(--gray-10)] border-[var(--gray-20)]">
  <h1 className="text-[var(--gray-90)]">Title</h1>
  <Button className="bg-[var(--primary-60)] hover:bg-[var(--primary-70)]">
    Click Me
  </Button>
</div>
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
- Email: `admin@pacebeats.com`
- Password: Any password (6+ characters)

## 📁 Project Structure

```
pacebeats-admin/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        # Dashboard layout (sidebar + header)
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── users/
│   │   │   │   └── page.tsx      # User management
│   │   │   ├── sessions/
│   │   │   │   └── page.tsx      # Sessions monitoring
│   │   │   ├── music/
│   │   │   │   └── page.tsx      # Music library
│   │   │   └── analytics/
│   │   │       └── page.tsx      # Analytics dashboard
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Root page (redirects to login)
│   │   └── globals.css           # Global styles with OKLCH colors
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx       # Navigation sidebar
│   │   │   ├── header.tsx        # Top header with breadcrumbs
│   │   │   ├── stats-card.tsx    # Statistics card component
│   │   │   └── music-card.tsx    # Music grid card
│   │   └── ui/                   # shadcn/ui components
│   └── lib/
│       ├── mock-data.ts          # Mock data for all features
│       └── utils.ts              # Utility functions
├── public/
│   └── logo.png                  # Pacebeats logo
└── package.json
```

## 🎭 Animation Features (Framer Motion)

- **Page entrance**: Smooth fade-in and slide-up animations
- **Staggered cards**: Sequential animation for lists
- **Hover effects**: Scale and lift on card hover
- **Button feedback**: Scale down on press
- **Layout animations**: Smooth transitions between grid/table views

## 📊 Mock Data

The application includes comprehensive mock data:
- **30+ Users** with registration dates, activity levels, and status
- **200+ Sessions** with real-time status indicators
- **100+ Music Tracks** across multiple genres and moods
- **Analytics Data** for charts and visualizations

Edit `/src/lib/mock-data.ts` to customize the data.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with OKLCH colors
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Tables**: @tanstack/react-table
- **Icons**: Lucide React
- **Date Handling**: date-fns

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
- Mobile-first approach
- Collapsible sidebar on mobile (Sheet component)
- Responsive grids and tables
- Touch-friendly interactions

### Performance
- Server-side rendering where appropriate
- Client components only when needed
- Optimized images with Next.js Image
- Lazy loading and code splitting

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

### Type Safety
- Full TypeScript coverage
- Proper type definitions for all data
- Type-safe component props
- Strict mode enabled

## 🎨 Customization

### Colors
Modify OKLCH colors in `src/app/globals.css`:
```css
:root {
  --primary-60: 0.55 0.19 252;
  --gray-10: 0.98 0 0;
  /* ... */
}
```

### Mock Data
Edit `src/lib/mock-data.ts` to add or modify:
- Users
- Sessions
- Music tracks
- Analytics data

### Components
All components are in `src/components/`:
- Dashboard components in `/dashboard`
- UI primitives in `/ui` (shadcn)

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

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@pacebeats.com or open an issue in the repository.

---

Built with ❤️ by the Pacebeats Team
