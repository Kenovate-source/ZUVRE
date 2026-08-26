# ZUVRE

An extensible AI creation ecosystem. This repository is the **Foundation Skeleton** — the capability-agnostic core, cross-cutting boundaries, and process scaffolding the first real capability module (`modules/website-creation`) will be built on top of. See `docs/architecture/README.md` for the full picture.

## Status

Foundation stage. No capability modules exist yet. See `VALIDATION.md` for exactly what has been verified to work versus what is authored and awaiting verification after dependency installation.

## Repository Layout

```
apps/           web (Next.js), api (tRPC + REST), worker (background jobs)
packages/       core, db, capability-sdk, ai-gateway, agent-runtime,
                tool-runtime, auth, observability, ui, config
modules/        (empty — website-creation is the next thing built here)
adr/            Architecture Decision Records — read these first
docs/           architecture overview, module-authoring guide, process rules
```

## Getting Started (in a real development environment)

This skeleton was built in a sandbox with no network access, so none of the following has actually been run — see `VALIDATION.md` for specifics. In a real environment:

```bash
pnpm install
docker compose up -d               # starts local Postgres
pnpm --filter @zuvre/db prisma:migrate:dev
pnpm build
pnpm test
pnpm dev
```

## Where to Go Next

- **Understand the architecture**: `docs/architecture/README.md`
- **Understand a specific decision**: `adr/README.md` (index of all 8 approved ADRs)
- **Build a capability module**: `docs/module-authoring.md`
- **Contribute** (human or AI agent): `CONTRIBUTING.md` and `docs/multi-agent-development.md`
- **Know what's actually verified**: `VALIDATION.md`

## Principles (see ADRs for full rationale)

1. `packages/core` is capability-agnostic — no `if (website) / if (game)` branching, ever.
2. Every cross-cutting concern (AI calls, deployment, data access, auth) has exactly one gateway package.
3. Workspace is the tenant boundary, enforced centrally, not per-query.
4. Nothing is built for a future capability type before it's real — no stub modules.
