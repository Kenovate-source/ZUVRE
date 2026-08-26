# ADR-0007: Deployment Provider Architecture

**Status**: Approved — pending implementation
**Date**: 2026-08-24
**Owner**: Platform/Infra

## Context
The `website-creation` vertical slice ends in a deployment step — the generated site needs to actually go live somewhere for the slice to be real. But the long-term platform must support multiple deployment targets across many future capability types (mobile, desktop, games, etc.), so the deployment mechanism can't be hardwired to one vendor.

## Problem
How do we ship a working deployment path for the first real module without hardcoding `core` (or `website-creation`) to a single deployment vendor?

## Decision
Vercel is the first concrete deployment target, implemented entirely behind a `DeploymentProvider` contract (deploy, get status, rollback, at minimum). `core` and `modules/website-creation` depend only on the `DeploymentProvider` interface, never on Vercel's API directly outside the one provider implementation. The first implementation targets the simplest useful path — deploying a generated static/Next.js site to Vercel — and does not attempt to build a multi-provider deployment platform up front.

## Alternatives Considered
- **Build multiple providers (Vercel + Netlify + self-hosted) from the start**: rejected as premature — no current requirement justifies the added surface area, and it would slow down proving the vertical slice for no near-term benefit.
- **No abstraction, call Vercel's API directly from the module**: rejected — this is exactly the kind of hardcoding the platform-wide extensibility goal exists to prevent, and the cost of the abstraction here is low.
- **Self-hosted deployment (custom build/serve infrastructure)**: viable long-term for cost or control reasons, but far more infra work than justified for proving the first vertical slice.

## Rationale
Vercel is a strong fit for Next.js output specifically (the likely default output of `website-creation`) and has a mature API, making it the fastest path to a real, working end-to-end slice. The `DeploymentProvider` contract is cheap to introduce now and expensive to retrofit later, so it's included from the start even though only one implementation exists.

## Consequences
- Deployment status/records in the core domain model (the `Deployment` entity) are provider-agnostic; provider-specific data lives in a scoped metadata field, not as first-class schema.
- Adding a second provider later is additive (new class implementing `DeploymentProvider`), not a rearchitecture.
- Vercel-specific concerns (API tokens, project linking, build settings) are isolated to the Vercel implementation of the provider interface.

## Risks
- Building only one provider means the abstraction's correctness is unproven until a second provider is actually added — accepted as a reasonable tradeoff versus building two providers speculatively.
- Vercel-specific constraints (build time limits, pricing at scale) could shape assumptions baked into the first implementation in ways that need revisiting once volume grows.

## Reversal Strategy
Adding or switching providers means implementing `DeploymentProvider` again for the new target and updating configuration — `core` and `website-creation` require no changes since they only reference the interface.

## Status Note
Approved. Vercel only for the first slice; no speculative multi-provider work.
