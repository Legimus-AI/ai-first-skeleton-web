# Design System — AI-First Skeleton Web

> This is the visual constitution. AI agents MUST read it before writing any UI.
> Default theme: **Aether** — translucent obsidian surfaces, hairline borders, single accent.
> Inspired by Linear, Vercel Dashboard, Supabase.

---

## 1. Design Principles

These are non-negotiable. They are grounded in cognitive science and usability research. When in doubt, return here.

### Cognitive Foundations

| Principle | Law/Theory | Rule for AI agents |
|-----------|-----------|-------------------|
| Fewer choices = faster decisions | Hick's Law | Max 1 primary CTA per context. Max 5-7 items per visible group |
| Bigger + closer = easier to hit | Fitts's Law | Primary actions are large (min 44px touch target) and near the content they affect |
| Familiar = fast | Jakob's Law | Use standard SaaS patterns (sidebar+main, table CRUD, form modals). Never reinvent navigation |
| Proximity = relationship | Gestalt Proximity | Related items are close (gap-2). Unrelated sections have generous space (space-y-6) |
| Similar look = same function | Gestalt Similarity | All primary buttons look identical. All destructive buttons look identical. No exceptions |
| Less to remember = less errors | Miller's Law (7±2) | Never require users to remember info across views. Show context inline |
| Users scan, don't read | F-pattern / Banner blindness | Put the most important content top-left. Primary actions top-right or inline with content |

### Product Principles

1. **Clarity over decoration** — Every element must help the user complete a task. If removing it changes nothing, remove it.
2. **Layered surfaces** — Background → Card → Popover. Each layer is one step elevated. Depth through color, not shadow.
3. **Single accent** — One chromatic color for primary actions. Everything else is grayscale. Color means something, never decorates.
4. **Generous breathing room** — Whitespace > borders. Spacing creates hierarchy. Dense ≠ productive.
5. **Progressive disclosure** — Show essentials first. Advanced features appear when needed (expand, tabs, modals). Never overwhelm.
6. **Feedback is mandatory** — Every action gets immediate feedback: loading state, success toast, error message. Silence = broken.
7. **Prevent, don't recover** — Confirmations on destructive actions. Smart defaults. Inline validation. Prevention > error messages.
8. **Dark mode native** — Design dark first, adapt to light. Both must feel intentional.

---

## 2. Color Tokens

All colors use OKLCH for perceptual uniformity. Defined in `src/styles.css`.

### Semantic Roles (universal — applies to any theme)

| Role | Usage | Never use for |
|------|-------|--------------|
| `background` | Page canvas, deepest layer | — |
| `card` | Elevated surfaces (cards, panels) | Text color |
| `popover` | Modals, dropdowns, tooltips | — |
| `muted` / `muted-foreground` | Disabled fills, secondary text, metadata | Primary actions |
| `primary` / `primary-foreground` | CTAs, active states, brand emphasis | Body text, borders |
| `destructive` | Delete, error, danger states | Success or info |
| `success` | Connected, complete, valid | Primary actions |
| `warning` | Caution, pending, attention | — |
| `info` | Informational, neutral highlight | — |
| `border` | Lines, dividers, input borders | Backgrounds |

### Aether Dark Mode Values

| Token | Value | Description |
|-------|-------|-------------|
| `--background` | `oklch(0 0 0)` | True black page background |
| `--card` | `oklch(0.07 0 0)` | Obsidian card surfaces |
| `--popover` | `oklch(0.1 0 0)` | Modal/dropdown surfaces |
| `--muted` | `oklch(0.14 0 0)` | Disabled fills |
| `--muted-foreground` | `oklch(0.556 0 0)` / `#888` | Secondary text |
| `--border` | `rgba(255,255,255,0.08)` | Hairline borders |
| `--input` | `oklch(0.05 0 0)` | Recessed input background |

### Aether Light Mode Values

| Token | Value | Description |
|-------|-------|-------------|
| `--background` | `oklch(0.985 0 0)` | Near-white page |
| `--card` | `oklch(1 0 0)` | Pure white cards |
| `--popover` | `oklch(1 0 0)` | Pure white modals |

### Border Philosophy

- **Dark:** `rgba(255,255,255,0.08)` — hairline, nearly invisible. Never solid grey.
- **Light:** Standard subtle gray. `border-border/50`.
- **Rule:** Prefer spacing over borders. Try `gap-6` before adding a divider.
- **Tables:** Bottom borders only. No full grid borders.

### Corner Radius

