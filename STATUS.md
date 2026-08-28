# ZUVRE — Phase 0 Status Report

This file is the single source of truth for what in this repository is
**real and implemented**, what is **designed but not implemented**, and
what has **not been validated** because this environment has no network
access. Per the project's own directive (spec §36–37): nothing below
claims a test ran that didn't, or a package installed that wasn't.

## What's Actually Implemented

- **Monorepo scaffold**: pnpm workspace + Turborepo config, shared strict
  TypeScript config, 4 packages + 1 app, all with real (not placeholder)
  source code.
- **Data model**: a complete, heavily-commented Prisma schema covering
  identity, workspaces/roles/members, the capability system, agents,
  conversations/memory, plans/entitlements/billing, links/QR, and audit
  logs — `packages/db/prisma/schema.prisma`.
- **Workspace isolation guard**: `scopedDb()` / `ownerDb()` in
  `packages/db/src/scope.ts`, used by the one real API route.
- **Capability SDK**: `defineCapability`, `capabilityRegistry`, and the
  full execution-context contract — `packages/capability-sdk`.
- **AI Gateway**: provider-agnostic routing with fallback and usage
  tracking, plus one real provider adapter (Anthropic, raw `fetch`, no
  SDK dependency) — `packages/ai-gateway`.
- **Auth foundation**: RBAC permission matching, JWT session issuing/
  verification, scrypt password hashing, and an owner-action audit
  wrapper — `packages/auth`.
- **Design system tokens**: two complete, named themes (Solmere/Duskmere)
  as both a TypeScript source of truth and CSS variables —
  `packages/ui/src/tokens.ts`, `apps/web/src/app/globals.css`.
- **One real, end-to-end capability**: `ai.chat`
  (`apps/web/src/server/capabilities/ai-chat.ts`), registered via
  `bootstrapCapabilities()`, executable through a real API route
  (`apps/web/src/app/api/capabilities/execute/route.ts`) that performs
  grant checking, input validation, execution-record creation, and
  artifact/permission plumbing per the capability contract.
- **Themed UI shell**: root layout + home page demonstrating the theme
  system.
- **Documentation**: Product Bible, Architecture, Brand Book, Capability
  System Spec (full), 3 ADRs, and a docs index mapping all 20 requested
  documents to written-vs-outlined status (`docs/README.md`).
- **Seed data**: plan definitions (Spark/Ember/Atlas/Orbit) and platform
  role stubs — `packages/db/prisma/seed.ts`.

## What's Designed But NOT Implemented

- Any capability besides `ai.chat` (image/video/audio/website/app/game/
  document/research/sticker generation, external integrations).
- The Owner Control Center UI (schema and audit plumbing exist;
  no dashboard screens).
- Agent execution runtime (schema exists; no planner/executor code).
- Async/queued job worker (ADR-0003 — deliberately deferred).
- Authentication UI and session-issuing API routes (the `auth` package
  has the primitives; no `/login`, `/register` routes wired yet).
- Billing/payment provider integration (entitlement schema exists;
  no Stripe/etc. integration).
- 15 of the 20 requested documents are outlined-and-linked rather than
  standalone (see `docs/README.md` for exactly which, and why).

## Tests

**No tests exist yet, and none were run.** This environment has
`bash_tool` with network access disabled, so `pnpm install` cannot
complete and nothing here has been compiled, type-checked, linted, or
executed. Concretely:

- `pnpm install` — not run (no registry access).
- `tsc --noEmit` / `next build` / `prisma generate` — not run (depend on
  installed packages).
- Unit/integration/API/capability-contract/authorization/workspace-
  isolation/worker tests (spec §34) — none written yet; this is real
  outstanding work, not a gap being hidden.

**What was checked**: every file was hand-written and reviewed for
internal consistency (import paths match package names and exports,
Prisma field names referenced in TypeScript match the schema, env vars
referenced in code match `.env.example`). That is a much weaker guarantee
than a passing build — treat it as "should install and run" rather than
"confirmed to run."

## First Thing To Do Next

```bash
pnpm install
```
and see what breaks. Given no dependency install has happened, there is a
realistic chance of minor issues (a version mismatch, a missing peer dep)
surfacing on first install — expected, and normal for a foundation that's
never been through `pnpm install` before.

## Recommended Next Phase

1. Run `pnpm install`, fix whatever surfaces, get `pnpm build` green.
2. Wire real auth routes (`/register`, `/login`) on top of the existing
   `packages/auth` primitives.
3. Write the test suite (spec §34) against what exists now, before adding
   more surface area.
4. Stand up the Owner Control Center's first screen: capability list
   with enable/disable, backed by the already-real
   `CapabilityDefinition.isEnabled` field.
5. Add the second real capability (a good candidate: `image.generate`,
   since it exercises `emitArtifact` and a second AI modality) to prove
   the capability contract generalizes beyond chat.
