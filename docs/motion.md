# Motion System

Lightweight animation primitives for page transitions, list reveals, and component enter/exit.

**Dependency:** `motion` (tree-shakeable framer-motion). Lazy-load heavy animations with `React.lazy`.

## Available Primitives

| Component | File | Purpose |
|-----------|------|---------|
| FadeIn | `@/ui/fade-in` | Fade + slight upward shift on mount. Supports `delay` for staggering |
| PageTransition | `@/ui/animate-presence-wrapper` | Animated page transitions (wrap route outlet) |
| AnimatedListItem | `@/ui/animated-list` | Staggered entrance for list items |

## Timing Tokens (`@/utils/motion-config`)

| Token | Duration | Use for |
|-------|----------|---------|
| `duration.fast` | 150ms | Micro-interactions (hover, toggle) |
| `duration.normal` | 200ms | Component enter/exit (modals, dropdowns) |
| `duration.slow` | 300ms | Page transitions |

## Rules

- **Max 200ms** for micro-interactions, **max 300ms** for page transitions
- **`motion-safe:`** prefix for ALL Tailwind CSS animations
- **Never animate SVGs** directly — wrap in `<span>`, animate the wrapper
- **Lazy load** heavy motion components with `React.lazy` + `<Suspense>`
- **Respects `prefers-reduced-motion`** automatically (Motion handles this)

## Usage

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
