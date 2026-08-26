# ADR-0003: API Architecture — tRPC (internal) + Versioned REST (external)

**Status**: Approved — pending implementation
**Date**: 2026-08-24
**Owner**: API/Platform

## Context
ZUVRE has two distinct API consumers with different needs: the first-party `apps/web` frontend (fastest possible iteration, full TypeScript control on both ends), and external/programmatic consumers — CLIs, third-party integrations, and AI agents that cannot depend on a TypeScript-coupled client.

## Problem
How do we serve both consumers without duplicating business logic or maintaining two divergent sources of truth for validation and behavior?

## Decision
- **Internal**: `apps/web ↔ apps/api` communicate via **tRPC**.
- **External**: a **versioned REST API** at `/api/v1/...`, with an OpenAPI spec generated from the same Zod schemas used by the tRPC layer.
- Both surfaces are thin adapters over the same underlying **application/domain service layer** in `core`. Neither tRPC procedures nor REST route handlers contain business logic themselves — they validate input (shared Zod schemas), call a domain service, and shape the response for their respective transport.

## Alternatives Considered
- **REST everywhere**: simpler mental model, one surface — but loses tRPC's zero-codegen type safety for the first-party app, which is a significant velocity cost given `apps/web` is the primary interface for a while.
- **GraphQL**: strong for flexible client queries, but adds a schema/resolver layer and operational complexity not currently justified — reconsider only if a real need for flexible client-driven querying emerges (e.g. complex dashboard composition).
- **tRPC everywhere, external clients get a generated client package**: rejected because it still couples external consumers (including AI agents that may not be TypeScript-based) to a TS-specific protocol.

## Rationale
Splitting by consumer type, not by feature, is the right axis — it means we don't have to decide per-endpoint which protocol to use. Sharing the Zod validation layer between both surfaces is what actually prevents duplication of business logic; the transport layer is intentionally kept thin.

## Consequences
- Every publicly relevant capability needs a domain service function that both a tRPC procedure and a REST handler can call — this shape needs to be established early and followed consistently.
- OpenAPI spec generation from Zod becomes a build step that must stay in CI (spec drift is a real risk if this isn't automated).
- Versioning discipline (`/api/v1/`) starts from the first REST endpoint, not retrofitted later.

## Risks
- Two transport surfaces mean two places integration bugs can hide if the "thin adapter, shared service" discipline slips — this is the main thing code review should watch for.
- REST versioning strategy for *breaking* changes (v1 → v2) is not yet defined in detail — deferred until the first breaking change is actually needed, but the `/api/v1/` prefix from day one keeps the door open.

## Reversal Strategy
Because both surfaces are thin adapters over shared domain services, dropping either transport (e.g. replacing REST with GraphQL later) means rewriting the adapter layer only — the domain service layer, which contains the actual logic, is untouched.

## Status Note
Approved. No business logic may live directly in a tRPC procedure or REST handler.
