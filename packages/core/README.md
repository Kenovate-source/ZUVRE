# @zuvre/core

Capability-agnostic domain model and orchestration core.

## Public API
- `src/domain/entities.ts` — foundation domain types (User, Workspace, WorkspaceMembership, Project, CreationRequest, CreationSpecificationRecord, Build, Asset, Deployment).
- `src/registry/capability-registry.ts` — `CapabilityRegistry`, the only place `core` knows about capability modules, and only through `@zuvre/capability-sdk`'s generic `CapabilityModule` type.

## Ownership
Owner: `@zuvre/platform-core`. Public-interface changes require an ADR per `docs/multi-agent-development.md`.

## Must never depend on
Any `modules/*` package. `core` imports `@zuvre/capability-sdk` only — never a concrete capability module. Verified by `grep -rniE "website|game|video|mobile|desktop" src/` returning no matches (see repo-level `VALIDATION.md`).

## Validation status
Compiles cleanly with `tsc`; `capability-registry.test.ts` actually runs and passes against the real `@zuvre/capability-sdk` package (via workspace symlink) in this build.
