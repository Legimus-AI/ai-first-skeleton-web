# Invariants

> Rules that must NEVER be broken. Violating any of these is a blocking issue.

## Governance

1. **Zero `any` types.** Biome enforces `noExplicitAny: "error"` and `noImplicitAnyLet: "error"`. Use Zod inference, generics, or `unknown` with narrowing. The ONLY escape: `biome-ignore` with library name and specific technical justification.
2. **Zero `biome-ignore` without justification.** Every suppression must include the library name and a clear reason. Blanket suppressions are forbidden.
3. **Zero non-null assertions.** Biome enforces `noNonNullAssertion: "error"`. Use narrowing guards (`if (!x) throw`) instead of `x!`.
4. **Strict TypeScript flags are non-negotiable.** `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes` — must remain enabled. Never weaken tsconfig.json strictness.

## Schema

5. **Zod is the single source of truth.** All API response types and form schemas are derived from `@repo/shared` via `z.infer<>`. Never define a type manually that duplicates a Zod schema.
6. **Never redefine types from `@repo/shared`.** If a type exists in shared, import it. Redefining causes silent drift.

## Data Fetching

7. **No raw `fetch()` calls.** All API calls go through `@/utils/api-client`. Never use raw `fetch()`.
8. **No `useEffect` for data fetching.** Use TanStack Query hooks.
9. **No local state for server data.** Use TanStack Query for all server state.
10. **CRUD hooks must export a `queryOptions` factory.** Every list query must be extractable via `queryOptions()` from `@tanstack/react-query`. The hook wraps it: `useX = (params) => useQuery(xQueryOptions(params))`. This enables route loaders and prefetching outside React.
11. **CRUD list routes must have a `loader`.** Every route with a list view must call `context.queryClient.ensureQueryData(xQueryOptions())` in its `loader`. This guarantees data is cached before the component renders.

## Styling

