# Authoring a Capability Module

This guide is for anyone — human or AI agent — building a new capability module against `packages/capability-sdk` (see ADR-0002). It will be filled in with concrete code examples once `modules/website-creation` exists as a reference implementation; for now it documents the contract and rules.

## Before You Start

- Read ADR-0002 in full. The contract described there is authoritative; this guide explains how to work within it.
- A module lives entirely under `modules/<your-module-name>/`.
- A module may depend on: `packages/capability-sdk`, `packages/core` (types only, never internal logic), `packages/ai-gateway`, `packages/agent-runtime`, `packages/tool-runtime`.
- A module may **never** depend on: another module, or any internal (non-exported) part of `packages/core`.

## What Your Module Must Implement

1. **Identity** — a unique id, display name, semver version, and the `capabilityType`(s) and output artifact type(s) it declares.
2. **`validateSpecification(spec)`** — validate a `CreationSpecification` against what your module actually needs, returning structured (Zod) errors, not exceptions, for invalid input.
3. **`plan(spec)`** — given a *valid* specification, return an ordered plan of steps with no side effects yet. Planning must be safe to call repeatedly and cheaply.
4. **`execute(plan, context)`** — run the plan using the `context` you're given (scoped access to `ai-gateway`, `agent-runtime`, `tool-runtime`), emitting progress events as you go. This is the only place side effects happen.

## What You Must Not Do

- Call an AI model provider SDK directly — always go through the `context`'s `ai-gateway` access.
- Reach into `packages/db` directly — persistence of `Build`/`Asset`/`Deployment` records is `core`'s responsibility, driven by the events your `execute()` emits.
- Assume anything about how your module is invoked (HTTP request shape, worker queue details) — you only ever see `CreationSpecification` in and progress events out.
- Add speculative support for creation types your module doesn't actually implement yet.

## Registration

Your module is registered explicitly in application composition code (`apps/api` and/or `apps/worker`), not auto-discovered. Registration is a deliberate, reviewed code change — see `docs/multi-agent-development.md` for what that review should check.

## Testing Expectations

- Contract tests: your module must pass the shared `capability-sdk` contract test suite (proves you actually satisfy the interface).
- Your own unit tests for `validateSpecification` and `plan` logic.
- Integration/E2E coverage for `execute()`'s critical path, proportional to what the module actually does.

## Reference Implementation

`modules/website-creation` is the first real module and will serve as the canonical example once built — this guide should be updated with concrete links/examples at that point, not before.
