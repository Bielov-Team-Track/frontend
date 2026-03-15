import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production",

	// Tracing now handled by OpenTelemetry → Grafana Tempo
	tracesSampleRate: 0,

	// Prevent Sentry from registering its own OTel instrumentation,
	// which would conflict with @vercel/otel. Available in Sentry SDK v8+.
	skipOpenTelemetrySetup: true,

	// Don't send errors without a DSN configured
	enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
