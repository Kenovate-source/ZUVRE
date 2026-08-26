# ADR-0001: Monorepo Tooling — pnpm Workspaces + Turborepo

**Status**: Approved — pending implementation
**Date**: 2026-08-24
**Owner**: Platform/Foundation

## Context
ZUVRE will contain multiple apps (`web`, `api`, `worker`), multiple shared packages, and — over time — multiple capability modules, all developed concurrently by human engineers and AI coding agents. The repo needs a workspace and task-orchestration tool from day one, before any application code exists, since package boundaries and CI both depend on it.

## Problem
How do we manage dependency installation, cross-package linking, and task execution (build/lint/test) across a growing number of packages without either full duplication or an unmanageable single `node_modules`?

## Decision
Use **pnpm workspaces** for dependency management and **Turborepo** for task orchestration, caching, and affected-package execution.

## Alternatives Considered
- **npm/yarn workspaces**: viable but weaker at strict dependency isolation (phantom dependency risk is higher, especially relevant with many packages authored by different agents).
- **Nx**: stronger project-graph tooling, code generators, and enforced module boundaries via lint rules — but heavier conceptual overhead and a steeper ramp for contributors (including AI agents working from documentation) at a stage where the module count is still one.
- **Bazel/other build-system-first tools**: capability far exceeds current need; operational cost not justified at foundation stage.

## Rationale
pnpm's strict `node_modules` structure prevents packages from silently depending on transitive dependencies they didn't declare — this matters more here than usual because multiple independent agents will be adding packages, and phantom dependencies are a common multi-author failure mode. Turborepo's affected-package task execution keeps CI fast as the module count grows, and its configuration surface is small enough to be fully documented for agent consumption. Nx's stronger boundary-enforcement tooling is real, but is a better fit once module count and team size justify the overhead — noted as a reversal trigger below.

## Consequences
- Every package must have an explicit `package.json` with correctly declared dependencies (no relying on hoisting).
- CI task definitions live in `turbo.json` and must be kept in sync as packages are added.
- Onboarding (human or agent) requires understanding pnpm workspace protocol (`workspace:*`) for internal package references.

## Risks
- As capability modules multiply, Turborepo's lighter-weight boundary enforcement (vs. Nx's lint-enforced module graph) relies more on `CODEOWNERS` and lint rules we author ourselves, rather than a built-in project-graph constraint system.
- pnpm's strictness occasionally surfaces dependency issues that npm/yarn would silently paper over — expected and treated as a feature, but worth flagging so it isn't mistaken for tooling breakage.

## Reversal Strategy
Migrating pnpm → Nx or npm/yarn is a mechanical, well-documented path (lockfile regeneration + workspace config translation) and does not touch application code, since package boundaries are enforced by folder structure and `index.ts` exports, not by the workspace tool itself. Revisit if module count exceeds roughly a dozen and Nx's enforced module-boundary graph becomes worth the added complexity.

## Status Note
Approved. Do not introduce Nx.
