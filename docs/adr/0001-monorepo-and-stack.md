# ADR 0001: Monorepo, pnpm + Turborepo, Next.js + Prisma/Postgres

**Status:** Accepted

## Context
ZUVRE needs many independently-evolvable pieces (capability SDK, AI
gateway, auth, db, UI, and eventually many capability packages) that still
need to ship as one coherent product, on a near-zero infrastructure
budget, deployable to Vercel first.

## Decision
- pnpm workspaces + Turborepo for the monorepo (fast, cache-friendly,
  no paid infra required).
- TypeScript throughout, strict mode, shared `tsconfig.base.json`.
- Next.js (App Router) for `apps/web` — one deployable that serves both UI
  and API routes, matching the Vercel-first deployment target (spec §24).
- PostgreSQL + Prisma for the database — mature, free/low-cost hosting
  options (e.g. Neon, Supabase, Railway free tiers) exist, and Prisma's
  schema is a good source of truth for the data model doc.

## Alternatives Considered
- Separate backend service (NestJS/Express) — rejected for Phase 0: adds a
  second deployable and infra cost with no capability that needs it yet.
  Revisit if worker/queue needs (ADR-0003) outgrow serverless functions.
- Drizzle instead of Prisma — Prisma chosen for schema-as-documentation
  ergonomics and migration tooling maturity; either would have worked.

## Consequences
Package boundaries must be respected via `src/index.ts` exports (see
Architecture doc §1) or the monorepo's isolation benefits erode over time.
