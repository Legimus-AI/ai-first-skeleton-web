# UI Archetypes & Shell Primitives

**Goal:** An AI agent starting from this skeleton picks (or designs) the right shell per product archetype instead of defaulting to admin-sidebar — with CORE enforcement intact.
**Scope:** frontend (+ doc sync in ai-first-architecture)
**Context:** ai-first-skeleton-web (React 19 + Vite + TanStack + Tailwind v4). Decision from CED debate 2026-06-11 (option C: archetypes + primitives + governed escape hatch). Spike verified: enforcement already tolerates non-CRUD slices; only INV-102 guards layout widths.
**Created:** 2026-06-11

## Research

- `INVARIANTS.md` (107 lines): rules already grouped by number range (1-34 general, 100-112 layout, 200-202 artifacts). CRUD rules (10, 11, 104, 106, 107, 109, 110) are conditional in TESTS (keyed on `*-list.tsx` / `getCrudSliceNames()`) but the doc never says so. → Layers must be documented, NOT renumbered (IDs are stable contract).
- `DESIGN_BRIEF.md` (84 lines): 3 layers, 16 questions. No product-archetype question. Q7 "Flow Type" is adjacent. → New "Layer 0 — Product Archetype" before Layer 1.
- `docs/layouts.md` + `src/layouts/`: 2 shells (authed-layout sidebar, navbar-layout) chosen by 1 import in `src/routes/_authed.tsx:2`. `content-area.tsx` owns ALL width variants (INV-102). WORKS.
- `src/ui/`: 34 primitives. No SplitPane. MISSING.
- `AGENTS.md:93-99`: promises `bun scripts/generate-slice.ts` — script does NOT exist (only `generate-routes.mjs`). FALSE DOC.
- `src/hooks/use-push-notifications.ts`: violates INV-021 (useEffect + api call same file). Pre-existing; skeleton fails own tests. Fix: subscription state → `useQuery`, subscribe/unsubscribe → `useMutation`.
- `apps/web/src/...` (2 files): mirror contamination from monorepo accident (stale copies of notifications.tsx + switch.tsx). DELETE.
- `DESIGN_BRIEF.md` empty template fails INV-201 test (`< 10 lines of content`). The skeleton ships a template by design — test must accept template-with-examples OR brief stays as-is and test tolerance documented. Spike showed it FAILS today. → fix by relaxing test to skip when file is the pristine template (marker comment), keeping enforcement for real projects.
- Spike evidence (2026-06-11): chat slice (no `-list.tsx`) passes ALL rules; custom layout only trips INV-102 (by design, ContentArea is the lawful path).

## Open Questions

None — proceeding with assumptions below.

## Decisions

