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
- Use `api` from `@/lib/api-client` for all API calls. See [`docs/api-client.md`](docs/api-client.md) for examples.
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
| Frontend-only service types | In `lib/<service>.ts` next to the fetch function |

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

## Adding a New CRUD Slice

**ALWAYS use the generator. NEVER create slice files manually:**

```bash
bun scripts/generate-slice.ts <name>
```

Architecture tests verify completeness. If you skip the generator, the tests will catch it.

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

Cross-slice data: compose at route level, never import between slices (INV-111).

## Routing

- File-based via TanStack Router + Vite plugin. Route files in `src/routes/`.
- `routeTree.gen.ts` is auto-generated — do NOT edit.

## Theming

OKLCH color tokens in `src/styles.css` (shadcn/ui + Tailwind v4 `@theme inline`). Never use hardcoded colors — use theme tokens. For the full design spec, read [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md).

## UI Primitives

Reusable components in `src/ui/` (shadcn/ui copy-paste pattern — we OWN these): Button, Input, Card, Badge, Skeleton, Separator, Sonner, AlertDialog, Dialog, DropdownMenu. Use `cn()` from `src/lib/cn.ts` to merge classes.

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
- Use raw `fetch()` — use `api` from `@/lib/api-client`
- Use `dangerouslySetInnerHTML` — sanitize with DOMPurify if needed
- Store UI state (tabs, filters, sort) in `useState` alone — persist in URL query params
- Use raw `useMutation` for toggles/inline edits — use `useOptimisticMutation`

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
