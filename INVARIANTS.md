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

7. **No raw `fetch()` calls.** All API calls go through `@/lib/api-client`. Never use raw `fetch()`.
8. **No `useEffect` for data fetching.** Use TanStack Query hooks.
9. **No local state for server data.** Use TanStack Query for all server state.

## Styling

10. **No CSS files.** Tailwind classes only, CVA for variants.
11. **No hardcoded colors.** Never use `bg-white`, `text-black`, `text-gray-*`, `bg-[#hex]`. Use semantic theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`).
12. **Dark mode must work.** Every component must work in both light and dark mode using theme tokens.

## Components

13. **One component per file.** File name = component name.
14. **Max ~300 lines per file.** Split into subcomponents if larger.
15. **No `dangerouslySetInnerHTML`.** Never use without DOMPurify sanitization. XSS is a blocking vulnerability.
16. **No array index as `key`.** Biome enforces `noArrayIndexKey: "error"`. Always use unique IDs (`key={item.id}`).
17. **No derived state in `useState`.** If a value can be computed from props or query data, derive it inline.

## Lib Reuse

112. **No local redefinitions of `lib/` exports.** If `lib/` exports a function, slices must import it — never redefine locally. Duplicating utilities causes drift and bloat.

## Security

18. **No secrets in frontend code.** All env vars exposed to the browser are PUBLIC — never store API keys, tokens, or credentials.
19. **Validate user-provided URLs** before rendering in `href`/`src` — block `javascript:` protocol.

## UI States

20. **Every data-driven component handles all states:** Loading (skeleton placeholders), Empty (descriptive message + CTA), Error (inline message or toast), Success (toast for mutations).
21. **Skeleton loading preferred over spinners.** Use `<Skeleton />` placeholders matching final layout dimensions — never spinning overlays or generic loaders.

## Forms & Interactions

22. **Every field must have a `<label>`.** No inputs without accessible labels.
23. **Anti double-submit.** Disable submit button + show loading state during mutations using `isPending`.
24. **Destructive actions require confirmation.** Delete/irreversible operations require a confirm dialog. Never delete on single click.

## Accessibility

25. **Visible focus styles.** All interactive elements must have `:focus-visible` styles.
26. **Semantic HTML.** `<button>` for actions, `<a>` for navigation, landmark elements for page structure.

## Type Organization

27. **No `types/` directories or `types.ts` barrel files.** Types live next to the code that uses them (colocation > organization by file type).

## Layout Architecture

100. **Layouts ONLY in `layouts/`.** Layout shells (sidebar, centered card, etc.) live in `src/layouts/`. No layout components in `components/` or `slices/`. `components/` is for app-level non-layout components only (e.g., error-boundary).
101. **Navigation must be data-driven.** All nav items live in `layouts/nav-items.ts` as a typed array. `authed-layout.tsx` imports and renders from this array. No hardcoded `<Link>` in the layout shell.
102. **No `max-w-*` in layout files except `content-area.tsx`.** Width constraints are managed by layout variants (`default` | `full` | `narrow` | `wide`) in `content-area.tsx` only.
103. **No deep relative imports.** Imports with `../../../` or deeper are forbidden. Use `@/` alias for all cross-directory imports.
104. **CRUD slices must have a nav entry.** Every slice with a `*-list.tsx` component must have a corresponding entry in `layouts/nav-items.ts`.
105. **Routes with `beforeLoad` must have `pendingComponent`.** Prevents white flash during async operations like auth checks.
106. **CRUD list components must use `ConfirmDelete`.** Every list with delete actions must import and use `ConfirmDelete` from `@/ui/confirm-delete`. No single-click deletes.
107. **CRUD hooks must export `useBulkDelete`.** Every CRUD slice must have a bulk delete hook using `useBulkDelete()` from `@/lib/use-bulk-delete`. Bulk operations are mandatory.
108. **SearchInput debounce is 600ms.** The `SearchInput` component in `@/ui/search-input.tsx` uses a 600ms debounce. Do not change this value without updating the invariant.

## CRUD View Contract

109. **Inline action icons, not dropdown menus.** Table rows use direct Edit + Delete icon buttons. Never use `DropdownMenu` / three-dot `⋯` for row actions — inline icons are immediately visible, fewer clicks.
110. **Create and Edit use modal dialogs.** New entities open a `FormDialog`. Editing opens the same `FormDialog` pre-populated with `defaultValues`. Only use dedicated pages for complex entities (>6 fields, tabs, nested data).
111. **Cross-slice composition rules.** Slices NEVER import **components** from other slices (UI coupling). Slices MAY import **hooks** from other slices when the view is a composed feature that genuinely needs cross-domain data (e.g., detail view + analytics, config form + related entities). For simple cases, routes compose data and pass as props. For complex composed views (tabs, panels), the component owns its data fetching via cross-slice hooks. Document each exception in the architecture test's `allowedCrossImports`.

## Testing

28. **Architecture rules are tested.** INVARIANTS rules are enforced by `src/__tests__/architecture.test.ts`. Adding a new invariant means adding a corresponding test.

## Documentation Sync

29. **Spec must match implementation.** If you change a pattern in the skeleton, update the architecture spec in the same commit or PR. Documentation drift is a bug.

### Plan-First

30. **Every feature starts with a plan** — create `docs/plans/<feature>.md` from template before coding. Confidence < 5 = plan only, no implementation.

### Operational

31. **Anti-thrashing gate** — 4 consecutive failures on same task = mandatory human escalation. Never brute-force past repeated failures.
32. **Decisions are logged** — append to `docs/DECISIONS.ndjson` when choosing between alternatives. Never modify or delete existing entries.
