import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production",

	// Performance monitoring — sample 20% of transactions
	tracesSampleRate: 0.2,

	// Session replay — capture 5% of sessions, 100% on error
	replaysSessionSampleRate: 0.05,
	replaysOnErrorSampleRate: 1.0,

	integrations: [
		Sentry.replayIntegration({
			maskAllText: false,
			blockAllMedia: false,
		}),
		Sentry.browserTracingIntegration(),
	],

	// Don't send errors without a DSN configured
	enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

	// Filter out noisy errors
	ignoreErrors: [
		// Browser extensions
		"ResizeObserver loop",
		// Network errors handled by our own error system
		"Network Error",
		"Failed to fetch",
		"Load failed",
		// Auth redirects (not real errors)
		"UNAUTHORIZED",
		"TOKEN_EXPIRED",
	],
});
