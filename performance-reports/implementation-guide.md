# Bundle Optimization Implementation Guide

## Quick Reference

### Current State
- **Build Status:** Failing (5 errors)
- **Dynamic Imports:** Only 1 component currently lazy loaded
- **DaisyUI Usage:** 123 occurrences in 40 files
- **Lucide Icons:** Used in 302 files with barrel imports
- **Tree-Shaking:** Configured via optimizePackageImports

## Immediate Fixes Required

### 1. Fix Build Error: Missing "use client"

**File:** `D:\Projects\Bielov-Team-Track\frontend\src\app\dashboard\locations\create\page.tsx`

```typescript
// Add this as the first line of the file
"use client"

import React, { useState } from "react";
// ... rest of imports
```

### 2. Fix Build Error: Missing API Exports

**File:** `D:\Projects\Bielov-Team-Track\frontend\src\lib\api\user.ts`

Either:
a) Export the missing functions:
```typescript
export const updateCoachProfile = async (data: CreateOrUpdateCoachProfileDto) => {
  // implementation
};

export const updatePlayerProfile = async (data: CreateOrUpdatePlayerProfileDto) => {
  // implementation
};
```

Or:
b) Remove unused imports from InvitationPageClient.tsx if they're not needed.

## High Priority Optimizations

### 1. Lazy Load Heavy Components

#### Example 1: Emoji Picker (100KB+ savings)

**Current Good Example (already using dynamic):**
```typescript
// src/app/dashboard/events/[id]/page.tsx
const Map = dynamic(() => import("@/components/features/locations").then((mod) => mod.Map), {
  ssr: false
});
```

**Apply same pattern to emoji picker:**

**File:** `src/components/ui/emoji-picker/index.tsx`
```typescript
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => <div className="h-96 w-80 animate-pulse bg-gray-100 rounded-lg" />
});

export default EmojiPicker;
```

**Usage in components:**
```typescript
// Before
import EmojiPicker from 'emoji-picker-react';

// After
import EmojiPicker from '@/components/ui/emoji-picker';
```

#### Example 2: Rich Text Editor (120KB savings)

**File:** `src/components/ui/rich-text-editor/index.tsx`
```typescript
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg p-4 h-64 animate-pulse bg-gray-50">
      <div className="h-8 bg-gray-200 rounded mb-4 w-full" />
      <div className="h-48 bg-gray-200 rounded" />
    </div>
  )
});

export default RichTextEditor;
```

#### Example 3: Image Cropper (20KB savings)

**File:** `src/components/ui/image-cropper/index.tsx`
```typescript
import dynamic from 'next/dynamic';

const ImageCropper = dynamic(() => import('./ImageCropperComponent'), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});

export default ImageCropper;
```

#### Example 4: Google Maps (150KB savings)

**Already implemented!** Good example at:
`src/app/dashboard/events/[id]/page.tsx`

Apply to other map usages:
```typescript
const LocationPicker = dynamic(
  () => import('@vis.gl/react-google-maps').then(mod => ({
    default: mod.Map
  })),
  { ssr: false }
);
```

### 2. Remove DaisyUI

**Files with DaisyUI usage (40 files to update):**

Key files identified:
- `src/app/globals.css` - Remove DaisyUI import
- `src/components/ui/card/index.tsx` - Replace with shadcn/ui card
- `src/components/ui/dropdown/index.tsx` - Replace with shadcn/ui dropdown
- `src/components/ui/drawer/index.tsx` - Replace with shadcn/ui drawer
- `src/components/ui/input-group.tsx` - Replace with shadcn/ui input

**Example migration:**

**Before (DaisyUI):**
```tsx
<div className="card card-bordered">
  <div className="card-body">
    <h2 className="card-title">Title</h2>
    <p>Content</p>
  </div>
</div>
```

**After (shadcn/ui):**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

**Search and replace patterns:**
```bash
# Find all DaisyUI button classes
grep -r "btn-primary\|btn-secondary\|btn-ghost" src

# Find all DaisyUI card classes
grep -r "card-body\|card-title\|card-bordered" src

# Find all DaisyUI input classes
grep -r "input-bordered\|input-primary" src
```

### 3. Optimize Lucide React

**Current usage (good tree-shaking pattern):**
```typescript
// src/app/(card-layout)/sign-up/page.tsx
import { Lock, Mail } from "lucide-react";
```

This is already optimal! Next.js optimizePackageImports should handle tree-shaking.

**Verification after build:**
1. Run: `ANALYZE=true npm run build`
2. Check if lucide-react chunk is <50KB
3. If >50KB, tree-shaking may have failed

**Fallback if tree-shaking fails:**
Create icon barrel file:

