# Development Commands

## Package Manager
This project uses **pnpm** as the package manager.

## Primary Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack (http://localhost:3000)

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues automatically

# Testing
pnpm test             # Run Vitest tests (if configured)
pnpm storybook        # Start Storybook (http://localhost:6006)
pnpm build-storybook  # Build static Storybook
```

## Type Checking

```bash
npx tsc --noEmit      # Check TypeScript without emitting files
npx tsc --noEmit --watch  # Watch mode for type checking
```

## Dependency Management

```bash
pnpm add <package>           # Add production dependency
pnpm add -D <package>        # Add dev dependency
pnpm update                  # Update dependencies
pnpm outdated               # Check for outdated packages
```

## Common Development Tasks

```bash
# Generate new component (manual - no generator)
# Create file in appropriate directory following naming conventions

# Clear Next.js cache
rm -rf .next

# Clear all caches
rm -rf .next node_modules/.cache
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure API endpoints and keys
3. Run `pnpm install`
4. Start with `pnpm dev`

## Prerequisites

- Node.js 18+
- pnpm installed globally (`npm install -g pnpm`)
- Backend services running (auth-service, events-service)
- Docker for database (see infrastructure/local)
