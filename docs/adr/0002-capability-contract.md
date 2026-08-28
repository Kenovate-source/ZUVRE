# ADR 0002: Capability Contract — Context Object, Not Ambient Access

**Status:** Accepted

## Context
Capabilities must be addable without core platform changes, and must not
be able to silently exceed their granted permissions (spec §3, §20).

## Decision
A capability's `execute(input, ctx)` receives no ambient access to the
database, network, or other capabilities. All side effects — progress
reporting, artifact creation, permission escalation — go through the
passed `ctx` object, which the runtime constructs per-execution scoped to
one workspace and one grant.

## Alternatives Considered
- Capabilities importing `@zuvre/db` directly — rejected: makes workspace
  isolation and permission enforcement a matter of capability-author
  discipline rather than a structural guarantee.
- A plugin/sandbox process (e.g. separate V8 isolate per capability) —
  desirable long-term for third-party/marketplace capabilities, but out of
  scope for Phase 0 where all capabilities are first-party code reviewed
  before merge. Revisit before allowing external developers to publish
  capabilities.

## Consequences
First-party capabilities are still trusted code (they run in-process), but
the *interface* they're written against already matches what a future
sandboxed runtime would expose, so hardening later is a runtime change,
not a capability-author-facing breaking change.