**File:** `src/lib/icons.ts`
```typescript
// Export only icons actually used in the app
export {
  Lock,
  Mail,
  Check,
  AlertTriangle,
  PlusIcon,
  BluetoothIcon,
  // ... only icons you use
} from "lucide-react";
```

**Then update imports:**
```typescript
// Before
import { Lock, Mail } from "lucide-react";

// After
import { Lock, Mail } from "@/lib/icons";
```

## Medium Priority Optimizations

### 4. Replace Framer Motion with CSS

**Common patterns to replace:**

**Simple Fade Animation:**
```typescript
// Before (framer-motion)
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// After (CSS)
<div className="animate-in fade-in duration-300">
  Content
</div>
```

**Simple Slide Animation:**
```typescript
// Before (framer-motion)
<motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
>
  Content
</motion.div>

// After (CSS)
<div className="animate-in slide-in-from-left-4 fade-in">
  Content
</div>
```

**Keep framer-motion for:**
- Complex orchestrated animations
- Gesture-based interactions (drag, swipe)
- Layout animations
- Spring physics

**Lazy load complex animations:**
```typescript
const AnimatedDashboard = dynamic(
  () => import('./AnimatedDashboard'),
  { ssr: false }
);
```

### 5. Route-Based Code Splitting

**Dashboard Tabs Pattern:**

**File:** `src/app/dashboard/teams/[id]/layout.tsx`
```typescript
import dynamic from 'next/dynamic';

const RosterTab = dynamic(() => import('./components/tabs/RosterTab'), {
  loading: () => <TabSkeleton />
});

const SettingsTab = dynamic(() => import('./components/tabs/SettingsTab'), {
  loading: () => <TabSkeleton />
});

const PostsTab = dynamic(() => import('./components/tabs/PostsTab'), {
  loading: () => <TabSkeleton />
});
```

**Modal Dialogs:**
```typescript
// Only load when needed
const [showModal, setShowModal] = useState(false);

const UserModal = dynamic(
  () => import('@/components/features/user/UserProfileModal'),
  { ssr: false }
);

// Modal only loads when showModal becomes true
{showModal && <UserModal ... />}
```

## Testing Optimizations

### Before Optimization Measurement

```bash
# 1. Build and analyze
cd frontend
npm run build 2>&1 | tee performance-reports/before-optimization.txt

# 2. Bundle analysis
ANALYZE=true npm run build

# 3. Lighthouse audit
npm run build && npm run start
npx lighthouse http://localhost:3000 --output-path=./performance-reports/before-lighthouse.html
```

### After Optimization Measurement

```bash
# 1. Build and analyze
npm run build 2>&1 | tee performance-reports/after-optimization.txt

# 2. Bundle analysis
ANALYZE=true npm run build

# 3. Lighthouse audit
npx lighthouse http://localhost:3000 --output-path=./performance-reports/after-lighthouse.html

# 4. Compare
diff performance-reports/before-optimization.txt performance-reports/after-optimization.txt
```

## Package-Specific Commands

```bash
# Check individual package sizes
npx package-size lucide-react
npx package-size framer-motion
npx package-size @tiptap/react
npx package-size emoji-picker-react
npx package-size @vis.gl/react-google-maps

# Find unused dependencies
npx depcheck

# Check for duplicate packages
npm ls lucide-react
npm ls react
npm dedupe
```

## Monitoring Setup

### 1. Add Bundle Size Limits

**File:** `package.json`
```json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "build:check": "next build && npm run size-check"
  },
  "size-limit": [
    {
      "path": ".next/static/chunks/pages/**/*.js",
      "limit": "200 KB"
    },
    {
      "path": ".next/static/chunks/main-*.js",
      "limit": "50 KB"
    }
  ]
}
```

### 2. GitHub Actions CI

**File:** `.github/workflows/performance.yml`
```yaml
name: Performance Check
on: [pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build and analyze
        working-directory: ./frontend
        run: npm run build

      - name: Check bundle size
        working-directory: ./frontend
        run: |
          npx -p nextjs-bundle-analysis report
          # Fail if bundle exceeds limits
```

## Next Steps

1. Fix build errors (estimated 30 minutes)
2. Run baseline analysis (estimated 15 minutes)
3. Implement lazy loading (estimated 2-4 hours)
4. Remove DaisyUI (estimated 4-6 hours)
5. Optimize animations (estimated 2-3 hours)
6. Measure improvements (estimated 1 hour)

Total estimated time: 10-15 hours of development work

## Resources

- Next.js Dynamic Imports: https://nextjs.org/docs/advanced-features/dynamic-import
- Bundle Analyzer: https://www.npmjs.com/package/@next/bundle-analyzer
- Web Vitals: https://web.dev/vitals/
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
