# Optimistic Mutations

Use `useOptimisticMutation` from `@/utils/use-optimistic-mutation` for mutations that should feel instant (toggles, inline edits, status changes).

## Usage

```tsx
const toggle = useOptimisticMutation({
  queryKey: ['todos'],
  mutationFn: (id: string) => api.patch(`/api/todos/${id}`, { completed: true }),
  optimisticUpdate: (old, id) => ({
    ...old,
    data: old.data.map(t => t.id === id ? { ...t, completed: true } : t),
  }),
})
```

## When to Use

- **Yes:** Toggles, status changes, inline edits — anything where waiting 200ms for the server feels sluggish
- **No:** Creates, deletes, complex mutations with validation — use regular `useMutation` + toast
