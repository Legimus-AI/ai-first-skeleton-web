# E2E Testing

E2E tests live at **monorepo root** `e2e/`, not inside `apps/web/`. They test user-visible behavior through the browser.

Add E2E coverage only when a material cross-boundary risk cannot be verified
more faithfully or cheaply below the browser layer: authentication, an
irreversible mutation, a critical multi-step journey, or browser-only behavior.

## Frontend Responsibilities

- Use semantic selectors: `getByRole()`, `getByText()`, `getByPlaceholder()` (preferred)
- Add `data-testid` attributes only when semantic selectors are ambiguous
- Test user-visible behavior, not implementation details (don't assert on CSS classes or internal state)
- Empty states, loading states, and error messages should be testable via text content
- Do not duplicate component-level scenarios or assert that static markup exists

## Run E2E

```bash
pnpm test:e2e  # from monorepo root (not from apps/web/)
```
