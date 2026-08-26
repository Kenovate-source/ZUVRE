# ZUVRE Architecture Overview

This is the entry point for understanding how ZUVRE is built. It summarizes decisions recorded in detail in `/adr/`.

## What ZUVRE Is (Foundation Stage)

A platform where a `core` orchestration layer manages Users, Workspaces, Projects, and CreationRequests, and delegates the actual work of creation to pluggable **capability modules**. `core` never contains logic specific to any one creation type (website, game, video, etc.) — see ADR-0002.

## System Shape

```
                     ┌─────────────┐
      apps/web  ───▶ │             │
      (Next.js)      │  apps/api   │ ───▶  packages/core (orchestration, registry)
                      │ (tRPC/REST)│            │
   external / CLI /   │             │            ▼
   agents ─────────▶  └─────────────┘     packages/db (Prisma/Postgres)
     (REST v1)                                    │
                                          modules/website-creation
                                           (implements capability-sdk)
                                                    │
                            ┌───────────────────────┼───────────────────────┐
                            ▼                       ▼                       ▼
                    packages/ai-gateway   packages/agent-runtime   packages/tool-runtime
                     (all model calls)    (plan/act/observe loop)  (sandboxed execution)
```

`apps/worker` runs longer background executions (module `execute()` calls) so `apps/api` stays responsive; both share `packages/core`.

## Core Principles

1. **`core` is capability-agnostic.** It orchestrates a generic `CreationRequest → Specification → Plan → Build → Deployment` lifecycle and never branches on creation type.
2. **One contract, many modules.** `packages/capability-sdk` is the only thing a capability module needs to know about the platform. See ADR-0002 and `docs/module-authoring.md`.
3. **Every cross-cutting concern has exactly one gateway.** All AI calls go through `packages/ai-gateway` (ADR-0006). All deployment goes through the `DeploymentProvider` contract (ADR-0007). All data access goes through `packages/db` (ADR-0004). All auth goes through `packages/auth` (ADR-0005).
4. **Workspace is the tenant boundary**, enforced centrally in the data-access layer, not per-query (ADR-0008).
5. **Nothing is built for future capability types before they're real.** No stub modules for games, video, mobile, etc. exist or should exist at this stage.

## Where to Go Next

- Building a capability module → `docs/module-authoring.md`
- Understanding a specific decision → `/adr/`
- Contributing (human or agent) → `CONTRIBUTING.md` and `docs/multi-agent-development.md`

## What This Document Is Not

Not a full implementation spec, not a database schema reference (see the relevant ADRs and, once written, `packages/db`'s own README), and not a commitment to every future capability listed in ZUVRE's long-term vision — only to the architecture remaining compatible with them.
