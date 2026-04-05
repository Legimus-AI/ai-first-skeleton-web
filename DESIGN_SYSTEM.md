# Design System — AI-First Skeleton Web

> World-class minimalist design. Inspired by Linear, Vercel Dashboard, Supabase.
> This document is the visual constitution — AI agents MUST read it before writing any UI.

## Principles

1. **Quiet confidence** — Let content speak. No decorative noise. Every pixel earns its place.
2. **Layered surfaces** — Background → Card → Popover. Each layer is slightly elevated.
3. **Single accent** — One chromatic color for primary actions. Everything else is grayscale.
4. **Generous breathing room** — More whitespace > more borders. Spacing creates hierarchy.
5. **Subtle transitions** — 150ms ease for hovers, 200ms for entrances. Never jarring.
6. **Dark mode native** — Design dark first, adapt to light. Both must feel intentional.

---

## Color Tokens

All colors use OKLCH for perceptual uniformity. Defined in `src/styles.css`.

### Semantic Palette

| Token | Purpose | Light | Dark |
|-------|---------|-------|------|
| `--accent` | Primary actions, links, focus rings | Blue | Blue (lighter) |
| `--accent-foreground` | Text on accent bg | White | Dark |
| `--success` | Positive states, completed | Green | Green (lighter) |
| `--success-foreground` | Text on success bg | White | Dark |
| `--warning` | Caution, pending | Amber | Amber (lighter) |
| `--warning-foreground` | Text on warning bg | Dark | Dark |
| `--destructive` | Delete, errors | Red | Red (lighter) |
| `--destructive-foreground` | Text on destructive bg | White | White |
| `--info` | Informational | Light blue | Light blue |
| `--info-foreground` | Text on info bg | Dark blue | Light blue |

### Surface Layers

| Token | Layer | Light | Dark |
|-------|-------|-------|------|
| `--background` | Page background (deepest) | `oklch(0.985 0 0)` | `oklch(0.13 0 0)` |
| `--card` | Card surfaces | `oklch(1 0 0)` | `oklch(0.17 0 0)` |
| `--popover` | Modals, dropdowns (top) | `oklch(1 0 0)` | `oklch(0.21 0 0)` |
| `--muted` | Disabled, secondary fills | `oklch(0.965 0 0)` | `oklch(0.22 0 0)` |

**Rule:** Each layer must be visibly distinct. Cards float above background. Popovers float above cards.

### Border Philosophy

- **Light mode:** Use `--border` (subtle gray) for structural dividers only
- **Dark mode:** Use `oklch(1 0 0 / 8%)` — white at 8% opacity. Borders nearly disappear
- **Prefer spacing over borders.** If two sections need separation, try `gap-6` before adding a border
- **Tables:** Use bottom borders on rows, NOT full grid borders

---

## Typography Scale

System font stack: `ui-sans-serif, system-ui, -apple-system, sans-serif` (no custom fonts in skeleton).

| Class | Size | Weight | Tracking | Use for |
|-------|------|--------|----------|---------|
| `text-2xl font-semibold tracking-tight` | 24px | 600 | -0.025em | Page titles |
| `text-lg font-semibold` | 18px | 600 | normal | Section headings, card titles |
| `text-sm` | 14px | 400 | normal | Body text, table cells, form labels |
| `text-sm text-muted-foreground` | 14px | 400 | normal | Secondary text, descriptions |
| `text-xs text-muted-foreground` | 12px | 400 | normal | Captions, timestamps, metadata |

### Page Title Pattern

```tsx
<div className="flex flex-col gap-1">
  <h1 className="text-2xl font-semibold tracking-tight">Page Title</h1>
  <p className="text-sm text-muted-foreground">Brief description of the page purpose.</p>
</div>
```

### Section Heading Pattern

```tsx
<h2 className="text-lg font-semibold">Section Title</h2>
```

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

### Page Layout Pattern

```tsx
<div className="space-y-6">
  {/* Page header: title + description + actions */}
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
      <p className="text-sm text-muted-foreground">Manage your task list.</p>
    </div>
    <Button>Add Todo</Button>
  </div>

  {/* Search + bulk actions */}
  <div className="flex items-center gap-3">
    <SearchInput ... />
    {bulkAction}
  </div>

  {/* Table */}
  <DataTable ... />

  {/* Pagination */}
  <Pagination ... />
</div>
```

---

## Table Design

Tables are the most data-dense component. They must feel clean, not cramped.

### Row Styling

| State | Style | Tailwind |
|-------|-------|----------|
| Default | No background | — |
| Hover | Very subtle fill, smooth transition | `hover:bg-muted/50 transition-colors duration-150` |
| Selected | Accent tint | `data-[selected=true]:bg-accent/8` |
| Active sort column | Bold header text | `font-semibold text-foreground` (vs default `text-muted-foreground`) |

### Header Styling

```tsx
<TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
```

- Use `uppercase tracking-wider` for column headers — makes them visually distinct from data
- Sort buttons: `hover:text-foreground` transition to indicate interactivity
- Active sort: icon fully opaque, others at 40% opacity

### Cell Padding

- Header cells: `px-4 py-3`
- Body cells: `px-4 py-3` (same — consistent alignment)
- Checkbox column: `w-12 px-4` (narrow, fixed width)
- Actions column: `w-24 text-right px-4`

### Borders

- Row dividers: `border-b border-border/50` (subtle, not heavy)
- No outer border on the table itself
- Header bottom: `border-b border-border` (slightly stronger than row dividers)

