pacebeats-admin/
├── src/
│   ├── app/                          # App Router (Next.js 13+)
│   │   ├── (auth)/                   # Route groups
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # /login route
│   │   │   └── layout.tsx            # Auth layout
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # /dashboard route
│   │   │   ├── users/
│   │   │   │   ├── page.tsx          # /users route
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # /users/[id] dynamic route
│   │   │   └── layout.tsx            # Dashboard layout
│   │   ├── api/                      # API Routes (Backend)
│   │   │   ├── auth/
│   │   │   │   └── route.ts          # POST /api/auth
│   │   │   ├── users/
│   │   │   │   └── route.ts          # GET/POST /api/users
│   │   │   └── users/[id]/
│   │   │       └── route.ts          # GET/PUT/DELETE /api/users/[id]
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page (/)
│   │   ├── loading.tsx               # Global loading UI
│   │   ├── error.tsx                 # Global error UI
│   │   └── not-found.tsx             # 404 page
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── index.ts
│   │   ├── layout/                   # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── navigation.tsx
│   │   └── dashboard/                # Feature-specific components
│   │       ├── user-table.tsx
│   │       └── analytics-card.tsx
│   ├── lib/                          # Utilities & configurations
│   │   ├── supabase.ts               # Supabase client
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── utils.ts                  # General utilities
│   │   └── validations.ts            # Zod schemas
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-users.ts
│   │   └── use-supabase.ts
│   ├── types/                        # TypeScript definitions
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── database.ts               # Supabase types
│   │   └── index.ts
│   └── middleware.ts                 # Next.js middleware
├── public/                           # Static assets
│   ├── images/
│   └── icons/
├── .env.local                        # Environment variables
├── .env.example                      # Environment template
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json
└── README.md