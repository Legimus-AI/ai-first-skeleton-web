# Design System — AI-First Skeleton Web (Aether Theme)

> World-class deep dark mode SaaS dashboard. Inspired by Linear, Vercel Dashboard, Supabase.
> Theme codename: **Aether** — translucent obsidian surfaces, hairline borders, cyan glow accents.
> This document is the visual constitution — AI agents MUST read it before writing any UI.

## Principles

1. **Quiet confidence** — Let content speak. No decorative noise. Every pixel earns its place.
2. **Layered surfaces** — Background -> Card -> Popover. Each layer is slightly elevated.
3. **Single accent** — One chromatic color (blue/cyan) for primary actions. Everything else is grayscale.
4. **Generous breathing room** — More whitespace > more borders. Spacing creates hierarchy.
5. **Subtle transitions** — 150ms ease for hovers, 200ms for entrances. Never jarring.
6. **Dark mode native** — Design dark first, adapt to light. Both must feel intentional.
7. **Glassmorphism** — Translucent surfaces with `backdrop-filter: blur()` for sidebar and dropdowns.
8. **Hairline borders** — 1px borders using `rgba(255,255,255,0.08)` in dark mode — no solid grey.

---

## Typography

**Font: Geist Sans** (loaded via Google Fonts CDN in `index.html`).

| Class | Size | Weight | Tracking | Use for |
|-------|------|--------|----------|---------|
| `text-2xl font-semibold tracking-tight` | 24px | 600 | -0.03em | Page titles |
| `text-lg font-semibold` | 18px | 600 | -0.03em | Section headings, card titles |
| `text-sm` | 14px | 400 | -0.01em | Body text, table cells, form labels |
| `text-sm text-muted-foreground` | 14px | 400 | -0.01em | Secondary text (#888888 in dark) |
| `text-xs text-muted-foreground` | 12px | 400 | -0.01em | Captions, timestamps, metadata |

Headlines (`h1`, `h2`, `h3`) automatically get `-0.03em` letter-spacing via global CSS.
Body text gets `-0.01em` via the body rule.

### Page Title Pattern

```tsx
<div className="flex flex-col gap-1">
  <h1 className="text-2xl font-semibold tracking-tight">Titulo de pagina</h1>
  <p className="text-sm text-muted-foreground">Descripcion breve del proposito.</p>
</div>
```

---

## Color Tokens

All colors use OKLCH for perceptual uniformity. Defined in `src/styles.css`.

### Dark Mode Surfaces (Aether)

| Token | Value | Description |
|-------|-------|-------------|
| `--background` | `oklch(0 0 0)` / `#000000` | True black page background |
| `--card` | `oklch(0.07 0 0)` / `~#0A0A0A` | Card surfaces — obsidian |
| `--popover` | `oklch(0.1 0 0)` | Modal/dropdown surfaces |
| `--muted` | `oklch(0.14 0 0)` | Disabled fills, secondary bg |
| `--muted-foreground` | `oklch(0.556 0 0)` / `~#888888` | Secondary text |

### Light Mode Surfaces

| Token | Value | Description |
|-------|-------|-------------|
| `--background` | `oklch(0.985 0 0)` | Near-white page background |
| `--card` | `oklch(1 0 0)` | Pure white cards |
| `--popover` | `oklch(1 0 0)` | Pure white modals |

### Border Philosophy (Aether)

- **Dark mode:** `oklch(1 0 0 / 8%)` — white at 8% opacity. Hairline borders that nearly vanish.
- **Light mode:** Standard subtle gray borders.
- **Component usage:** `border-border/50` in light, `dark:border-[rgba(255,255,255,0.08)]` in dark.
- **Prefer spacing over borders.** If two sections need separation, try `gap-6` before adding a border.
- **Tables:** Bottom borders on rows using the hairline approach, NOT full grid borders.

### Corner Radius

- Small elements (inputs, buttons): `rounded-lg` (8px)
- Cards, dialogs, dropdowns: `rounded-xl` (12px)
- Badges: `rounded-full`

---

## Aether-Specific Effects

### Glassmorphism

Used on sidebar and dropdown menus in dark mode:

```css
.aether-glass {
  background: var(--sidebar-glass-bg);  /* oklch(0.05 0 0 / 70%) */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

Dropdown menus: `dark:bg-[rgba(10,10,10,0.85)] dark:backdrop-blur-xl`

### Active Sidebar Glow

Active nav items get a subtle cyan/blue outer glow in dark mode:

```
dark:shadow-[0_0_12px_2px_var(--glow-color)]
```

Plus a left accent border: `border-l-2 border-primary`

### Button Squish

All buttons have a micro-interaction on click:

```css
.aether-squish:active {
  transform: scale(0.96);
}
```

### Dark Inset Inputs

Inputs feel "recessed" in dark mode with a darker background:

```css
.aether-input-inset {
  background-color: var(--input-inset-bg);  /* oklch(0.05 0 0) */
}
```

Focus state: border turns white with subtle inner glow shadow.

---

## Spacing Hierarchy

Consistent spacing creates visual rhythm. Use these values:

| Context | Spacing | Tailwind |
|---------|---------|----------|
| Page padding | 32px desktop, 16px mobile | `p-4 md:p-8` |
| Between page sections | 24px | `space-y-6` |
| Between header and content | 24px | `mt-6` or `space-y-6` |
| Between table and pagination | 16px | `mt-4` |
| Inside cards | 24px | `p-6` |
| Between form fields | 16px | `space-y-4` |
| Between inline elements | 8px | `gap-2` |
| Between icon and label | 8px | `gap-2` |
| Bulk action bar gap | 12px | `gap-3` |

---

## Table Design

### Row Styling

| State | Light | Dark (Aether) |
|-------|-------|---------------|
| Default | No background | No background |
| Hover | `bg-muted/50` | `bg-[rgba(255,255,255,0.03)]` |
| Selected | `bg-primary/5` | `bg-primary/5` |
| Borders | `border-border/50` | `border-[rgba(255,255,255,0.06)]` |

### Header Styling

```tsx
<TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
```

---

## Surface & Elevation

### Card Styling (Aether)

```tsx
// Cards use hairline borders in dark mode, subtle shadow in light
<Card>  {/* Already styled: rounded-xl, dark:border-[rgba(255,255,255,0.08)], dark:shadow-none */}
```

### Sidebar (Aether)

| State | Style |
|-------|-------|
| Container | Glassmorphism (`aether-glass`), hairline right border |
| Default item | `text-muted-foreground` |
| Hover item | `bg-muted/50 text-foreground` |
| Active item | `bg-primary/10 text-primary` + left border + glow shadow in dark |

---

## Icons

All icons from `lucide-react`. Tree-shakeable, consistent stroke width.

### Sizes

| Context | Size | Tailwind |
|---------|------|----------|
| Inline with text (buttons, nav) | 16px | `h-4 w-4` |
| Empty state container | 24px inside 48px circle | `h-6 w-6` |
| Page-level hero | 40px | `h-10 w-10` |
| Action buttons (table) | 16px | `h-4 w-4` |

---

## Animations & Transitions

### Shimmer (Skeleton Loading)

Duration: **0.8s** (fast shimmer for perceived speed).
Dark mode gradient: `from-[rgba(255,255,255,0.06)] via-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.06)]`

### Fade-In

Improved curve: `cubic-bezier(0.16, 1, 0.3, 1)` over 200ms with 6px vertical translate.

### Button Squish

`scale(0.96)` on `:active` state, 100ms ease transition.

### Glow Pulse

Subtle pulsing glow animation for emphasis elements: 3s ease-in-out infinite cycle.

### Micro-interactions (always)

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Buttons | all properties | 150ms | ease |
| Table rows | `background-color` | 150ms | ease |
| Sidebar items | `background-color, color` | 150ms | ease |
| Focus rings | `box-shadow` | 150ms | ease |

Use `motion-safe:` prefix on ALL animations. Respect `prefers-reduced-motion`.

---

## Component Variant Guide

### Button Variants (Aether)

| Variant | Light | Dark (Aether) |
|---------|-------|---------------|
| `primary` | Solid accent bg | Solid white bg, black text, 1px inner border, radial gradient hover |
| `outline` | Border + transparent | White stroke, transparent bg. Hover: fill white, text black |
| `destructive` | Solid red bg | Same |
| `secondary` | Muted bg | Same |
| `ghost` | Transparent, hover bg | Transparent, hover accent bg |
| `link` | Underline, accent | Same |

### Badge Variants (Aether — softer tints)

| Variant | Dark mode |
|---------|-----------|
| `default` | `bg-primary/8 text-primary/90` |
| `secondary` | `bg-[rgba(255,255,255,0.06)] text-muted-foreground` |
| `destructive` | `bg-destructive/8 text-destructive/90` |
| `success` | `bg-success/8 text-success/90` |
| `warning` | `bg-warning/8 text-warning/90` |
| `info` | `bg-info/8 text-info/90` |
| `outline` | `border-[rgba(255,255,255,0.12)] text-muted-foreground` |

---

## Empty States

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
    <Icon className="h-6 w-6 text-muted-foreground" />
  </div>
  <h3 className="mt-4 text-sm font-semibold">Sin elementos aun</h3>
  <p className="mt-1 text-sm text-muted-foreground max-w-sm">
    Crea el primero para comenzar.
  </p>
  <Button className="mt-4" size="sm">
    <Plus className="mr-1.5 h-4 w-4" />
    Agregar
  </Button>
</div>
```

