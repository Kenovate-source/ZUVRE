# ZUVRE Architecture

## 1. Monorepo Layout

```
zuvre/
  apps/
    web/                 Next.js app (UI + API routes)
  packages/
    db/                  Prisma schema, scoped client, migrations
    capability-sdk/      defineCapability(), registry, execution context types
    ai-gateway/          Provider-agnostic AI routing (text/image/audio/video)
    auth/                Sessions, RBAC/permissions, password hashing, owner audit wrapper
    ui/                  Design tokens (Solmere / Duskmere), shared components (grows over time)
  docs/                  This documentation set + ADRs
```

Package boundaries follow one rule: **anything another package needs to
call is exported from that package's `src/index.ts`; nothing reaches into
another package's internals.** `apps/web` is the only package allowed to
import from all of the others — packages don't import `apps/web`, and
`packages/*` avoid importing each other except where the dependency is
conceptually real (`auth` depends on `db`; `capability-sdk` depends on
nothing else in the repo, so it could be published standalone later).

## 2. Request Flow (Capability Execution)

```
Client
  → apps/web API route (auth verified, input validated with zod)
  → scopedDb(workspaceId) checks CapabilityGrant is enabled
  → capabilityRegistry looks up the in-code CapabilityDefinition
  → CapabilityExecution row created (status=RUNNING)
  → capability.execute(input, ctx) runs
      ctx.reportProgress / ctx.emitArtifact / ctx.requestPermission
      are the ONLY way a capability touches state outside its own logic —
      this is what makes capabilities swappable and sandboxable later.
  → CapabilityExecution row updated (SUCCEEDED/FAILED), artifacts persisted
  → response returned
```

This flow is implemented end-to-end (not just described) in
`apps/web/src/app/api/capabilities/execute/route.ts`, wired to the real
`ai.chat` capability in `apps/web/src/server/capabilities/ai-chat.ts`, as
Phase 0's proof that the architecture actually works, per spec §3.

## 3. Data Isolation

Every workspace-owned table carries `workspaceId`. Application code is
expected to use `scopedDb(workspaceId)` (`packages/db/src/scope.ts`) rather
than the raw Prisma client for those tables. This is enforced by
convention + code review today; a follow-up hardening step (tracked in
`ADR-0004`) is to add a lint rule that forbids `rawDb.<scopedModel>` outside
of `packages/db` and explicitly audited owner paths (`ownerDb()`).

## 4. AI Gateway

`packages/ai-gateway` defines `AiProviderAdapter` (one per provider),
`ModelRoute` (which provider/model serves a given modality + scope, with an
optional fallback), and `AiGateway` (routes, retries via fallback, reports
usage). Adding a provider means writing one adapter file and registering
it — no changes to capabilities that consume the gateway. Only an Anthropic
text adapter ships in Phase 0; the interface already supports image/audio/
video/embedding for when those providers are added.

## 5. Capability System

See `09-capability-system.md` for the full spec. Architecturally: a
capability is code (`defineCapability` in `capability-sdk`) plus a database
row (`CapabilityDefinition`) that the platform owner can enable/disable
without a deploy. `bootstrapCapabilities()` reconciles the two at boot.

## 6. Agents

See `10-agent-system.md`. An `Agent` is scoped to a workspace and an
explicit allow-list of capability IDs (`allowedCapabilityIds`), plus an
`allowExternalWork` flag. An `AgentRun` produces a `plan` (steps) and drives
one or more `CapabilityExecution`s. Nothing about agents bypasses the
capability grant/permission system — an agent invoking `image.generate`
goes through the exact same grant check a human-initiated call would.

## 7. Worker / Async Architecture

Phase 0 ships only synchronous capability execution (`isAsync: false`
capabilities, like `ai.chat`). The `CapabilityExecution.status` enum
(`QUEUED / RUNNING / AWAITING_APPROVAL / SUCCEEDED / FAILED / CANCELLED`)
and the `AgentRun` model are already shaped for a queue-backed worker
(e.g. BullMQ + Redis, or Postgres-backed queue to avoid a second piece of
infra while the budget is tight — see Cost Posture below); wiring an actual
worker process is next-phase work, not yet implemented. This is tracked in
`ADR-0003`.

## 8. Observability

Structured logging and audit events are real: every `CapabilityExecution`
and every owner action (`withOwnerAudit` in `packages/auth`) writes an
`AuditLog` row. Correlation IDs, metrics export, and error-reporting
integration (e.g. Sentry) are designed for (`SENTRY_DSN` in `.env.example`)
but not wired up in this pass — see `16-observability.md`.

## 9. Cost Posture (spec §22)

Phase 0 deliberately runs on: one Postgres database, one Next.js
deployment (Vercel), and pay-per-use AI provider calls — nothing with a
fixed monthly infrastructure cost. Redis/queue infra, vector search, blob
storage providers, and multi-region deployment are all designed into the
interfaces (`AiProviderAdapter`, artifact `storageRef` as an opaque
pointer, `scopedDb`) so they can be added later without changing the
capabilities or API routes that depend on them.

## 10. Deployment

Primary target: Vercel, for `apps/web`. The app has no code that assumes
Vercel-specific APIs beyond what Next.js itself provides, so a future move
to a different host is a deployment-config change, not a rewrite. See
`14-deployment-guide.md`.
