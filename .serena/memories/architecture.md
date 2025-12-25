# Frontend Architecture

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (account)/               # Auth route group (login, register)
│   ├── api/                     # API routes (if any)
│   ├── events/                  # Event pages
│   ├── games/                   # Game pages
│   ├── groups/                  # Group pages
│   ├── profile/                 # Profile pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
│
├── components/
│   ├── ui/                      # Design System Components
│   │   ├── input/               # Input with variants
│   │   ├── select/              # Select component
│   │   ├── modal/               # Modal/Dialog
│   │   ├── avatar/              # Avatar component
│   │   ├── loader.tsx           # Loading spinner
│   │   └── index.ts             # Barrel exports
│   │
│   ├── layout/                  # Layout Components
│   │   ├── header/              # Header + navigation
│   │   ├── footer.tsx           # Footer
│   │   └── react-query-provider.tsx
│   │
│   └── features/                # Feature Components
│       ├── auth/
│       │   └── forms/           # Login, Register forms
│       ├── events/
│       │   ├── components/      # EventCard, EventList
│       │   └── forms/           # CreateEvent, EditEvent
│       ├── teams/
│       │   ├── components/      # TeamList, TeamCard
│       │   └── positions/       # Position components
│       └── users/               # User-related components
│
├── lib/
│   ├── auth/                    # Auth context, helpers
│   │   ├── auth-context.tsx     # AuthProvider, useAuth
│   │   └── auth-service.ts      # Auth API calls
│   │
│   ├── models/                  # TypeScript Types
│   │   ├── user.ts              # User types
│   │   ├── event.ts             # Event types
│   │   └── index.ts             # Type exports
│   │
│   ├── requests/                # API Functions
│   │   ├── events.ts            # Event API
│   │   ├── users.ts             # User API
│   │   └── teams.ts             # Team API
│   │
│   ├── utils/                   # Utilities
│   │   ├── date.ts              # Date formatting
│   │   ├── string.ts            # String helpers
│   │   ├── cn.ts                # classNames utility
│   │   └── index.ts             # Utility exports
│   │
│   ├── client.ts                # Axios instance
│   └── constants.ts             # App constants
│
├── hooks/                       # Custom Hooks
│   ├── useEvents.ts
│   ├── useDebounce.ts
│   └── index.ts
│
└── middleware.ts                # Route protection
```

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Page/     │────▶│  React Query │────▶│  API Client │────▶ Backend
│  Component  │◀────│    Cache     │◀────│   (Axios)   │◀────
└─────────────┘     └──────────────┘     └─────────────┘
       │                                        │
       │            ┌──────────────┐            │
       └───────────▶│   Zustand    │◀───────────┘
                    │ (Client State)│
                    └──────────────┘
```

## State Management Strategy

| State Type | Solution | Example |
|------------|----------|---------|
| Server State | React Query | Events, Users, Teams |
| Auth State | React Context | User session, tokens |
| UI State | useState/Zustand | Modals, filters |
| Form State | React Hook Form | Form inputs |
| URL State | Next.js Router | Pagination, filters |

## Authentication Flow

```
1. User submits credentials
2. Auth service validates → returns JWT + refresh token
3. Tokens stored in httpOnly cookies
4. Axios interceptor attaches token to requests
5. Middleware protects routes
6. Token refresh on 401 response
```

## Import Aliases

```typescript
// Configured in tsconfig.json
@/*  →  ./src/*

// Usage
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
```

## Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection, auth redirects |
| `lib/client.ts` | Axios instance with interceptors |
| `lib/auth/auth-context.tsx` | Auth state provider |
| `app/layout.tsx` | Root layout with providers |
| `components/ui/index.ts` | UI component exports |
