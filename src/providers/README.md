# `providers/` — React Context Providers

Application-level React components that wrap the tree with context (theme, query client, auth, i18n). Peer to `slices/`, `services/`, `hooks/`, `utils/`, `constants/`.

## Contract

- **Every file is `.tsx`** — providers render JSX
- **Exports a Provider component + a hook to read its context** (e.g., `ThemeProvider` + `useTheme()`)
- **No slice imports** — providers are infrastructure; domain context belongs in `slices/<X>/`
- **Colocated hook** — the `use-<name>()` hook that reads the context stays in the same file as the provider

## File naming

One provider per file:

- `theme-provider.tsx` — dark/light/system theme + `useTheme()`
- `query-provider.tsx` — TanStack Query `QueryClientProvider` setup (when customized)
- `auth-provider.tsx` — authentication state (if not a slice)

## When to add a file here

| Scope | Location |
|-------|----------|
| Global app-wide context | `providers/<name>-provider.tsx` (here) |
| Domain context (scoped to one feature tree) | `slices/<name>/<name>-provider.tsx` |
| Pure styling primitive | `ui/<name>.tsx` |

## Anti-patterns

```tsx
// ❌ Domain provider in top-level
// providers/product-context.tsx  // NO — belongs in slices/products/

// ❌ Separating the hook from the provider
// providers/theme-provider.tsx + hooks/use-theme.ts  // NO — colocate

// ❌ Grab-bag
// providers/app.tsx  // ❌ name by purpose (theme-provider, auth-provider)
```

See ADR 0012 (frontend-structure) in ai-first-architecture spec.
