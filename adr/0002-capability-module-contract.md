# ADR-0002: Capability Module Contract

**Status**: Approved — pending implementation
**Date**: 2026-08-24
**Owner**: Core/Platform

## Context
ZUVRE must eventually support many creation types (websites, games, video, agents, etc.) without `core` accumulating type-specific branching. This is the central architectural bet of the whole project and must be right before the first real module (`website-creation`) is built against it.

## Problem
What is the stable interface between `core` (orchestration, persistence, registry) and a capability module (the thing that actually knows how to build a website, a game, etc.), such that new capabilities can be added without modifying `core` or any existing module?

## Decision
Define a typed contract in `packages/capability-sdk` that every capability module implements. Minimum required surface:

- **Identity**: unique id, display name, semver version, declared `capabilityType`(s) and output artifact type(s).
- **`validateSpecification(spec)`**: returns valid/invalid + structured (Zod) errors, given a `CreationSpecification`.
- **`plan(spec)`**: returns an execution plan (ordered steps, estimated resources) without side effects.
- **`execute(plan, context)`**: runs the plan, returning/emitting a stream of progress events (status, logs, artifacts). `context` supplies scoped access to `ai-gateway`, `agent-runtime`, and `tool-runtime` — the module never reaches those directly outside the context it's given.

Modules are registered **explicitly** in application composition code (`apps/api`, `apps/worker`) at startup — an explicit array/map of module instances passed into `core`'s `CapabilityRegistry`. Filesystem-based auto-discovery is explicitly rejected.

The contract is proven via a **test fixture / mock module** living inside the `capability-sdk` (or `core`) test suite — not a permanent no-op module in `modules/`. The fixture may be deleted or rewritten freely since it is test-only and never registered in a real application.

The first and only real module built against this contract initially is `modules/website-creation`. No stub modules for other capability types are created.

## Alternatives Considered
- **Filesystem/convention-based auto-discovery** (e.g. any folder in `modules/` auto-registers): faster to add modules, but harder to audit, harder to type-check at the registration boundary, and a worse fit for a multi-agent codebase where predictability matters more than convenience.
- **Inheritance-based module base class**: rejected in favor of an interface/contract — composition over inheritance keeps modules from accidentally depending on `core` implementation details.
- **A permanent no-op/throwaway module in `modules/`**: rejected per explicit correction — it would ship dead code into the production module directory and blur the line between "real capability" and "test scaffold."

## Rationale
An explicit, typed, statically-registered contract is the only version of this that is both (a) safe for AI agents to implement against without needing to understand `core` internals, and (b) enforceable by CI/typecheck rather than by convention or code review alone. Keeping the proof-of-contract entirely inside tests avoids production code paths that exist only to demonstrate an architecture rather than serve a user.

## Consequences
- Adding a capability module never requires a `core` code change beyond one line of registration wiring in application composition.
- The contract itself becomes the single highest-leverage (and highest-risk) interface in the codebase — changes to it require an ADR per the multi-agent development rules, not an ad hoc PR.
- Module authors have a clear, testable contract to build against, documented in `docs/module-authoring.md`.

## Risks
- Getting the contract wrong before `website-creation` exists means discovering gaps only once real implementation starts — mitigated by treating `website-creation`'s build as validation of the contract, with contract revisions expected and tracked via ADR amendments rather than silent drift.
- Streaming progress-event design (`execute`'s return shape) is the most likely part to need revision once real async, long-running builds are implemented.

## Reversal Strategy
Because modules only depend on `capability-sdk` types (never on `core` internals or each other), contract changes are isolated to `capability-sdk` plus each module's implementation of it — `core`'s registry and persistence logic don't need to change for most contract revisions.

## Status Note
Approved. No permanent throwaway module. No filesystem auto-discovery. `website-creation` is the only real module to be built next.
