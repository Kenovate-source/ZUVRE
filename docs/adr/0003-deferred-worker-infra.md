# ADR 0003: Defer Real Worker/Queue Infrastructure Past Phase 0

**Status:** Accepted

## Context
Spec §27 requires async job architecture (queued, retryable, cancellable,
progress-reporting). Standing up Redis/BullMQ (or similar) is real
infrastructure with a cost and operational surface, and no Phase 0
capability actually needs to run longer than a request/response cycle
(`ai.chat` is synchronous).

## Decision
Ship the data model and execution-status contract that a worker will use
(`CapabilityExecution.status`, `AgentRun`) now, but implement only the
synchronous path in Phase 0. Do not stand up a queue until a capability
that genuinely needs it (e.g. video generation, website build/deploy) is
being implemented.

## Consequences
`isAsync: true` capabilities cannot be added yet without also building the
worker. This is a deliberate sequencing choice (spec §22's "scale
technically from the beginning; scale spending only when necessary") —
tracked as required Phase 2 work, not silently skipped.
