# OpenTelemetry Integration

Distributed tracing for the frontend. Correlates browser spans with backend traces via `X-Request-Id`.

## 1. Install

```bash
pnpm add @opentelemetry/sdk-trace-web @opentelemetry/auto-instrumentations-web @opentelemetry/exporter-trace-otlp-http
```

## 2. Create `src/lib/otel.ts`

```ts
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web'
import { registerInstrumentations } from '@opentelemetry/instrumentation'

const collectorUrl = import.meta.env.VITE_OTEL_COLLECTOR_URL

if (collectorUrl) {
  const provider = new WebTracerProvider()

  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new OTLPTraceExporter({ url: `${collectorUrl}/v1/traces` })
    )
  )

  provider.register()

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: [/./],
        },
      }),
    ],
  })
}
```

## 3. Enable in `main.tsx`

Add an import (not pre-commented since OTEL is less common):

```ts
import './lib/otel'
```

## 4. Environment variable

Add to `.env`:

```
VITE_OTEL_COLLECTOR_URL=http://localhost:4318
```

## How it works

- `auto-instrumentations-web` automatically instruments `fetch` calls
- Every API response includes `X-Request-Id` (exposed via CORS `exposeHeaders`)
- The OTEL fetch instrumentation picks up response headers for span attributes
- Backend traces with the same request ID can be correlated in Jaeger/Grafana Tempo

## Exporters

| Backend | Exporter URL |
|---------|-------------|
| Jaeger | `http://localhost:4318` |
| Grafana Tempo | `http://localhost:4318` |
| Honeycomb | `https://api.honeycomb.io` (add API key header) |
