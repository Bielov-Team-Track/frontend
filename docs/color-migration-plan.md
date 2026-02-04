# Color System Migration Plan

This document outlines the migration from hardcoded Tailwind colors to a unified semantic token system.

## Current State

### Existing Tokens (Working Well)
- Core: `background`, `foreground`, `card`, `popover`
- Brand: `primary`, `secondary`, `accent`
- Status: `success`, `warning`, `error`, `info`, `destructive`
- UI: `border`, `input`, `ring`, `muted`
- Sidebar: Full sidebar token set
- Charts: `chart-1` through `chart-5`

### Missing Tokens (To Add)
- **Surface hierarchy** (elevation levels)
- **Overlay** (modal backdrops)
- **Interactive states** (hover, active)
- **Semantic neutrals** (tracks, placeholders)

---

## New Token Definitions

Add these to `globals.css` in both `:root` and `.dark`:

```css
:root {
  /* ===== SURFACE HIERARCHY ===== */
  /* For layered UI: background < surface < surface-elevated < surface-overlay */
  --surface: oklch(0.97 0 0);                    /* Subtle card backgrounds */
  --surface-foreground: oklch(0.145 0 0);
  --surface-elevated: oklch(1 0 0);              /* Elevated cards, modals */
  --surface-elevated-foreground: oklch(0.145 0 0);

  /* ===== OVERLAY ===== */
  --overlay: oklch(0 0 0 / 60%);                 /* Modal backdrops */
  --overlay-light: oklch(0 0 0 / 20%);           /* Subtle overlays */

  /* ===== INTERACTIVE STATES ===== */
  --hover: oklch(0 0 0 / 5%);                    /* Hover backgrounds */
  --active: oklch(0 0 0 / 10%);                  /* Active/pressed states */
  --selected: oklch(0 0 0 / 8%);                 /* Selected items */

  /* ===== SEMANTIC NEUTRALS ===== */
  --track: oklch(0.9 0 0);                       /* Slider tracks, progress bg */
  --placeholder: oklch(0.85 0 0);                /* Placeholder elements */
  --skeleton: oklch(0.92 0 0);                   /* Loading skeletons */

  /* ===== INTENSITY LEVELS (Domain-specific) ===== */
  --intensity-low: oklch(0.72 0.17 160);         /* Emerald equivalent */
  --intensity-low-foreground: oklch(0.985 0 0);
  --intensity-medium: oklch(0.75 0.18 85);       /* Amber equivalent (reuse warning) */
  --intensity-medium-foreground: oklch(0.2 0 0);
  --intensity-high: oklch(0.7 0.18 15);          /* Rose equivalent */
  --intensity-high-foreground: oklch(0.985 0 0);
}

.dark {
  /* ===== SURFACE HIERARCHY ===== */
  --surface: oklch(0.18 0 0);                    /* neutral-900 equivalent */
  --surface-foreground: oklch(0.985 0 0);
  --surface-elevated: oklch(0.22 0 0);           /* neutral-800 equivalent */
  --surface-elevated-foreground: oklch(0.985 0 0);

  /* ===== OVERLAY ===== */
  --overlay: oklch(0 0 0 / 60%);
  --overlay-light: oklch(0 0 0 / 40%);

  /* ===== INTERACTIVE STATES ===== */
  --hover: oklch(1 0 0 / 5%);                    /* white/5 equivalent */
  --active: oklch(1 0 0 / 10%);                  /* white/10 equivalent */
  --selected: oklch(1 0 0 / 8%);

  /* ===== SEMANTIC NEUTRALS ===== */
  --track: oklch(0.35 0 0);                      /* neutral-700 equivalent */
  --placeholder: oklch(0.25 0 0);                /* neutral-800 equivalent */
  --skeleton: oklch(0.28 0 0);                   /* Skeleton loading */

  /* ===== INTENSITY LEVELS ===== */
  --intensity-low: oklch(0.65 0.17 160);
  --intensity-low-foreground: oklch(0.985 0 0);
  --intensity-medium: oklch(0.8 0.16 85);
  --intensity-medium-foreground: oklch(0.2 0 0);
  --intensity-high: oklch(0.65 0.18 15);
  --intensity-high-foreground: oklch(0.985 0 0);
}
```