12. **No CSS files.** Tailwind classes only, CVA for variants.
13. **No hardcoded colors.** Never use `bg-white`, `text-black`, `text-gray-*`, `bg-[#hex]`. Use semantic theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`).
14. **Dark mode must work.** Every component must work in both light and dark mode using theme tokens.

## Components

15. **One component per file.** File name = component name.
16. **One file = one responsibility.** Soft cap ~300 lines (add file-level comment justifying cohesion if exceeded). Hard cap 800 lines (split mandatory). Never split artificially — cross-file navigation costs more than a long cohesive file for AI agents.
17. **No `dangerouslySetInnerHTML`.** Never use without DOMPurify sanitization. XSS is a blocking vulnerability.
18. **No array index as `key`.** Biome enforces `noArrayIndexKey: "error"`. Always use unique IDs (`key={item.id}`).
19. **No derived state in `useState`.** If a value can be computed from props or query data, derive it inline.

## Lib Reuse

112. **No local redefinitions of `utils/` exports.** If `utils/` exports a function, slices must import it — never redefine locally. Duplicating utilities causes drift and bloat.

## Security

20. **No secrets in frontend code.** All env vars exposed to the browser are PUBLIC — never store API keys, tokens, or credentials.
21. **Validate user-provided URLs** before rendering in `href`/`src` — block `javascript:` protocol.

## UI States

22. **Every data-driven component handles all states:** Loading (skeleton placeholders), Empty (descriptive message + CTA), Error (inline message or toast), Success (toast for mutations).
23. **Skeleton loading preferred over spinners.** Use `<Skeleton />` placeholders matching final layout dimensions — never spinning overlays or generic loaders.

## Forms & Interactions

24. **Every field must have a `<label>`.** No inputs without accessible labels.
25. **Anti double-submit.** Disable submit button + show loading state during mutations using `isPending`.
26. **Destructive actions require confirmation.** Delete/irreversible operations require a confirm dialog. Never delete on single click.

## Accessibility

27. **Visible focus styles.** All interactive elements must have `:focus-visible` styles.
28. **Semantic HTML.** `<button>` for actions, `<a>` for navigation, landmark elements for page structure.

## Type Organization

29. **No `types/` directories or `types.ts` barrel files.** Types live next to the code that uses them (colocation > organization by file type).

## Layout Architecture

100. **Layouts ONLY in `layouts/`.** Layout shells (sidebar, centered card, etc.) live in `src/layouts/`. No layout components in `components/` or `slices/`. `components/` is for app-level non-layout components only (e.g., error-boundary).
101. **Navigation must be data-driven.** All nav items live in `layouts/nav-items.ts` as a typed array. `authed-layout.tsx` imports and renders from this array. No hardcoded `<Link>` in the layout shell.
102. **No `max-w-*` in layout files except `content-area.tsx`.** Width constraints are managed by layout variants (`default` | `full` | `narrow` | `wide`) in `content-area.tsx` only.
103. **No deep relative imports.** Imports with `../../../` or deeper are forbidden. Use `@/` alias for all cross-directory imports.
104. **CRUD slices must have a nav entry.** Every slice with a `*-list.tsx` component must have a corresponding entry in `layouts/nav-items.ts`.
105. **Routes with `beforeLoad` must have `pendingComponent`.** Prevents white flash during async operations like auth checks.
106. **CRUD list components must use `ConfirmDelete`.** Every list with delete actions must import and use `ConfirmDelete` from `@/ui/confirm-delete`. No single-click deletes.
107. **CRUD hooks must export `useBulkDelete`.** Every CRUD slice must have a bulk delete hook using `useBulkDelete()` from `@/utils/use-bulk-delete`. Bulk operations are mandatory.
108. **SearchInput debounce is 600ms.** The `SearchInput` component in `@/ui/search-input.tsx` uses a 600ms debounce. Do not change this value without updating the invariant.

## CRUD View Contract

109. **Inline action icons, not dropdown menus.** Table rows use direct Edit + Delete icon buttons. Never use `DropdownMenu` / three-dot `⋯` for row actions — inline icons are immediately visible, fewer clicks.
110. **Create and Edit use modal dialogs.** New entities open a `FormDialog`. Editing opens the same `FormDialog` pre-populated with `defaultValues`. Only use dedicated pages for complex entities (>6 fields, tabs, nested data).
111. **Cross-slice composition rules.** Slices NEVER import **components** from other slices (UI coupling). Slices MAY import **hooks** from other slices when the view is a composed feature that genuinely needs cross-domain data (e.g., detail view + analytics, config form + related entities). For simple cases, routes compose data and pass as props. For complex composed views (tabs, panels), the component owns its data fetching via cross-slice hooks. Document each exception in the architecture test's `allowedCrossImports`.

## Design System Artifacts

200. **DESIGN_SYSTEM.md must exist and be complete.** Must contain all required sections: Design Principles, Color Tokens, Typography, Spacing, Component Patterns, Motion System, Responsive Strategy, Screen-Type Patterns, Quality Checklist. Enforced by architecture test.
201. **DESIGN_BRIEF.md must exist and be filled.** The brief defines WHO uses this product and WHY. An empty template is a violation — answers must be present. Without a brief, design decisions are arbitrary. Run `/design-audit` to fill it.
202. **styles.css must define semantic tokens.** Required tokens: `--background`, `--foreground`, `--card`, `--primary`, `--border`, `--muted`. No project ships without a themed palette.

## Testing

30. **Architecture rules are tested.** INVARIANTS rules are enforced by `src/__tests__/architecture.test.ts`. Adding a new invariant means adding a corresponding test.

## Documentation Sync

31. **Spec must match implementation.** If you change a pattern in the skeleton, update the architecture spec in the same commit or PR. Documentation drift is a bug.

### Plan-First

32. **Every feature starts with a plan** — create `docs/plans/<feature>.md` from template before coding. Confidence < 5 = plan only, no implementation.

### Operational

33. **Anti-thrashing gate** — 4 consecutive failures on same task = mandatory human escalation. Never brute-force past repeated failures.
34. **Decisions are logged** — append to `docs/DECISIONS.ndjson` when choosing between alternatives. Never modify or delete existing entries.
