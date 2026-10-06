#!/bin/bash
# Stop hook: keep the turn open while architecture tests fail.
# Exit 2 sends stderr back to the agent; any output on exit 0 would only reach the debug log.

INPUT=$(cat)

# WHY: stop_hook_active means this hook already blocked once in this chain; blocking again loops forever.
echo "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true' && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
# Skip only when nothing is uncommitted and nothing is unpushed; if git fails, run the tests.
if DIRTY=$(git status --porcelain 2>/dev/null) && [ -z "$DIRTY" ] \
  && [ -z "$(git rev-list -1 HEAD --not --remotes 2>/dev/null)" ]; then exit 0; fi

# Dependencies not installed: the tests cannot run, so there is no verdict to enforce.
[ -d node_modules ] || exit 0

OUTPUT=$(pnpm test:arch 2>&1) && exit 0

echo "Architecture gate failed. If these are test failures, fix the code, never the tests; if the runner could not start, report it:" >&2
# Passing lines are noise for the agent; keep only the failure report.
echo "$OUTPUT" | grep -v "✓" | tail -40 >&2
exit 2
