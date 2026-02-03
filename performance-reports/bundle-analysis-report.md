# Next.js Bundle Size Analysis Report
**Date:** 2026-02-02
**Project:** Bielov Volleyer - Team Track
**Framework:** Next.js 16.1.1 with Turbopack

## Executive Summary

The application build currently fails due to code errors, preventing direct bundle analysis. However, based on configuration analysis, dependency review, and codebase structure examination, several significant optimization opportunities have been identified.

### Key Findings

- **Total TypeScript Files:** 669 files
- **Component Files:** 304 components
- **Heavy Library Usage:** Extensive use of large libraries across 302+ files
- **Build Status:** Failed (5 compilation errors blocking production build)

## Critical Issues Blocking Build

### 1. Missing "use client" Directive
**File:** `src/app/dashboard/locations/create/page.tsx`
**Impact:** Server component trying to use React hooks
**Fix Required:** Add `"use client"` directive at top of file

### 2. Missing API Exports
**Files:** `InvitationPageClient.tsx` importing from `lib/api/user.ts`
**Missing Exports:**
- `updateCoachProfile`
- `updatePlayerProfile`

**Impact:** Blocks entire build process
**Fix Required:** Export missing functions or remove unused imports

## Bundle Size Analysis (Based on Configuration)

### Current Next.js Configuration

**Positive Optimizations Already Implemented:**
- Bundle analyzer configured (enabled via ANALYZE=true)
- Standalone output mode for smaller Docker images
- Experimental package import optimization for 14 libraries
- Image optimization enabled (unoptimized: false)

**Optimized Packages:**
```javascript
lucide-react, @base-ui-components/react, framer-motion,
@tanstack/react-query, @tanstack/react-table, date-fns,
@tiptap/react, @tiptap/starter-kit, @tiptap/core,
@/components, @/components/ui, @/components/layout,
@/components/features, @/providers, @/hooks
```

### Heavy Dependencies Analysis

