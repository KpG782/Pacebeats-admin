# PaceBeats Admin Control Center

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&style=flat-square) ![React](https://img.shields.io/badge/React-19-61dafb?logo=react&style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&style=flat-square) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&style=flat-square)

An executive command center for the PaceBeats multi-platform music ecosystem. The interface pairs a dark, performance-forward aesthetic with neon accents so label teams can orchestrate releases, talent, and revenue in real time.

## Overview
- Centralizes marketing, release, and revenue signals into a single admin surface.
- Built as the web companion to the PaceBeats mobile app, sharing the same design language and tokens.
- Ships with responsive, dashboard-first layouts that spotlight the day's most critical metrics.
- Uses the PaceBeats design system for consistency across cards, buttons, badges, and typography.

## Tech Stack & Tooling
- **Next.js 15 (App Router + Turbopack):** server components, streaming, and fast DX.
- **React 19:** hooks-first UI with concurrent rendering.
- **TypeScript 5:** strict typing for data and auth flows.
- **Tailwind CSS 4:** utility-first styling layered on top of the PaceBeats design tokens.
- **Geist font suite:** branded typography delivered through `next/font`.
- **ESLint 9 + Next config:** linting tuned for React Server Components.

## Brand System Highlights
**Color DNA**
- `#00FF7F` signature neon for calls-to-action and premium states.
- Charcoal gradients (`#121212` - `#1E1E1E`) keep focus on content while preserving dark-mode contrast.
- Secondary accents include `#1DB954` for Spotify integrations and `#4CAF50` for success signals.

**Typography & Spacing**
- Geist family with weights 400, 500, and 700 and display sizing from `12px` to `32px`.
- Uppercase micro-spacing (0.3em - 0.4em tracking) for HUD-style labels and status chips.
- Modular spacing scale (`4px` to `64px`) keeps paddings and gaps predictable.

**Components & Feedback**
- Rounded surfaces (`8px` - `24px` radius) with frosted glass overlays for depth.
- Card, button, and badge systems defined for hover transitions and status variants.
- State colors cover success, warning, error, and premium tiers out of the box.

## Experience Snapshot
- Hero dashboard introduces KPIs such as active campaigns, approvals, and weekly revenue.
- Call-to-action chips drive users toward full analytics and reporting modules.
- Real-time operational pulse indicator keeps cross-team stakeholders aligned.

## Getting Started
1. Install dependencies with `npm install` (or your preferred package manager).
2. Run the local dev server: `npm run dev` (Turbopack enabled).
3. Visit `http://localhost:3000` to explore the admin experience.
4. Edit `src/app/page.tsx` - changes hot-reload instantly.

## Available Scripts
- `npm run dev` - start the dev server with Turbopack.
- `npm run build` - production build optimized for Vercel.
- `npm run start` - serve the compiled app.
- `npm run lint` - run ESLint checks.

## Project Structure
```
pacebeats-admin/
  src/
    app/
      globals.css      # Shared Tailwind layers and design tokens
      layout.tsx       # Root layout wiring Geist fonts and metadata
      page.tsx         # Landing dashboard hero experience
```

## Roadmap
- Extend dashboard routes for releases, users, and revenue management.
- Hook up Supabase auth and data models for live metrics.
- Harden the component library into a reusable package for other PaceBeats surfaces.

## Design Resources
- Brand system reference: `brandkit.md` inside the repo.
- Figma library: [PaceBeats Components](https://figma.com/pacebeats).
- Accessibility checks: [WebAIM Contrast](https://webaim.org/resources/contrastchecker/).

- Crafted by the PaceBeats design and front-of-house team in the Philippines.
