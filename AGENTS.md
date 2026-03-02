# Web Frontend — Agent Guidelines

React 19 SPA with Vite, TanStack Router, TanStack Query, and Tailwind CSS.

## Commands

| Task | Command |
|------|---------|
| Dev | `pnpm dev` |
| Build | `pnpm build` |
| Test | `pnpm test` |
| Type check | `pnpm typecheck` |

## Design Brief (MANDATORY)

Before generating any new view, page, or component with visual/interaction decisions:

1. **Read `DESIGN_BRIEF.md`** at the repo root (or `apps/web/DESIGN_BRIEF.md`)
2. **If Layer 1 is empty** → ask the user to fill questions 1-6 first. Do NOT generate final UI without this context — only wireframes/exploratory layouts.
3. **If filled** → use it as constraints for all visual, layout, density, and interaction decisions.

The Design Brief ensures consistent UI across sessions and agents. It captures the vertical, user profile, error cost, and trust model — which determine UI patterns more than aesthetic preferences.

## Rules

- **Functional components only.** No class components.
- **One component per file.** File name = component name. AI agents can't grep components in multi-component files.
- **Max ~200 lines per file.** Split into subcomponents if larger.
- **Composition over props.** If a component has >5 props, split into subcomponents. Prefer children/slots over mega-prop objects.
- Use TanStack Query for all server state (no local state for API data)
- Use `api` from `@/lib/api-client` for all API calls (backend-agnostic fetch wrapper)
- Import types from `@repo/shared` for forms (React Hook Form + Zod)
- Tailwind CSS only — no CSS files, no CSS-in-JS
- Use CVA (`class-variance-authority`) for component variants
- Use `cn()` helper (`clsx` + `tailwind-merge`) for conditional classes

### Import Paths

**Always use the `@/` alias for cross-directory imports.** The alias maps `@/` → `src/` (configured in `tsconfig.json` and Vite).

```ts
// CORRECT — deterministic, works from any file
import { api } from '@/lib/api-client'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/button'
import { useTodos } from '@/slices/todos/hooks/use-todos'

// WRONG — fragile, error-prone level counting
import { api } from '../../../lib/api-client'
import { Button } from '../../ui/button'
```

**Relative imports (`./`) are only for same-directory or direct sibling files:**

```ts
// OK — same directory
import { TodoForm } from './TodoForm'
import type { TodoFormProps } from './types'
```

**Why:** AI agents generate imports automatically. `@/lib/api-client` is always correct regardless of file depth. `../../../lib/api-client` requires counting directory levels — one mistake breaks the build silently.

### Type Organization

**Never create `types/` directories or `types.ts` barrel files.** Types follow colocation rules:

| Type category | Where it lives | Example |
|---------------|---------------|---------|
| Domain types (`Todo`, `CreateTodo`, `TodoListResponse`) | `@repo/shared` — always import, never redefine | `import type { Todo } from '@repo/shared'` |
| Component props | Inline in the component file | `interface TodoFormProps { todo?: Todo }` |
| Hook options | Inline in the hook file | `interface UseTodosOptions { page?: number }` |
| Form data | Inline via Zod infer | `type FormData = z.infer<typeof formSchema>` |
| UI primitive props | In the `ui/*.tsx` file | `export type ButtonProps = ...` |
| Frontend-only service types | In `lib/<service>.ts` next to the fetch function | `interface GeocodingResult { ... }` |

**Key rules:**
- **Never duplicate types from `@repo/shared`** — if a type exists in shared, import it. Redefining causes silent drift.
- **No standalone type files** — types live next to the code that uses them (colocation > organization by file type).
- **The frontend never talks to external APIs directly** — all data flows through the backend. If that changes, create `lib/<service>.ts` with types + fetch function together.

### Component Patterns

- **No derived state.** If a value can be computed from props or query data, derive it inline — don't store it in `useState`. Example: `const isEmpty = items.length === 0` (not `const [isEmpty, setIsEmpty] = useState(false)`).
- **Stable keys in lists.** Always use unique IDs as `key`, never array index. Index keys cause subtle bugs with reordering and state.
- **Logic in hooks, not components.** Components render UI. Business logic, data transformations, and complex state belong in custom hooks (`use-*.ts`).
- **Persist UI state in URL query params.** All user-facing config (active tab, selected filters, sort order, pagination, selections) MUST be reflected in URL query params. Initialize state from params on mount, sync changes back via `replaceState`. Page refresh must restore the exact view — never lose user context.

