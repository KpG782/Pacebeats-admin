# 🎨 PaceBeats Brand Kit & Design System

<img src="https://img.shields.io/badge/Design%20System-Modern-purple?style=flat-square" alt="Design System" /> <img src="https://img.shields.io/badge/Color%20Palette-Dark%20Mode-green?style=flat-square" alt="Color Palette" /> <img src="https://img.shields.io/badge/UI%20Framework-Jetpack%20Compose-blue?style=flat-square" alt="UI Framework" /> <img src="https://img.shields.io/badge/Admin%20Ready-Web%20Components-orange?style=flat-square" alt="Admin Ready" />

Welcome to the **PaceBeats Brand Kit**, a comprehensive design system that defines the visual identity and component library for the PaceBeats ecosystem. This guide provides all colors, typography, spacing, and component specifications needed for consistent design across mobile and admin web platforms. 🎨✨🚀

---

## 🌈 Brand Colors & Identity

### 🎯 Primary Brand Colors

```css
/* Core Brand Identity */
--primary-green: #00FF7F        /* Signature neon green */
--primary-dark: #1A1A1A         /* Deep charcoal */
--background-dark: #121212      /* Pure dark background */
--surface-dark: #1E1E1E         /* Elevated surfaces */
--accent-green: #4CAF50         /* Secondary green */
--spotify-green: #1DB954        /* Spotify integration */
```

### 🎨 Secondary Color Palette

```css
/* Text & Communication Colors */
--text-primary: #FFFFFF         /* Primary text */
--text-secondary: #B0B0B0      /* Secondary text */
--text-muted: #707070          /* Subtle text */
--error-color: #FF5252         /* Error states */
--warning-color: #FFC107       /* Warning alerts */
--success-color: #4CAF50       /* Success feedback */
--info-color: #2196F3          /* Information */
```

### 🖼️ UI Component Colors

```css
/* Interface Elements */
--card-background: #2A2A2A     /* Card surfaces */
--border-color: #333333        /* Borders & dividers */
--divider-color: #404040       /* Section dividers */
--disabled-color: #616161      /* Disabled states */
--overlay-color: rgba(0, 0, 0, 0.7)    /* Modal overlays */
--shadow-color: rgba(0, 0, 0, 0.3)     /* Drop shadows */
```

---

## 📏 Design Tokens & Spacing System

### 🔢 Spacing Scale

```css
/* Consistent Spacing System */
--space-xs: 4px                /* Micro spacing */
--space-sm: 8px                /* Small elements */
--space-md: 16px               /* Standard spacing */
--space-lg: 24px               /* Large sections */
--space-xl: 32px               /* Extra large gaps */
--space-2xl: 48px              /* Section breaks */
--space-3xl: 64px              /* Page divisions */

/* Component-Specific Paddings */
--padding-component: 16px       /* UI components */
--padding-screen: 20px          /* Screen margins */
--padding-card: 16px            /* Card interiors */
--margin-section: 24px          /* Section spacing */
```

### ✍️ Typography System

```css
/* Font Size Hierarchy */
--font-size-xs: 12px           /* Captions, labels */
--font-size-sm: 14px           /* Body text small */
--font-size-md: 16px           /* Body text */
--font-size-lg: 18px           /* Subheadings */
--font-size-xl: 24px           /* Headings */
--font-size-2xl: 32px          /* Page titles */

/* Font Weight Scale */
--font-weight-normal: 400      /* Regular text */
--font-weight-medium: 500      /* Medium emphasis */
--font-weight-bold: 700        /* Strong emphasis */
```

### 🔄 Border Radius Standards

```css
/* Consistent Corner Rounding */
--radius-sm: 8px               /* Small components */
--radius-md: 12px              /* Standard cards */
--radius-lg: 16px              /* Large containers */
--radius-xl: 24px              /* Hero elements */
--radius-full: 50%             /* Circular elements */
```

---

## 🧩 Component Library Specifications

### 📦 Card Components

```css
/* Primary Card Style */
.admin-card {
  background: var(--card-background);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: 0 2px 8px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.admin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow-color);
}
```

### 🔘 Button System

```css
/* Primary Button */
.admin-button-primary {
  background: var(--primary-green);
  color: var(--primary-dark);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--font-size-md);
}

.admin-button-primary:hover {
  background: #00e570;
  transform: translateY(-1px);
}

/* Secondary Button */
.admin-button-secondary {
  background: transparent;
  color: var(--primary-green);
  border: 1px solid var(--primary-green);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s ease;
}

.admin-button-secondary:hover {
  background: rgba(0, 255, 127, 0.1);
}

/* Danger Button */
.admin-button-danger {
  background: var(--error-color);
  color: var(--text-primary);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
```

