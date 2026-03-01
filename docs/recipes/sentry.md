# Sentry Integration

Error tracking + performance monitoring for the frontend.

## 1. Install

```bash
pnpm add @sentry/react
```

## 2. Create `src/lib/sentry.ts`

```ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  beforeBreadcrumb(breadcrumb, hint) {
    // Attach requestId from api-client to fetch breadcrumbs
    if (breadcrumb.category === 'fetch' && hint?.response?.requestId) {
      breadcrumb.data = { ...breadcrumb.data, requestId: hint.response.requestId }
    }
    return breadcrumb
  },
})
```

## 3. Enable in `main.tsx`

Uncomment the import:

```ts
import './lib/sentry'
```

## 4. Wrap ErrorBoundary (optional)

Replace `react-error-boundary` with `Sentry.ErrorBoundary` in `src/components/error-boundary.tsx` for automatic error reporting:

```tsx
import * as Sentry from '@sentry/react'

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return <Sentry.ErrorBoundary fallback={ErrorFallback}>{children}</Sentry.ErrorBoundary>
}
```

## 5. Environment variable

Add to `.env`:

```
VITE_SENTRY_DSN=https://your-key@o0.ingest.sentry.io/0
```

## Correlation

Every API response has `res.requestId` attached by `api-client.ts`. Sentry breadcrumbs include this ID, so you can search Sentry by requestId and match it to backend logs.
