# Performance Testing Guide

This directory contains performance reports and testing tools for the Bielov Volleyer application.

## Quick Start

### 1. Automated Performance Analysis

Run the performance analysis script:

```bash
cd frontend
node scripts/performance-analysis.js
```

This generates a report with recommendations based on the current codebase structure.

### 2. Lighthouse CI Testing

Install Lighthouse CI globally:

```bash
npm install -g @lhci/cli
```

Run Lighthouse tests on all configured pages:

```bash
cd frontend
npm run build
npm start &  # Start production server
lhci autorun --config=lighthouserc.json
```

Reports will be saved to `frontend/performance-reports/lighthouse/`

### 3. Chrome DevTools Manual Testing

For detailed performance profiling:

1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Click Record, perform actions, then Stop
4. Analyze the flame chart for bottlenecks

**Key metrics to watch:**
- **LCP (Largest Contentful Paint)**: < 2.5s (good), < 4s (needs improvement)
- **FID (First Input Delay)**: < 100ms (good), < 300ms (needs improvement)
- **CLS (Cumulative Layout Shift)**: < 0.1 (good), < 0.25 (needs improvement)
- **TBT (Total Blocking Time)**: < 200ms (good), < 600ms (needs improvement)

### 4. Web Vitals Monitoring

Add real-user monitoring with Web Vitals:

```bash
npm install web-vitals
```

**In your root layout or _app.tsx:**

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Performance Testing Checklist

### Before Each Release

- [ ] Run Lighthouse CI on all major pages
- [ ] Check bundle size hasn't increased unexpectedly
- [ ] Verify Core Web Vitals meet targets
- [ ] Test on throttled network (Slow 3G)
- [ ] Test on mobile devices
- [ ] Review and optimize largest bundles

### Key Pages to Test

1. **Homepage (/)**: First impression, should load quickly
2. **Login (/login)**: Critical auth flow
3. **Clubs (/clubs)**: Data-heavy listing page
4. **Events (/events)**: Main feature page
5. **User Profile (/profile)**: Personalized content

### Performance Budgets

Set performance budgets to prevent regression:

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | 2.0s |
| Largest Contentful Paint | < 2.0s | 2.5s |
| Time to Interactive | < 3.0s | 4.0s |
| Total Blocking Time | < 200ms | 300ms |
| Cumulative Layout Shift | < 0.1 | 0.25 |
| Initial JS Bundle | < 200KB | 300KB |
| Total Page Weight | < 1MB | 2MB |

## Common Performance Issues & Solutions

### Issue: Large Initial Bundle

**Symptoms:** Slow initial page load, high Time to Interactive

**Solutions:**
- Implement code splitting with `dynamic()` imports
- Defer non-critical third-party scripts
- Tree-shake unused dependencies
- Use selective imports (e.g., `import { Button } from 'lib'` → `import Button from 'lib/button'`)

**Example:**
```typescript
// Before: Everything loads immediately
import { HeavyChart } from '@/components/charts';

// After: Load only when needed
const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <Spinner />,
  ssr: false
});
```

### Issue: Slow API Responses

**Symptoms:** Long wait times, poor interactivity

**Solutions:**
- Implement optimistic updates
- Add loading states and skeletons
- Cache API responses with React Query
- Add database indexes on frequently queried fields
- Implement pagination for large datasets

**Example:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['events', filters],
  queryFn: () => fetchEvents(filters),
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  keepPreviousData: true // Show old data while fetching new
});
```

### Issue: Layout Shift (High CLS)

**Symptoms:** Elements jumping during load, poor visual stability

**Solutions:**
- Reserve space for images with width/height
- Use skeleton loaders for dynamic content
- Avoid inserting content above existing content
- Use `next/font` to prevent font swap shift

**Example:**
```typescript
// Before: Image causes layout shift
<img src="/banner.jpg" alt="Banner" />

// After: Reserved space prevents shift
import Image from 'next/image';
<Image src="/banner.jpg" alt="Banner" width={1200} height={400} />
```

### Issue: Unoptimized Images

**Symptoms:** Large page weight, slow LCP

**Solutions:**
- Use Next.js Image component
- Implement lazy loading
- Serve modern formats (WebP, AVIF)
- Use appropriate image sizes

**Example:**
```typescript
<Image
  src="/event-photo.jpg"
  alt="Event"
  width={400}
  height={300}
  quality={75}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Issue: Render Blocking Resources

**Symptoms:** Delayed FCP, white screen during load

**Solutions:**
- Inline critical CSS
- Defer non-critical CSS
- Use font-display: swap
- Preload critical resources

**Example:**
```typescript
// In next.config.js
module.exports = {
  experimental: {
    optimizeCss: true, // Enable CSS optimization
  },
};

// In layout/page
<link
  rel="preload"
  href="/fonts/inter.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

## Monitoring & Alerting

### Vercel Analytics (Recommended)

```bash
npm install @vercel/analytics @vercel/speed-insights
```

```typescript
// In root layout
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Web Vitals Tracking

Create a Web Vitals monitoring service:

```typescript
// lib/analytics/webVitals.ts
import { Metric } from 'web-vitals';

export function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType
  });

  // Send to your analytics endpoint
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true
    });
  }
}
```

## Tools & Resources

### Essential Tools

- **Lighthouse CI**: Automated performance testing
- **Chrome DevTools**: Manual performance profiling
- **WebPageTest**: Detailed waterfall analysis
- **Bundle Analyzer**: Visualize bundle composition
- **React DevTools Profiler**: Component render optimization

### Installation

```bash
# Lighthouse CI
npm install -g @lhci/cli

# Bundle analyzer for Next.js
npm install --save-dev @next/bundle-analyzer

# Web Vitals library
npm install web-vitals

# Performance monitoring
npm install @vercel/analytics @vercel/speed-insights
```

### Configuration

**Enable bundle analyzer in next.config.js:**

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Your Next.js config
});
```

**Run bundle analysis:**

```bash
ANALYZE=true npm run build
```

## Performance Testing Workflow

### 1. Baseline Measurement

Before making changes, establish a baseline:

```bash
# Build and start production server
npm run build
npm start &

# Run Lighthouse CI
lhci autorun --config=lighthouserc.json

# Save baseline report
cp .lighthouseci/*.json ./performance-reports/baseline/
```

### 2. Make Optimizations

Implement performance improvements based on recommendations.

### 3. Measure Impact

After changes, run tests again:

```bash
# Run Lighthouse CI
lhci autorun --config=lighthouserc.json

# Compare with baseline
node scripts/compare-performance.js baseline/ latest/
```

### 4. Document Results

Update this document with:
- What was changed
- Performance impact (before/after metrics)
- Lessons learned
- Recommendations for future work

## Performance History

Track performance improvements over time:

| Date | Version | Homepage LCP | Login LCP | Clubs LCP | Notes |
|------|---------|-------------|-----------|-----------|-------|
| 2026-02-02 | v0.1.0 | - | - | - | Initial baseline |

## Additional Resources

- [Web.dev Performance Guide](https://web.dev/performance/)
- [Next.js Performance Docs](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse Scoring Guide](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Core Web Vitals](https://web.dev/vitals/)
