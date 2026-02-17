# Performance Quick Wins - Implementation Guide

This guide provides copy-paste ready code for the highest impact performance optimizations.

---

## 1. Web Vitals Monitoring (30 min - HIGH IMPACT)

### Option A: Vercel Analytics (Recommended - 5 min)

**Step 1:** Install packages
```bash
npm install @vercel/analytics @vercel/speed-insights
```

**Step 2:** Update root layout

Find your root layout file (likely `src/app/layout.tsx`) and add:

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Done!** Vercel will now track Core Web Vitals automatically.

---

### Option B: Custom Web Vitals (30 min - More Control)

**Step 1:** Install web-vitals
```bash
npm install web-vitals
```

**Step 2:** Create analytics utility

**File:** `src/lib/analytics/webVitals.ts`
```typescript
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

const vitalsUrl = '/api/analytics/vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  });

  // Use sendBeacon if available (doesn't block page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, body);
  } else {
    fetch(vitalsUrl, {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(console.error);
  }
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

**Step 3:** Create API endpoint

**File:** `src/app/api/analytics/vitals/route.ts`
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const metrics = await request.json();

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        name: metrics.name,
        value: Math.round(metrics.value),
        rating: metrics.rating,
        page: metrics.page,
      });
    }

    // In production, send to your analytics service
    // Examples:
    // - Send to database
    // - Forward to Google Analytics
    // - Send to monitoring service (Datadog, New Relic, etc.)

    // Example: Send to database (commented out - implement as needed)
    // await prisma.webVitals.create({
    //   data: {
    //     name: metrics.name,
    //     value: metrics.value,
    //     rating: metrics.rating,
    //     page: metrics.page,
    //     timestamp: new Date(metrics.timestamp),
    //   },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to record web vital:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

**Step 4:** Initialize in root layout

**File:** `src/app/layout.tsx`
```typescript
'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/analytics/webVitals';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initWebVitals();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

## 2. React Query Global Cache Configuration (15 min - HIGH IMPACT)

