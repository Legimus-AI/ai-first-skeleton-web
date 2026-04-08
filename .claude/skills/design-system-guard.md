---
description: Enforces Aether design system when editing UI components or styles
paths: ["**/src/ui/*.tsx", "**/src/styles.css", "**/src/layouts/*.tsx"]
context: inline
---

# Aether Design System Rules (auto-activated)

You are editing a UI primitive or layout. Read `DESIGN_SYSTEM.md` for the full spec.

## Color Rules
- **ONLY semantic tokens** — `bg-background`, `text-foreground`, `border-border`, etc.
- **NEVER** `bg-white`, `text-gray-500`, `border-[#hex]`, or any Tailwind color scale with numbers
- **OKLCH color space** — all tokens defined in `src/styles.css` under `@theme inline`

## Interaction Rules
- **Every interactive element** needs `transition-colors duration-150`
- **Button squish** — `active:scale-[0.96]` on clickable elements
- **`motion-safe:` prefix** on all animations — respect reduced motion
- **Glassmorphism** only on sidebar — `backdrop-filter: blur(10px)`

## Typography
- **Geist Sans** — tight letter-spacing (-0.03em headlines, -0.01em body)
- **Font sizes** via Tailwind scale — never arbitrary `text-[14px]`

## Layout
- Dark-first: true black background (`#000000`), obsidian card surfaces
- Hairline borders at 8% white opacity
- Responsive: mobile-first (`p-4 md:p-8`, `grid-cols-1 md:grid-cols-2`)