Add to `@theme inline` block:

```css
@theme inline {
  /* ... existing tokens ... */

  /* Surface Hierarchy */
  --color-surface: var(--surface);
  --color-surface-foreground: var(--surface-foreground);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-elevated-foreground: var(--surface-elevated-foreground);

  /* Overlay */
  --color-overlay: var(--overlay);
  --color-overlay-light: var(--overlay-light);

  /* Interactive States */
  --color-hover: var(--hover);
  --color-active: var(--active);
  --color-selected: var(--selected);

  /* Semantic Neutrals */
  --color-track: var(--track);
  --color-placeholder: var(--placeholder);
  --color-skeleton: var(--skeleton);

  /* Intensity Levels */
  --color-intensity-low: var(--intensity-low);
  --color-intensity-low-foreground: var(--intensity-low-foreground);
  --color-intensity-medium: var(--intensity-medium);
  --color-intensity-medium-foreground: var(--intensity-medium-foreground);
  --color-intensity-high: var(--intensity-high);
  --color-intensity-high-foreground: var(--intensity-high-foreground);
}
```

---

## Migration Mapping

### Background Colors

| Hardcoded | Semantic Token | Usage |
|-----------|----------------|-------|
| `bg-neutral-900` | `bg-surface` | Cards, panels, sidebar, header |
| `bg-neutral-950` | `bg-background` | Page background (already exists) |
| `bg-neutral-800` | `bg-surface-elevated` | Secondary surfaces, dropdowns |
| `bg-neutral-700` | `bg-track` | Slider tracks, progress backgrounds |
| `bg-neutral-600` | `bg-active` | Selected/active pill states |
| `bg-neutral-200` | `bg-muted` | Light mode inputs (use existing) |
| `bg-base-100` | `bg-card` | Card surfaces (already exists) |
| `bg-base-200` | `bg-background` | Page backgrounds |
| `bg-base-300` | `bg-surface` | Elevated surfaces |
| `bg-gray-*` | `bg-placeholder` | Placeholder elements |
| `bg-slate-700` | `bg-track` | Court empty state |
| `bg-white/5` | `bg-hover` | Hover backgrounds |
| `bg-white/10` | `bg-active` | Active/pressed states |
| `bg-white/20` | `bg-selected` | Selected states |
| `bg-black/60` | `bg-overlay` | Modal backdrops |
| `bg-black/20` | `bg-overlay-light` | Subtle overlays |

### Interactive States

| Hardcoded | Semantic Token | Usage |
|-----------|----------------|-------|
| `hover:bg-neutral-800` | `hover:bg-surface-elevated` | Hover on dark surfaces |
| `hover:bg-white/5` | `hover:bg-hover` | Standard hover |
| `hover:bg-white/10` | `hover:bg-active` | Emphasized hover |

### Status/Intensity Colors

| Hardcoded | Semantic Token | Usage |
|-----------|----------------|-------|
| `bg-emerald-500/10` | `bg-intensity-low/10` | Low intensity background |
| `text-emerald-400` | `text-intensity-low` | Low intensity text |
| `bg-amber-500/10` | `bg-intensity-medium/10` or `bg-warning/10` | Medium intensity / warning |
| `text-amber-400` | `text-intensity-medium` or `text-warning` | Medium intensity / warning |
| `bg-rose-500/10` | `bg-intensity-high/10` | High intensity background |
| `text-rose-400` | `text-intensity-high` | High intensity text |
| `bg-green-500/10` | `bg-success/10` | Success state (already exists) |
| `text-green-500` | `text-success` | Success text (already exists) |
| `bg-red-500/10` | `bg-error/10` | Error state (already exists) |
| `text-red-500` | `text-error` | Error text (already exists) |

---

## File-by-File Migration

### Priority 1: Core Layout Components

