# Layout Architecture

All layout shells live in `src/layouts/`. The skeleton provides **four shell presets** — projects pick one based on the Product Archetype in DESIGN_BRIEF.md Layer 0 (or design a custom shell via the governed escape hatch in AGENTS.md "Layout Reasoning").

```
src/layouts/
├── authed-layout.tsx    ← Vertical sidebar (data-heavy admin panels)
├── navbar-layout.tsx    ← Horizontal navbar (lighter apps, simpler tools)
├── focused-layout.tsx   ← Minimal header, no nav (editors, composers, single-artifact tools)
├── split-layout.tsx     ← Header + full-bleed body for SplitPane (chat, inbox, master-detail)
├── public-layout.tsx    ← Centered card (login, register)
├── not-found.tsx        ← 404 page
├── content-area.tsx     ← Layout variants: default | full | narrow | wide | bleed
└── nav-items.ts         ← Typed NavItem[] — add entries here for new slices
```

## Choosing a Layout

Switch layout by changing **1 import** in `src/routes/_authed.tsx`:

```tsx
// admin-crud (default): vertical sidebar — data-heavy admin, many nav items
import { AuthedLayout } from '@/layouts/authed-layout'

// admin-crud (light): horizontal navbar — lighter, fewer nav items
import { AuthedLayout } from '@/layouts/navbar-layout'

// focused-tool: minimal header, content is the hero
import { AuthedLayout } from '@/layouts/focused-layout'

// conversational / split-view: header + full-bleed SplitPane body
import { AuthedLayout } from '@/layouts/split-layout'
```

**All shells share:** `UserDropdown`, theme toggle, dark mode, mobile responsive, semantic tokens. Slices don't know which shell wraps them.

| Shell | Archetype (DESIGN_BRIEF Layer 0) | Best for | Mobile behavior |
|-------|----------------------------------|----------|----------------|
| **Sidebar** | `admin-crud` | Data-heavy admin, 5+ nav items, deep hierarchy | Hamburger → overlay sidebar |
| **Navbar** | `admin-crud` | Lighter tools, 3-5 nav items, public-facing | Hamburger → slide-down menu |
| **Focused** | `focused-tool` | Editors, composers, review screens | Same minimal header |
| **Split** | `conversational`, `split-view` | Chat, inbox, list+detail triage | Panes stack vertically |

**`archetype: custom`?** Don't force a preset — follow AGENTS.md "Layout Reasoning" to design a novel shell. CORE invariants (tokens, a11y, INV-102 widths via ContentArea) still apply.

## SplitPane Primitive

`split-layout` provides the shell; routes compose the body with `SplitPane` from `@/ui/split-pane`:

```tsx
import { SplitPane } from '@/ui/split-pane'

<SplitPane
  listWidth="md"            // sm (260px) | md (320px) | lg (400px)
  list={<ConversationList />}
  detail={<ChatView />}
/>
```

Below `md` the panes stack vertically (list first). See `src/routes/_authed/chat.tsx` for the reference usage.

## Layout Variants

Routes declare their variant in the route context; `ContentArea` (`src/layouts/content-area.tsx`) resolves it to a width:

```tsx
export const Route = createFileRoute('/_authed/dashboard')({
  context: () => ({ layout: 'full' as const }),
  component: DashboardPage,
})
```

- `default` — `max-w-7xl` (CRUD tables, standard pages)
- `full` — no max-width (dashboards, analytics)
- `narrow` — `max-w-2xl` (settings, simple forms)
- `wide` — `max-w-[1400px]` (wide content)
- `bleed` — no padding, no max-width, fills the shell height so the surface owns its scroll (chat, canvas, board; see `src/routes/_authed/board.tsx`)

## Shared Components

| Component | File | Used by |
|-----------|------|---------|
| UserDropdown | `@/ui/user-dropdown` | Every shell — avatar, profile link, theme toggle, logout |
| ContentArea | `@/layouts/content-area` | Sidebar, navbar and focused shells — variant-based width constraints (the split shell renders a full-bleed body) |
| NavItems | `@/layouts/nav-items` | Sidebar, navbar and split shells — data-driven navigation |

## Profile Page

`/profile` route exists at `src/routes/_authed/profile.tsx`. Shows user info + edit form. Links from UserDropdown avatar click.
