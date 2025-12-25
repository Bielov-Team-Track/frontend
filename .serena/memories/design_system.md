# Design System Reference

## Core Principles

1. **Modal-First** - All overlays are modals, sidebars only for navigation
2. **Shared Components** - Forms/views work in any context
3. **Accent Colors Only** - Primary/secondary for emphasis, neutrals dominate
4. **Elevation Over Borders** - Use shadows and background difference
5. **Decision Trees Over Options** - Clear rules, not arbitrary choices
6. **Mobile-First** - Start with mobile, add breakpoints

## Color System

### Functional Colors (Accents)

| Role | Name | HEX | Usage |
|------|------|-----|-------|
| Primary | Vivid Tangerine | `#FF7D00` | Main CTAs, active states |
| Secondary | Stormy Teal | `#29757A` | Secondary actions, links |
| Success | Fern | `#4A7A45` | Success states |
| Error | Rusty Spice | `#BE3F23` | Errors, destructive |
| Info | Baltic Blue | `#2E5A88` | Informational |
| Warning | Golden Ochre | `#D99100` | Warnings |

### Color Decision Tree
```
Main action? → Primary (orange)
Destructive? → Error (red)
Secondary action? → Secondary (teal) or Neutral
Otherwise → Ghost/neutral variant
```

## Typography

| Role | Mobile | Desktop | Class |
|------|--------|---------|-------|
| Display | 24px | 40px | `text-display` |
| H1 | 20px | 30px | `text-h1` |
| H2 | 18px | 24px | `text-h2` |
| H3 | 16px | 20px | `text-h3` |
| Body | 14px | 16px | `text-body` |
| Small | 12px | 14px | `text-small` |
| Caption | 11px | 12px | `text-caption` |

## Elevation Scale

| Level | Use Case | Classes |
|-------|----------|---------|
| 0 | Page background | `bg-base` |
| 1 | Section backgrounds | `bg-subtle/50` |
| 2 | Cards, panels | `bg-surface/80 backdrop-blur-sm shadow-sm` |
| 3 | Dropdowns, popovers | `bg-raised/85 backdrop-blur-lg shadow-lg` |
| 4 | Modals | `bg-overlay/95 backdrop-blur-xl shadow-2xl` |

## Component Patterns

### Buttons
```
Primary action → variant="default" (orange)
Destructive → variant="destructive" (red)
Secondary → variant="secondary" or "outline"
Minimal → variant="ghost"
```

### Sizes
- `sm`: Compact UI, tables
- `md`: Default, most uses
- `lg`: CTAs, prominent actions

### Modal Sizes
- `sm` (400px): Confirmations
- `md` (500px): Simple forms
- `lg` (700px): Detail views
- `xl` (900px): Complex forms
- `full`: Mobile fallback

## Layout Patterns

### Dashboard Layout
```
Desktop: Sidebar (w-64) + Main content
Tablet: Sidebar (w-16, icons only) + Main content
Mobile: Bottom nav + Main content
```

### Public Layout
```
Top nav (sticky) + Centered content (max-w-5xl) + Footer
```

### Spacing Scale
- `xs` (4px): Icon spacing
- `sm` (8px): Related elements
- `md` (16px): Card padding, form gaps
- `lg` (24px): Section padding
- `xl` (32px): Dashboard sections
- `2xl` (48px): Public page sections

## Responsive Breakpoints

| Name | Width | Target |
|------|-------|--------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |

## Common Patterns

### Card Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Form Layout
```tsx
<form className="flex flex-col gap-4">
```

### Form Actions
```tsx
<div className="flex justify-end gap-3 mt-6">
```

## Don'ts

- Don't use sidebar/drawer for forms (only navigation)
- Don't use borders as primary separation (use elevation)
- Don't overuse primary color (it's an accent)
- Don't skip responsive classes
- Don't use arbitrary Tailwind values
