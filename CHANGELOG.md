# Changelog

Versions of the 2.x line of this web skeleton, newest first. Before 2.10.0 the history lives only in the
commits up to `v2.9.0`; 3.0.0 and later (Better Auth) are in the changelog on `main`.
Architecture decisions are in the [spec changelog](https://github.com/Legimus-AI/ai-first-architecture/blob/main/CHANGELOG.md).

## 2.10.0 — 2026-10-12: settings that follow the account

The settings pages of 3.x, backported for backends that serve their own auth under `/api/v1/auth`
(e.g. the FastAPI skeleton) instead of Better Auth. The organization chooses its time zone and date
format, and each person their theme and time zone, saved through the API so they follow the account to
any device. Implements
[ADR 0024](https://github.com/Legimus-AI/ai-first-architecture/blob/main/docs/decisions/0024-runtime-settings-per-organization-and-user.md).

### Breaking

- **The signed-in shell needs the backend's settings slice:** `_authed` loads `GET /api/v1/me/settings`
  and `GET /api/v1/organization/settings` before any page renders, and the pages `PATCH` them. Every
  member role must hold `organization:read`; changing the organization's settings takes
  `organization:write` (owner and admin).
- **`@/utils/format-date` is now `@/services/date-format-service`:** `formatDate`, `formatDateTime` and
  `formatRelative` hold the runtime locale and time zone, and `utils/` stays pure. Update the imports.
- **The `Theme` type moved from `@/providers/theme-provider` to `@repo/shared`** (with `themeSchema` and
  `THEMES`): `import type { Theme } from '@repo/shared'` (e.g. a product's `ui/theme-segmented.tsx`).

### Added

- `/settings/general`: the organization's time zone and date format (owner and admin edit them, members
  see them read-only), each field restorable to its default. `/settings/preferences`: the person's theme
  and time zone, which can follow the organization's. Every form page under Configuración (general,
  preferences, security, notifications) uses the `narrow` layout.
- Dates show in the organization's locale, in the person's time zone or else the organization's. Pages
  outside the signed-in shell keep `VITE_LOCALE` and the browser's zone. A zone the browser cannot format
  falls back to the device's zone, with a warning once in the shell and on both settings pages.
- The theme is saved to the account: the account's theme wins on the first load of a session, and every
  later toggle is saved once; a failed save puts the last confirmed theme back.
- When the session's account changes in another tab, the shell drops the cached data and reloads it.
- `useOptimisticMutation` takes `successMessage: false` (no success toast) and `scope` (saves run one at
  a time).

### Changed

- The API key presets Solo lectura and Lectura y escritura also grant `organization:read` (read only: the
  organization's time zone and locale), so an agent using one can read the organization's settings. Keys
  made before keep their scopes, and the table lists them as they are.