| Context | Radius | Tailwind |
|---------|--------|----------|
| Inputs, buttons | 8px | `rounded-lg` |
| Cards, dialogs, dropdowns | 12px | `rounded-xl` |
| Badges, pills | full | `rounded-full` |

---

## 3. Typography

**Font:** Geist Sans (loaded via Google Fonts CDN in `index.html`).

| Level | Class | Size | Weight | Tracking | Use for |
|-------|-------|------|--------|----------|---------|
| Page title | `text-2xl font-semibold tracking-tight` | 24px | 600 | -0.03em | H1 page headings |
| Section title | `text-lg font-semibold` | 18px | 600 | -0.03em | Card titles, section heads |
| Body | `text-sm` | 14px | 400 | -0.01em | Text, table cells, labels |
| Secondary | `text-sm text-muted-foreground` | 14px | 400 | -0.01em | Helper text, descriptions |
| Caption | `text-xs text-muted-foreground` | 12px | 400 | -0.01em | Timestamps, metadata |

Headlines get `-0.03em` tracking via global CSS. Body gets `-0.01em`.

**Page title pattern:**
```tsx
<div className="flex flex-col gap-1">
  <h1 className="text-2xl font-semibold tracking-tight">Page Title</h1>
  <p className="text-sm text-muted-foreground">Brief description of purpose.</p>
</div>
```

---

## 4. Spacing System

Base unit: **4px**. Everything is a multiple.

| Context | Value | Tailwind | Why |
|---------|-------|----------|-----|
| Page padding | 32px desktop, 16px mobile | `p-4 md:p-8` | Breathing room on edges |
| Between page sections | 24px | `space-y-6` | Clear section separation (Gestalt) |
| Inside cards | 24px | `p-6` | Comfortable internal spacing |
| Between form fields | 16px | `space-y-4` | Grouped but distinct |
| Between inline elements | 8px | `gap-2` | Tight relationship |
| Between icon and label | 8px | `gap-2` | Visual proximity |
| Table to pagination | 16px | `mt-4` | Logical separation |
| Min touch target | 44px | `min-h-11` | Fitts's Law: usable on mobile |

---

## 5. Component Patterns

### States Matrix

Every interactive component MUST handle these states:

| Component | Default | Hover | Active/Press | Focus | Disabled | Loading | Error |
|-----------|---------|-------|-------------|-------|----------|---------|-------|
| Button | Styled per variant | Color shift, 150ms | Scale 0.96 (squish) | Ring-2 | Opacity 50%, cursor not-allowed | Spinner + disabled | — |
| Input | Border, bg-input | — | — | Ring-2 primary | Opacity 50% | — | Border destructive |
| Card | Border, bg-card | Subtle bg shift (optional) | — | — | Opacity 50% | Skeleton | — |
| Table row | No bg | `bg-[rgba(255,255,255,0.03)]` | — | — | — | Skeleton rows | — |
| Link/Nav | Text color | Underline or bg shift | — | Ring-2 | Opacity 50% | — | — |
| Badge | Semantic tint | — | — | — | — | — | — |
| Dialog | Open state | — | — | Focus trap | — | Submit loading | Form errors |

### Button Variants (Aether)

| Variant | Dark Mode | Light Mode |
|---------|-----------|------------|
| `primary` | White bg, black text, radial gradient hover | Accent bg, white text |
| `outline` | White stroke, transparent. Hover: fill white | Border, hover bg |
| `destructive` | Red bg | Red bg |
| `secondary` | Muted bg | Muted bg |
| `ghost` | Transparent, hover accent bg | Transparent, hover muted |
| `link` | Underline, accent color | Same |

All buttons: `aether-squish` active scale(0.96), `transition-colors duration-150`.

### Badge Variants (Aether — soft tints)

| Variant | Value |
|---------|-------|
| `default` | `bg-primary/8 text-primary/90` |
| `secondary` | `bg-[rgba(255,255,255,0.06)] text-muted-foreground` |
| `destructive` | `bg-destructive/8 text-destructive/90` |
| `success` | `bg-success/8 text-success/90` |
| `warning` | `bg-warning/8 text-warning/90` |
| `info` | `bg-info/8 text-info/90` |

### Table Design (Aether)

