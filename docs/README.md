# Documentation

Every guide in `docs/`, one line each. New here? Read [AGENTS.md](../AGENTS.md) and [layouts.md](layouts.md) first, then the guide that matches your task.

## 🧭 Building views

| File | What it is for |
|------|----------------|
| [layouts.md](layouts.md) | The four shell presets, choosing one per archetype, SplitPane, layout variants (`default`, `full`, `narrow`, `wide`, `bleed`) |
| [api-client.md](api-client.md) | Calling the API through `src/services/api-client.ts` and handling typed errors |
| [pagination.md](pagination.md) | List hooks with `ListQuery` params and the `meta` they return |
| [optimistic-mutations.md](optimistic-mutations.md) | `useOptimisticMutation` for toggles and inline edits, and when not to use it |
| [motion.md](motion.md) | CSS-only motion primitives, timing and reduced-motion rules |
| [i18n.md](i18n.md) | Locale-aware date and number formatting with `Intl` |
| [auth-and-api-keys.md](auth-and-api-keys.md) | Better Auth's client (`auth-client.ts`), sign-in, sign-up, password reset, email verification and invitation routes, OAuth consent and CLI approval pages, the `_authed` and `_session` guards, the session policy, team changes, API key scopes and connected apps |

## 🤖 Agents

| File | What it is for |
|------|----------------|
| [agent-guardrails.md](agent-guardrails.md) | `AGENTS.md`, the `CLAUDE.md` adapter, the Claude Code stop hook, rules and `.env` deny, the skeleton stamp and `/sync-skeleton` |
| [protocols/anti-thrashing.md](protocols/anti-thrashing.md) | What an agent does after repeated failures, and how to escalate |
| [KNOWN_FAILURES.md](KNOWN_FAILURES.md) | Registry of failures and their fixes; check it before debugging |

## 🧪 Testing

| File | What it is for |
|------|----------------|
| [testing-e2e.md](testing-e2e.md) | E2E responsibilities of the frontend; the tests live at the monorepo root |

## 🔌 Recipes

| File | What it is for |
|------|----------------|
| [recipes/sentry.md](recipes/sentry.md) | Error tracking and performance monitoring with Sentry |
| [recipes/clarity.md](recipes/clarity.md) | Session replay and heatmaps with Microsoft Clarity |
| [recipes/opentelemetry.md](recipes/opentelemetry.md) | Browser tracing correlated with backend traces through `X-Request-Id` |
| [recipes/push-notifications.md](recipes/push-notifications.md) | Browser push notifications with VAPID keys and a service worker |

## 🏛️ Decisions and plans

| File | What it is for |
|------|----------------|
| [DECISIONS.ndjson](DECISIONS.ndjson) | Append-only decision log, one JSON line each (fetch wrapper over Hono RPC, product archetypes, the floating listbox); a `custom` archetype must log its reason here |
| [plans/README.md](plans/README.md) | How feature plans work: when to write one, confidence gate, lifecycle |
| [plans/TEMPLATE.md](plans/TEMPLATE.md) | Template for a new plan |
| [plans/skeleton-essentials.md](plans/skeleton-essentials.md) | Plan behind the profile pages and the flexible layout system |
| [plans/world-class-ui-components.md](plans/world-class-ui-components.md) | Plan behind the command palette, optimistic UI, motion and undo toast |
| [plans/ui-archetypes-shell-primitives.md](plans/ui-archetypes-shell-primitives.md) | Plan behind the product archetypes and shell presets (ADR 0014) |
| [plans/scroll-safe-floating-listbox.md](plans/scroll-safe-floating-listbox.md) | Plan behind the scroll-safe, body-portaled floating listbox |

## 📌 At the repo root

[README.md](../README.md) (overview and commands), [CHANGELOG.md](../CHANGELOG.md) (what each version changed, from 3.0.0 on), [AGENTS.md](../AGENTS.md) (agent instructions), [INVARIANTS.md](../INVARIANTS.md) (rules the architecture test enforces), [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) (the design spec and the Suave identity), [DESIGN_BRIEF.md](../DESIGN_BRIEF.md) (who the product is for; Layer 0 picks the archetype).
