# Skeleton Essentials — Profile + Flexible Layout System

**Goal:** Complete the skeleton's essential pages (profile view/edit) and make the layout system flexible enough that AI agents can produce unique UI/UX for different verticals without being locked into one pattern.
**Scope:** frontend
**Context:** ai-first-skeleton-web, React 19 + Vite + TanStack + Tailwind
**Created:** 2026-04-04

## Research

### What already exists
- `src/layouts/authed-layout.tsx` (139 lines) — vertical sidebar layout with data-driven nav
- `src/layouts/nav-items.ts` — centralized navigation config (INV-101 enforced)
- `src/layouts/content-area.tsx` — 4 layout variants (default/full/narrow/wide)
- `src/layouts/public-layout.tsx` — layout for login/register (no sidebar)
- `src/routes/_authed/api-keys.tsx` — API keys management page (exists)
- `src/routes/login.tsx`, `src/routes/register.tsx` — auth pages (exist)
- `src/slices/auth/hooks/use-auth.ts` — useCurrentUser, useLogout, useLogin, useRegister
- Sidebar has: user avatar (initial), email, logout button, theme toggle
- Mobile: hamburger menu → overlay sidebar

### What's missing
- **Profile page** — view + edit name/email/avatar (no route for it)
- **Layout flexibility** — currently hardcoded to vertical sidebar. Projects in different verticals (healthcare dashboards, e-commerce, devtools, minimal landing) might want horizontal nav, combined, or no sidebar at all. The skeleton should NOT force one layout — it should provide composable pieces that AI agents assemble per DESIGN_BRIEF.md

### Sidebar vs Horizontal — Decision

**The skeleton should NOT choose one.** It should provide:
1. A **vertical sidebar layout** (current, good for data-heavy admin panels)
2. A **horizontal navbar layout** (for lighter apps, public-facing dashboards, simpler tools)
3. The layout selection is determined by DESIGN_BRIEF.md Layer 1 answers, NOT hardcoded

The `_authed.tsx` route imports the layout. Changing layout = changing 1 import. AI agents read DESIGN_BRIEF.md and pick the right one.

```tsx
// Option A: sidebar (current default — data-heavy admin)
import { AuthedLayout } from '@/layouts/authed-layout'

// Option B: horizontal navbar (lighter, public-facing)
import { AuthedLayout } from '@/layouts/navbar-layout'
```

## Open Questions

None — proceeding with assumptions below.

## Decisions

- **PROVISIONAL:** Both layouts provided as options. Vertical sidebar remains default. `/start-new-project` asks which layout to use based on DESIGN_BRIEF.md
- **PROVISIONAL:** Profile page is a settings-style page under `/profile` with tabs (if needed) or simple form
- **DEFINITIVE:** Layouts are composable — same nav-items.ts, same ContentArea, same ThemeToggle. Only the shell changes

## Requirements

### What it must do
- Profile page: view current user info (name, email, avatar), edit name, change password (if backend supports)
- Navbar layout: horizontal navigation bar with same nav-items.ts data, same mobile responsive behavior, same user dropdown
- Both layouts must work with dark mode, mobile-first, all theme tokens
- Layout switch = change 1 import in `_authed.tsx` — zero changes to slices or routes

### What it must NOT do
- Force one layout on all projects — DESIGN_BRIEF.md drives the choice
- Duplicate navigation logic — both layouts consume the same `nav-items.ts`
- Add complexity to existing slices — slices don't know which layout wraps them

### Acceptance Criteria
- [ ] `/profile` route exists with user info display + edit form
- [ ] Profile form uses React Hook Form + Zod validation
- [ ] Navbar layout (`navbar-layout.tsx`) exists as alternative to sidebar
- [ ] Navbar is responsive: full nav on desktop, hamburger on mobile
- [ ] Switching layout = changing 1 import in `_authed.tsx`
- [ ] Both layouts use `nav-items.ts` for navigation data
- [ ] Both layouts render `ContentArea` with variant support
- [ ] Dark mode works in both layouts
- [ ] Mobile works in both layouts
- [ ] AGENTS.md documents the layout choice pattern
- [ ] All lint + typecheck passes

## Stage Queue

- [ ] Stage 1: Create profile page — route `_authed/profile.tsx` + `slices/auth/components/profile-page.tsx` + `slices/auth/components/profile-form.tsx`. View user info, edit name. Use existing `useCurrentUser` hook. Add "Profile" nav entry to `nav-items.ts`
- [ ] Stage 2: Create navbar layout — `layouts/navbar-layout.tsx`. Horizontal nav bar with: logo left, nav links center (from `nav-items.ts`), user dropdown right (avatar + name + theme toggle + logout). Mobile: hamburger → slide-down menu. Uses same `ContentArea` component. Same dark mode tokens
- [ ] Stage 3: Create user dropdown component — `ui/user-dropdown.tsx`. Used by BOTH layouts in their footer/header. Shows: avatar, name, email, "Profile" link, theme toggle, logout button. Extracts the current `SidebarUserFooter` logic into a reusable component
- [ ] Quality Gate: lint + typecheck
- [ ] Stage 4: Refactor sidebar layout to use UserDropdown — replace inline `SidebarUserFooter` with the shared `UserDropdown` component. Verify sidebar still works identically
- [ ] Stage 5: Update AGENTS.md — document layout choice pattern (sidebar vs navbar), profile page, UserDropdown. Add guidelines for when to use which layout based on DESIGN_BRIEF.md
- [ ] Quality Gate: lint + typecheck
- [ ] Final Gate: `/check-ai-first web`

## Current Stage: 0 (not started)

## Progress Log
- 2026-04-04 — Plan created (5 stages + 2 gates + final gate)

## Exit Criteria
- [ ] All stages complete
- [ ] All quality gates pass (lint + typecheck)
- [ ] AGENTS.md updated with layout choice docs
- [ ] `/check-ai-first web` passes