| Package | Version | Estimated Size | Usage Frequency | Optimization Priority |
|---------|---------|---------------|-----------------|---------------------|
| **framer-motion** | 12.23.26 | ~160KB gzipped | 302 files | HIGH - Consider alternatives |
| **@tiptap/** (suite) | 3.14.0 | ~120KB gzipped | Heavy usage | MEDIUM - Code split |
| **lucide-react** | 0.562.0 | ~600KB (if tree-shaking fails) | 302 files | HIGH - Verify tree-shaking |
| **@tanstack/react-query** | 5.90.12 | ~45KB gzipped | Extensive | LOW - Essential |
| **@tanstack/react-table** | 8.21.3 | ~40KB gzipped | Tables | LOW - Essential |
| **emoji-picker-react** | 4.16.1 | ~100KB+ | Unknown | MEDIUM - Lazy load |
| **@microsoft/signalr** | 10.0.0 | ~80KB | Real-time features | LOW - Essential |
| **daisyui** | 5.5.14 | CSS only | Migration to shadcn/ui | HIGH - Remove after migration |
| **@vis.gl/react-google-maps** | 1.7.1 | ~150KB+ | Location features | MEDIUM - Code split |
| **react-easy-crop** | 5.5.6 | ~20KB | Image cropping | LOW - Lazy load |
| **tippy.js** | 6.3.7 | ~30KB | Tooltips | LOW - Consider native |

### Duplicate/Redundant Dependencies

**UI Component Libraries (Consolidation Needed):**
- `daisyui` (5.5.14) - Legacy, being migrated
- `shadcn` (3.6.2) - New design system
- `@base-ui/react` (1.0.0) - Base components
- `@radix-ui/react-slot` (1.2.4) - Primitives

**Recommendation:** Complete migration from DaisyUI to shadcn/ui to eliminate redundancy.

## Optimization Opportunities

### HIGH Priority (Potential 200-400KB Savings)

#### 1. Optimize Lucide React Imports
**Current State:** Full package imports in 302 files
**Issue:** Risk of bundling all 1000+ icons if tree-shaking fails

**Recommended Fix:**
```javascript
// Instead of barrel imports
import { Icon1, Icon2, Icon3 } from 'lucide-react';

// Use direct imports (if tree-shaking fails)
import Icon1 from 'lucide-react/dist/esm/icons/icon1';
```

**Verification:** Check if Next.js optimizePackageImports is working correctly.

#### 2. Remove DaisyUI Completely
**Current:** Still in dependencies (5.5.14)
**Status:** Migration to shadcn/ui mentioned but incomplete
**Savings:** ~50-100KB CSS + reduced CSS conflicts

**Action Items:**
- Search for remaining DaisyUI class names
- Complete component migration
- Remove from package.json
- Remove from Tailwind config

#### 3. Implement Code Splitting for Heavy Features

**High-Impact Lazy Load Candidates:**

a) **Rich Text Editor (Tiptap Suite)**
```typescript
// Lazy load the editor component
const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
});
```
**Estimated Savings:** 120KB initial bundle

b) **Emoji Picker**
```typescript
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false
});
```
**Estimated Savings:** 100KB+ initial bundle

c) **Google Maps**
```typescript
const MapComponent = dynamic(() => import('@vis.gl/react-google-maps'), {
  ssr: false
});
```
**Estimated Savings:** 150KB+ initial bundle

d) **Image Cropper**
```typescript
const ImageCropper = dynamic(() => import('@/components/ui/image-cropper'), {
  ssr: false
});
```
**Estimated Savings:** 20KB initial bundle

### MEDIUM Priority (Potential 100-200KB Savings)

#### 4. Optimize Framer Motion Usage
**Current:** Used in 302 files for animations
**Issue:** Large library for basic animations

**Options:**
- Replace simple animations with CSS transitions
- Use lighter animation alternatives for simple cases
- Lazy load complex animation components
- Consider CSS-only animations for basic use cases

**Example Refactor:**
```typescript
// Before: Framer Motion for simple fade
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

// After: CSS transition
<div className="animate-fade-in">
```

#### 5. Audit and Optimize Component Barrel Exports
**Files:** 304 component files with potential barrel export issues

**Risk:** Next.js may bundle entire component library even if only importing one component.

**Current Optimization:** Already configured in next.config.mjs
```javascript
optimizePackageImports: [
  '@/components',
  '@/components/ui',
  // ...
]
```

**Verification Needed:** Ensure this is working correctly after fixing build errors.

### LOW Priority (Potential 50-100KB Savings)

#### 6. Optimize Date Handling
**Current:** date-fns (4.1.0)
**Status:** Already optimized in config
**Note:** Good choice, tree-shakeable (unlike moment.js)

#### 7. Review Storybook Dependencies
**Issue:** Storybook dependencies in production package.json

**Dependencies to Review:**
- @chromatic-com/storybook: 4.1.3
- @storybook/addon-*: Multiple packages
- storybook: 10.1.10

**Recommendation:** Ensure these are devDependencies, not dependencies.

#### 8. Minimize Polyfills
**Check:** Review if @microsoft/signalr requires polyfills
**Action:** Ensure only necessary polyfills are included

## Page-Specific Optimization Opportunities

### Dashboard Pages (High Traffic)
- Implement route-based code splitting
- Lazy load tab contents
- Use React.lazy() for modal dialogs

### Event Pages
- Lazy load payment processing components
- Defer loading of maps until user interaction
- Optimize image loading with Next.js Image component

### Profile Pages
- Lazy load stats/charts
- Defer loading of achievement badges
- Optimize avatar images

## Recommended Implementation Plan

### Phase 1: Fix Build Issues (Immediate)
1. Add "use client" to dashboard/locations/create/page.tsx
2. Fix missing API exports in lib/api/user.ts
3. Verify build completes successfully
4. Run bundle analyzer: `ANALYZE=true npm run build`

### Phase 2: Quick Wins (Week 1)
1. Complete DaisyUI removal
2. Implement lazy loading for:
   - Emoji picker
   - Image cropper
   - Rich text editor
   - Google Maps
3. Verify Lucide React tree-shaking

### Phase 3: Medium Optimizations (Week 2-3)
1. Audit Framer Motion usage
2. Replace simple animations with CSS
3. Implement route-based code splitting
4. Optimize component barrel exports

### Phase 4: Polish (Week 4)
1. Move Storybook to devDependencies
2. Implement image optimization strategy
3. Add performance budgets to CI/CD
4. Set up bundle size monitoring

## Performance Budget Recommendations

```javascript
// next.config.mjs addition
experimental: {
  // ... existing config
  bundleAnalysis: {
    openAnalyzer: true,
  },
  performanceBudget: {
    firstLoadJS: 200, // 200KB for first load
    totalBlockingTime: 300, // 300ms max TBT
  }
}
```

## Monitoring and Continuous Optimization

### Tools to Implement

1. **Bundle Analyzer** (Already configured)
   ```bash
   ANALYZE=true npm run build
   ```

2. **Lighthouse CI**
   - Track performance over time
   - Set performance budgets
   - Fail builds that exceed budgets

3. **Next.js Bundle Analysis**
   - Use built-in bundle analysis
   - Track bundle size in CI/CD
   - Alert on significant increases

4. **webpack-bundle-analyzer Alternative**
   - Consider @next/bundle-analyzer (already configured)
   - Or use `next build --profile` for detailed analysis

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Analyze bundle size
  run: |
    npm run build
    npx -p nextjs-bundle-analysis report

- name: Check bundle size
  uses: andresz1/size-limit-action@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Expected Performance Improvements

### Before Optimization (Estimated)
- **First Load JS:** 400-500KB
- **Largest Chunks:** 200-250KB
- **Total Bundle:** 1.5-2MB

### After Phase 1-2 Optimization (Target)
- **First Load JS:** 250-300KB (40% reduction)
- **Largest Chunks:** 150KB (40% reduction)
- **Total Bundle:** 1.2-1.5MB (20% reduction)

### After Complete Optimization (Goal)
- **First Load JS:** <200KB (50%+ reduction)
- **Largest Chunks:** <100KB (60% reduction)
- **Total Bundle:** <1MB (50% reduction)

## Code Examples

### 1. Dynamic Import Pattern

```typescript
// components/LazyComponents.tsx
import dynamic from 'next/dynamic';

export const LazyEmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  {
    ssr: false,
    loading: () => <div className="animate-pulse">Loading...</div>
  }
);

export const LazyRichEditor = dynamic(
  () => import('@/components/ui/rich-text-editor'),
  { ssr: false }
);

export const LazyGoogleMap = dynamic(
  () => import('@vis.gl/react-google-maps').then(mod => mod.Map),
  { ssr: false }
);
```

### 2. Framer Motion Optimization

```typescript
// Before: Full framer-motion
import { motion, AnimatePresence } from 'framer-motion';

// After: Minimal imports or CSS
// For simple animations, use CSS:
<div className="transition-opacity duration-300 hover:opacity-80">

// For complex animations, still use framer-motion but lazy load:
const AnimatedComponent = dynamic(() =>
  import('./AnimatedComponent'),
  { ssr: false }
);
```

### 3. Icon Optimization Check

```typescript
// Verify tree-shaking is working
// Run: npm run build and check if all icons are bundled

// If tree-shaking fails, create icon barrel:
// lib/icons.ts
export {
  Home,
  User,
  Settings,
  // Only icons actually used
} from 'lucide-react';

// Then import from barrel:
import { Home, User } from '@/lib/icons';
```

## Next Steps

1. **Immediate:** Fix build errors and generate actual bundle analysis
2. **Week 1:** Implement Phase 1 and 2 optimizations
3. **Week 2:** Measure improvements and iterate
4. **Ongoing:** Monitor bundle size in CI/CD

## Appendix: Commands Reference

```bash
# Build with bundle analysis
ANALYZE=true npm run build

# Build and check for issues
npm run build 2>&1 | tee build-output.txt

# Check dependency sizes
npx npm-check-updates
npx depcheck  # Find unused dependencies

# Analyze package impact
npx package-size <package-name>

# Profile build
NODE_OPTIONS='--inspect' next build

# Check for duplicate packages
npm dedupe
npm ls <package-name>
```

---

**Report Generated:** 2026-02-02
**Analyst:** Performance Engineer
**Next Review:** After build fixes implemented