---

## Empty States

Empty states are the first thing a new user sees. They must feel intentional, not broken.

### Structure

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
    <Icon className="h-6 w-6 text-muted-foreground" />
  </div>
  <h3 className="mt-4 text-sm font-semibold">No todos yet</h3>
  <p className="mt-1 text-sm text-muted-foreground max-w-sm">
    Create your first todo to get started with task management.
  </p>
  <Button className="mt-4" size="sm">
    <Plus className="mr-1.5 h-4 w-4" />
    Add Todo
  </Button>
</div>
```

### Rules

- **Icon**: 48px container (rounded-full bg-muted), 24px icon inside
- **Title**: `text-sm font-semibold` — short, specific ("No todos yet" not "Empty")
- **Description**: `text-sm text-muted-foreground max-w-sm` — one sentence, helpful
- **CTA**: Primary button, small size, icon + label
- **Vertical padding**: `py-16` — generous, centered in available space

---

## Surface & Elevation

### When to Use Cards

- **Use cards** for distinct content groups that need visual separation (settings panels, stats, forms)
- **Don't use cards** for the main data table (tables live directly on the page background)
- **Don't nest cards** inside cards

### Card Styling

```tsx
// Light mode: subtle shadow, no border
<Card className="shadow-sm border-0 bg-card">

// Both modes (safe default): border + subtle shadow
<Card className="border border-border/50 shadow-sm">
```

**Dark mode note:** Shadows are invisible on dark backgrounds. Use `border-border/50` as the primary elevation cue in dark mode. The `shadow-sm` is for light mode only — it gracefully disappears in dark.

### Sidebar Styling

| State | Style |
|-------|-------|
| Default | `text-muted-foreground` |
| Hover | `bg-muted/50 text-foreground transition-colors duration-150` |
| Active | `bg-accent/10 text-accent font-medium` |

- Active indicator: left border `border-l-2 border-accent` OR accent background tint
- Group labels: `text-xs font-medium uppercase tracking-wider text-muted-foreground` with `mb-2`

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

### Colors

- **Default**: `text-muted-foreground` — blends with secondary text
- **Destructive action**: `text-destructive` — red for delete icons
- **Active nav**: `text-accent` — matches accent color
- **Inside buttons**: Inherit button text color (no extra class needed)

### Action Button Pattern

```tsx
{/* Edit — ghost button, icon only */}
<Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit todo">
  <Pencil className="h-4 w-4" />
</Button>

{/* Delete — ghost button, destructive icon */}
<Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete todo">
  <Trash2 className="h-4 w-4 text-destructive" />
</Button>
```

Use `size="icon"` (square button) for table actions. Always include `aria-label`.

---

## Animations & Transitions

### Micro-interactions (always)

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Buttons | `background-color, color` | 150ms | ease |
| Table rows | `background-color` | 150ms | ease |
| Sidebar items | `background-color, color` | 150ms | ease |
| Focus rings | `box-shadow` | 150ms | ease |
| Icons (sort) | `opacity` | 150ms | ease |

All via `transition-colors duration-150`.

### Entrance animations (optional, motion-safe)

| Element | Animation | Duration |
|---------|-----------|----------|
| Modal appear | Scale 95→100% + fade | 200ms |
| Toast | Slide up + fade | 200ms |
| Page content | Fade in | 150ms |

Use `motion-safe:` prefix on ALL animations. Respect `prefers-reduced-motion`.

### Never animate

- Table data (rows should appear instantly)
- Pagination transitions
- Sort reorder
- SVGs directly (animate wrapper divs)

---

## Component Variant Guide

### Button Variants

| Variant | Use for | Visual |
|---------|---------|--------|
| `primary` | Main CTA ("Add Todo", "Save") | Solid accent bg |
| `secondary` | Secondary actions ("Cancel", "Back") | Muted bg |
| `outline` | Tertiary actions, toggles | Border only |
| `ghost` | Table actions, nav items | Transparent, hover bg |
| `destructive` | Delete, remove | Solid red bg |
| `link` | Inline text links | Underline, accent color |

### Badge Variants

| Variant | Use for | Visual |
|---------|---------|--------|
| `default` | Neutral status | Muted bg |
| `secondary` | Informational | Lighter muted bg |
| `success` | Completed, active | Green tint bg |
| `warning` | Pending, attention | Amber tint bg |
| `destructive` | Error, failed | Red tint bg |
| `outline` | Tags, metadata | Border only |

---

## Quick Reference (copy-paste patterns)

### Page with CRUD table

```tsx
<div className="space-y-6">
  <CrudPageHeader title="..." search={...} action={...} bulkAction={...} />
  <DataTable ... />
  <Pagination ... />
</div>
```

### Settings page

```tsx
<div className="space-y-6">
  <div className="flex flex-col gap-1">
    <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
    <p className="text-sm text-muted-foreground">Manage your account.</p>
  </div>
  <Card className="border border-border/50 shadow-sm">
    <CardHeader>
      <CardTitle className="text-lg">Profile</CardTitle>
      <CardDescription>Update your personal information.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* form fields */}
    </CardContent>
    <CardFooter>
      <Button>Save</Button>
    </CardFooter>
  </Card>
</div>
```

### Status badge

```tsx
<Badge variant={todo.completed ? "success" : "secondary"}>
  {todo.completed ? "Done" : "Pending"}
</Badge>
```
