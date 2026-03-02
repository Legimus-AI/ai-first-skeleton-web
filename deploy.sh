#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-main}"
STEP="init"
START_TIME=$(date +%s)

on_failure() {
  local exit_code=$?
  echo ""
  echo "═══════════════════════════════════════"
  echo "  ✗ DEPLOY FAILED"
  echo "  Date:    $(date '+%Y-%m-%d %H:%M:%S')"
  echo "  Step:    $STEP"
  echo "  Error:   Exit code $exit_code"
  echo "═══════════════════════════════════════"
  exit "$exit_code"
}
trap on_failure ERR

STEP="git"
git fetch origin "$BRANCH"

LOCAL_HEAD=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse FETCH_HEAD)

if [ "$LOCAL_HEAD" = "$REMOTE_HEAD" ]; then
  echo "Already up to date"
  exit 0
fi

OLD_HEAD="$LOCAL_HEAD"
git reset --hard FETCH_HEAD

STEP="install"
if git diff --name-only "$OLD_HEAD" HEAD | grep -qE '^(package\.json|pnpm-lock\.yaml)$'; then
  pnpm install --frozen-lockfile
else
  echo "Dependencies unchanged, skipping install"
fi

STEP="build"
pnpm build

DURATION=$(( $(date +%s) - START_TIME ))
COMMIT=$(git rev-parse --short HEAD)
AUTHOR=$(git log -1 --format='%an')
MESSAGE=$(git log -1 --format='%s')

echo ""
echo "═══════════════════════════════════════"
echo "  ✓ DEPLOY SUCCESS"
echo "  Date:    $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Commit:  $COMMIT"
echo "  Author:  $AUTHOR"
echo "  Message: $MESSAGE"
echo "  Duration: ${DURATION}s"
echo "═══════════════════════════════════════"
