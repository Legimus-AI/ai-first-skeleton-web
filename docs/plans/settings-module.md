# Plan: Settings pages and runtime preferences

> Created: 2026-10-12 | Confidence: 7/10 | Spec: [ADR 0024](https://github.com/Legimus-AI/ai-first-architecture/blob/main/docs/decisions/0024-runtime-settings-per-organization-and-user.md)

## Objective

Let the organization choose its time zone and date format, and each person their theme and time zone, saved through the API so they follow the account to any device. Dates in every table render in the effective zone and the organization's locale.

## Context

- Theme lived only in `localStorage`; dates used the build's `VITE_LOCALE` and the browser's zone.
- The backends add `GET`/`PATCH /api/v1/me/settings` (any session) and `/api/v1/organization/settings` (members read, `organization:write` writes), answering `{ data }` with every default filled in. `PATCH` is a top-level merge patch: `null` restores a default.

## Approach

### Option A: the `_authed` loader applies the preferences, `useSettingsSync` keeps them
- Pros: no page renders a date before the preferences are known; one hook owns the theme reconciliation for every toggle.
- Cons: the formatters hold module state, so they move from `utils/format-date.ts` (pure by contract) to `services/date-format-service.ts`.

### Option B: a React context for the preferences
- Pros: re-renders dates on change.
- Cons: every formatter caller would need a hook; 12 callers are plain functions in column builders.

### Decision: Option A

Rationale: smallest change to the 12 callers; the loader guarantees the first render is right, and a settings change happens on a settings page, so other pages render with the new values when opened.

## Implementation Steps

1. [x] `slices/settings/hooks/use-settings.ts`: query options for both documents (`staleTime: Infinity`, no refetch on focus), `useSaveTheme` (optimistic, one save at a time, only failures toast), form mutations that store the API's answer.
2. [x] `services/date-format-service.ts` (moved from `utils/format-date.ts`): `setDateFormatPreferences({ locale, timeZone })` and `resetDateFormatPreferences()`; `formatDate`/`formatDateTime` pass `timeZone`; a zone the browser cannot format falls back to the device's zone (`getUnsupportedTimeZone`, warning on both settings pages).
3. [x] `routes/_authed.tsx`: loader loads both documents and applies the preferences (`.catch(ignoreCancelled)`); the route component calls `useSettingsSync(accountKey)` outside the layout (its content remounts per page) and `useReloadOnAccountSwitch(accountKey)`.
4. [x] `/settings/general` (organization form, read-only with a hint without `organization:write`) and `/settings/preferences` (theme + own zone, or "<zone> (la de la organización)" to follow the organization's; the zone comes first so a 375 px select cuts the label, not the zone).
5. [x] Nav entries (General for `organization:write`, Preferencias for everyone) and docs.

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/slices/settings/` | Create | Hooks (`use-settings`, `use-settings-sync`), forms, pages, `SettingField`, the unsupported-zone hint, time zone and locale options, form schemas |
| `src/routes/_authed/settings/{general,preferences}.tsx` | Create | Routes, layout `narrow` (no loaders: `_authed` loads the settings) |
| `src/routes/_authed/settings/{security,notifications}.tsx` | Modify | Layout `narrow` instead of a manual `max-w-2xl`: no width jump inside Configuración |
| `src/routes/_authed.tsx` | Modify | Load settings before rendering, call `useReloadOnAccountSwitch` and `useSettingsSync` |
| `src/slices/auth/hooks/use-account-switch.ts` | Create | Another account in another tab: reset every query, reload the page's data |
| `src/services/date-format-service.ts` | Move + modify | Was `utils/format-date.ts`; runtime locale and time zone, unsupported-zone fallback |
| `src/hooks/use-optimistic-mutation.ts` | Modify | `successMessage: false` skips the success toast; `scope` serializes saves |
| `src/providers/theme-provider.tsx` | Modify | `Theme` from `@repo/shared`, stored value validated, blocked storage tolerated |
| `src/ui/hint.tsx` | Modify | `id`, so a control can point at the hint (`aria-describedby`) |
| `src/ui/select.tsx` | Modify | `pr-9`: long labels stop before the chevron |
| `src/layouts/nav-items.ts` | Modify | Two entries under Configuración |

## Verification Checkpoints

- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` (architecture test included), `pnpm build` inside a TypeScript backend monorepo
- [x] `useSettingsSync` test under `StrictMode`: the account's theme is applied once, a later toggle saves exactly once, nothing is saved during the first reconciliation, a failed save puts the account's theme back
- [x] `OrganizationSettingsForm` test: each save sends only the keys changed since the last one; "Restablecer" sends `null` for its key; saving a field then restoring it shows the default with Save disabled; an unsaved change of the other field survives a "Restablecer"
- [x] `useSettingsSync` test: quick saves that fail go back to the last theme the server confirmed; another account's theme applies once its settings arrive, without a save; leaving the shell restores the build locale and the browser's zone
- [x] Route test: another account signed in from another tab drops the first account's data and shows the second account's theme
- [x] `useSettingsSync` tests: a late failed save of the previous account never saves into the new one; the new account's toggles save even when its settings match the previous one's; the unsupported-zone toast shows once
- [x] Date service and options tests: a zone the browser cannot format falls back to the device's zone (locale kept) and lists under its bare name
- [x] E2E in a real browser at desktop and 375 px: both pages, member read-only view, dates across a day boundary

## Risks

- A theme toggled while the shell is still loading is overwritten: `AuthedPending` renders the header and its toggle, and the first reconciliation applies the account's theme over it. Accepted: the account's theme wins once per session.
- Theme saved and reconciled in a loop: `useSettingsSync` keeps the account's last known theme and ignores the provider's stale value until it shows the account's.
- Two quick theme toggles: saves run one at a time (mutation `scope`) and settle in order; a failed save goes back to the last theme the server confirmed unless a later toggle already replaced it.
- Another account signed in from another tab: `/me`'s re-check shows a new `userId:organizationId`; `_authed` resets every query and reloads the page's data. `useReloadOnAccountSwitch` names the new account only once its data is in the cache, and `useSettingsSync` reconciles again for it; a save of the previous account that fails late never rolls back into the new one.
- A zone the server accepts but an older browser cannot format: replies carry it as plain text, dates fall back to the device's zone with a warning, the select lists it under its bare name, and the organization form validates only the keys a save changes, so the locale can still be saved.
- Forms that follow the cache (`values` + `keepDirtyValues`) keep `dirtyFields` after a save, so a later "Restablecer" left the old value on screen. Both forms reset explicitly instead: `reset(saved)` after a save, `resetField` of that field alone after "Restablecer" (which saves at once). An unsaved change of the other field survives a "Restablecer" and stays ready to save. Each save sends only the keys that differ from the saved settings.
- Out of scope: the notification-sound switch on `/settings/notifications` stays in `localStorage` only (nothing reads it yet).