### 📊 Data Table Styling

```css
/* Modern Data Tables */
.admin-table {
  background: var(--surface-dark);
  border-radius: var(--radius-md);
  overflow: hidden;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.admin-table th {
  background: var(--card-background);
  color: var(--text-primary);
  padding: var(--space-md);
  text-align: left;
  font-weight: var(--font-weight-medium);
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-table td {
  padding: var(--space-md);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--divider-color);
  font-size: var(--font-size-md);
}

.admin-table tr:hover {
  background: rgba(0, 255, 127, 0.05);
}
```

### 🧭 Navigation Components

```css
/* Sidebar Navigation */
.admin-sidebar {
  width: 280px;
  background: var(--surface-dark);
  padding: var(--space-lg);
  height: 100vh;
  border-right: 1px solid var(--border-color);
  box-shadow: 2px 0 8px var(--shadow-color);
}

.admin-nav-item {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-sm);
  transition: all 0.3s ease;
  font-weight: var(--font-weight-medium);
}

.admin-nav-item.active {
  background: var(--primary-green);
  color: var(--primary-dark);
  box-shadow: 0 2px 4px rgba(0, 255, 127, 0.3);
}

.admin-nav-item:hover:not(.active) {
  background: var(--card-background);
  color: var(--text-primary);
  transform: translateX(4px);
}

.admin-nav-icon {
  margin-right: var(--space-sm);
  width: 20px;
  height: 20px;
}
```

---

## 🏗️ Admin Website Architecture

### 📱 Main Navigation Structure

#### 1. 📊 **Dashboard**

```typescript
dashboard: {
  overview: '/dashboard',              // Main metrics overview
  analytics: '/dashboard/analytics',   // Detailed analytics
  realtime: '/dashboard/realtime'      // Live monitoring
}
```

#### 2. 👥 **User Management**

```typescript
users: {
  list: '/users',                      // User directory
  profile: '/users/:id',               // Individual profiles
  verification: '/users/verification', // Account verification
  analytics: '/users/analytics',       // User behavior data
  profileSetup: '/users/profile-setup' // Setup tracking
}
```

#### 3. 🎵 **Content Management**

```typescript
content: {
  music: '/content/music',             // Music library
  playlists: '/content/playlists',     // Playlist management
  genres: '/content/genres',           // Genre categorization
  approvals: '/content/approvals',     // Content moderation
  library: '/content/library'          // Library overview
}
```

#### 4. 📈 **Analytics & Reports**

```typescript
analytics: {
  users: '/analytics/users',           // User engagement
  sessions: '/analytics/sessions',     // Running sessions
  music: '/analytics/music',           // Music streaming data
  geographic: '/analytics/geographic', // Location analytics
  running: '/analytics/running'        // Performance metrics
}
```

#### 5. 🎧 **Spotify Integration**

```typescript
spotify: {
  integration: '/spotify/integration', // API management
  playlists: '/spotify/playlists',     // Playlist sync
  sync: '/spotify/sync',               // Sync status
  health: '/spotify/health',           // Integration health
  playback: '/spotify/playback'        // Playback monitoring
}
```

#### 6. 📝 **Survey & Feedback**

```typescript
feedback: {
  surveys: '/feedback/surveys',        // Survey responses
  reviews: '/feedback/reviews',        // App reviews
  requests: '/feedback/requests',      // Feature requests
  quickSurvey: '/feedback/quick-survey' // Quick survey data
}
```

#### 7. ⚙️ **System Management**

```typescript
system: {
  settings: '/system/settings',        // App configuration
  notifications: '/system/notifications', // Push notifications
  health: '/system/health',            // System monitoring
  logs: '/system/logs',                // Error logs
  versions: '/system/versions'         // Version management
}
```

---

## 🎯 Layout & Grid System

### 📐 Page Layout Structure

```css
/* Main Layout Container */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--background-dark);
  color: var(--text-primary);
  font-family: "Inter", -apple-system, sans-serif;
}

.admin-main {
  flex: 1;
  padding: var(--space-xl);
  overflow-y: auto;
  max-width: calc(100vw - 280px);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}

.admin-content {
  display: grid;
  gap: var(--space-lg);
}
```

