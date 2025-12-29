# Frontend Project Overview

## Purpose

Next.js web application for Bielov Spike - a volleyball community platform for organizing events, managing teams, and tracking games.

## Tech Stack

| Category       | Technology                   | Version   |
| -------------- | ---------------------------- | --------- |
| Framework      | Next.js (App Router)         | 16.x      |
| Language       | TypeScript                   | 5.x       |
| Runtime        | React                        | 19.x      |
| Styling        | Tailwind CSS                 | 4.x       |
| UI Library     | DaisyUI + shadcn/ui          | -         |
| State (Server) | TanStack React Query         | 5.x       |
| State (Client) | Zustand                      | 5.x       |
| Forms          | React Hook Form + Yup        | 7.x / 1.x |
| HTTP Client    | Axios                        | 1.x       |
| Real-time      | SignalR (@microsoft/signalr) | 10.x      |
| Animation      | Framer Motion                | 12.x      |
| Testing        | Vitest + Playwright          | 4.x / 1.x |
| Documentation  | Storybook                    | 10.x      |
| Icons          | Lucide React                 | -         |

## Architecture Principles

1. **Feature-Based Organization** - Components grouped by domain (events, teams, auth)
2. **UI Component System** - Reusable design-system components in `ui/`
3. **Barrel Exports** - Clean imports via index.ts files
4. **Mobile-First** - Responsive design starting from mobile breakpoints
5. **Type Safety** - Strict TypeScript throughout
6. **Server Components** - Leverage Next.js App Router patterns

## Key Features

-   JWT authentication with refresh tokens
-   Event CRUD with real-time updates
-   Team position management
-   User profiles with volleyball-specific data
-   Payment integration (Stripe planned)

## Integration Points

-   **Auth Service**: JWT tokens, user authentication
-   **Events Service**: Event management API
-   **SignalR Hub**: Real-time updates for teams/positions