| Element | Style |
|---------|-------|
| Row default | No background |
| Row hover | `bg-[rgba(255,255,255,0.03)]` |
| Row selected | `bg-primary/5` |
| Row border | `border-[rgba(255,255,255,0.06)]` (hairline bottom) |
| Header | `text-xs font-medium text-muted-foreground uppercase tracking-wider` |
| Action buttons | Icon-only, `h-4 w-4`, inline (never dropdown) |

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
    <Icon className="h-6 w-6 text-muted-foreground" />
  </div>
  <h3 className="mt-4 text-sm font-semibold">No items yet</h3>
  <p className="mt-1 text-sm text-muted-foreground max-w-sm">Create the first one to get started.</p>
  <Button className="mt-4" size="sm"><Plus className="mr-1.5 h-4 w-4" />Add</Button>
</div>
```

---

## 6. Motion System

### Philosophy

Motion is felt, never seen. No bouncing, no spring physics, no dramatic entrances. Everything transitions in 100-200ms with the same easing curve. Motion adds meaning (state changed) or guides attention (new element appeared). Never decorative.

### Signature Easing

**All transitions use the same curve:** `cubic-bezier(0.16, 1, 0.3, 1)` — fast start, gentle deceleration.

### Timing Scale

| Speed | Duration | Use for |
|-------|----------|---------|
| Quick | 100ms | Color changes on hover, focus rings |
| Normal | 150ms | Button state changes, row highlights |
| Entrance | 200ms | Fade-in, slide-in, new elements appearing |
| Layout | 300ms | Sidebar collapse, panel resize |

### What Animates What

| Trigger | Property | Duration | Easing |
|---------|----------|----------|--------|
| Hover (button) | `background-color, color` | 150ms | Signature curve |
| Hover (table row) | `background-color` | 150ms | Signature curve |
| Press (button) | `transform: scale(0.96)` | 100ms | ease |
| Focus | `box-shadow (ring)` | 150ms | Signature curve |
| Element appears | `opacity, transform(6px)` | 200ms | Signature curve |
| Skeleton loading | shimmer gradient | 800ms | ease-in-out |
| Emphasis | glow pulse | 3000ms | ease-in-out infinite |

### Reduced Motion

ALL animations MUST use `motion-safe:` prefix. Respect `prefers-reduced-motion`.

---

## 7. Aether-Specific Effects

### Glassmorphism (sidebar + dropdowns in dark mode)

```css
.aether-glass {
  background: oklch(0.05 0 0 / 70%);
  backdrop-filter: blur(10px);
}
```

Dropdown menus: `dark:bg-[rgba(10,10,10,0.85)] dark:backdrop-blur-xl`

### Active Sidebar Glow

Active nav items: `dark:shadow-[0_0_12px_2px_var(--glow-color)]` + left accent border `border-l-2 border-primary`.

### Dark Inset Inputs

Inputs feel recessed: `background-color: oklch(0.05 0 0)`. Focus: border turns white with subtle inner glow.

---

## 8. Responsive Strategy

### Breakpoints

| Name | Width | What changes |
|------|-------|-------------|
| Mobile | < 640px | Single column, stacked layout, full-width buttons, hamburger nav |
| Tablet | 640-1024px | 1-2 columns, sidebar may collapse, reduced padding |
| Desktop | > 1024px | Full layout, sidebar visible, multi-column grids |

### Rules

1. **Mobile-first classes.** Write `text-sm md:text-base`, not the reverse.
2. **Touch targets:** Min 44px height on all interactive elements on mobile (`min-h-11`).
3. **Tables → cards on mobile.** Complex tables should stack as cards below `sm:`. Simple tables can scroll horizontally.
4. **Sidebar → drawer.** Below `lg:`, sidebar becomes a slide-in drawer triggered by hamburger.
5. **Full-width CTAs on mobile.** Primary buttons become `w-full` below `sm:`.
6. **Typography stays consistent.** Don't change font sizes per breakpoint. The scale is already optimized for readability at 14px body.
7. **Hide secondary content, not primary.** On mobile, hide descriptions and metadata. Never hide the primary action or main content.

---

## 9. Screen-Type Patterns

### CRUD List (the skeleton default — see INVARIANTS.md 106-111)

```
┌─ CrudPageHeader ──────────────────────────────┐
│  Title + Description    [Search] [+ Create]    │
├────────────────────────────────────────────────┤
│  ☐ Name          Status      Created   Actions │
│  ☐ Item A        Active      Jan 5     ✏️ 🗑️   │
│  ☐ Item B        Draft       Jan 3     ✏️ 🗑️   │
├────────────────────────────────────────────────┤
│  [Bulk delete bar when items selected]         │
│  ← 1 2 3 ... →  (pagination)                  │
└────────────────────────────────────────────────┘
```

Layout: `default` (max-w-7xl). Bulk select, server search (600ms debounce), server sort, server pagination. Create/Edit via FormDialog modal. Delete via ConfirmDelete.

### Dashboard

```
┌─ Page Title ───────────────────────────────────┐
│  Welcome back, User          [Primary action]  │
├────────────────────────────────────────────────┤
│  ┌─ KPI ─┐  ┌─ KPI ─┐  ┌─ KPI ─┐  ┌─ KPI ─┐ │
│  │ Value  │  │ Value  │  │ Value  │  │ Value  │ │
│  │ +12%   │  │ -3%    │  │ 98%    │  │ 42     │ │
│  └────────┘  └────────┘  └────────┘  └────────┘ │
│  ┌─ Chart/Activity ─────────────────────────┐  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

