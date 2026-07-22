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
2. **If Layer 1 is empty** → ask the user to fill questions 1-6 first. Do NOT generate final UI without this context.
3. **If filled** → use it as constraints for all visual, layout, density, and interaction decisions.

## Rules

- **Functional components only.** No class components.
- Use TanStack Query for all server state (no local state for API data).
- Use `api` from `@/services/api-client` for all API calls. See [`docs/api-client.md`](docs/api-client.md) for examples.
- Import types from `@repo/shared` for forms (React Hook Form + Zod).
- Tailwind CSS only — no CSS files, no CSS-in-JS.
- Use CVA (`class-variance-authority`) for component variants.
- Use `cn()` helper (`clsx` + `tailwind-merge`) for conditional classes.
- All remaining rules (max file size, one component per file, no hardcoded colors, dark mode, accessibility, security, etc.) are enforced in `INVARIANTS.md`.

### Import Paths

**Always use `@/` alias for cross-directory imports.** Maps `@/` → `src/` (tsconfig + Vite).
Relative `./` only for same-directory or direct siblings. See INV-103.

### Type Organization

Types follow colocation — no `types/` directories or barrel files (INV-027):

| Type category | Where it lives |
|---------------|---------------|
| Domain types | `@repo/shared` — always import, never redefine |
| Component props | Inline in the component file |
| Hook options | Inline in the hook file |
| Form data | Inline via `z.infer<typeof formSchema>` |
| UI primitive props | In the `ui/*.tsx` file |
| Frontend-only service types | In `services/<service>.ts` next to the fetch function |

### Component Patterns

- **No derived state.** Compute from props/query data inline — don't store in `useState`.
- **Stable keys.** Always use unique IDs as `key`, never array index.
- **Logic in hooks, not components.** Components render UI. Business logic in `use-*.ts`.
- **URL state.** Active tab, filters, sort, pagination → URL query params. Refresh must restore exact view.

### Responsive Design (Mobile-First)

- Default styles target mobile; scale up with `sm:`, `md:`, `lg:`, `xl:`.
- `flex` / `grid` with responsive columns. No fixed widths — prefer `max-w-*`.
- Page padding: `p-4 md:p-8`. Tables: `overflow-x-auto`. Sidebar: hamburger on mobile.

### Centralized Env Config

All env vars via `import.meta.env.VITE_*` (never `process.env`). Use a centralized `src/env.ts` for typed access with validation. New vars must be prefixed `VITE_` for client-side access.

### Where to Put New Code (ADR 0012)

| Who uses it? | What it does | Where it goes |
|---|---|---|
| 1 slice only | anything | `slices/<name>/` |
| 2+ slices | HTTP, SSE, WebSocket, browser API | `services/<name>-service.ts` |
| 2+ slices | React hook (no domain entity mentioned) | `hooks/use-<name>.ts` |
| 2+ slices | pure function (no React, no fetch) | `utils/<name>.ts` |
| App-wide | React context provider | `providers/<name>-provider.tsx` |
| 2+ slices | cross-cutting constant | `constants/<domain>.ts` |

**Black-box rule:** "Would this file work verbatim in a different app of the same stack (TanStack, Tailwind) but different domain?"
- **Yes** → top-level (`services/`, `hooks/`, `utils/`, `providers/`)
- **No** (mentions product, assistant, conversation, etc.) → `slices/<name>/`

**Contracts** (enforced by architecture tests):
- `utils/` — no `.tsx`, no `react` imports, no `fetch`/`axios`
- `services/` — no imports from `slices/`
- `hooks/` top-level — no imports from `slices/`; files must start with `use-`
- No grab-bag files (`utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`, `shared.ts`) in any of the above

See the `AGENTS.md` in each folder for the full contract + examples.

## Layout Reasoning (read BEFORE choosing any layout)

The admin sidebar is ONE preset, not THE default. Before building views, resolve the
product archetype from `DESIGN_BRIEF.md` Layer 0 and justify the shell choice:

**Decision rule — look at the DOMINANT user flow:**

| Dominant flow | Use |
|---------------|-----|
| List, filter, create, edit records | `authed-layout` (sidebar) or `navbar-layout` preset |
| Converse, triage threads, inbox | `split-layout` preset |
| Compose, write, edit ONE artifact | `focused-layout` preset |
| Browse list + inspect detail side by side | `split-layout` preset |
| None of the above (canvas, map, player, novel UX) | **Design from scratch** — governed escape hatch below |

**Governed escape hatch (`archetype: custom`):**
1. State in `DESIGN_BRIEF.md` Layer 0 why no preset fits.
2. Design intentionally (use the frontend-design skill if available) — novel layout,
   distinctive visual direction, NOT a generic admin panel.
