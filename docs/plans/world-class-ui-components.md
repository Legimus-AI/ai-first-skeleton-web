# Plan: World-Class UI Components — Tier 1+2

> Decision Record: 2026-04-04 multi-model debate (Claude Opus 4.6 + Gemini 3 Flash + GPT-5.4)
> 3/3 convergence on top gaps: Command Palette, Optimistic UI, Motion, Undo Toast

## Context

The skeleton covers CRUD SaaS admin well (DataTable, Pagination, FormDialog, etc.). But world-class apps (Linear, Vercel, Notion, Supabase) have patterns we don't — command palette, optimistic mutations, transitions, and more.

These are **skeleton-level patterns** (reusable UI components and hooks), NOT product features. Collaboration, notifications, saved views are product-specific and belong in individual projects.

## Confidence: 8/10 — implement

---

## Tier 1: High Impact, Low Effort

### 1. Command Palette (⌘K)

**What:** Global command menu for search + navigation + actions via keyboard.
**Why:** Every world-class SaaS has it. Reduces mouse dependency for power users.
**Dep:** `cmdk` (paras.sh, 15k+ stars, used by Vercel/Linear/Raycast)

**Files to create:**
- `src/ui/command-menu.tsx` — the component (wraps `cmdk` with our theme tokens)
- `src/lib/use-command-menu.ts` — global toggle hook (⌘K / Ctrl+K listener)
- Wire into `src/components/app-layout.tsx` — render at layout level

**Pattern for slices:**
```tsx
// Each slice registers its commands via a hook
export function useTodoCommands() {
  return [
    { label: 'Create Todo', action: () => navigate({ to: '/todos', search: { create: true } }) },
    { label: 'Search Todos', action: () => navigate({ to: '/todos', search: { focus: 'search' } }) },
  ]
}
```

**Architecture test:** `INV-108: CommandMenu rendered in app-layout` (verify import exists)

**Estimate:** 1 day

### 2. Optimistic UI Hook

**What:** Generic hook wrapping TanStack Query `useMutation` with `onMutate` optimistic update + auto-rollback.
**Why:** Makes mutations feel instant. React 19 has `useOptimistic` but TanStack integration is better for our pattern.
**Dep:** None (TanStack Query already installed)

**Files to create:**
- `src/lib/use-optimistic-mutation.ts` — generic hook

**Pattern:**
```tsx
export function useOptimisticMutation<TData, TVariables>({
  queryKey,
  mutationFn,
  optimisticUpdate, // (old: TData[], variables: TVariables) => TData[]
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old) => optimisticUpdate(old, variables))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
```

**Usage in slices:**
```tsx
const toggleTodo = useOptimisticMutation({
  queryKey: ['todos'],
  mutationFn: (id) => api.patch(`/api/todos/${id}`, { completed: true }),
  optimisticUpdate: (old, id) => old.map(t => t.id === id ? { ...t, completed: true } : t),
})
```

**Estimate:** 4 hours

### 3. Undo Toast for Deletes

**What:** Instead of confirm dialog → delete, use "Deleted. [Undo]" toast with 5s timer. Less friction, same safety.
**Why:** Gmail/Linear pattern. ConfirmDelete stays for bulk deletes, but single-item deletes get undo toast.
**Dep:** `sonner` (already installed)

**Files to create:**
- `src/ui/undo-toast.tsx` — reusable component
- `src/lib/use-undo-delete.ts` — hook wrapping delayed delete + undo

**Pattern:**
```tsx
const { deleteWithUndo } = useUndoDelete({
  queryKey: ['todos'],
  deleteFn: (id) => api.delete(`/api/todos/${id}`),
  label: (item) => item.title,
})

// In DataTable row actions:
<button onClick={() => deleteWithUndo(todo)}>Delete</button>
// Shows: "Todo deleted. [Undo] ████░ 5s"
```

**Keep ConfirmDelete for:** bulk deletes, irreversible actions, high-cost operations.

**Estimate:** 2 hours

### 4. Onboarding Stepper

**What:** Multi-step wizard component for setup flows, onboarding, guided configuration.
**Why:** DESIGN_BRIEF.md mentions "linear flow" but no component exists. First-time UX matters.
**Dep:** None

**Files to create:**
- `src/ui/stepper.tsx` — step indicator + navigation
- `src/ui/step-content.tsx` — content container with transitions