Layout: `full`. Max 4 KPI cards. Each KPI: one number, one label, optional trend. Chart below. Every metric must answer "so what?" — if it doesn't drive action, remove it.

### Settings (tabs layout)

```
┌─ Settings ─────────────────────────────────────┐
│  [General] [Team] [Security] [API Keys] [...]  │
├────────────────────────────────────────────────┤
│  Section Title                                  │
│  Description text                               │
│  ┌─ Form Card ──────────────────────────────┐  │
│  │  Field label                              │  │
│  │  [input]                                  │  │
│  │  Field label                              │  │
│  │  [input]                                  │  │
│  │                          [Cancel] [Save]  │  │
│  └───────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

Layout: `narrow` (max-w-2xl). Tabs for sections. Each section: title + description + form card. Max 6 fields per section. Save at card level, not page level.

### Detail View (entity page)

```
┌─ Breadcrumb: List > Item Name ─────────────────┐
│  ┌─ Header Card ────────────────────────────┐  │
│  │  Entity name        [Status] [Edit] [⋯]  │  │
│  │  Created Jan 5 by User                    │  │
│  └───────────────────────────────────────────┘  │
│  [Overview] [Activity] [Settings]              │
│  ┌─ Tab content ────────────────────────────┐  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

Layout: `default`. Breadcrumb navigation. Header card with key info + actions. Tabs for different views. This is the ONLY pattern where dropdown menu (⋯) is acceptable — for secondary actions on the entity.

### Wizard / Multi-Step