- Archetype values: `admin-crud` | `conversational` | `focused-tool` | `split-view` | `custom` (PROVISIONAL — promote new ones only after real repetition; GPT-5.5 risk #1).
- Frontend slice generator: NOT implemented this session — AGENTS.md updated to reflect reality (reference slices as pattern source). PROVISIONAL.
- Chat reference slice is client-state only (no backend chat endpoint exists in skeleton API); documented as the non-CRUD UI pattern example with a comment showing where TanStack Query would attach.
- INV-201 test: pristine-template detection via the existing `<!-- Example:` markers count, so skeleton stays green but real projects must fill the brief.
- Related: CED Decision Record 2026-06-11 (this session), ADR 0010-0013, INV-070 (doc sync).

## Approach

Single repo, three moves: (1) make the decision portal explicit (archetype question + layered invariants + Layout Reasoning section), (2) give the vocabulary (SplitPane primitive + focused/split shell presets over ContentArea), (3) break the example monopoly (chat reference slice). Cleanup rides along because the same files are touched. Architecture spec synced in same change-set (INV-070).

## Requirements

### What it must do
- DESIGN_BRIEF.md asks Product Archetype (5 values) before Layer 1.
- INVARIANTS.md declares CORE vs PATTERN:CRUD vs ARTIFACT layers without renumbering.
- `src/ui/split-pane.tsx` primitive (responsive: side-by-side ≥md, stacked below) + `src/layouts/focused-layout.tsx` + `src/layouts/split-layout.tsx`, both INV-102-clean.
- AGENTS.md "Layout Reasoning" section: decision rule (dominant flow listar/editar → preset; conversar/componer/manipular → custom via frontend-design skill + DECISIONS.ndjson entry + brief justification). CORE never relaxes.
- `src/slices/chat/` reference slice + `/chat` route + nav entry, passing all architecture tests.
- use-push-notifications.ts passes INV-021 via TanStack Query.
- `apps/` mirror removed; .gitignore prevents recurrence; generator promise corrected.
- ADR 0014 + CHANGELOG bump in ai-first-architecture; frontend-principles.md note.

### What it must NOT do
- No renumbering of INV IDs. No weakening of CORE rules. No new repos/branches.
- No backend changes. No new heavy deps (SplitPane is hand-rolled flex/grid).

### Acceptance Criteria
- [ ] `npx vitest run src/__tests__/architecture.test.ts` green on skeleton-web standalone (including previously failing INV-021 + INV-201).
- [ ] `pnpm build` green standalone.
- [ ] Post-setup monorepo (setup-v3-pg copy): web tests + typecheck green with synced changes.
- [ ] Chrome MCP visual check: 4 shells render (sidebar, navbar, focused, split) + chat slice usable; screenshots captured.
- [ ] ADR 0014 committed in ai-first-architecture same session.

## Commands
- lint: `npx biome check .` — typecheck: `pnpm typecheck` — test: `npx vitest run` — build: `pnpm build`

## Stage Queue
- [ ] Stage 1: clean — remove `apps/` mirror (2 files), add `.gitignore` guard `apps/`, fix AGENTS.md generator promise (point to reference slices), refactor `use-push-notifications.ts` to useQuery (subscription state: queryKey ['push','subscription'], queryFn registers SW + reads subscription) + useMutation (subscribe/unsubscribe invalidating that key). Acceptance: INV-021 test passes; hook API surface unchanged (same return shape).
- [ ] Stage 2: document — DESIGN_BRIEF.md Layer 0 (archetype Q with 5 values + guidance per value); INVARIANTS.md layer headers + per-rule scope tags for 10, 11, 104, 106, 107, 109, 110 ("PATTERN: CRUD — applies to slices with `*-list.tsx`"); AGENTS.md "Layout Reasoning" section with decision rule + escape hatch contract; relax INV-201 test for pristine template (count `<!-- Example:` markers). Acceptance: arch tests green; INVARIANTS unchanged IDs.
- [ ] Stage 3: build shells — `src/ui/split-pane.tsx` (props: `sidebar`/`detail` or `left`/`right`, `defaultRatio`, responsive stack <md, uses tokens only); `src/layouts/focused-layout.tsx` (minimal header: app name + UserDropdown + theme toggle, ContentArea narrow default, no persistent nav); `src/layouts/split-layout.tsx` (header + SplitPane body, nav optional via navItems); update `docs/layouts.md` (4 shells table + archetype mapping + how to switch). Acceptance: INV-102 clean (no max-w outside content-area), arch tests green.
- [ ] Quality Gate (lint + typecheck + arch tests)
- [ ] Stage 4: add chat reference slice — `src/slices/chat/components/chat-view.tsx` (message list + composer, optimistic local append, all UI states, tokens only, aria labels), `src/routes/_authed/chat.tsx` (renders ChatView inside SplitPane with conversation list placeholder→ real local conversations), nav entry in nav-items.ts. Comment block: where TanStack Query attaches when a backend exists. Acceptance: arch tests green (no CRUD rules triggered), route renders.
- [ ] Stage 5: sync architecture repo — ADR `0014-ui-archetypes-and-shell-primitives.md` in ai-first-architecture/docs/decisions (decision, evidence table from CED, alternatives A/B rejected); CHANGELOG v2.7.0 entry; frontend-principles.md: add F7 archetype note + link ADR. Acceptance: files exist, cross-refs valid.  [GATE: push de ambos repos]
- [ ] Stage 6: validate — rsync changes into setup-v3-pg/apps/web, run web tests + typecheck there; launch api+web dev servers; Chrome MCP: login, screenshot sidebar shell, swap import → navbar, focused, split (temporary edit in the throwaway copy), screenshot each, exercise /chat (send messages, empty state), check console errors. Acceptance: all 4 shells + chat verified visually, zero console errors.
- [ ] Final Gate: /check-patterns + full test suite both repos

## Confidence: 8.5
Spike already validated the structural risk (enforcement tolerates non-CRUD). Remaining risk is mechanical (INV-021 refactor, INV-201 test adjustment) — both covered by running arch tests per stage.

## Current Stage: 0 (not started)

## Progress Log
- 2026-06-11 — Plan created (6 stages) from CED decision record.

## Challenge Applied
**Technique:** Pre-mortem (auto-applied; autonomous flow per Victor's instruction)
**Key findings:**
- INV-201 test would keep the skeleton red even after our changes (template brief fails `< 10 lines` check) — added explicit fix to Stage 2 (was missing from original ask).
- INV-021 fix risks changing the hook's public API and breaking notifications settings page — acceptance pinned to "same return shape".
- Visual verification needs a running backend (login wall) — Stage 6 explicitly uses setup-v3-pg with pg18-dev DB already provisioned.
- Shell demos can't be toggled per-route (shell is per-project, 1 import) — Stage 6 swaps the import in the throwaway copy instead of polluting the repo.
**Plan changes:** Stage 2 gained INV-201 test relaxation; Stage 6 gained explicit swap-import procedure; acceptance criteria pinned hook API stability.

## Exit Criteria
- [ ] All stages complete
- [ ] All quality gates pass (lint + typecheck + test)
- [ ] /check-patterns passes
- [ ] Visual verification (Chrome MCP) passes
- [ ] ADR 0014 + CHANGELOG synced in ai-first-architecture
