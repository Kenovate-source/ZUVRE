# ZUVRE Documentation Index

Status legend: **Written** = full document exists. **Outlined** = scope and
key decisions captured below and in the referencing docs, but no
standalone document yet — writing the standalone doc is templated,
low-risk work, listed in `STATUS.md` as next-phase.

| # | Document | Status | Notes |
|---|---|---|---|
| 1 | Product Bible | **Written** | `01-product-bible.md` |
| 2 | PRD | Outlined | Product Bible §5–6 cover Phase 0 scope/non-goals; a feature-by-feature PRD table is next-phase |
| 3 | Brand Book | **Written** | `03-brand-book.md` |
| 4 | Design System | Outlined | Token source of truth is `packages/ui/src/tokens.ts`; component-catalog doc is next-phase (no components built yet beyond page shell) |
| 5 | Master Development Guide | Outlined | Architecture doc §1 (package boundaries) + this index cover the essentials; contributor-onboarding doc is next-phase |
| 6 | Architecture | **Written** | `06-architecture.md` |
| 7 | Security Model | Outlined | Captured across Architecture §3 (data isolation), `packages/auth` (RBAC, owner audit), and ADR-0002 (capability sandboxing posture); consolidated standalone doc is next-phase |
| 8 | AI Architecture | Outlined | Captured in Architecture §4 and `packages/ai-gateway`; standalone doc with routing/fallback policy tables is next-phase |
| 9 | Capability System Specification | **Written** | `09-capability-system.md` |
| 10 | Agent System Specification | Outlined | Captured in Architecture §6 and the `Agent`/`AgentRun` schema; standalone doc covering planning/approval flows is next-phase |
| 11 | Owner Control Center Specification | Outlined | Captured in `packages/auth/src/owner.ts` (`withOwnerAudit`) and schema (`Role.maxOccupants`, `CapabilityDefinition.isEnabled`); no UI built yet |
| 12 | Data Model / Database Specification | Outlined | `packages/db/prisma/schema.prisma` is heavily commented and is the source of truth; a prose walkthrough doc is next-phase |
| 13 | API Specification | Outlined | One real endpoint documented in Architecture §2; a full versioned external API doesn't exist yet (nothing public-facing to version) |
| 14 | Deployment Guide | **Written (brief)** | See root `README.md` "Deploy to Vercel" section |
| 15 | Testing Strategy | Outlined | See root `STATUS.md` "Tests" section for what's runnable offline vs not, and what test types are planned |
| 16 | Observability Guide | Outlined | Captured in Architecture §8; log/metrics provider wiring is next-phase |
| 17 | Internationalization Strategy | Outlined | `User.locale`/`User.timeZone` fields exist in schema; no i18n library wired into `apps/web` yet |
| 18 | Monetization / Entitlement Specification | Outlined | Plan names/rationale in Brand Book §7; `Plan.entitlements` schema shape and seed data in `packages/db/prisma/seed.ts` |
| 19 | External Integrations Specification | Outlined | Captured conceptually in Architecture (capability `requiredPermissions`, grant `approvalPolicy`); no third-party integration implemented yet |
| 20 | ADR Collection | **Started** | `adr/0001`–`adr/0003`; add one per significant future decision |

**Why outline-and-link instead of twenty full documents up front:** several
of these (Security Model, AI Architecture, Agent System, Owner Control
Center) would otherwise duplicate the same design decisions in prose that
already live, precisely and unambiguously, in the schema and code
comments. Writing the standalone prose docs before more of Phase 1 exists
risks them drifting out of sync with the code they describe. `STATUS.md`
tracks this as explicit next-phase work rather than treating it as done.