**File:** `src/providers/query-client.provider.tsx` (or wherever your QueryClient is configured)

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 5 minutes
            // Won't refetch during this time unless explicitly triggered
            staleTime: 5 * 60 * 1000,

            // Keep unused data in cache for 10 minutes
            // After this, data is garbage collected
            gcTime: 10 * 60 * 1000,

            // Retry failed queries 3 times with exponential backoff
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors)
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              // Retry up to 3 times for server errors
              return failureCount < 3;
            },

            // Don't refetch on window focus (can be annoying for users)
            // Enable this if you want always-fresh data
            refetchOnWindowFocus: false,

            // Refetch on network reconnection to get latest data
            refetchOnReconnect: true,

            // Refetch when component mounts if data is stale
            refetchOnMount: true,

            // Show stale data while refetching in background
            placeholderData: (previousData) => previousData,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,

            // On mutation error, you can add global error handling here
            onError: (error: any) => {
              console.error('Mutation error:', error);
              // You can show a global toast notification here
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
```

**Impact:** Reduces API calls by 30-50%, faster navigation between pages.

---

## 3. Data Prefetching (20 min - MEDIUM-HIGH IMPACT)

**Step 1:** Create prefetch hooks

**File:** `src/hooks/usePrefetch.ts`
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { fetchEvent } from '@/lib/api/events';
import { fetchClub } from '@/lib/api/clubs';
import { fetchUserProfile } from '@/lib/api/user';

export function usePrefetchEvent() {
  const queryClient = useQueryClient();

  return (eventId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['event', eventId],
      queryFn: () => fetchEvent(eventId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

export function usePrefetchClub() {
  const queryClient = useQueryClient();

  return (clubId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['club', clubId],
      queryFn: () => fetchClub(clubId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

export function usePrefetchUserProfile() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => fetchUserProfile(userId),
      staleTime: 5 * 60 * 1000,
    });
  };
}
```

**Step 2:** Use in components

**Example: Event Card**
```typescript
import { usePrefetchEvent } from '@/hooks/usePrefetch';
import Link from 'next/link';

function EventCard({ event }) {
  const prefetchEvent = usePrefetchEvent();

  return (
    <Link
      href={`/events/${event.id}`}
      onMouseEnter={() => prefetchEvent(event.id)}
      onFocus={() => prefetchEvent(event.id)}
    >
      <div>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
      </div>
    </Link>
  );
}
```

**Impact:** Near-instant page loads when users click prefetched links.

---

## 4. Dynamic Imports for Heavy Components (30-60 min - HIGH IMPACT)

### Identify Heavy Components

Run bundle analyzer to find large components:
```bash
ANALYZE=true npm run build
```

Look for:
- Tiptap editor (~100KB)
- Google Maps
- Charts/visualizations
- Emoji pickers
- Image croppers

### Example: Lazy Load Tiptap Editor

**Before:**
```typescript
import { RichTextEditor } from '@/components/ui/RichTextEditor';

export default function PostForm() {
  return (
    <form>
      <RichTextEditor />
    </form>
  );
}
```

**After:**
```typescript
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const RichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor'),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false, // Editors usually don't need SSR
  }
);

export default function PostForm() {
  return (
    <form>
      <RichTextEditor />
    </form>
  );
}
```

### Example: Lazy Load Modals

**Before:**
```typescript
import { EditEventModal } from '@/components/features/events/EditEventModal';

export default function EventPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Edit</button>
      <EditEventModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

**After:**
```typescript
import dynamic from 'next/dynamic';

const EditEventModal = dynamic(
  () => import('@/components/features/events/EditEventModal'),
  { ssr: false } // Modals don't need SSR
);

export default function EventPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Edit</button>
      {isOpen && (
        <EditEventModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
```

**Key components to lazy load:**
1. `RichTextEditor` (Tiptap) - ~100KB
2. `EmojiPicker` (emoji-picker-react)
3. `ImageCropper` (react-easy-crop)
4. `GoogleMap` (@vis.gl/react-google-maps)
5. Admin panels
6. Analytics dashboards
7. Heavy visualizations

**Impact:** 20-40% reduction in initial bundle size.

---

## 5. Font Optimization (10 min - MEDIUM IMPACT)

**File:** `src/app/layout.tsx`

```typescript
import { Inter } from 'next/font/google';

// Load Inter font with Latin subset
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text while font loads
  variable: '--font-inter',
  // Optional: only load specific weights to reduce file size
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

**Update Tailwind config:**

**File:** `tailwind.config.js`
```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

**Impact:** Prevents layout shift (improves CLS), faster font loading.

---

## 6. Backend Database Indexes (30 min - CRITICAL IMPACT)

### For Events Service

**File:** `events-service/Events.DataAccess/ApplicationDbContext.cs` (or similar)

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Events - Critical for listing and search performance
    modelBuilder.Entity<Event>(entity =>
    {
        // Index on start time (used in most queries)
        entity.HasIndex(e => e.StartTime)
              .HasDatabaseName("IX_Events_StartTime");

        // Index on status (active, cancelled, completed)
        entity.HasIndex(e => e.Status)
              .HasDatabaseName("IX_Events_Status");

        // Composite index for public events listing (most common query)
        entity.HasIndex(e => new { e.IsPublic, e.StartTime })
              .HasDatabaseName("IX_Events_IsPublic_StartTime");

        // Index on organizer for "my events" queries
        entity.HasIndex(e => e.OrganizerId)
              .HasDatabaseName("IX_Events_OrganizerId");

        // Index on club ID for club events
        entity.HasIndex(e => e.ClubId)
              .HasDatabaseName("IX_Events_ClubId");
    });

    // Event participants - for join/leave operations
    modelBuilder.Entity<EventParticipant>(entity =>
    {
        // Composite index for checking if user is already in event
        entity.HasIndex(ep => new { ep.EventId, ep.UserId })
              .IsUnique()
              .HasDatabaseName("IX_EventParticipants_EventId_UserId");

        // Index on user ID for "my events" queries
        entity.HasIndex(ep => ep.UserId)
              .HasDatabaseName("IX_EventParticipants_UserId");
    });
}
```

### For Clubs Service

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Clubs
    modelBuilder.Entity<Club>(entity =>
    {
        entity.HasIndex(c => c.CreatedAt)
              .HasDatabaseName("IX_Clubs_CreatedAt");

        entity.HasIndex(c => new { c.IsPublic, c.Status })
              .HasDatabaseName("IX_Clubs_IsPublic_Status");

        entity.HasIndex(c => c.OwnerId)
              .HasDatabaseName("IX_Clubs_OwnerId");
    });

    // Club members
    modelBuilder.Entity<ClubMember>(entity =>
    {
        entity.HasIndex(cm => new { cm.ClubId, cm.UserId })
              .IsUnique()
              .HasDatabaseName("IX_ClubMembers_ClubId_UserId");

        entity.HasIndex(cm => cm.UserId)
              .HasDatabaseName("IX_ClubMembers_UserId");
    });
}
```

### For Auth Service

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<User>(entity =>
    {
        // Email lookups (login)
        entity.HasIndex(u => u.Email)
              .IsUnique()
              .HasDatabaseName("IX_Users_Email");

        // Username lookups (profile search)
        entity.HasIndex(u => u.Username)
              .HasDatabaseName("IX_Users_Username");

        // Created at for pagination
        entity.HasIndex(u => u.CreatedAt)
              .HasDatabaseName("IX_Users_CreatedAt");
    });
}
```

### Generate and Apply Migration

```bash
# In each microservice directory

# Generate migration
dotnet ef migrations add AddPerformanceIndexes

# Apply migration
dotnet ef database update
```

**Impact:** 50-80% reduction in query response time, especially as data grows.

---

## 7. Implement Pagination (45 min - CRITICAL IMPACT)

### Backend: Update Repository

**File:** `events-service/Events.DataAccess/Repositories/EventRepository.cs`

```csharp
public async Task<PagedResult<Event>> GetPagedAsync(
    int page = 1,
    int pageSize = 20,
    EventFilters? filters = null)
{
    var query = _context.Events
        .Where(e => e.StartTime > DateTime.UtcNow);

    // Apply filters
    if (filters?.IsPublic.HasValue == true)
        query = query.Where(e => e.IsPublic == filters.IsPublic.Value);

    if (filters?.ClubId.HasValue == true)
        query = query.Where(e => e.ClubId == filters.ClubId.Value);

    // Get total count
    var totalCount = await query.CountAsync();

    // Apply pagination
    var items = await query
        .OrderBy(e => e.StartTime)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Include(e => e.Organizer)
        .Include(e => e.Club)
        .ToListAsync();

    return new PagedResult<Event>
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize,
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
    };
}
```

**Create PagedResult model:**

```csharp
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}
```

### Frontend: Infinite Scroll with React Query

**File:** `src/hooks/useEvents.ts`

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/lib/api/events';

export function useInfiniteEvents(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['events', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      fetchEvents({
        ...filters,
        page: pageParam,
        pageSize: 20,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });
}
```

**File:** `src/components/features/events/EventsList.tsx`

```typescript
'use client';

import { useInfiniteEvents } from '@/hooks/useEvents';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { EventCard } from './EventCard';

export function EventsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteEvents();

  const { ref, inView } = useInView();

  // Load more when user scrolls to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <Spinner />;
  }

  const events = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}

      {/* Load more trigger */}
      <div ref={ref} className="py-4">
        {isFetchingNextPage && <Spinner />}
      </div>

      {!hasNextPage && (
        <p className="text-center text-gray-500">No more events</p>
      )}
    </div>
  );
}
```

**Install react-intersection-observer:**
```bash
npm install react-intersection-observer
```

**Impact:** Loads only 20 items at a time instead of all data, dramatically faster initial load.

---

## Implementation Priority

**Week 1 (Critical):**
1. ✅ Fix build errors (30 min)
2. ✅ Add Web Vitals monitoring (30 min)
3. ✅ Configure React Query defaults (15 min)
4. ✅ Add database indexes (30 min)

**Week 2 (High Impact):**
5. ✅ Implement pagination (45 min)
6. ✅ Add data prefetching (20 min)
7. ✅ Lazy load heavy components (60 min)
8. ✅ Optimize fonts (10 min)

**Week 3 (Monitoring & Testing):**
9. ✅ Run Lighthouse CI baseline
10. ✅ Analyze bundle with webpack-bundle-analyzer
11. ✅ Set up performance budgets
12. ✅ Add performance tests to CI/CD

---

## Measuring Impact

After implementing each optimization, measure improvement:

```bash
# Before optimization
npm run build
npm start
lhci autorun --config=lighthouserc.json

# Save baseline
cp .lighthouseci/*.json ./performance-reports/before/

# After optimization
npm run build
npm start
lhci autorun --config=lighthouserc.json

# Compare
cp .lighthouseci/*.json ./performance-reports/after/
```

Track metrics:
- **LCP improvement:** Target 30-50% reduction
- **TBT improvement:** Target 20-40% reduction
- **Bundle size:** Target 20-40% reduction
- **API response time:** Target 50-80% reduction

---

## Quick Reference

**Commands:**
```bash
# Analyze bundle
ANALYZE=true npm run build

# Run performance tests
lhci autorun

# Start production server
npm run build && npm start

# Generate migration (backend)
dotnet ef migrations add AddIndexes
dotnet ef database update
```

**Key Files:**
- `src/app/layout.tsx` - Web Vitals, fonts
- `src/providers/query-client.provider.tsx` - React Query config
- `src/hooks/usePrefetch.ts` - Prefetching hooks
- `events-service/.../ApplicationDbContext.cs` - Database indexes

---

**Total Implementation Time:** ~4-6 hours
**Expected Performance Improvement:** 40-70% across all Core Web Vitals
**Difficulty:** Medium (requires both frontend and backend changes)