**Pattern:**
```tsx
<Stepper currentStep={step} steps={['Account', 'Connect', 'Configure', 'Done']}>
  <StepContent step={0}><AccountForm onNext={() => setStep(1)} /></StepContent>
  <StepContent step={1}><ConnectForm onNext={() => setStep(2)} /></StepContent>
  ...
</Stepper>
```

**Estimate:** 4 hours

---

## Tier 2: High Impact, Medium Effort

### 5. Motion System

**What:** Lightweight animation primitives for route transitions, list enter/exit, and layout shifts.
**Why:** World-class apps feel "alive". Brusk page changes feel broken.
**Dep:** `motion` (framer-motion lite, tree-shakeable)

**Files to create:**
- `src/ui/animate-presence.tsx` — wrapper for enter/exit animations
- `src/ui/fade-in.tsx` — simple fade-in on mount
- `src/lib/motion-config.ts` — shared duration/easing tokens

**Rules:**
- `motion-safe:` prefix on all animations (respect prefers-reduced-motion)
- Max 200ms for micro-interactions, 300ms for page transitions
- NEVER animate SVGs directly (wrap in span)
- Lazy load `motion` via `React.lazy` (not in initial bundle)

**Estimate:** 1 day

### 6. Virtualized DataTable

**What:** DataTable upgrade for 1000+ row datasets without DOM bloat.
**Why:** Current DataTable renders all rows. At 500+ items, scrolling lags.
**Dep:** `@tanstack/react-virtual`

**Files to modify:**
- `src/ui/data-table.tsx` — add `virtualized` prop (opt-in, backward compatible)

**Pattern:**
```tsx
<DataTable data={items} columns={columns} virtualized={items.length > 100} />
```

Default behavior unchanged. Only activates when `virtualized` prop is true.

**Estimate:** 1 day

### 7. Global Search

**What:** Extends Command Palette (#1) with entity search across all slices.
**Why:** World-class apps let you find anything from one input.
**Dep:** Builds on #1 (cmdk)

**Files to create:**
- `src/ui/global-search.tsx` — search results panel within command menu
- `src/lib/use-global-search.ts` — aggregates search across registered slice endpoints

**Pattern for slices:**
```tsx
// Each slice registers a search provider
export function useTodoSearch(query: string) {
  return useQuery({
    queryKey: ['search', 'todos', query],
    queryFn: () => api.get('/api/todos', { search: query, limit: '5' }),
    enabled: query.length > 1,
  })
}
```

**Estimate:** 4 hours (after #1 is done)

### 8. AI Sidecar Layout Slot

**What:** Collapsible side panel in the layout for AI assistant, context info, or activity feed.
**Why:** AI-first projects need a surface for AI interactions without leaving the current view.
**Dep:** None

**Files to create:**
- `src/layouts/with-sidecar.tsx` — layout wrapper with collapsible right panel
- `src/ui/sidecar-panel.tsx` — the panel component

**Pattern:**
```tsx
// In route file:
<WithSidecar panel={<AICopilotPanel context={currentEntity} />}>
  <EntityDetailView />
</WithSidecar>
```

The skeleton provides the LAYOUT SLOT. The AI implementation is product-specific.

**Estimate:** 4 hours

---

## Implementation Order

```
Week 1:
  Day 1: #2 Optimistic UI hook + #3 Undo toast (quick wins, no deps to install)
  Day 2: #1 Command Palette (install cmdk, create component + hook, wire to layout)
  Day 3: #4 Stepper + #8 AI Sidecar layout slot

Week 2:
  Day 4: #5 Motion system (install motion, create primitives, add to route transitions)
  Day 5: #6 Virtualized DataTable + #7 Global Search (extends #1)
```

## Definition of Done (each item)

- [ ] Component created in `src/ui/` or hook in `src/lib/`
- [ ] Used in todos slice as reference implementation
- [ ] Architecture test added (if applicable)
- [ ] AGENTS.md updated with pattern documentation
- [ ] `pnpm lint && pnpm typecheck && pnpm test` passes
- [ ] README.md updated (component list, new deps)

## NOT in scope (product-specific, not skeleton)

- Saved views / favorites (requires backend storage)
- Collaboration (comments, mentions, activity feed content)
- Notification center (requires backend events)
- Real-time updates via WebSocket/SSE (backend-dependent)
- Drag & drop sortable (Tier 3, separate plan)
- Inline row editing (Tier 3, separate plan)
- Density toggle compact/cozy (Tier 3, separate plan)
