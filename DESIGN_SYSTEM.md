# Design System — AI-First Skeleton Web

> This is the visual constitution. AI agents MUST read it before writing any UI.
> Default identity: **Suave** — soft warm-neutral surfaces, pill buttons, soft shadows, Onest type, color only for state.
> An identity is a swappable token block, not a fixed look: see [Identities](#identities).

---

## 1. Design Principles

These are non-negotiable. They are grounded in cognitive science and usability research. When in doubt, return here.

### Cognitive Foundations

| Principle | Law/Theory | Rule for AI agents |
|-----------|-----------|-------------------|
| Fewer choices = faster decisions | Hick's Law | Max 1 primary CTA per context. Max 5-7 items per visible group |
| Bigger + closer = easier to hit | Fitts's Law | Primary actions are large (min 44px touch target) and near the content they affect |
| Familiar = fast | Jakob's Law | Familiar interactions (forms, tables, dialogs); the shell follows the product archetype, not habit |
| Proximity = relationship | Gestalt Proximity | Related items are close (gap-2). Unrelated sections have generous space (space-y-6) |
| Similar look = same function | Gestalt Similarity | All primary buttons look identical. All destructive buttons look identical. No exceptions |
| Less to remember = less errors | Miller's Law (7±2) | Never require users to remember info across views. Show context inline |
| Users scan, don't read | F-pattern / Banner blindness | Put the most important content top-left. Primary actions top-right or inline with content |

### Product Principles

1. **Every element carries data or a function** — if removing it loses nothing, remove it. Decoration that repeats a label (an icon tile above a KPI) is noise.
2. **Layered surfaces** — Background → Card → Popover. Light mode separates layers with soft shadows; dark mode with surface tone.
3. **Neutral ink** — `primary` is ink (near black / near white). Color appears only for state: success, warning, destructive, info.
4. **Breathing room by default, density by token** — Suave is airy; data-heavy screens switch to `data-density="compact"` instead of hand-tightening.
5. **Progressive disclosure** — Show essentials first. Advanced features appear when needed (expand, tabs, modals).
6. **Feedback is mandatory** — Every action gets immediate feedback: loading state, success toast, error message. Silence = broken.
7. **Prevent, don't recover** — Confirmations on destructive actions. Smart defaults. Inline validation.
8. **Both modes are intentional** — Light and dark are designed, not inverted. Check both before shipping.
9. **One identity per product** — Suave is where a project starts, not where every project ends. The brief decides the identity.

---

## 2. Color Tokens

All colors use OKLCH. They live in the IDENTITY block of `src/styles.css`; components read only the semantic names.

### Semantic Roles (universal — applies to any identity)

| Role | Usage | Never use for |
|------|-------|--------------|
| `background` | Page canvas, deepest layer; also the fill of inputs inside cards | — |
| `card` | Elevated surfaces (cards, sidebar, panels) | Text color |
| `popover` | Dialogs, dropdowns, tooltips, floating bars | — |
| `muted` / `muted-foreground` | Quiet fills, secondary text, metadata | Primary actions |
| `accent` | Hover and active fills (nav pills, menu items, table rows) | Brand color |
| `primary` / `primary-foreground` | CTAs, the active state | Body text, borders |
| `destructive` · `success` · `warning` · `info` | State only: text, dots, tints, solid fills | Decoration |
| `border` / `input` | Table rows, inputs, dividers | Backgrounds |
| `ring` | Focus outline | — |

### Suave Values

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `oklch(0.972 0.004 80)` | `oklch(0.19 0.005 60)` |
| `--card` | `oklch(0.995 0.002 80)` | `oklch(0.235 0.006 60)` |
| `--popover` | `oklch(0.995 0.002 80)` | `oklch(0.27 0.006 60)` |
| `--foreground` / `--primary` | `oklch(0.25 0.008 60)` | `oklch(0.95 0.004 80)` |
| `--muted` / `--secondary` / `--accent` | `oklch(0.935 0.005 80)` | `oklch(0.29 0.006 60)` |
| `--muted-foreground` / `--ring` | `oklch(0.5 0.008 60)` | `oklch(0.72 0.006 80)` |
| `--border` | `oklch(0.915 0.005 80)` | `oklch(0.31 0.007 60)` |
| States | lightness 0.5, white foreground | lightness 0.72–0.8, ink foreground |

The neutrals carry a warm hue (60–80) at very low chroma: they read as grey, not cream. Changing that hue and chroma is the cheapest way to give another product a different temperature.

### Contrast (measured)

Every text pair clears WCAG AA 4.5:1 in both modes. Lowest pairs: `muted-foreground` on `muted` 4.96 (light) and 5.69 (dark); state text on a 10–12% tint of itself 4.70 (light `success`); state foregrounds on solid state fills ≥ 5.3 (light) and ≥ 6.8 (dark). Re-run the check when you change an identity.

### State Tints

Badges and soft alerts use the state color at 10–12% under text of the same color: `bg-success/10 text-success`. One class works in both modes; never add `dark:` overrides.

---

## 3. Typography

**Font:** Onest Variable, self-hosted through `@fontsource-variable/onest` (imported at the top of `src/styles.css`). No Google Fonts request.

| Token | Utility | Suave |
|-------|---------|-------|
| `--font-body` | `font-sans` | Onest Variable |
| `--font-display` | `font-heading` (h1–h3 get it globally) | Onest Variable |
| `--tracking-body` / `--tracking-display` | global | -0.005em / -0.025em |

| Level | Class | Size | Weight | Use for |
|-------|-------|------|--------|---------|
| Page title | `text-2xl font-semibold` | 24px | 600 | H1 page headings |
| Section title | `text-lg font-semibold` | 18px | 600 | Card titles, section heads |
| Body | `text-sm` | 14px | 400 | Text, table cells, labels |
| Secondary | `text-sm text-muted-foreground` | 14px | 400 | Helper text, descriptions |
| Caption | `text-xs text-muted-foreground` | 12px | 400 | Timestamps, metadata |
| Micro | `text-2xs` | 11px | 500 | Avatar initials, counters |

- Sentence case everywhere. No uppercase labels with tracked letters.
- Numbers in tables and KPIs use `tabular-nums`; never `font-mono` for data.
- Never arbitrary sizes (`text-[13px]`): add a token if the scale is missing a step.

---

## 4. Spacing & Density

Base unit: **4px**. Everything is a multiple.

| Context | Value | Tailwind |
|---------|-------|----------|
| Page padding | 32px desktop, 16px mobile | `p-4 md:p-8` |
| Between page sections | 24px | `space-y-6` |
| Inside surfaces | `--surface-padding` (24px) | `p-(--surface-padding)` |
| Between form fields | 16px | `space-y-4` |
| Between inline elements, icon and label | 8px | `gap-2` |
| Min touch target | 44px | `min-h-11` |

### Density tokens

| Token | Comfortable (default) | Compact |
|-------|----------------------|---------|
| `--control-height` | 40px | 36px |
| `--row-padding-y` | 12px | 8px |
| `--surface-padding` | 24px | 16px |

Set `data-density="compact"` on `<html>` for a whole product, or on one wrapper for a dense screen. Buttons, inputs, selects, table cells and cards follow automatically.

---

## 5. Shape & Elevation

| Utility | Token | Suave | Use for |
|---------|-------|-------|---------|
| `rounded-control` (= `rounded-lg`) | `--radius` | 12px | Inputs, selects, textareas, menu items |
| `rounded-button` | `--radius-button-value` | pill | Buttons, segmented controls |
| `rounded-overlay` (= `rounded-xl`) | `--radius-overlay-value` | 16px | Dialogs, dropdowns, popovers |
| `rounded-surface` | `--radius-surface-value` | 20px | Cards, sidebar, panels |
| `rounded-full` | — | — | Avatars, badges, dots |

| Utility | Light | Dark |
|---------|-------|------|
| `shadow-control` | 1px soft shadow | 1px dark shadow |
| `shadow-surface` | soft two-layer warm shadow | faint top edge + deep shadow |
| `shadow-overlay` | larger soft shadow | faint top edge + deeper shadow |

Cards have no border in Suave: elevation separates them. Borders stay on inputs, table rows and dividers.

---

## 6. Component Patterns

### States Matrix

| Component | Default | Hover | Press | Focus | Disabled | Loading | Error |
|-----------|---------|-------|-------|-------|----------|---------|-------|
| Button | Per variant | Fill shift, 150ms | `scale(0.97)`, 120ms | `ring-2 ring-ring` | 50% opacity | Spinner + disabled | — |
| Input | `bg-background border-input` | Border darkens | — | Border `ring`, ring 2px at 20% | 50% opacity | — | Border destructive |
| Card | `bg-card shadow-surface` | — | — | — | 50% opacity | Skeleton | — |
| Table row | No fill | `bg-accent/60` | — | — | — | Skeleton rows | — |
| Nav item | Muted text | `bg-accent/60` | — | Ring | 50% opacity | — | — |
| Badge | State tint | — | — | — | — | — | — |

### Buttons

Pill (`rounded-button`), height `--control-height`. Variants: `primary` (ink), `secondary` (accent fill), `outline` (border, card fill), `ghost`, `destructive`, `link`. The press scale lives in the button itself; never add it per call site.

### Segmented control

`Segmented` (`@/ui/segmented`) for one choice among 2–5 options that applies at once: a pill track (`bg-muted`), the chosen option raised (`bg-card shadow-control`), a legend that names the choice, 44px targets on mobile. Options are text, or icons named by their label (`ThemeSegmented`). More options than that: use a select.

### Tables

Header in sentence case, `text-xs font-medium text-muted-foreground`. Rows separated by `border-border`, cells padded with `--row-padding-y`. Action buttons are icon-only and inline.

### Empty States

A sentence that says what is missing and one button that fixes it. An icon only when it shows the thing that is missing; never an icon inside a tinted circle as decoration.

---

## 7. Motion System

### Philosophy

Motion answers what the person did: open, close, confirm, move. Nothing animates on page load except the content fade. Never decorative loops.

### Signature Easing

One curve for everything: `ease-standard` = `--motion-ease` = `cubic-bezier(0.16, 1, 0.3, 1)`.

### Timing Scale

| Speed | Duration | Use for |
|-------|----------|---------|
| Press | 120ms | Button press scale, toggles |
| Normal | 150–200ms | Hover fills, focus, menus and dialogs entering |
| Layout | 300–320ms | Sidebar collapse, accordion height, sliding indicators |

### Rules

- Prefer CSS transitions over keyframes for anything a user can trigger twice quickly: transitions are interruptible, keyframes glitch.
- Animate `transform` and `opacity`; animate height with the `grid-rows-[0fr]` → `grid-rows-[1fr]` pattern.
- All animations use `motion-safe:`; `prefers-reduced-motion` turns them off.

---

## 8. Responsive Strategy

| Name | Width | What changes |
|------|-------|-------------|
| Mobile | < 640px | Single column, full-width primary buttons, sidebar becomes a drawer |
| Tablet | 640-1024px | 1-2 columns, reduced padding |
| Desktop | > 1024px | Full layout, floating sidebar, multi-column grids |

1. **Mobile-first classes.** Write `text-sm md:text-base`, not the reverse.
2. **Touch targets:** min 44px on mobile.
3. **Tables:** complex tables stack as cards below `sm:`; simple ones scroll horizontally inside their own box.
4. **Hide secondary content, never the primary action.**
5. Verify at 375px with no horizontal page scroll.

---

## 9. Screen-Type Patterns

**CRUD list** — `CrudPageHeader` (title, description, search, one create button), data table with bulk select, server search/sort/pagination, create and edit in `FormDialog`, delete through `ConfirmDelete`. Layout `default`.

**Dashboard** — Lead with the user's main job (what needs attention now), then the numbers that drive action. A number earns a place only if it changes what someone does; pair it with its trend instead of an icon. Layout `full`.

**Settings** — Tabs for sections; each section is a title, a description and one form card with at most 6 fields; save per card. Layout `narrow`.

**Detail view** — Breadcrumb, a header surface with the key facts and actions, tabs for views. The only place where a `⋯` menu for secondary actions is acceptable. Layout `default`.

**Wizard** — Linear, max 5 steps, progress visible, back always available, summary before submit. Layout `narrow`.

The shell (sidebar, navbar, split, focused) comes from the archetype in `DESIGN_BRIEF.md`; see `docs/layouts.md`.

---

## 10. Quality Checklist

This is what `/arquitecto` evaluates.

- [ ] Page purpose clear in 3 seconds; exactly one primary CTA visible
- [ ] Every visual element carries data or a function (nothing from §12 slipped in)
- [ ] Every action has feedback; destructive actions confirm; submit disables while loading
- [ ] Only semantic tokens and token utilities (no hex, no rgba, no `dark:` color overrides)
- [ ] Typography follows the scale; sentence case; tabular numbers in data
- [ ] Light and dark both checked; contrast ≥ 4.5:1 for text
- [ ] Visible `:focus-visible` on every interactive element; every input labelled
- [ ] Works at 375px without horizontal scroll; touch targets ≥ 44px
- [ ] Motion uses `ease-standard`, `motion-safe:`, and is interruptible

---

## 11. Icons

Phosphor, imported ONLY from `@/ui/icons` (never from `@phosphor-icons/react` or any other set directly). The wrapper exports set-agnostic names (`Search`, `ChevronRight`, `Spinner`…), so switching the set is one file.

| Setting | Suave | Where |
|---------|-------|-------|
| Default weight | `regular` | `ICON_WEIGHT` in `src/ui/icons.ts`, applied by `IconProvider` |
| Active nav item | `fill` | `ACTIVE_ICON_WEIGHT` |
| Inline size | 16px | `h-4 w-4` |

**Brand icons (MANDATORY):** WhatsApp, Google, Shopify and other brands use the brand's real SVG and color, never a generic glyph.

---

## 12. Do NOT (anti-generic list)

These are the tells of a templated SaaS. Each one is banned unless the brief explicitly asks for it.

- An icon inside a tinted circle or square above a KPI or as card decoration
- Four identical KPI cards as the opening of every screen
- Uppercase labels with wide tracking above headings or nav groups
- `→` appended to links and buttons; emoji as UI icons
- Gradient washes, glows and glassmorphism as decoration
- Cards with a colored left border as an accent
- `font-mono` for small data labels; arbitrary pixel font sizes
- `dark:` color overrides or rgba/hex values inside components (put the value in a token)
- Importing an icon set anywhere except `src/ui/icons.ts`
- Spinners for page loading (use skeletons); animations longer than 320ms (except loops like the spinner)

---

## Identities

An identity is everything between `IDENTITY` and `END IDENTITY` in `src/styles.css`, plus the icon set and weight in `src/ui/icons.ts`. To give a product its own face:

1. Copy the block and rename it (`IDENTITY: <Name>`).
2. Change the neutrals' hue and chroma (temperature), the fonts (`--font-body`, `--font-display`, plus the `@fontsource` import), the radii, the elevation and the motion curve.
3. Pick the icon set and weight in `src/ui/icons.ts`.
4. Pick the shell from the archetype (`DESIGN_BRIEF.md` Layer 0).
5. Re-check contrast in both modes.

Theme exports from tweakcn or shadcn/create use the same color names, so they can be pasted over the color part of the block.

## Brief → Token Mapping

| Brand posture | Neutral temperature | Radius (control / surface) | Elevation | Density | Motion | Icon weight |
|---------------|--------------------|---------------------------|-----------|---------|--------|-------------|
| Sober / professional | Cool, chroma ≤ 0.006 | 6px / 10px | Borders + `shadow-control` | Compact | 150ms | regular |
| Premium / minimal | Pure neutral | 8px / 12px | Tone only | Comfortable | 200ms | light |
| Friendly / approachable (Suave) | Warm, chroma ≈ 0.005 | 12px / 20px, pill buttons | Soft shadows | Comfortable | 200ms | regular, fill when active |
| Bold / energetic | Any, with one vivid state | 16px+ | Strong shadows | Compact | 200–300ms | bold or duotone |

| Error cost | Confirmations | Inline validation | Undo |
|------------|--------------|-------------------|------|
| Low | Delete only | On submit | Nice-to-have |
| Medium | Delete + bulk actions | On blur | Recommended |
| High | All destructive + transfers | Real-time | Required |
