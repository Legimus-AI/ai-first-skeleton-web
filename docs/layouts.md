# Layout Architecture

All layout shells live in `src/layouts/`. The skeleton provides **two layout options** — projects pick one based on DESIGN_BRIEF.md.

```
src/layouts/
├── authed-layout.tsx    ← Vertical sidebar layout (data-heavy admin panels)
├── navbar-layout.tsx    ← Horizontal navbar layout (lighter apps, simpler tools)
├── public-layout.tsx    ← Centered card (login, register)
├── content-area.tsx     ← Layout variants: default | full | narrow | wide
└── nav-items.ts         ← Typed NavItem[] — add entries here for new slices
```

## Choosing a Layout

Switch layout by changing **1 import** in `src/routes/_authed.tsx`:

```tsx
// Option A: Vertical sidebar (default — data-heavy admin, many nav items)
import { AuthedLayout } from '@/layouts/authed-layout'

// Option B: Horizontal navbar (lighter, simpler, fewer nav items)
import { AuthedLayout } from '@/layouts/navbar-layout'
```

**Both layouts share:** `nav-items.ts`, `ContentArea`, `UserDropdown`, dark mode, mobile responsive. Slices don't know which layout wraps them — they render inside `ContentArea` regardless.

| Layout | Best for | Mobile behavior |
|--------|----------|----------------|
| **Sidebar** | Data-heavy admin, 5+ nav items, deep hierarchy | Hamburger → overlay sidebar |
| **Navbar** | Lighter tools, 3-5 nav items, public-facing | Hamburger → slide-down menu |

**DESIGN_BRIEF.md guidance:** If Layer 1 answer #5 (Information Density) is "high" → sidebar. If "low/medium" → navbar.

## Layout Variants

Routes declare their variant via the `variant` prop on `AuthedLayout`:
- `default` — `max-w-7xl` (CRUD tables, standard pages)
- `full` — no max-width (dashboards, analytics)
- `narrow` — `max-w-2xl` (settings, simple forms)
- `wide` — `max-w-[1400px]` (wide content)

## Shared Components

| Component | File | Used by |
|-----------|------|---------|
| UserDropdown | `@/ui/user-dropdown` | Both layouts — avatar, profile link, theme toggle, logout |
| ContentArea | `@/layouts/content-area` | Both layouts — variant-based width constraints |
| NavItems | `@/layouts/nav-items` | Both layouts — data-driven navigation |

## Profile Page

`/profile` route exists at `src/routes/_authed/profile.tsx`. Shows user info + edit form. Links from UserDropdown avatar click.
