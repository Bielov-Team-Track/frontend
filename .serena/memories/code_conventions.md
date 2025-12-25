# Code Conventions & Style Guide

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `user-menu.tsx`, `event-card.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useEvents.ts` |
| Utilities | camelCase | `formatDate.ts`, `apiClient.ts` |
| Types/Models | PascalCase | `User.ts`, `EventResponse.ts` |
| Constants | SCREAMING_SNAKE_CASE | `API_ENDPOINTS.ts` |

## Component Naming

```typescript
// Components: PascalCase
export function UserMenu() { ... }
export function EventCard() { ... }

// Props interfaces: ComponentNameProps
interface UserMenuProps { ... }
interface EventCardProps { ... }
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # Design system (Input, Button, Modal)
│   ├── layout/            # Layout components (Header, Footer)
│   └── features/          # Domain components
│       ├── auth/
│       ├── events/
│       └── teams/
├── lib/
│   ├── auth/              # Auth context and helpers
│   ├── models/            # TypeScript types
│   ├── requests/          # API request functions
│   └── utils/             # Utility functions
└── hooks/                 # Custom React hooks
```

## Import Order

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

// 3. Internal imports (absolute)
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/lib/auth';

// 4. Relative imports
import { EventCard } from './event-card';

// 5. Types (if separate)
import type { Event } from '@/lib/models';
```

## TypeScript Guidelines

```typescript
// ✅ Use explicit return types for public functions
function formatEventDate(date: Date): string { ... }

// ✅ Use interfaces for objects, types for unions/primitives
interface User {
  id: string;
  email: string;
}
type Status = 'pending' | 'active' | 'completed';

// ✅ Avoid `any` - use `unknown` if type is truly unknown
function handleError(error: unknown) { ... }

// ✅ Use const assertions for literal types
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = typeof ROLES[number];
```

## React Patterns

```typescript
// ✅ Prefer function components
export function EventList({ events }: EventListProps) { ... }

// ✅ Use early returns for conditional rendering
if (isLoading) return <Loader />;
if (error) return <ErrorMessage error={error} />;
return <Content />;

// ✅ Extract complex logic to custom hooks
const { events, isLoading, refetch } = useEvents();

// ✅ Memoize expensive computations
const sortedEvents = useMemo(() => 
  events.sort((a, b) => a.date - b.date), 
  [events]
);
```

## Form Handling

```typescript
// Use React Hook Form + Yup
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema),
});
```

## API Requests

```typescript
// Use React Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['events', filters],
  queryFn: () => eventsApi.getAll(filters),
});

// Mutations with optimistic updates
const mutation = useMutation({
  mutationFn: eventsApi.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
});
```

## CSS/Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use design system tokens (see design-system.md)
- Avoid arbitrary values - use design tokens
- Use `cn()` utility for conditional classes

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'flex items-center gap-2',
  isActive && 'bg-primary text-white',
  className
)} />
```
