# ADR-0008: Multi-Tenancy — Shared Database with Workspace-Scoped Row Isolation

**Status**: Approved — pending implementation
**Date**: 2026-08-24
**Owner**: Data/Platform

## Context
Workspace is ZUVRE's tenant boundary (§10 of the foundation spec). Every workspace-owned resource — projects, creation requests, builds, assets, deployments — must be strictly isolated from other workspaces, and this isolation must not depend on individual developers or agents remembering to filter queries correctly.

## Problem
How do we isolate tenant data cheaply at the current scale while making cross-tenant leakage structurally hard to introduce, even under concurrent multi-agent development?

## Decision
Use a **single shared PostgreSQL database** with **workspace-scoped row isolation**: every workspace-owned table carries a `workspaceId` column/relation, and data access is centralized in `packages/db` so that workspace scoping is enforced in one place rather than repeated ad hoc in every query. Cross-workspace access fails by default (queries require an explicit workspace context to run at all, rather than defaulting to unscoped). Automated tests specifically targeting cross-workspace leakage are a required part of the `packages/db` test suite, not optional coverage.

## Alternatives Considered
- **Schema-per-tenant**: stronger isolation guarantee, but far higher operational complexity (migrations run per schema, connection management complexity) — not justified at current scale and explicitly excluded by your instruction.
- **Database-per-tenant**: even stronger isolation, even higher operational cost — same rejection reasoning, more so.
- **Relying on manual `WHERE workspace_id = ...` clauses per query without centralization**: rejected explicitly — this is the "hope developers remember" approach the decision is designed to avoid, and is especially risky with multiple concurrent AI agents writing queries.

## Rationale
Shared-database-with-row-isolation is the standard, proven approach at ZUVRE's current stage, and centralizing the scoping logic in `packages/db` converts "every query must remember to filter" into "the data-access layer structurally can't return unscoped data" — a much safer property under concurrent multi-author development. This keeps operational cost low while the automated leakage tests provide the safety net that manual discipline alone wouldn't.

## Consequences
- Every workspace-owned Prisma model requires a `workspaceId` field and a corresponding index.
- `packages/db`'s repository functions require a workspace context as an input, not an optional filter — making unscoped access a type error, not just a convention violation, wherever practical.
- A dedicated test suite proving that workspace A's context can never read/write workspace B's data becomes part of the Definition of Done for `packages/db`, not a nice-to-have.

## Risks
- Shared-database isolation is enforced by application-layer discipline (centralized in one package) rather than the database itself — Postgres Row-Level Security is a possible additional hardening layer worth evaluating during `packages/db` implementation, not decided here.
- As data volume grows, a shared database may eventually need partitioning or read-replica strategies — a scaling concern, not a correctness concern, deferred until relevant.

## Reversal Strategy
Because all access is centralized in `packages/db`, a later move to schema-per-tenant or database-per-tenant for specific high-value workspaces (if ever needed) is a data-access-layer change, not a rewrite of every caller — callers already only interact through workspace-scoped repository functions.

## Status Note
Approved. No schema-per-tenant at this stage. Cross-workspace leakage tests are mandatory, not optional.
