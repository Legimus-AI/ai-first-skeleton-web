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

There is no timing module: durations are Tailwind classes and the curve is the `ease-standard` utility (`--motion-ease` in the IDENTITY block of `src/styles.css`). The scale is defined in [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) section 7:

| Speed | Duration | Use for |
|-------|----------|---------|
| Press | 120ms | Button press scale, toggles |
| Normal | 150–200ms | Hover fills, focus, menus and dialogs entering |
| Layout | 300–320ms | Sidebar collapse, accordion height, sliding indicators |

## Rules

- **Max 200ms** for micro-interactions, **max 320ms** for layout changes
- **Interruptible:** prefer CSS transitions over keyframes for anything a user can trigger twice quickly
- **One curve:** `ease-standard` everywhere; never a per-component `cubic-bezier`
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
