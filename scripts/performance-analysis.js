#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analyzes Next.js bundle size, route performance, and provides recommendations
 */

const fs = require('fs');
const path = require('path');

const PERFORMANCE_REPORT_DIR = path.join(__dirname, '../performance-reports');

// Ensure reports directory exists
if (!fs.existsSync(PERFORMANCE_REPORT_DIR)) {
  fs.mkdirSync(PERFORMANCE_REPORT_DIR, { recursive: true });
}

/**
 * Analyze Next.js build output
 */
function analyzeBuildOutput() {
  const buildDir = path.join(__dirname, '../.next');

  if (!fs.existsSync(buildDir)) {
    console.error('Build directory not found. Run `npm run build` first.');
    return null;
  }

  const buildManifest = path.join(buildDir, 'build-manifest.json');

  if (!fs.existsSync(buildManifest)) {
    console.error('Build manifest not found.');
    return null;
  }

  const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf-8'));

  return {
    pages: Object.keys(manifest.pages || {}),
    totalPages: Object.keys(manifest.pages || {}).length,
    sharedChunks: manifest.sortedPages || []
  };
}

/**
 * Analyze bundle sizes
 */
function analyzeBundleSizes() {
  const statsFile = path.join(__dirname, '../.next/analyze/client.html');

  // Check if webpack-bundle-analyzer output exists
  if (fs.existsSync(statsFile)) {
    console.log('\nBundle analyzer report available at:', statsFile);
  } else {
    console.log('\nTo generate detailed bundle analysis, add @next/bundle-analyzer:');
    console.log('  npm install --save-dev @next/bundle-analyzer');
  }
}

/**
 * Performance recommendations based on project structure
 */
function generateRecommendations() {
  const recommendations = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  // Check for common performance issues
  const componentsDir = path.join(__dirname, '../src/components');
  const pagesDir = path.join(__dirname, '../src/app');

  // Check for large components without code splitting
  if (fs.existsSync(componentsDir)) {
    const components = fs.readdirSync(componentsDir, { recursive: true })
      .filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'));

    recommendations.medium.push({
      title: 'Component Code Splitting',
      description: `Found ${components.length} components. Consider dynamic imports for large components not needed on initial load.`,
      impact: 'Reduces initial bundle size',
      code: `
// Instead of:
import HeavyComponent from '@/components/HeavyComponent';

// Use dynamic import:
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Spinner />
});
      `.trim()
    });
  }

  // Check for image optimization
  recommendations.high.push({
    title: 'Image Optimization',
    description: 'Ensure all images use Next.js Image component for automatic optimization.',
    impact: 'Reduces LCP and bandwidth usage',
    code: `
// Use next/image instead of <img>:
import Image from 'next/image';

<Image
  src="/event-banner.jpg"
  alt="Event"
  width={800}
  height={400}
  priority={isAboveFold}
/>
    `.trim()
  });

  // Font optimization
  recommendations.medium.push({
    title: 'Font Optimization',
    description: 'Use next/font for automatic font optimization and prevention of layout shift.',
    impact: 'Improves CLS and reduces FOIT/FOUT',
    code: `
// In layout.tsx or page:
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }) {
  return <div className={inter.className}>{children}</div>;
}
    `.trim()
  });

  // API route optimization
  recommendations.high.push({
    title: 'API Response Caching',
    description: 'Implement caching strategies for API responses to reduce server load.',
    impact: 'Reduces response time and server costs',
    code: `
// In API routes or React Query:
export const getEvents = async () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};
    `.trim()
  });

  // React Query optimization
  recommendations.medium.push({
    title: 'React Query Prefetching',
    description: 'Prefetch data for likely next pages to improve perceived performance.',
    impact: 'Reduces time to interactive on navigation',
    code: `
// Prefetch on hover or mount:
const queryClient = useQueryClient();

const prefetchEventDetails = (eventId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId)
  });
};

<Link
  href={\`/events/\${event.id}\`}
  onMouseEnter={() => prefetchEventDetails(event.id)}
>
  View Event
</Link>
    `.trim()
  });

  // Lazy loading
  recommendations.high.push({
    title: 'Route-based Code Splitting',
    description: 'Leverage Next.js automatic code splitting and add manual splits for heavy features.',
    impact: 'Reduces initial bundle size significantly',
    code: `
// For heavy features not needed immediately:
const AdminPanel = dynamic(() => import('@/components/features/AdminPanel'), {
  loading: () => <LoadingState />,
  ssr: false // If not needed for SEO
});
    `.trim()
  });

  // Database query optimization
  recommendations.critical.push({
    title: 'Backend Query Optimization',
    description: 'Add indexes to frequently queried fields and implement pagination.',
    impact: 'Critical for scalability - reduces API response time',
    code: `
// In Entity Framework:
modelBuilder.Entity<Event>()
  .HasIndex(e => e.StartTime)
  .HasIndex(e => e.Status)
  .HasIndex(e => new { e.IsPublic, e.StartTime });

// Implement pagination:
var events = await _context.Events
  .Where(e => e.StartTime > DateTime.UtcNow)
  .OrderBy(e => e.StartTime)
  .Skip((page - 1) * pageSize)
  .Take(pageSize)
  .ToListAsync();
    `.trim()
  });

  // Monitoring
  recommendations.high.push({
    title: 'Performance Monitoring',
    description: 'Implement Web Vitals monitoring to track real user performance.',
    impact: 'Enables data-driven optimization decisions',
    code: `
// In _app.tsx or layout.tsx:
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

// Or custom Web Vitals reporting:
export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics endpoint
}
    `.trim()
  });

  return recommendations;
}

