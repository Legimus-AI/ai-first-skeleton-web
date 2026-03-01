# Agent Session Metadata

This directory stores session metadata for AI agents working on this codebase.

## Structure

```
.agent/
├── README.md
└── sessions/
    └── <session-id>.json
```

## Session File Schema

```json
{
  "id": "uuid",
  "agent": "agent-name",
  "startedAt": "ISO-8601",
  "endedAt": "ISO-8601",
  "task": "Brief description",
  "filesModified": ["src/..."],
  "outcome": "success | failure | escalated",
  "notes": "Optional context for next session"
}
```

## Purpose

- Persistent context across sessions
- Prevents duplicate work
- Enables handoff between agents
