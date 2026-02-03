# Bundle Optimization Checklist

## Priority Actions

### CRITICAL - Build Fixes Required First
- [ ] Fix `src/app/dashboard/locations/create/page.tsx` - Add "use client" directive
- [ ] Fix missing exports in `lib/api/user.ts` - Add `updateCoachProfile` and `updatePlayerProfile`
- [ ] Run successful build: `npm run build`
- [ ] Generate bundle analysis: `ANALYZE=true npm run build`

### HIGH Priority - Week 1 (Est. 200-400KB savings)

#### 1. Lazy Load Heavy Components
- [ ] Lazy load emoji-picker-react (~100KB)
  - File: `src/components/ui/emoji-picker/index.tsx`
  - Pattern: `dynamic(() => import('emoji-picker-react'), { ssr: false })`

- [ ] Lazy load rich text editor (~120KB)
  - File: `src/components/ui/rich-text-editor/index.tsx`
  - Pattern: `dynamic(() => import('./RichTextEditor'), { ssr: false })`

- [ ] Lazy load Google Maps (~150KB)
  - File: Components using `@vis.gl/react-google-maps`
  - Pattern: `dynamic(() => import('@vis.gl/react-google-maps'), { ssr: false })`

- [ ] Lazy load image cropper (~20KB)
  - File: `src/components/ui/image-cropper/index.tsx`
  - Pattern: `dynamic(() => import('react-easy-crop'), { ssr: false })`

#### 2. Remove DaisyUI
- [ ] Search for DaisyUI class usage: `grep -r "btn-|card-|input-|modal-|drawer-" src`
- [ ] Replace remaining DaisyUI components with shadcn/ui equivalents
- [ ] Remove from package.json
- [ ] Remove from tailwind.config
- [ ] Remove DaisyUI CSS imports

#### 3. Verify Lucide React Tree-Shaking
- [ ] Check bundle analysis for lucide-react size
- [ ] If >50KB, consider creating icon barrel file
- [ ] Verify optimizePackageImports is working for lucide-react

### MEDIUM Priority - Week 2-3 (Est. 100-200KB savings)

#### 4. Optimize Framer Motion
- [ ] Audit simple animation usage (fades, slides)
- [ ] Replace with CSS transitions where possible
- [ ] Keep framer-motion for complex animations only
- [ ] Lazy load animation-heavy components

#### 5. Route-Based Code Splitting
- [ ] Dashboard tabs - lazy load tab content
- [ ] Modal dialogs - use React.lazy()
- [ ] Settings pages - lazy load sections
- [ ] Profile pages - lazy load charts/stats

#### 6. Component Barrel Export Optimization
- [ ] Verify optimizePackageImports working for @/components
- [ ] Check build output for unexpected large chunks
- [ ] Consider direct imports if barrel optimization fails

### LOW Priority - Week 4 (Est. 50-100KB savings)

#### 7. Move Dev Dependencies
- [ ] Check if Storybook packages are in dependencies (should be devDependencies)
- [ ] Move: @chromatic-com/storybook
- [ ] Move: @storybook/addon-*
- [ ] Move: storybook

#### 8. Image Optimization
- [ ] Audit image sizes in public directory
- [ ] Implement next/image for all images
- [ ] Add image size limits
- [ ] Optimize logo and favicon files

#### 9. Unused Dependencies
- [ ] Run: `npx depcheck`
- [ ] Remove unused packages
- [ ] Check for duplicate packages: `npm dedupe`

## Measurement & Monitoring

### After Each Phase
- [ ] Run `ANALYZE=true npm run build`
- [ ] Compare bundle sizes before/after
- [ ] Check Lighthouse scores
- [ ] Test page load times

### Performance Budgets
- [ ] Set first load JS budget: <200KB
- [ ] Set largest chunk budget: <100KB
- [ ] Set total bundle budget: <1MB
- [ ] Add to CI/CD pipeline

### Monitoring Setup
- [ ] Configure Lighthouse CI
- [ ] Set up bundle size tracking
- [ ] Add performance alerts
- [ ] Create performance dashboard

## Success Metrics

### Target Improvements
- First Load JS: 400-500KB → <200KB (50%+ reduction)
- Largest Chunks: 200-250KB → <100KB (60% reduction)
- Total Bundle: 1.5-2MB → <1MB (50% reduction)

### Page Load Metrics
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1
- TTI (Time to Interactive): <3.5s

## Quick Commands

```bash
# Build with analysis
ANALYZE=true npm run build

# Check dependency sizes
npx package-size lucide-react
npx package-size framer-motion
npx package-size @tiptap/react

# Find unused dependencies
npx depcheck

# Check for duplicates
npm dedupe
npm ls lucide-react

# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Bundle size limit
npx size-limit
```

## Notes

- Bundle analyzer opens in browser at http://localhost:8888 when ANALYZE=true
- Test lazy loading with slow 3G throttling in DevTools
- Monitor real user metrics with Web Vitals
- Consider implementing resource hints (preload, prefetch)
