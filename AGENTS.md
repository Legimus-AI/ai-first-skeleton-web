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

### Centralized Env Config

- **All environment variables must be accessed through Vite's `import.meta.env.VITE_*` pattern, never via `process.env`.** Vite statically replaces `import.meta.env.VITE_*` at build time — `process.env` does not exist in the browser and will silently be `undefined`.
- **For typed access, use a centralized env config file** if one exists (e.g., `src/env.ts`), or create one that validates env vars at startup. This gives you type safety, a single source of truth, and early failure if a required variable is missing.
- **When adding new env vars:** prefix with `VITE_` for client-side access. Variables without the `VITE_` prefix are not exposed to the browser bundle (Vite security boundary).

```ts
// src/env.ts — centralized, validated, typed
const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  locale: import.meta.env.VITE_LOCALE ?? 'en-US',
} as const

if (!env.apiUrl) throw new Error('VITE_API_URL is required')

export { env }
```

```ts
// CORRECT — typed, validated, fails fast
import { env } from '@/env'
fetch(`${env.apiUrl}/api/todos`)

// WRONG — untyped, no validation, undefined at runtime
fetch(`${process.env.API_URL}/api/todos`)
```

## Layout Architecture

All layout shells live in `src/layouts/`. The skeleton provides **two layout options** — projects pick one based on DESIGN_BRIEF.md.

```
src/layouts/
├── authed-layout.tsx    ← Vertical sidebar layout (data-heavy admin panels)
├── navbar-layout.tsx    ← Horizontal navbar layout (lighter apps, simpler tools)
├── public-layout.tsx    ← Centered card (login, register)
├── content-area.tsx     ← Layout variants: default | full | narrow | wide
└── nav-items.ts         ← Typed NavItem[] — add entries here for new slices
```

### Choosing a layout

Switch layout by changing **1 import** in `src/routes/_authed.tsx`:

```tsx
// Option A: Vertical sidebar (default — data-heavy admin, many nav items)
import { AuthedLayout } from '@/layouts/authed-layout'

// Option B: Horizontal navbar (lighter, simpler, fewer nav items)
import { AuthedLayout } from '@/layouts/navbar-layout'
```

**Both layouts share:** `nav-items.ts`, `ContentArea`, `UserDropdown`, dark mode, mobile responsive. Slices don't know which layout wraps them — they render inside `ContentArea` regardless.

| Layout | Best for | Mobile behavior |
|--------|----------|----------------|
| **Sidebar** | Data-heavy admin, 5+ nav items, deep hierarchy | Hamburger → overlay sidebar |
| **Navbar** | Lighter tools, 3-5 nav items, public-facing | Hamburger → slide-down menu |

**DESIGN_BRIEF.md guidance:** If Layer 1 answer #5 (Information Density) is "high" → sidebar. If "low/medium" → navbar.

### Layout variants

Routes declare their variant via the `variant` prop on `AuthedLayout`:
- `default` — `max-w-7xl` (CRUD tables, standard pages)
- `full` — no max-width (dashboards, analytics)
- `narrow` — `max-w-2xl` (settings, simple forms)
- `wide` — `max-w-[1400px]` (wide content)

### Shared components

| Component | File | Used by |
|-----------|------|---------|
| UserDropdown | `@/ui/user-dropdown` | Both layouts — avatar, profile link, theme toggle, logout |
| ContentArea | `@/layouts/content-area` | Both layouts — variant-based width constraints |
| NavItems | `@/layouts/nav-items` | Both layouts — data-driven navigation |

### Profile page

`/profile` route exists at `src/routes/_authed/profile.tsx`. Shows user info + edit form. Links from UserDropdown avatar click.

## Adding a New CRUD Slice

**ALWAYS use the generator. NEVER create slice files manually:**

```bash
bun scripts/generate-slice.ts <name>
```

The generator creates ALL required files:
- `packages/shared/src/slices/<name>/schemas.ts` — Zod schemas (SoT)
- `apps/api/src/slices/<name>/` — routes, service, schema, tests
- `apps/web/src/slices/<name>/hooks/use-<name>.ts` — 5 hooks (list, create, update, delete, bulkDelete)
- `apps/web/src/slices/<name>/components/<singular>-list.tsx` — DataTable + CrudPageHeader + Pagination
- `apps/web/src/slices/<name>/components/<singular>-form.tsx` — FormDialog for create/edit
- `apps/web/src/routes/_authed/<name>.tsx` — route file with parseListParams
- Entry in `layouts/nav-items.ts`

