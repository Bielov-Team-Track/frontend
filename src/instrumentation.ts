import * as Sentry from "@sentry/nextjs";
import { registerOTel } from '@vercel/otel';

export async function register() {
  // OpenTelemetry distributed tracing → OTel Collector → Grafana Tempo
  // Must be registered BEFORE Sentry to claim the global tracer provider
  registerOTel({
    serviceName: 'frontend',
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: [
          /^https?:\/\/localhost:8000/,
          /^https?:\/\/api\.volleyspike\.app/,
          // Docker bridge: frontend container → caddy → services
          /^https?:\/\/caddy/,
        ],
        ignoreUrls: [
          /\/_next\//,
          /\/favicon\.ico/,
          /\.(png|jpg|svg|css|js|woff2?)$/,
        ],
      },
    },
  });

  // Sentry error tracking (tracing disabled — handled by OTel above)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
