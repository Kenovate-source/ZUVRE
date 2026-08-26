# Architecture Decision Records — Index

ADRs are the required record of any architectural decision in ZUVRE. No undocumented architectural changes — see `docs/multi-agent-development.md`.

New ADRs start from `0000-template.md`, are numbered sequentially, and default to `Proposed` until explicitly marked `Approved`.

| ADR | Title | Status |
|---|---|---|
| [0001](./0001-monorepo-tooling.md) | Monorepo Tooling — pnpm + Turborepo | Approved — pending implementation |
| [0002](./0002-capability-module-contract.md) | Capability Module Contract | Approved — pending implementation |
| [0003](./0003-api-architecture.md) | API Architecture — tRPC + Versioned REST | Approved — pending implementation |
| [0004](./0004-orm-database.md) | Database & ORM — PostgreSQL + Prisma | Approved — pending implementation |
| [0005](./0005-authentication-architecture.md) | Authentication Architecture | Approved — pending implementation |
| [0006](./0006-ai-gateway-architecture.md) | AI Gateway Architecture | Approved — pending implementation |
| [0007](./0007-deployment-provider-architecture.md) | Deployment Provider Architecture | Approved — pending implementation |
| [0008](./0008-multi-tenancy.md) | Multi-Tenancy — Shared DB + Workspace Row Isolation | Approved — pending implementation |

All 8 foundation-stage ADRs are now **Approved — pending implementation**. Future ADRs will be added as new capability modules or cross-cutting concerns require decisions — not written speculatively ahead of need.