Architecture tests verify completeness. If you skip the generator, the tests will catch it.

## Slice structure

```
src/slices/<name>/
├── components/    ← React components (kebab-case files)
├── hooks/         ← TanStack Query hooks (use-*.ts)
└── (no routes.ts — route files live in src/routes/_authed/)
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

## README Sync (MANDATORY)

After ANY of these changes, update `README.md` in the same commit/PR:

- New command/script added to `package.json`
- New environment variable required
- New slice/module created
- New UI component added to `src/ui/`
- Architecture change (new dependency, new pattern, new directory)

**What to update in README:**
- **Commands table** — every `pnpm` script with a one-line description
- **Environment variables** — every required env var with description and example
- **Project structure** — if directories were added/removed/renamed
- **UI components** — available primitives in `src/ui/`
- **Key features** — if user-visible functionality changed

**Rule:** A developer reading ONLY the README should understand what the project does, how to run it, and what commands are available. If they can't, the README is incomplete.

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

## CRUD View Contract (enforced by tests + generator)

Every CRUD list view MUST include ALL of these. The generator creates them. Tests verify them.

| Feature | Component | Rule |
|---------|-----------|------|
| **Bulk delete** | Checkbox column + `useBulkDelete` + bulk action bar | INV-107 |
| **Server pagination** | `Pagination` component + `page` URL param | INV-092, INV-095 |
| **Server search** | `SearchInput` (600ms debounce) + `search` URL param | INV-092, INV-095, INV-108 |
| **Server sort** | `DataTable` sort headers + `sort`/`order` URL params | INV-095 |
| **Create modal** | `FormDialog` + reusable form component | INV-092 |
| **Edit modal** | Same `FormDialog` + pre-populated `defaultValues` | INV-092 |
| **Inline actions** | Edit icon + Delete icon per row (NO dropdown menu) | Convention |
| **Confirm delete** | `ConfirmDelete` dialog on every delete action | INV-106 |
| **Loading skeleton** | `DataTable isLoading` prop | INV-060 |
| **Empty state** | `DataTable emptyMessage` + `emptyAction` (icon + text + CTA) | INV-060 |
| **`keepPreviousData`** | `placeholderData: keepPreviousData` in list hook | INV-097 |
| **Schema validation** | `safeParseResponse()` on all API responses | INV-096 |

### Inline Actions (NOT dropdown menu)

Table rows use direct icon buttons, NOT a three-dot `⋯` dropdown:

```tsx
// ✅ CORRECT — inline icons, immediately visible
render: (item) => (
  <div className="flex justify-end gap-1">
    <Button variant="ghost" size="sm" onClick={() => setEditTarget(item)}>
      <Pencil className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
)

