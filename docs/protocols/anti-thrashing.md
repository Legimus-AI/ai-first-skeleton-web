# Anti-Thrashing Protocol

> Circuit breaker for AI agents hitting repeated failures.

## Escalation Gates

| Consecutive Failures | Action |
|---------------------|--------|
| 1 | Retry with different approach |
| 2 | Isolate: write minimal reproducible case |
| 3 | Freeze scope + write failing test |
| 4 | **STOP** — escalate to human with 3 hypotheses |

## What Counts as a Failure

- Same lint/typecheck error after attempted fix
- Same test failing after attempted fix
- Same build error after attempted fix
- Component rendering incorrectly after attempted fix

## What to Document on Escalation

```markdown
## Escalation: [Component/Feature]

### What I tried
1. Attempt 1: [approach] → [result]
2. Attempt 2: [approach] → [result]
3. Attempt 3: [approach] → [result]

### 3 Hypotheses
1. [Most likely cause]
2. [Alternative cause]
3. [Edge case]

### Minimal reproduction
[Steps or code snippet]
```

## Recovery

After human resolves the issue:
1. Document the root cause in `docs/KNOWN_FAILURES.md`
2. Add a test to prevent recurrence
3. Reset the failure counter
