# Scroll-safe floating listbox

## Goal

Provide a canonical body-portaled listbox primitive that remains aligned inside transformed dialogs and scrolls reliably while modal scroll locking is active.

## Success criteria

- Fixed viewport geometry remains bounded and independent of transformed ancestors.
- Native wheel and touch input remain available inside the listbox under Radix scroll locking.
- Non-scrollable listboxes do not intercept page scrolling.
- Unit tests, type checks, lint, and the production build pass.
- The architecture specification and skeleton README document the pattern.

## Implementation

1. Add the floating-listbox geometry and nested scroll-lock panel with focused tests.
2. Document when body portals require explicit wheel ownership.
3. Port the same helper to Cortex and RasaIA3 listbox consumers.
4. Verify in a real scrolled assistant dialog before release.

Confidence: 9/10.
