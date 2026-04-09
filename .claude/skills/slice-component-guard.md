---
description: Enforces CRUD component patterns when editing slice components
paths: ["**/src/slices/*/components/*.tsx"]
context: inline
---

# Slice Component Rules (auto-activated)

You are editing a slice component. These rules are NON-NEGOTIABLE:

1. **One component per file** — file name = component name in kebab-case
2. **Max ~300 lines** — split into subcomponents if larger
3. **No cross-slice component imports** — never import components from another slice. Hooks (data) may cross slices for composed views — document in architecture test `allowedCrossImports`
4. **Types from `@repo/shared`** — never redefine types locally
5. **No raw `fetch()`** — use the slice's TanStack Query hooks
6. **No `useEffect` for data fetching** — TanStack Query handles all server state
7. **No CSS files** — Tailwind only, using semantic tokens (`bg-background`, not `bg-white`)
8. **No hardcoded colors** — use theme tokens from `src/styles.css`
9. **No `dangerouslySetInnerHTML`** — security violation
10. **No array index as key** — use stable IDs

## CRUD List Contract (if this is a list component)

Must include: bulk delete, server pagination, server search (600ms debounce), server sort, create/edit modals (FormDialog), inline action icons (pencil + trash), confirm delete dialog, skeleton loading, empty state with CTA.