3. Respect ALL CORE invariants (tokens, a11y, no raw fetch, type-safety, INV-102 widths
   via `ContentArea`). Only PATTERN: CRUD rules are waived — and only because there is
   no `*-list.tsx`.
4. Append the decision to `docs/DECISIONS.ndjson` (INV-034).

**How to build a `custom` surface (the patterns the presets don't give you):**
- **Free layout** (boards, canvases, players, timelines): compose with raw flex/grid + the
  `bleed` ContentArea variant (`context: () => ({ layout: 'bleed' as const })`) so the surface
  is full-bleed and owns its own height/scroll. `src/slices/board/` is the worked example.
- **Persistent chrome** (a bar/toolbar that must survive navigation, e.g. a now-playing bar):
  lift the state into an app-wide provider and render the chrome in a custom shell OUTSIDE the
  route `<Outlet/>` (a sibling layout that exports `AuthedLayout`; swapping the import in
  `_authed.tsx` is the one-line switch).
- **Drag-and-drop / direct manipulation:** there is no DnD dependency by design — use native
  HTML5 DnD (`draggable` + `onDragStart`/`onDragOver`/`onDrop` + `dataTransfer`) and ALWAYS add
  a keyboard/touch fallback (move buttons). `src/slices/board/` shows both.
- **Generated visuals over assets:** the skeleton ships no image assets — prefer token-driven
  generated visuals (e.g. a CSS gradient keyed off an id) so the result stays themeable.

Reference examples — one per archetype family, all passing the same CORE enforcement:
- `src/slices/todos/` — `admin-crud` (DataTable, pagination, the full CRUD contract)
- `src/slices/chat/` — `conversational` (SplitPane, optimistic local append, no `*-list.tsx`)
- `src/slices/editor/` — `focused-tool` (single-artifact composer, content-as-hero, no CRUD)
- `src/slices/board/` — `custom` (full-bleed spatial board: multi-column flex + native drag-and-drop, no preset fit)

**Naming is the opt-in:** the `*-list.tsx` filename suffix is what activates the
PATTERN: CRUD contract (DataTable, Pagination, ConfirmDelete, useBulkDelete). In
non-CRUD slices, do NOT name components `*-list.tsx` unless you want that contract
— e.g. the chat slice uses `conversations.tsx`, not `conversation-list.tsx`.

## Adding a New CRUD Slice

There is no frontend slice generator — copy the reference slice instead:

1. **Copy the structure of `src/slices/todos/`** (the gold CRUD slice) and rename.
2. Follow the CRUD View Contract below — architecture tests verify completeness.
3. For non-CRUD slices, copy the matching reference: `src/slices/chat/` (conversational),
   `src/slices/editor/` (focused-tool), or `src/slices/board/` (custom / free layout). See the
   "Layout Reasoning" section — the CRUD
   contract does not apply to them.

### Slice Structure

```
src/slices/<name>/
├── components/    ← React components (kebab-case files)
├── hooks/         ← TanStack Query hooks (use-*.ts)
└── (no routes.ts — route files live in src/routes/_authed/)
```

### CRUD View Contract (enforced by tests + generator)

Every CRUD list view MUST include:

| Feature | Rule |
|---------|------|
| Bulk delete | Checkbox column + `useBulkDelete` + bulk action bar (INV-107) |
| Server pagination | `Pagination` + `page` URL param (INV-092, INV-095) |
| Server search | `SearchInput` (600ms debounce) + `search` URL param (INV-108) |
| Server sort | `DataTable` sort headers + `sort`/`order` URL params |
| Create/Edit modals | `FormDialog` + reusable form component (INV-110) |
| Inline actions | Edit + Delete icon buttons per row — NO dropdown menu (INV-109) |
| Confirm delete | `ConfirmDelete` dialog on every delete action (INV-106) |
| Loading skeleton | `DataTable isLoading` prop (INV-060) |
| Empty state | `emptyMessage` + `emptyAction` (icon + text + CTA) (INV-060) |
| `keepPreviousData` | `placeholderData: keepPreviousData` in list hook (INV-097) |
| Schema validation | `safeParseResponse()` on all API responses (INV-096) |

Cross-slice data: hooks may cross slices (data), components never cross slices (UI). Document exceptions in architecture test `allowedCrossImports` (INV-111).

Default mutable administrative lists to backend `updatedAt DESC` ordering with a deterministic ID tie-breaker. Tables, selectors, and form option lists preserve server order; do not add an implicit alphabetical client-side sort.

When a provider, integration, or account needs an API key, token, secret, or account identifier for first use, collect it in the creation dialog. Submit metadata and write-only credentials in one atomic backend operation, keep plaintext out of React state/query caches/logs/responses, and retain a separate rotation action for later changes.

## Routing

- File-based via TanStack Router + Vite plugin. Route files in `src/routes/`.
- `routeTree.gen.ts` is auto-generated — do NOT edit.
- Router enables `defaultPreload: 'intent'` — hovering a `<Link>` preloads route code + runs loaders.
- `defaultPreloadStaleTime: 0` ensures preloads always fetch fresh data.
- `defaultViewTransition: true` enables native cross-fade between routes (View Transitions API).

### Route Loaders & queryOptions

Every CRUD list route must have a `loader` that calls `ensureQueryData` with a `queryOptions` factory:

```ts
// In hook file: extract queryOptions factory
export const todosQueryOptions = (params?: Partial<ListQuery>) =>
  queryOptions({ queryKey: [...TODOS_KEY, params], queryFn: async () => { /* fetch */ }, placeholderData: keepPreviousData })

export function useTodos(params?: Partial<ListQuery>) { return useQuery(todosQueryOptions(params)) }

// In route file: wire loader
loader: ({ context }) => context.queryClient.ensureQueryData(todosQueryOptions()),
```

This guarantees data is in cache before the component renders. Combined with hover preloading, navigation feels instant.

## Theming

OKLCH color tokens in `src/styles.css` (shadcn/ui + Tailwind v4 `@theme inline`). Never use hardcoded colors — use theme tokens. For the full design spec, read [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md).

## UI Primitives

Reusable components in `src/ui/` (shadcn/ui copy-paste pattern — we OWN these): Button, Input, Card, Badge, Skeleton, Separator, Sonner, AlertDialog, Dialog, DropdownMenu. Use `cn()` from `src/utils/cn.ts` (only pure helpers live in utils/) to merge classes.

## React Performance (non-obvious rules)

- **No barrel imports.** Import from the specific file, not `index.ts` re-exports.
- **`Promise.all()`** for independent async ops — never sequential awaits.
- **Lazy load** heavy components with `React.lazy()` + `<Suspense>` (>50KB).
- **Lazy state init.** `useState(() => expensiveFn())` not `useState(expensiveFn())`.
- **Immutable array methods.** `toSorted()`, `toReversed()`, `toSpliced()` over mutating versions.
- **`content-visibility: auto`** on long lists/grids for off-screen rendering.
- **Animate wrappers, not SVGs.** Wrap in `<span>` and animate that.

## Do NOT

- Import from `@repo/api` at runtime (only `import type`)
- Create CSS files — use Tailwind classes
- Use `useEffect` for data fetching — use TanStack Query
- Edit `routeTree.gen.ts` — auto-generated
- Use raw `fetch()` — use `api` from `@/services/api-client`
- Use `dangerouslySetInnerHTML` — sanitize with DOMPurify if needed
- Store UI state (tabs, filters, sort) in `useState` alone — persist in URL query params
- Use raw `useMutation` for toggles/inline edits — use `useOptimisticMutation`
- Define utility functions in components — search `utils/` first (`format-date`, `cn`, `api-client`, etc.)

For the complete forbidden patterns list, see `INVARIANTS.md`.

## Reference Docs

Detailed examples and recipes moved out of this file for conciseness:

| Topic | File |
|-------|------|
| API client usage & error handling | [`docs/api-client.md`](docs/api-client.md) |
| Layout architecture & variants | [`docs/layouts.md`](docs/layouts.md) |
| Motion system & animation primitives | [`docs/motion.md`](docs/motion.md) |
| Optimistic mutations | [`docs/optimistic-mutations.md`](docs/optimistic-mutations.md) |
| Pagination examples | [`docs/pagination.md`](docs/pagination.md) |
| E2E testing | [`docs/testing-e2e.md`](docs/testing-e2e.md) |
| i18n / locale awareness | [`docs/i18n.md`](docs/i18n.md) |
| Observability (Sentry, Clarity, OTel) | [`docs/recipes/`](docs/recipes/) |
| Design system (Aether theme) | [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) |
| Anti-thrashing protocol | [`docs/protocols/anti-thrashing.md`](docs/protocols/anti-thrashing.md) |

## Documentation Sync (CRITICAL)

When you change a pattern in this skeleton, you MUST also update the architecture spec in `Legimus-AI/ai-first-architecture` — same commit/PR. Never "later".

## README Sync (MANDATORY)

After adding commands, env vars, slices, UI components, or architecture changes, update `README.md` in the same commit/PR. A developer reading ONLY the README should understand what the project does, how to run it, and what commands are available.

## When Stuck (Anti-Thrashing)

| Failures | Action |
|----------|--------|
| 1 | Retry with different approach |
| 2 | Isolate: write minimal reproducible case |
| 3 | Freeze scope + write failing test |
| 4 | Escalate to human with 3 hypotheses |

Before implementing, declare confidence (1-10). If < 5, write plan only — do not code.
