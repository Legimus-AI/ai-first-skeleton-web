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
14. **Max ~200 lines per file.** Split into subcomponents if larger.
15. **No `dangerouslySetInnerHTML`.** Never use without DOMPurify sanitization. XSS is a blocking vulnerability.
16. **No array index as `key`.** Biome enforces `noArrayIndexKey: "error"`. Always use unique IDs (`key={item.id}`).
17. **No derived state in `useState`.** If a value can be computed from props or query data, derive it inline.

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

## Testing

28. **Architecture rules are tested.** INVARIANTS rules are enforced by `src/__tests__/architecture.test.ts`. Adding a new invariant means adding a corresponding test.

## Documentation Sync

29. **Spec must match implementation.** If you change a pattern in the skeleton, update the architecture spec in the same commit or PR. Documentation drift is a bug.

### Plan-First

30. **Every feature starts with a plan** — create `docs/plans/<feature>.md` from template before coding. Confidence < 5 = plan only, no implementation.

### Operational

31. **Anti-thrashing gate** — 4 consecutive failures on same task = mandatory human escalation. Never brute-force past repeated failures.
32. **Decisions are logged** — append to `docs/DECISIONS.ndjson` when choosing between alternatives. Never modify or delete existing entries.
