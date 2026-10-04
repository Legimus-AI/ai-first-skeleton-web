# Motion System

Lightweight animation primitives for page transitions, list reveals, and component enter/exit.

**Dependency:** none beyond Tailwind. The primitives are CSS-only: `tw-animate-css` utilities (`animate-in`, `fade-in-0`, `slide-in-from-bottom-1`) plus the keyframes defined in `src/styles.css`. If a project needs physics-based animation, add a library then and lazy-load it with `React.lazy`.

## Available Primitives

| Component | File | Purpose |
|-----------|------|---------|
| FadeIn | `@/ui/fade-in` | Fade + slight upward shift on mount. Supports `delay` (seconds) for staggering |
| PageTransition | `@/ui/animate-presence-wrapper` | Fade-in on route change, keyed by `pageKey` (wrap the route outlet) |
| AnimatedListItem | `@/ui/animated-list` | Staggered entrance for list items (`index` × `staggerDelay`, default 0.03 s) |

## Timing

There is no timing module: durations are Tailwind classes (`duration-150`, `duration-200`, `duration-300`). The scale and the signature easing curve are defined in [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) section 6:

| Speed | Duration | Use for |
|-------|----------|---------|
| Quick | 100ms | Color changes on hover, focus rings |
| Normal | 150ms | Micro-interactions (hover, toggle, button state) |
| Entrance | 200ms | Component enter/exit (fade-in, modals, dropdowns) |
| Layout | 300ms | Page-level layout changes (sidebar collapse, panel resize) |

## Rules

- **Max 200ms** for micro-interactions, **max 300ms** for page transitions
- **`motion-safe:`** prefix for ALL Tailwind CSS animations
- **Never animate SVGs** directly — wrap in `<span>`, animate the wrapper
- **Lazy load** heavy motion components with `React.lazy` + `<Suspense>`
- **Respects `prefers-reduced-motion`** through the `motion-safe:` prefix: with reduced motion on, the classes do not apply

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
