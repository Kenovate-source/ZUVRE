# ADR-0004: Database & ORM — PostgreSQL + Prisma

**Status**: Approved — pending implementation
**Date**: 2026-08-24
**Owner**: Data/Platform

## Context
ZUVRE needs a typed, migratable data layer isolated behind a single package boundary (`packages/db`) so no application package can create ad hoc database access paths.

## Problem
Which database and ORM combination gives the strongest type safety and migration story while staying isolated behind one package boundary?

## Decision
Use **PostgreSQL** as the primary datastore and **Prisma** as the ORM, entirely encapsulated in `packages/db`. No application package (`apps/*`, `modules/*`) instantiates its own Prisma client or issues raw queries outside this package — all data access goes through repository/service functions exported from `packages/db`.

## Alternatives Considered
- **Drizzle ORM**: lighter weight, closer to raw SQL, generally better edge-runtime compatibility. A real alternative, set aside for now because Prisma's migration tooling and DX are more mature today and the team is starting from zero — but flagged explicitly below as the fallback if edge-runtime constraints become real.
- **Raw SQL / query builder (Kysely, etc.)**: maximum control, minimum abstraction — rejected for the foundation stage as it pushes more type-safety responsibility onto hand-written code, which is a worse fit for a multi-agent-authored codebase.

## Rationale
Prisma's schema-first workflow, generated client, and migration tooling reduce the chance of drift between schema and code — a meaningful concern when multiple agents may be adding entities over time. PostgreSQL is the right default relational store given the relational nature of the core domain model (§6–7 of the foundation spec) and its strong ecosystem support across every deployment target under consideration.

## Consequences
- All core entities (§7 of the foundation spec) are modeled in one Prisma schema in `packages/db`.
- Any capability module needing its own persistent state (e.g. `website-creation`-specific data) still goes through `packages/db` — either as first-class schema additions (with migration) or scoped JSON columns, decided when that module is actually built, not now.
- Database migrations become a first-class, reviewed artifact in every PR that changes schema.

## Risks
- Prisma has known rough edges in some edge-runtime deployment targets; if `apps/web` or `apps/api` need edge deployment, this could force a reconsideration.
- Prisma's generated client can encourage over-fetching if repository functions aren't deliberately scoped — a code-review concern, not a tooling one.

## Reversal Strategy
Because all access is centralized in `packages/db`, an ORM swap (Prisma → Drizzle) is isolated to that package's internals; consuming code depends on the repository functions' exported types, not Prisma's client types directly, which should hold if we keep repository return types as plain domain types rather than re-exporting Prisma's generated types verbatim — call this out explicitly during `packages/db` implementation.

## Status Note
Approved. Watch the edge-runtime constraint; revisit only if it becomes a real deployment requirement.