// ❌ WRONG — hidden behind dropdown, extra click
render: (item) => (
  <DropdownMenu>
    <DropdownMenuTrigger><MoreHorizontal /></DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Edit</DropdownMenuItem>
      <DropdownMenuItem>Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
```

**Why:** Inline icons = fewer clicks, immediately scannable. Dropdown = hidden actions, extra interaction.

### Cross-Slice Data (F7: Route-Level Composition)

Slices NEVER import from other slices. If a view needs data from another slice, compose at the route level:

```tsx
// routes/_authed/dashboard.tsx — route composes from multiple slices
import { useTodos } from '@/slices/todos/hooks/use-todos'
import { useProducts } from '@/slices/products/hooks/use-products'
import { DashboardView } from '@/slices/dashboard/components/dashboard-view'

function DashboardPage() {
  const { data: todos } = useTodos({ page: 1 })
  const { data: products } = useProducts({ page: 1 })
  return <DashboardView recentTodos={todos?.data ?? []} recentProducts={products?.data ?? []} />
}
```

The component receives props — never imports hooks from other slices.

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
- Use raw `useMutation` for toggles/inline edits — use `useOptimisticMutation` for instant feedback
- Add animations without `motion-safe:` — always respect `prefers-reduced-motion`
- Animate SVGs directly — wrap in `<span>` and animate the wrapper

## Motion System

Lightweight animation primitives for page transitions, list reveals, and component enter/exit.

**Dependency:** `motion` (tree-shakeable framer-motion). Lazy-load heavy animations with `React.lazy`.

### Available primitives

| Component | File | Purpose |
|-----------|------|---------|
| FadeIn | `@/ui/fade-in` | Fade + slight upward shift on mount. Supports `delay` for staggering |
| PageTransition | `@/ui/animate-presence-wrapper` | Animated page transitions (wrap route outlet) |
| AnimatedListItem | `@/ui/animated-list` | Staggered entrance for list items |

### Timing tokens (`@/lib/motion-config`)

| Token | Duration | Use for |
|-------|----------|---------|
| `duration.fast` | 150ms | Micro-interactions (hover, toggle) |
| `duration.normal` | 200ms | Component enter/exit (modals, dropdowns) |
| `duration.slow` | 300ms | Page transitions |

### Rules

- **Max 200ms** for micro-interactions, **max 300ms** for page transitions
- **`motion-safe:`** prefix for ALL Tailwind CSS animations
- **Never animate SVGs** directly — wrap in `<span>`, animate the wrapper
- **Lazy load** heavy motion components with `React.lazy` + `<Suspense>`
- **Respects `prefers-reduced-motion`** automatically (Motion handles this)

### Usage

```tsx
// Page transitions in _authed layout:
<PageTransition pageKey={pathname}>
  <Outlet />
</PageTransition>

// Fade-in content:
<FadeIn><Card>Appears smoothly</Card></FadeIn>

// Staggered list:
{items.map((item, i) => (
  <AnimatedListItem key={item.id} index={i}>
    <TodoRow todo={item} />
  </AnimatedListItem>
))}
```

## Optimistic Mutations

Use `useOptimisticMutation` from `@/lib/use-optimistic-mutation` for mutations that should feel instant (toggles, inline edits, status changes).

```tsx
const toggle = useOptimisticMutation({
  queryKey: ['todos'],
  mutationFn: (id: string) => api.patch(`/api/v1/todos/${id}`, { completed: true }),
  optimisticUpdate: (old, id) => ({
    ...old,
    data: old.data.map(t => t.id === id ? { ...t, completed: true } : t),
  }),
})
```

**When to use:** Toggles, status changes, inline edits — anything where waiting 200ms for the server feels sluggish.
**When NOT to use:** Creates, deletes, complex mutations with validation — use regular `useMutation` + toast.

---

## Design System (MANDATORY — read `DESIGN_SYSTEM.md` for full spec)

The skeleton follows a **world-class minimalist** design inspired by Linear, Vercel Dashboard, and Supabase.

### Core Principles
1. Single accent color (blue) — everything else is grayscale
2. Layered surfaces: background → card → popover (each visibly distinct)
3. Spacing creates hierarchy — prefer whitespace over borders
4. 150ms transitions on all interactive elements

### Typography (use exactly these)
| Use | Classes |
|-----|---------|
| Page title | `text-2xl font-semibold tracking-tight` |
| Section heading | `text-lg font-semibold` |
| Body text | `text-sm` |
| Secondary text | `text-sm text-muted-foreground` |
| Caption | `text-xs text-muted-foreground` |

### Page Layout
```tsx
<div className="space-y-6">
  <CrudPageHeader title="..." description="..." search={...} action={...} />
  <DataTable ... />
  <Pagination ... />
</div>
```
Always `space-y-6` between page sections. Never `space-y-2`.

### Tables
- Headers: `uppercase tracking-wider text-xs` (auto from TableHead)
- Row hover: `hover:bg-muted/50` (auto from TableRow)
- Row borders: `border-border/50` — subtle, not heavy
- Actions: icon-only ghost buttons (`size="icon" className="h-8 w-8"`)

### Empty States
- Icon inside `h-12 w-12 rounded-full bg-muted` container
- Title: `text-sm font-medium`
- CTA: `Button size="sm"` with icon + label
- Vertical padding: `py-16`

### Badges (semantic)
| Variant | Use for |
|---------|---------|
| `default` | Neutral/primary status |
| `success` | Completed, active |
| `warning` | Pending, caution |
| `destructive` | Error, failed |
| `info` | Informational |

### Cards
- Default: `border-border/50 shadow-sm` (light shadow + subtle border)
- Card titles: `text-lg font-semibold` (not text-2xl)

### Buttons in context
- Primary CTA: `<Button><Plus className="mr-1.5 h-4 w-4" /> Add Item</Button>`
- Table actions: `<Button variant="ghost" size="icon" className="h-8 w-8">`
- Bulk actions: `<Button variant="destructive" size="sm">`

### Do NOT
- Use `space-y-2` for page layout (use `space-y-6`)
- Use text buttons ("Edit") in table action columns (use icon-only buttons)
- Skip the page description in CrudPageHeader
- Use `text-2xl` for card titles (use `text-lg`)
- Add borders where spacing suffices