#### `src/components/layout/sidebar/index.tsx`
```diff
- fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-neutral-900 border-r border-white/5
+ fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface border-r border-border

- isRoot ? "bg-neutral-900 text-white" : "bg-white/5 text-white"
+ isRoot ? "bg-surface text-foreground" : "bg-hover text-foreground"

- "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
+ "fixed inset-0 z-40 bg-overlay backdrop-blur-sm md:hidden"
```

#### `src/components/layout/dashboard-header/DashboardHeader.tsx`
```diff
- <header className="sticky top-0 z-40 bg-neutral-900 border-b border-white/5">
+ <header className="sticky top-0 z-40 bg-surface border-b border-border">
```

#### `src/app/(card-layout)/layout.tsx`
```diff
- <html ... className={`${inter.variable} min-h-screen relative bg-base-300`}>
+ <html ... className={`${inter.variable} min-h-screen relative bg-background`}>

- <body className="... bg-base-200 text-base-content">
+ <body className="... bg-background text-foreground">

- <div className="... bg-neutral-900 p-6 sm:p-8 rounded-lg ...">
+ <div className="... bg-surface p-6 sm:p-8 rounded-lg ...">
```

### Priority 2: UI Components

#### `src/components/ui/tabs.tsx`
```diff
- default: "bg-neutral-800",
+ default: "bg-surface-elevated",
```

#### `src/components/ui/slider/index.tsx`
```diff
- track: "bg-neutral-700",
+ track: "bg-track",
```

#### `src/components/ui/steps/index.tsx`
```diff
- future: "bg-neutral-800 text-muted-foreground",
+ future: "bg-surface-elevated text-muted-foreground",

- <div className={cn("flex-1 mx-2 relative bg-neutral-800", ...)}>
+ <div className={cn("flex-1 mx-2 relative bg-track", ...)}>
```

#### `src/components/ui/avatar/index.tsx`
```diff
- className={cn("bg-neutral-800", ...)}
+ className={cn("bg-skeleton", ...)}
```

#### `src/components/ui/select/index.tsx`
```diff
- <div className="text-muted-foreground bg-neutral-800 ...">
+ <div className="text-muted-foreground bg-surface-elevated ...">
```

#### `src/components/ui/input/index.tsx`
```diff
- className="text-muted-foreground bg-neutral-800 ..."
+ className="text-muted-foreground bg-surface-elevated ..."
```

### Priority 3: Feature Components

#### `src/components/features/notifications/*.tsx`
```diff
- "hover:bg-neutral-800 hover:text-foreground"
+ "hover:bg-surface-elevated hover:text-foreground"
```

#### `src/components/features/posts/PostCard.tsx`
```diff
- <article className="bg-neutral-900 backdrop-blur-sm shadow-sm rounded-2xl border border-white/5">
+ <article className="bg-surface backdrop-blur-sm shadow-sm rounded-2xl border border-border">
```

#### `src/components/features/users/user-selector/UserSelector.tsx`
```diff
- <SkeletonAvatar className="bg-neutral-800" size="sm" />
+ <SkeletonAvatar className="bg-skeleton" size="sm" />

- <Skeleton className="bg-neutral-800" ... />
+ <Skeleton className="bg-skeleton" ... />

- <div className="... bg-neutral-950 relative ...">
+ <div className="... bg-background relative ...">

- <div className="... bg-neutral-900 rounded-t-2xl ...">
+ <div className="... bg-surface rounded-t-2xl ...">
```

#### `src/components/features/drills/DrillCard.tsx` (and DrillListItem.tsx)
Extract color config to shared constant:
```typescript
// src/lib/constants/intensity-colors.ts
export const intensityColors = {
  Low: {
    bg: "bg-intensity-low/10",
    text: "text-intensity-low",
    border: "border-intensity-low/40",
  },
  Medium: {
    bg: "bg-intensity-medium/10",
    text: "text-intensity-medium",
    border: "border-intensity-medium/40",
  },
  High: {
    bg: "bg-intensity-high/10",
    text: "text-intensity-high",
    border: "border-intensity-high/40",
  },
} as const;
```

### Priority 4: Page Components