```ts
// CORRECT — state survives refresh, shareable URLs
const [tab] = useSearch({ from: '/dashboard', select: (s) => s.tab ?? 'overview' })

// WRONG — state lost on refresh
const [tab, setTab] = useState('overview')
```

**Why:** Users expect browser back/forward and refresh to preserve their view. Shareable URLs with state reduce support friction. AI agents can link directly to specific views.

### Responsive Design (Mobile-First)

All components and views MUST be responsive:

- Default styles target mobile (`text-sm`, single column)
- Scale up with `sm:`, `md:`, `lg:`, `xl:` prefixes
- Use `flex` / `grid` with responsive columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Never use fixed widths — prefer `max-w-*` and responsive breakpoints
- Page padding: `p-4 md:p-8` (not `p-8` — too much on mobile)
- Headings: `text-2xl md:text-3xl` (not `text-3xl`)
- Page headers with action buttons: `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`
- Tables: wrap in `overflow-x-auto` container for horizontal scroll on mobile
- Sidebar layout: hidden on mobile with hamburger menu (`md:hidden` / `hidden md:block`), overlay with backdrop on mobile

### Dark Mode

Every new component MUST work in both light and dark mode:

- All tokens auto-switch when `.dark` class is on root — zero extra work if you use theme tokens
- Never hardcode `bg-white`, `text-black` — use `bg-background`, `text-foreground`
- Shadows are invisible in dark mode — use `border` for elevation instead

### No Hardcoded Colors

- **No Tailwind color scales** — use semantic tokens (`text-muted-foreground` not `text-gray-500`)
- **No arbitrary hex values** — never write `bg-[#E54370]` or `text-[#fff]` in components. Add new colors as tokens in `src/styles.css`, then reference via Tailwind.

### Typography & Motion

- **Density:** `text-sm` for body, `text-xs` for metadata, `tracking-tight` for headings
- **Transitions:** Add `transition-colors duration-150` on all interactive elements (buttons, links, cards)
- **Respect `prefers-reduced-motion`:** Use `motion-safe:` prefix for animations. No infinite animations that block interaction.

### UI States

Every data-driven component must handle all states:

| State | Pattern |
|-------|---------|
| **Loading** | `<Skeleton />` placeholders matching final layout size (anti-CLS) |
| **Empty** | Descriptive message + call-to-action |
| **Error** | Inline message or toast via `sonner` |
| **Success** | Toast for mutations |

**Skeleton loading over spinners/overlays:** Always use `<Skeleton />` placeholders that match the final layout shape and size. Never use spinning overlays, full-page loaders, or generic "Loading..." text. Skeletons prevent cumulative layout shift (CLS) and give users a preview of what's coming.

**Layout stability:** Reserve space for async content — skeletons must match the final layout dimensions. Images must have explicit `width`/`height` or `aspect-ratio`.

### Forms & Mutations

- **Every field must have a `<label>`.** No floating inputs without accessible labels.
- **Anti double-submit:** Disable submit button + show loading state during mutations. Use `isPending` from `useMutation`.
- **Destructive actions = confirmation.** Delete/irreversible operations require a confirm dialog or undo toast. Never delete on single click.

### Accessibility

- All interactive elements: visible `:focus-visible` styles (`focus-visible:ring-2`)
- Semantic HTML: `<button>` for actions, `<a>` for navigation, `<main>`/`<nav>`/`<aside>` for landmarks
- Descriptive text for buttons/links (no "Click here"), `alt` text on images
- Links with `target="_blank"` must include `rel="noopener noreferrer"`

### Security

- **Never use `dangerouslySetInnerHTML`** unless content is sanitized with a dedicated library (e.g., DOMPurify)
- **No secrets in frontend code.** All env vars exposed to the browser are PUBLIC — never store API keys, tokens, or credentials
- **Validate user-provided URLs** before rendering in `href`/`src` — block `javascript:` protocol

## Slice structure

```
src/slices/<name>/
├── components/    ← React components (PascalCase files)
├── hooks/         ← TanStack Query hooks (use-*.ts)
└── routes.ts      ← TanStack Router route (if slice has its own page)
```

## Routing

- File-based routing via TanStack Router + Vite plugin
- Route files in `src/routes/`
- `routeTree.gen.ts` is auto-generated — do NOT edit manually
- Add to `.gitignore`: `routeTree.gen.ts`

## API calls

