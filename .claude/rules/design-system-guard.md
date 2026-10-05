---
paths: ["**/src/ui/*.tsx", "**/src/ui/*.ts", "**/src/styles.css", "**/src/layouts/*.tsx", "**/src/slices/**/*.tsx", "**/src/routes/**/*.tsx"]
---

# Design System Rules (auto-activated)

You are editing UI. Read `DESIGN_SYSTEM.md` for the full spec. The look comes from tokens; the current identity is **Suave** (IDENTITY block in `src/styles.css` + `src/ui/icons.ts`).

## Tokens only
- **Colors:** semantic utilities only — `bg-card`, `text-muted-foreground`, `border-border`, `bg-success/10`…
- **NEVER** hex, `rgba()`, Tailwind color scales (`text-gray-500`), or `dark:` color overrides. If dark mode needs a different value, it belongs in the `.dark` block of the identity, not in the component.
- **Shape and depth:** `rounded-control`, `rounded-button`, `rounded-overlay`, `rounded-surface`, `shadow-control|surface|overlay`. No arbitrary radii or shadows.
- **Density:** heights and paddings that should tighten in compact mode use `h-(--control-height)`, `py-(--row-padding-y)`, `p-(--surface-padding)`.
- **Motion:** `ease-standard`, 120ms press / 150–200ms enter / 300–320ms layout, `motion-safe:` on animations.

## Icons
- Import ONLY from `@/ui/icons`. Never from `@phosphor-icons/react`, `lucide-react` or another set.
- Missing icon? Add an export to `src/ui/icons.ts` with a set-agnostic name.

## Typography
- Sentence case; never uppercase labels with tracking.
- Scale: `text-2xs`, `text-xs`, `text-sm`, `text-lg`, `text-2xl`. Never arbitrary `text-[13px]`.
- Numbers in data: `tabular-nums`, never `font-mono`.

## Anti-generic (banned unless the brief asks for it)
- Icon inside a tinted circle/square above a KPI or as card decoration
- Four identical KPI cards as the opening of a screen
- `→` appended to links/buttons, emoji as icons
- Gradients, glows, glassmorphism as decoration
- Colored left-border accent cards
- Every element must carry data or a function; if removing it loses nothing, remove it

## Layout
- Shell comes from the archetype (`DESIGN_BRIEF.md` Layer 0, `docs/layouts.md`).
- Responsive and mobile-first: `p-4 md:p-8`, `grid-cols-1 md:grid-cols-2`, no horizontal page scroll at 375px.