#### Dashboard pages
Replace all instances of:
- `bg-neutral-900` → `bg-surface`
- `border-white/5` → `border-border`
- `border-white/10` → `border-border`

#### Legal pages (privacy-policy, terms-of-service)
Replace all DaisyUI classes:
- `bg-base-100` → `bg-card`
- `bg-base-200` → `bg-background`
- `bg-base-300` → `bg-surface`
- `text-base-content` → `text-foreground`
- `border-base-300` → `border-border`

---

## Search & Replace Commands

Run these in order (use with caution, review changes):

```bash
# Phase 1: Major surface replacements
find src -name "*.tsx" -exec sed -i 's/bg-neutral-900/bg-surface/g' {} \;
find src -name "*.tsx" -exec sed -i 's/bg-neutral-950/bg-background/g' {} \;
find src -name "*.tsx" -exec sed -i 's/bg-neutral-800/bg-surface-elevated/g' {} \;
find src -name "*.tsx" -exec sed -i 's/bg-neutral-700/bg-track/g' {} \;

# Phase 2: Interactive states
find src -name "*.tsx" -exec sed -i 's/hover:bg-neutral-800/hover:bg-surface-elevated/g' {} \;
find src -name "*.tsx" -exec sed -i 's/bg-white\/5/bg-hover/g' {} \;
find src -name "*.tsx" -exec sed -i 's/bg-white\/10/bg-active/g' {} \;

# Phase 3: Overlays
find src -name "*.tsx" -exec sed -i 's/bg-black\/60/bg-overlay/g' {} \;
find src -name "*.tsx" -exec sed -i 's/bg-black\/20/bg-overlay-light/g' {} \;

# Phase 4: DaisyUI migration
find src -name "*.tsx" -exec sed -i 's/bg-base-100/bg-card/g' {} \;
find src -name "*.tsx" -exec sed -i 's/bg-base-200/bg-background/g' {} \;
find src -name "*.tsx" -exec sed -i 's/bg-base-300/bg-surface/g' {} \;

# Phase 5: Borders
find src -name "*.tsx" -exec sed -i 's/border-white\/5/border-border/g' {} \;
find src -name "*.tsx" -exec sed -i 's/border-white\/10/border-border/g' {} \;
```

---

## Verification Checklist

After migration, verify:

- [ ] Light mode looks correct
- [ ] Dark mode looks correct
- [ ] Hover states work on all interactive elements
- [ ] Modal overlays have proper backdrop
- [ ] Skeletons/loading states are visible
- [ ] Slider tracks are visible
- [ ] Cards have proper elevation hierarchy
- [ ] Status colors (success/warning/error) are distinguishable

---

## Token Reference Card

### Surface Hierarchy (Dark Mode)
```
bg-background     → oklch(0.145 0 0)  → Deepest (page bg)
bg-surface        → oklch(0.18 0 0)   → Primary cards/panels
bg-surface-elevated → oklch(0.22 0 0) → Dropdowns, popovers
bg-card           → oklch(0.205 0 0)  → Explicit card surfaces
```

### Interactive States (Dark Mode)
```
bg-hover          → oklch(1 0 0 / 5%)  → Standard hover
bg-active         → oklch(1 0 0 / 10%) → Pressed/active
bg-selected       → oklch(1 0 0 / 8%)  → Selected items
```

### Semantic Neutrals (Dark Mode)
```
bg-track          → oklch(0.35 0 0)   → Slider/progress tracks
bg-skeleton       → oklch(0.28 0 0)   → Loading skeletons
bg-placeholder    → oklch(0.25 0 0)   → Placeholder images
bg-overlay        → oklch(0 0 0 / 60%) → Modal backdrops
```

### Status Colors
```
text-success / bg-success  → Green tones
text-warning / bg-warning  → Amber tones
text-error / bg-error      → Red tones
text-info / bg-info        → Blue tones
```

### Intensity Colors (Drills)
```
*-intensity-low    → Emerald tones (easy)
*-intensity-medium → Amber tones (moderate)
*-intensity-high   → Rose tones (hard)
```