```ts
// Backend-agnostic API client — works with any AI-First Skeleton backend
import { api } from '@/lib/api-client'
import { throwIfNotOk } from '@/lib/api-error'

// GET with query params
const res = await api.get('/api/todos', { page: '1', limit: '20' })
await throwIfNotOk(res)
const json = await res.json()

// POST with body
const res = await api.post('/api/todos', { title: 'Buy milk' })

// PATCH with path param + body
const res = await api.patch(`/api/todos/${id}`, { completed: true })

// DELETE
const res = await api.delete(`/api/todos/${id}`)
```

Response types come from `@repo/shared` (Zod schemas), validated at runtime.

## Theming system

OKLCH color tokens in `src/styles.css` — shadcn/ui pattern with Tailwind v4 `@theme inline`.

**Never use hardcoded colors.** Always use theme tokens:

| Instead of | Use |
|------------|-----|
| `text-gray-500` | `text-muted-foreground` |
| `text-red-500` | `text-destructive` |
| `bg-white` | `bg-background` |
| `bg-gray-100` | `bg-muted` |
| `border-gray-200` | `border-border` |

Available tokens: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`.

Dark mode: add class `dark` to root element — all tokens auto-switch.

## UI primitives

Reusable components in `src/ui/` (shadcn/ui copy-paste pattern — we OWN these):

| Component | File | Notes |
|-----------|------|-------|
| Button | `button.tsx` | CVA variants: primary, destructive, outline, secondary, ghost, link |
| Input | `input.tsx` | Styled with theme tokens |
| Card | `card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Badge | `badge.tsx` | CVA variants: default, secondary, destructive, outline |
| Skeleton | `skeleton.tsx` | Loading placeholder |
| Separator | `separator.tsx` | Horizontal/vertical divider |
| Sonner | `sonner.tsx` | Toast notifications (via `sonner` library) |
| AlertDialog | `alert-dialog.tsx` | Confirmation for destructive actions |
| Dialog | `dialog.tsx` | Modal forms and detail views |
| DropdownMenu | `dropdown-menu.tsx` | Row actions in tables/lists |

Use `cn()` from `src/lib/cn.ts` to merge classes: `cn('base-class', conditional && 'active-class')`.

## Error handling

All API errors are typed and structured:

```typescript
import { throwIfNotOk } from '@/lib/api-error'

const res = await api.get('/api/todos')
await throwIfNotOk(res) // throws ApiError { code, message, requestId }
```

Error codes from `@repo/shared`: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

For granular error handling:

```typescript
import { parseApiError } from '@/lib/api-error'

const error = await parseApiError(res) // { code, message, requestId? }
if (error.code === 'NOT_FOUND') { /* handle */ }
```

## Pagination

List hooks accept optional `ListQuery` params:

```typescript
import { useTodos } from '@/slices/todos/hooks/use-todos'

// Default: page 1, limit 20
const { data } = useTodos()

// With filters
const { data } = useTodos({ page: 2, search: 'buy', sort: 'createdAt', order: 'desc' })

// Access metadata
data?.meta.total      // total items
data?.meta.totalPages // total pages
data?.meta.hasMore    // more pages available
```

## E2E Testing

E2E tests live at **monorepo root** `e2e/`, not inside `apps/web/`. They test user-visible behavior through the browser.

**Frontend responsibilities for E2E:**

