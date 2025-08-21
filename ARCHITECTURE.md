# Frontend Architecture Guide

## Overview
This document outlines the restructured frontend architecture following Next.js 14 best practices and modern React patterns.

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (account)/               # Route groups for auth pages
│   ├── api/                     # API routes
│   ├── events/                  # Event-related pages
│   ├── games/                   # Game pages
│   ├── groups/                  # Group pages
│   ├── profile/                 # Profile pages
│   └── ...                      # Other feature pages
│
├── components/                   # All React components
│   ├── ui/                      # Reusable UI components (Design System)
│   │   ├── input/               # Input component with variants
│   │   ├── select/              # Select component
│   │   ├── textarea/            # TextArea component
│   │   ├── modal/               # Modal component
│   │   ├── avatar/              # Avatar component
│   │   ├── loader.tsx           # Loading spinner
│   │   ├── back-button.tsx      # Navigation back button
│   │   └── index.ts             # Barrel exports
│   │
│   ├── layout/                  # Layout-specific components
│   │   ├── header/              # Header component and related
│   │   ├── footer.tsx           # Footer component
│   │   ├── react-query-provider.tsx  # Query provider wrapper
│   │   └── index.ts             # Barrel exports
│   │
│   ├── features/                # Feature-based component organization
│   │   ├── auth/                # Authentication components
│   │   │   ├── forms/           # Auth forms
│   │   │   └── index.ts         # Feature exports
│   │   │
│   │   ├── events/              # Event-related components
│   │   │   ├── components/      # Event UI components
│   │   │   ├── forms/           # Event forms
│   │   │   └── index.ts         # Feature exports
│   │   │
│   │   ├── teams/               # Team components
│   │   │   ├── components/      # Team UI components
│   │   │   ├── positions/       # Position-specific components
│   │   │   └── index.ts         # Feature exports
│   │   │
│   │   ├── users/               # User-related components
│   │   ├── groups/              # Group components
│   │   ├── payments/            # Payment components
│   │   ├── locations/           # Location and map components
│   │   └── audit/               # Audit components
│   │
│   └── index.ts                 # Main component exports
│
├── lib/                         # Business logic and utilities
│   ├── auth/                    # Authentication context and helpers
│   ├── models/                  # TypeScript type definitions
│   ├── requests/                # API request functions
│   ├── server/                  # Server-side utilities
│   ├── utils/                   # Utility functions
│   │   ├── date.ts              # Date utilities
│   │   ├── string.ts            # String utilities  
│   │   ├── color.ts             # Color utilities
│   │   ├── responsive.ts        # Responsive design helpers
│   │   └── index.ts             # Utility exports
│   ├── client.ts                # API client configuration
│   ├── constants.ts             # App constants
│   └── gameEngine.ts            # Game logic
│
├── hooks/                       # Custom React hooks
├── hoc/                         # Higher-order components
└── middleware.ts                # Next.js middleware
```

## Architecture Principles

### 1. **Feature-Based Organization**
Components are organized by domain/feature rather than type:
- `features/events/` - All event-related components
- `features/teams/` - All team-related components  
- `features/auth/` - All authentication components

### 2. **UI Component System**
The `ui/` directory contains reusable, design-system components:
- Consistent styling and behavior
- Responsive design built-in
- TypeScript interfaces for props
- Easy to import: `import { Input, Select } from '@/components/ui'`

### 3. **Barrel Exports**
Index files provide clean imports:
```typescript
// Instead of:
import Input from '@/components/ui/input/index'
import Select from '@/components/ui/select/index'

// Use:
import { Input, Select } from '@/components/ui'
```

### 4. **Consistent Naming**
- Files: kebab-case (`user-menu.tsx`)  
- Components: PascalCase (`UserMenu`)
- Directories: kebab-case for UI, PascalCase for features

## Import Patterns

### UI Components
```typescript
import { Input, Select, Loader, Modal } from '@/components/ui'
```

### Feature Components
```typescript
import { EventsList, CreateEventForm } from '@/components/features/events'
import { TeamsList, Position } from '@/components/features/teams'
```

### Layout Components
```typescript
import { Header, Footer, ReactQueryProvider } from '@/components/layout'
```

### Utilities
```typescript
import { formatDate, getDuration } from '@/lib/utils/date'
import { capitalizeFirstLetter } from '@/lib/utils/string'
import { responsiveClasses } from '@/lib/utils/responsive'
```

## Component Development Guidelines

### UI Components
- Must be responsive and accessible
- Follow the established design tokens
- Include proper TypeScript interfaces
- Support variants and sizes
- Include error handling

### Feature Components  
- Business logic specific to a domain
- Can use UI components internally
- Handle feature-specific state management
- Include proper error boundaries

### Layout Components
- App-wide layout concerns
- Navigation, headers, footers
- Provider components
- Global state management

## Benefits of This Structure

1. **Scalability**: Easy to add new features without cluttering existing directories
2. **Maintainability**: Related code is co-located
3. **Reusability**: UI components are easily shared across features  
4. **Developer Experience**: Clear imports and intuitive file organization
5. **Type Safety**: Consistent TypeScript patterns throughout
6. **Performance**: Better tree-shaking with barrel exports
7. **Testing**: Easier to test feature-specific functionality

## Migration Guide

When adding new components:

1. **Reusable UI**: Add to `src/components/ui/`
2. **Feature-specific**: Add to appropriate `src/components/features/[domain]/`
3. **Layout-related**: Add to `src/components/layout/`
4. **Update exports**: Add to relevant `index.ts` files

## Next Steps

- Consider adding Storybook for component documentation
- Implement component testing strategy
- Add lint rules to enforce architecture patterns
- Create component templates for consistency