### 🎯 Responsive Grid System

```css
/* Grid Layouts */
.admin-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.admin-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

.admin-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
}

/* Responsive Breakpoints */
@media (max-width: 768px) {
  .admin-grid-2,
  .admin-grid-3,
  .admin-grid-4 {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    width: 240px;
  }
}
```

---

## 📝 Form Elements & Inputs

### 🔤 Input Components

```css
/* Form Styling */
.admin-form-group {
  margin-bottom: var(--space-lg);
}

.admin-label {
  display: block;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-input {
  width: 100%;
  padding: var(--space-md);
  background: var(--surface-dark);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  transition: all 0.3s ease;
}

.admin-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 2px rgba(0, 255, 127, 0.2);
  background: var(--card-background);
}

.admin-select {
  width: 100%;
  padding: var(--space-md);
  background: var(--surface-dark);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  cursor: pointer;
}
```

---

## 🏷️ Status & Badge System

### 🎯 Status Indicators

```css
/* Status Badge Base */
.status-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

/* Status Variants */
.status-active {
  background: rgba(76, 175, 80, 0.2);
  color: var(--success-color);
  border: 1px solid rgba(76, 175, 80, 0.4);
}

.status-inactive {
  background: rgba(97, 97, 97, 0.2);
  color: var(--disabled-color);
  border: 1px solid rgba(97, 97, 97, 0.4);
}

.status-error {
  background: rgba(255, 82, 82, 0.2);
  color: var(--error-color);
  border: 1px solid rgba(255, 82, 82, 0.4);
}

.status-warning {
  background: rgba(255, 193, 7, 0.2);
  color: var(--warning-color);
  border: 1px solid rgba(255, 193, 7, 0.4);
}

.status-premium {
  background: rgba(0, 255, 127, 0.2);
  color: var(--primary-green);
  border: 1px solid rgba(0, 255, 127, 0.4);
}
```

---

## 🎨 Usage Guidelines

### ✅ Do's

- Use **--primary-green** for key actions and branding
- Maintain **consistent spacing** using the token system
- Apply **hover states** for interactive elements
- Use **status badges** for clear state communication
- Follow **typography hierarchy** for content structure

### ❌ Don'ts

- Don't use bright colors on dark backgrounds without proper contrast
- Avoid mixing different spacing scales
- Don't override border-radius without design system approval
- Avoid using colors outside the defined palette
- Don't ignore responsive breakpoints

---

## 🏆 Implementation Checklist

- [ ] 🎨 **Colors:** Implement CSS custom properties
- [ ] 📏 **Spacing:** Apply consistent spacing tokens
- [ ] ✍️ **Typography:** Set up font hierarchy
- [ ] 🧩 **Components:** Build reusable component library
- [ ] 📱 **Navigation:** Implement sidebar and routing
- [ ] 📊 **Tables:** Style data presentation components
- [ ] 📝 **Forms:** Create consistent form elements
- [ ] 🏷️ **Status:** Implement badge and status system
- [ ] 📐 **Layout:** Set up responsive grid system
- [ ] ⚡ **Animations:** Add smooth transitions

---

## 🔗 Resources & Tools

- 🎨 **Figma Design System:** [PaceBeats Components](https://figma.com/pacebeats)
- 🖼️ **Icon Library:** [Heroicons](https://heroicons.com/) or [Lucide](https://lucide.dev/)
- 🌈 **Color Contrast:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- 📱 **Responsive Testing:** [Responsively App](https://responsively.app/)

---

## 👥 Design Team

- 🎨 **Timothy Forte** — Lead UI/UX Designer & Design System Architect
- 🚀 **Ken Patrick Garcia** — Product Design & User Experience
- 💻 **Brian Ashley Papa** — Component Development & Integration
- 🔧 **Lanz Corpuz** — Quality Assurance & Design Testing

---

## 📄 Design System License

```
PaceBeats Design System © 2024
Licensed under Creative Commons Attribution 4.0 International

You are free to:
- Share, copy and redistribute the design tokens
- Adapt, remix, transform, and build upon the system

Under the following terms:
- Attribution: Give appropriate credit to PaceBeats team
- No additional restrictions may be applied
```

---

> Crafted with ❤️ for consistent, beautiful, and accessible user experiences across the PaceBeats ecosystem.

**Made with 🎨 by passionate designers in the Philippines 🇵🇭**