/**
 * Generate performance report
 */
function generateReport() {
  console.log('='.repeat(80));
  console.log('PERFORMANCE ANALYSIS REPORT');
  console.log('Generated:', new Date().toISOString());
  console.log('='.repeat(80));

  const buildInfo = analyzeBuildOutput();

  if (buildInfo) {
    console.log('\n📦 BUILD ANALYSIS');
    console.log('-'.repeat(80));
    console.log(`Total Pages: ${buildInfo.totalPages}`);
    console.log(`Pages: ${buildInfo.pages.join(', ')}`);
  }

  console.log('\n⚡ PERFORMANCE RECOMMENDATIONS');
  console.log('-'.repeat(80));

  const recommendations = generateRecommendations();

  // Critical issues
  if (recommendations.critical.length > 0) {
    console.log('\n🚨 CRITICAL (Immediate attention required):\n');
    recommendations.critical.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log(`   Impact: ${rec.impact}\n`);
    });
  }

  // High priority
  if (recommendations.high.length > 0) {
    console.log('\n🔴 HIGH PRIORITY:\n');
    recommendations.high.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log(`   Impact: ${rec.impact}\n`);
    });
  }

  // Medium priority
  if (recommendations.medium.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY:\n');
    recommendations.medium.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log(`   Impact: ${rec.impact}\n`);
    });
  }

  // Save detailed report
  const reportPath = path.join(PERFORMANCE_REPORT_DIR, `report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    buildInfo,
    recommendations
  }, null, 2));

  console.log('\n📄 DETAILED REPORT');
  console.log('-'.repeat(80));
  console.log(`Full report saved to: ${reportPath}`);

  console.log('\n💡 NEXT STEPS');
  console.log('-'.repeat(80));
  console.log('1. Run `npm run build` to analyze production bundle');
  console.log('2. Install Lighthouse CI: npm install -g @lhci/cli');
  console.log('3. Run: lhci autorun --config=lighthouserc.json');
  console.log('4. Consider adding @vercel/analytics for real-user monitoring');
  console.log('5. Use Chrome DevTools Performance tab for runtime profiling');

  analyzeBundleSizes();

  console.log('\n' + '='.repeat(80));
}

// Run analysis
generateReport();
