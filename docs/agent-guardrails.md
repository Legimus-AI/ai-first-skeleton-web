# Agent Guardrails

How this repo keeps coding agents on the rails: the instructions every agent reads, the Claude Code hook and rules that fire on their own, and the skeleton stamp that brings later fixes of this repo into projects built from it.

## Instructions every agent reads

| File | Who reads it | What it holds |
|------|--------------|---------------|
| `AGENTS.md` | Every agent (Codex, Cursor, Copilot, Gemini CLI, Claude Code through the adapter) | Commands, layout reasoning, the CRUD view contract, routing, rules |
| `INVARIANTS.md` | Every agent, through `AGENTS.md`; Claude Code through the import | Non-negotiable rules by layer (CORE, PATTERN: CRUD, ARTIFACT, OPERATIONAL), enforced by `src/__tests__/architecture.test.ts` |
| `DESIGN_SYSTEM.md`, `DESIGN_BRIEF.md` | Agents building UI | The design spec, and who the product is for (Layer 0 picks the archetype) |
| `CLAUDE.md` | Claude Code | Only imports: `@AGENTS.md`, `@INVARIANTS.md`, `@DESIGN_SYSTEM.md`. Nothing else is written there |
| `src/{constants,hooks,providers,services,utils}/AGENTS.md` | Agents working in that folder | The folder's contract; each has a `CLAUDE.md` next to it that imports it, so Claude Code loads it when it reads a file there |

`CLAUDE.md` stays an adapter on purpose: Claude Code reads `AGENTS.md` by itself only when no `CLAUDE.md` exists in the folder or above it, and a parent folder often has one. The import makes the loading explicit.

## Claude Code guardrails

All of them live in `.claude/` and are wired in `.claude/settings.json`.

| Guardrail | Where | What it does |
|-----------|-------|--------------|
| Stop hook | `.claude/hooks/arch-gate.sh` | Before the agent finishes a turn, runs `pnpm test:arch` when there are uncommitted or unpushed changes. On failure it keeps the turn open once and hands the failure report to the agent. It skips when `node_modules` is missing |
| `.env` deny | `permissions.deny` in `.claude/settings.json` | Blocks reading `.env` and `.env.*`; `.env.example` stays readable |
| Path-scoped rules | `.claude/rules/slice-component-guard.md`, `slice-hooks-guard.md`, `design-system-guard.md` | Load only when the agent touches a slice component, a slice hook, or a UI primitive / layout / `styles.css` |

**When they load:** hooks and `permissions.deny` come from the `.claude/settings.json` of the directory where the Claude Code session starts. Start the session inside this repo or its worktree; a session started in a parent folder, or one that reaches the repo through a symlink, loads none of them.

**Inside a project:** once a backend skeleton's `setup.sh` copies this repo into `apps/web/`, the project's root `.claude/` governs the session. Its stop hook runs the root `pnpm test:arch`, which also runs this repo's architecture test (`pnpm --filter @repo/web --if-present test:arch` in the TypeScript skeleton).

**Standalone:** this repo cannot install its dependencies on its own (`@repo/shared` is a workspace package), so the stop hook finds no `node_modules` and skips. The CI of this repo runs Biome and the architecture test without a full install (`.github/workflows/ci.yml`).

The architecture test checks the wiring: every hook script named in `.claude/settings.json` exists, every `pnpm` script a hook runs exists in `package.json`, no hook command pipes away its exit code, every rule in `.claude/rules/` has a `paths:` frontmatter, and no skill is a flat `.claude/skills/*.md` file (Claude Code would ignore it).

## Skeleton stamp and `/sync-skeleton`

This repo does not write a stamp itself. A backend skeleton's `scripts/setup.sh` records the commit it cloned from here in the project's `.skeleton-version`:

```
backend=Legimus-AI/ai-first-skeleton-typescript@<sha>
web=Legimus-AI/ai-first-skeleton-web@<sha>
```

The `/sync-skeleton` skill (a Legimus agent skill, not part of this repo) reads the `web=` line, lists the commits of this repo that came after it, applies them under the project's `apps/web/` oldest first, runs the project's gates and advances the stamp. That is how a fix here reaches projects that already exist.

Decision record: [ADR 0015, skeleton propagation](https://github.com/Legimus-AI/ai-first-architecture/blob/main/docs/decisions/0015-skeleton-propagation.md).