```
┌─ Step indicator: ① → ② → ③ ───────────────────┐
│  Step title                                     │
│  Step description                               │
│  ┌─ Form Card ──────────────────────────────┐  │
│  │  Fields for this step                     │  │
│  │                        [Back] [Continue]  │  │
│  └───────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

Layout: `narrow`. Linear flow only. Max 5 steps. Step indicator shows progress. Back always available. Final step shows summary before submit. Use when: >6 fields, sequential logic, or user needs guidance through a process.

---

## 10. Quality Checklist

This is what `/arquitecto` evaluates. Before shipping any UI, verify:

### Hierarchy & Clarity

- [ ] Can you identify the page purpose in 3 seconds? (3-Second Test)
- [ ] Is there exactly 1 primary CTA visible? (Hick's Law)
- [ ] Squint the screen — can you see 3 distinct zones? (Squint Test)
- [ ] Is the most important content top-left or top-center? (F-pattern)

### Interaction Quality

- [ ] Every action has immediate feedback (loading, success, error)
- [ ] Destructive actions require confirmation
- [ ] Forms validate inline, not just on submit
- [ ] Submit buttons disable during loading (anti double-submit)
- [ ] Empty states guide to first action with clear CTA

### Visual Consistency

- [ ] Only semantic color tokens used (no hardcoded hex)
- [ ] Typography follows the 5-level scale (no extra sizes)
- [ ] Spacing follows the 4px grid (no arbitrary values)
- [ ] All buttons of same variant look identical across pages
- [ ] Dark mode and light mode both work correctly

### Accessibility

- [ ] Color contrast meets 4.5:1 (WCAG AA)
- [ ] Every interactive element has visible `:focus-visible`
- [ ] Every input has a `<label>` or `aria-label`
- [ ] Color is never the sole indicator of state
- [ ] Semantic HTML: `<button>` for actions, `<a>` for navigation

### Responsive

- [ ] Works at 375px (iPhone SE) without horizontal scroll
- [ ] Touch targets are min 44px
- [ ] Primary content and actions visible on mobile (nothing critical hidden)
- [ ] Tables degrade gracefully (scroll or stack)

### Motion

- [ ] All animations use `motion-safe:` prefix
- [ ] No animation exceeds 300ms (except looping indicators)
- [ ] Hover transitions on all interactive elements (150ms)

---

## 11. Icons

Generic UI icons from `lucide-react`. Tree-shakeable, consistent stroke width.

### Brand Icons (MANDATORY)

When referencing a brand (WhatsApp, Google, Shopify, etc.), ALWAYS use the brand's real SVG with its official color. Never substitute with a generic lucide icon. Brand recognition = trust = conversion.

### Sizes

| Context | Size | Tailwind |
|---------|------|----------|
| Inline (buttons, nav) | 16px | `h-4 w-4` |
| Empty state | 24px in 48px circle | `h-6 w-6` |
| Hero | 40px | `h-10 w-10` |
| Table actions | 16px | `h-4 w-4` |

---

## 12. Do NOT

- Use `space-y-2` for page layout (use `space-y-6`)
- Use text buttons in table action columns (use icon-only)
- Skip page description in CrudPageHeader
- Use `text-2xl` for card titles (use `text-lg`)
- Add borders where spacing suffices
- Use solid grey borders in dark mode (use hairline rgba)
- Use gradients for backgrounds (solid colors only)
- Skip `motion-safe:` prefix on animations
- Show more than 7 items in a nav group without collapsing
- Create settings forms with >6 fields (split into sections)
- Use spinners for page loading (use skeleton placeholders)
- Put secondary text in the same visual weight as primary text
- Animate anything >300ms (except looping indicators)

---

## Brief → Token Mapping (for design system generation)

When generating a new design system from DESIGN_BRIEF.md answers, use this table:

### Brand Posture → Visual Tokens

| Posture | Background | Accent | Radius | Shadows | Motion | Density |
|---------|-----------|--------|--------|---------|--------|---------|
| Sober/Professional | Light gray `oklch(0.97)` | Blue/green (muted) | 4-6px | Subtle `shadow-sm` | Minimal 100ms | Comfortable |
| Premium/Minimal | True black `oklch(0)` | Single cool color | 8-12px | None (depth via bg layers) | Subtle 150ms | Spacious |
| Friendly/Approachable | Warm white `oklch(0.98)` | Warm (orange/yellow/coral) | 12-16px | Soft `shadow-md` | Expressive 200ms | Comfortable |
| Bold/Energetic | Dark or vibrant | Multiple vibrant | 16px+ / full | Colored shadows | Dynamic 200-300ms | Dense |

### Dominant Emotion → Interaction Tokens

| Emotion | Feedback intensity | Tooltip frequency | Motion timing | Color temperature |
|---------|-------------------|-------------------|---------------|-------------------|
| Control | High — every state visible | Low — expert users | Fast 100ms | Cool (blue/slate) |
| Speed | Medium — success only | None | Ultra-fast 80ms | Neutral |
| Security | High — confirmations on everything | Medium | Normal 150ms | Cool (blue/green) |
| Accompaniment | High — contextual guidance | High — everywhere | Normal 150ms | Warm (amber/orange) |
| Delight | Medium — micro-celebrations | Low | Expressive 200ms+ | Warm/vibrant |

### Error Cost → Validation Strategy

| Cost | Confirmations | Inline validation | Undo support | Color usage |
|------|--------------|-------------------|--------------|-------------|
| Low | Delete only | On submit | Nice-to-have | Red = error only |
| Medium | Delete + bulk actions | On blur | Recommended | Red = error, yellow = warning |
| High | All destructive + transfers | Real-time | Required | Red prominent, warnings visible |

---

## Quick Reference — Aether Dark Values

| Element | Value |
|---------|-------|
| Page bg | `#000` (oklch(0 0 0)) |
| Card | `~#0A0A0A` (oklch(0.07 0 0)) |
| Popover | oklch(0.1 0 0) |
| Border | `rgba(255,255,255,0.08)` |
| Secondary text | `#888` (oklch(0.556 0 0)) |
| Input bg | `oklch(0.05 0 0)` |
| Glow | `oklch(0.65 0.2 260 / 30%)` |
| Sidebar bg | `oklch(0.05 0 0 / 70%)` + blur(10px) |
| Font | Geist Sans |
| Headline tracking | -0.03em |
| Body tracking | -0.01em |
| Radius | 8px (elements), 12px (cards) |
| Shimmer | 0.8s |
| Fade-in | cubic-bezier(0.16, 1, 0.3, 1) |
| Button squish | scale(0.96) on :active |
