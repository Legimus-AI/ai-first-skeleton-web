# E2E Testing

E2E tests live at **monorepo root** `e2e/`, not inside `apps/web/`. They test user-visible behavior through the browser.

## Frontend Responsibilities

- Use semantic selectors: `getByRole()`, `getByText()`, `getByPlaceholder()` (preferred)
- Add `data-testid` attributes only when semantic selectors are ambiguous
- Test user-visible behavior, not implementation details (don't assert on CSS classes or internal state)
- Empty states, loading states, and error messages should be testable via text content

## Viewport and Scroll Verification

For every full-page view that can grow beyond the viewport:

1. Identify exactly one vertical scroll owner. In a fixed-height flex shell, it normally
   needs `min-h-0` plus `overflow-y-auto` or `overflow-y-scroll`.
2. Force content beyond the viewport and confirm the owner has
   `scrollHeight > clientHeight` with computed `overflowY` equal to `auto` or `scroll`.
3. Place the pointer over the real content area, then use trusted wheel, touch, or
   keyboard input until the last meaningful element is visible. Setting `scrollTop` or
   calling `scrollTo()` only proves geometry and is not release evidence.
4. After CDP viewport tests, restore dimensions that fit the physical browser window.
   Verify `innerHeight <= outerHeight` before handoff; otherwise the DOM can count
   physically off-screen pixels as visible and suppress scrolling.

```ts
const scrollArea = page.getByRole('main')
const initialScrollTop = await scrollArea.evaluate((element) => element.scrollTop)

await scrollArea.hover()
await page.mouse.wheel(0, 600)

const finalScrollTop = await scrollArea.evaluate((element) => element.scrollTop)
expect(finalScrollTop).toBeGreaterThan(initialScrollTop)
expect(await page.evaluate(() => innerHeight <= outerHeight)).toBe(true)
```

## Run E2E

```bash
pnpm test:e2e  # from monorepo root (not from apps/web/)
```