---

## Quick Reference — Aether Dark Mode Values

| Element | Value |
|---------|-------|
| Page background | `#000000` (oklch(0 0 0)) |
| Card surface | `~#0A0A0A` (oklch(0.07 0 0)) |
| Popover surface | oklch(0.1 0 0) |
| Border color | `rgba(255,255,255,0.08)` |
| Secondary text | `#888888` (oklch(0.556 0 0)) |
| Input background | `oklch(0.05 0 0)` / `~#0D0D0D` |
| Glow color | `oklch(0.65 0.2 260 / 30%)` |
| Sidebar bg | `oklch(0.05 0 0 / 70%)` + blur(10px) |
| Font | Geist Sans |
| Headline tracking | -0.03em |
| Body tracking | -0.01em |
| Corner radius | 8px (elements), 12px (cards/dialogs) |
| Shimmer speed | 0.8s |
| Fade-in curve | cubic-bezier(0.16, 1, 0.3, 1) |
| Button squish | scale(0.96) on :active |

---

## Do NOT

- Use `space-y-2` for page layout (use `space-y-6`)
- Use text buttons ("Edit") in table action columns (use icon-only buttons)
- Skip the page description in CrudPageHeader
- Use `text-2xl` for card titles (use `text-lg`)
- Add borders where spacing suffices
- Use solid grey borders in dark mode (use hairline `rgba(255,255,255,0.08)`)
- Use gradients for backgrounds or surfaces (solid colors only)
- Skip `motion-safe:` prefix on animations
