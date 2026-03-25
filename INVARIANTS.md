# Invariants

Non-negotiable rules enforced by `architecture.test` and CI. Violations block merges.

## Governance

- **INV-001:** Zero `any` types. Biome enforces `noExplicitAny: "error"` and `noImplicitAnyLet: "error"`. Use Zod inference, generics, or `unknown` with narrowing. The ONLY escape: `biome-ignore` with library name and specific technical justification.
- **INV-002:** Zero `biome-ignore` without justification. Every suppression must include the library name and a clear reason. Blanket suppressions are forbidden.
- **INV-003:** Zero non-null assertions. Biome enforces `noNonNullAssertion: "error"`. Use narrowing guards (`if (!x) throw`) instead of `x!`.
- **INV-004:** Strict TypeScript flags are non-negotiable. `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes` — must remain enabled. Never weaken tsconfig.json strictness.

## Schema

- **INV-010:** Zod is the single source of truth. All API response types and form schemas are derived from `@repo/shared` via `z.infer<>`. Never define a type manually that duplicates a Zod schema.
- **INV-011:** Never redefine types from `@repo/shared`. If a type exists in shared, import it. Redefining causes silent drift.

## Data Fetching

- **INV-020:** No raw `fetch()` calls. All API calls go through `@/lib/api-client`. Never use raw `fetch()`.
- **INV-021:** No `useEffect` for data fetching. Use TanStack Query hooks.
- **INV-022:** No local state for server data. Use TanStack Query for all server state.

## Styling

- **INV-030:** No CSS files. Tailwind classes only, CVA for variants.
- **INV-031:** No hardcoded colors. Never use `bg-white`, `text-black`, `text-gray-*`, `bg-[#hex]`. Use semantic theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`).
- **INV-032:** Dark mode must work. Every component must work in both light and dark mode using theme tokens.

## Components

- **INV-040:** One component per file. File name = component name.
- **INV-041:** Max ~200 lines per file. Split into subcomponents if larger.
- **INV-042:** No `dangerouslySetInnerHTML`. Never use without DOMPurify sanitization. XSS is a blocking vulnerability.
- **INV-043:** No array index as `key`. Biome enforces `noArrayIndexKey: "error"`. Always use unique IDs (`key={item.id}`).
- **INV-044:** No derived state in `useState`. If a value can be computed from props or query data, derive it inline.

## Security

- **INV-050:** No secrets in frontend code. All env vars exposed to the browser are PUBLIC — never store API keys, tokens, or credentials.
- **INV-051:** Validate user-provided URLs before rendering in `href`/`src` — block `javascript:` protocol.

## UI States

- **INV-060:** Every data-driven component handles all states: Loading (skeleton placeholders), Empty (descriptive message + CTA), Error (inline message or toast), Success (toast for mutations).
- **INV-061:** Skeleton loading preferred over spinners. Use `<Skeleton />` placeholders matching final layout dimensions — never spinning overlays or generic loaders.

## Forms & Interactions

- **INV-070:** Every field must have a `<label>`. No inputs without accessible labels.
- **INV-071:** Anti double-submit. Disable submit button + show loading state during mutations using `isPending`.
- **INV-072:** Destructive actions require confirmation. Delete/irreversible operations require a confirm dialog. Never delete on single click.

## Accessibility

- **INV-080:** Visible focus styles. All interactive elements must have `:focus-visible` styles.
- **INV-081:** Semantic HTML. `<button>` for actions, `<a>` for navigation, landmark elements for page structure.

## Type Organization

- **INV-090:** No `types/` directories or `types.ts` barrel files. Types live next to the code that uses them (colocation > organization by file type).

## CRUD Completeness

- **INV-091:** No placeholder text in component JSX. Forbidden patterns: `coming soon`, `placeholder`, `todo:`, `not implemented`, `implement later`. Use generic CRUD components to build complete views — never stub with placeholder UI.
- **INV-092:** CRUD list components MUST use generic components from `@/ui/`: `DataTable`, `CrudPageHeader`, `SearchInput`, and `Pagination`. Inline tables, custom search inputs, and manual pagination in slice components are prohibited. Domain-specific code only — layout is handled by generics.
- **INV-093:** Every hooks file in a CRUD slice MUST export list, create, update, and delete hooks (matching pattern `useXs`, `useCreateX`, `useUpdateX`, `useDeleteX`). Incomplete hook files indicate unfinished work.
- **INV-094:** Every CRUD slice (has `*-list.tsx`) MUST have a corresponding route file in `src/routes/_authed/`. A slice without a route is invisible to users.
- **INV-095:** No client-side data manipulation in list components. `.filter()`, `.sort()`, `.slice()` on server data is PROHIBITED in `*-list.tsx` files. All filtering, sorting, and pagination is server-side via query params.

## Testing

- **INV-100:** Architecture rules are tested. INVARIANTS rules are enforced by `src/__tests__/architecture.test.ts`. Adding a new invariant means adding a corresponding test.

## Documentation Sync

- **INV-110:** Spec must match implementation. If you change a pattern in the skeleton, update the architecture spec in the same commit or PR. Documentation drift is a bug.
