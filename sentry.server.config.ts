import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production",

	// Performance monitoring
	tracesSampleRate: 0.2,

	// Don't send errors without a DSN configured
	enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