- Use semantic selectors: `getByRole()`, `getByText()`, `getByPlaceholder()` (preferred)
- Add `data-testid` attributes only when semantic selectors are ambiguous
- Test user-visible behavior, not implementation details (don't assert on CSS classes or internal state)
- Empty states, loading states, and error messages should be testable via text content

**Run E2E:** `pnpm test:e2e` from monorepo root (not from `apps/web/`).

## i18n (Locale Awareness)

All date and number formatting must use the configured locale:

- **Import locale:** `import { locale } from '@/env'`
- **Date formatting:** `new Intl.DateTimeFormat(locale, options).format(date)`
- **Number formatting:** `new Intl.NumberFormat(locale, options).format(number)`
- **Never hardcode locale strings** — always use `locale` constant
- **Text direction:** Components should support `dir="rtl"` for future RTL locales (avoid hardcoded `left`/`right`, use `start`/`end` in Tailwind)

### Not Included (Future)

This skeleton provides locale awareness for formatting only. Multi-language support requires:
- Translation files (e.g., `i18next`, `react-intl`)
- Language switcher component
- Route-level locale detection

## Documentation Sync (CRITICAL)

When you change a pattern in this frontend skeleton, you MUST also update the architecture spec:

1. **What triggers a spec update:** New UI convention, new component pattern, new routing approach, changed state management, new testing pattern
2. **Where to update:** `Legimus-AI/ai-first-architecture` — edit the relevant doc in `docs/`, bump version in `CHANGELOG.md`
3. **When:** Same commit/PR as the skeleton change. Never "later".

## When Stuck (Anti-Thrashing Protocol)

If you hit repeated failures on the same task:

| Failures | Action |
|----------|--------|
| 1 | Retry with different approach |
| 2 | Isolate: write minimal reproducible case |
| 3 | Freeze scope + write failing test |
| 4 | Escalate to human with 3 hypotheses |

Full protocol: [`docs/protocols/anti-thrashing.md`](docs/protocols/anti-thrashing.md)

Before implementing, declare confidence (1-10). If < 5, write plan only — do not code.

## Observability

The skeleton is pre-wired for observability tools (Sentry, Clarity, OpenTelemetry) without including them as dependencies.

### What's in place

- **`X-Request-Id` exposed via CORS** — the backend includes `exposeHeaders: ['X-Request-Id']`, so browser JS can read the header
- **`res.requestId` on all API responses** — `api-client.ts` extracts `X-Request-Id` and attaches it as `res.requestId` on every `Response` object (not just errors)
- **Structured debug payload in ErrorBoundary** — "Copy debug info" button copies JSON with `message`, `requestId`, `code`, `url`, `timestamp`, `userAgent`
- **Commented import slots in `main.tsx`** — uncomment `import './lib/sentry'` or `import './lib/clarity'` to enable

### Adding an observability tool

Step-by-step recipes in `docs/recipes/`:

| Tool | Recipe | What it does |
|------|--------|-------------|
| Sentry | [`sentry.md`](docs/recipes/sentry.md) | Error tracking + performance traces |
| Microsoft Clarity | [`clarity.md`](docs/recipes/clarity.md) | Session replay + heatmaps |
| OpenTelemetry | [`opentelemetry.md`](docs/recipes/opentelemetry.md) | Distributed tracing (Jaeger/Tempo) |

Each integration is a 1-file addition (`src/lib/<tool>.ts`) + env var.

## React Performance (non-obvious rules)

These are patterns an AI agent won't follow by default — enforce them:

- **No barrel imports.** Import from the specific file, not from `index.ts` re-exports. Barrel files defeat tree-shaking and increase bundle size: `import { Button } from '@/ui/button'` not `import { Button } from '@/ui'`.
- **`Promise.all()` for independent async ops.** Never `await` sequentially when calls don't depend on each other: `const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()])`.
- **Lazy load heavy components.** Use `React.lazy()` + `<Suspense>` for routes and components over ~50KB (charts, editors, modals with rich content).
- **Lazy state initialization.** When initial state is expensive to compute, pass a function: `useState(() => computeExpensiveDefault())` not `useState(computeExpensiveDefault())`.
- **Immutable array methods.** Use `toSorted()`, `toReversed()`, `toSpliced()` instead of mutating `sort()`, `reverse()`, `splice()`. Prevents accidental state mutation.
- **`content-visibility: auto`** on long lists/grids with many items. Skips rendering off-screen items. Add to the list container: `className="[content-visibility:auto] [contain-intrinsic-size:auto_500px]"`.
- **Animate wrappers, not SVGs.** Never put `transition-*` or `animate-*` directly on `<svg>`. Wrap in a `<span>` or `<div>` and animate that — SVG animation triggers expensive repaints.
- **Minimize RSC serialization.** When passing data across server/client boundaries, send only the fields the client needs — not full database objects.

## Do NOT

- Import from `@repo/api` at runtime (only `import type` for AppType)
- Create CSS files — use Tailwind classes
- Use `useEffect` for data fetching — use TanStack Query
- Edit `routeTree.gen.ts` — it's auto-generated
- Use hardcoded colors (`text-gray-*`, `bg-white`, `[#hex]`) — use theme tokens
- Use raw `fetch()` — use the `api` client from `@/lib/api-client`
- Use array index as `key` in lists — use unique IDs
- Store derived state in `useState` — compute inline
- Put multiple components in one file — one component per file
- Use `dangerouslySetInnerHTML` — sanitize with DOMPurify if absolutely needed
- Delete without confirmation — destructive actions need confirm dialog or undo
- Hardcode locale in Intl APIs — always use `locale` from `@/env`
- Create `types/` directories or `types.ts` files — types live next to the code that uses them
- Redefine types from `@repo/shared` — always import, never duplicate
- Use spinning overlays or generic loaders — use `<Skeleton />` placeholders
- Use relative paths (`../../`) for cross-directory imports — use `@/` alias instead
- Store UI state (tabs, filters, sort) in `useState` alone — persist in URL query params so refresh restores the view
