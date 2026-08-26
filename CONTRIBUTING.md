# Contributing to ZUVRE

This applies equally to human engineers and AI coding agents. See also `docs/multi-agent-development.md` for the reasoning behind these rules.

## Before You Start

- Read `docs/architecture/README.md` and the ADR(s) relevant to what you're touching.
- Confirm your task is scoped to one package or one module. If it isn't, split it or raise the boundary question before starting.

## Branching & Commits

- Trunk-based development: short-lived branches off `main`, no direct pushes to `main`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`) — this enables automated changelog generation later.

## Pull Requests

- Keep PRs small and scoped to a single package/module and a single concern.
- PR description should link the relevant ADR(s) if the change touches architecture, and the task/issue it addresses.
- All CI checks (lint, typecheck, unit tests, and E2E where applicable) must pass before merge.
- CODEOWNERS review is required for the package(s) touched — this is enforced by branch protection, not optional.

## Architectural Changes

- Any change to a package's public interface, the capability contract, shared API shapes, or the database schema requires an ADR, written and reviewed *before* the implementation PR, using `/adr/0000-template.md`.
- Do not retrofit an ADR to justify a change already merged.

## Testing

- New code ships with tests appropriate to what it does — unit tests colocated with source, integration tests for API boundaries, contract tests for anything implementing a shared interface (e.g. `capability-sdk`).
- A change without corresponding tests is not considered complete.

## Documentation

- Package-level `README.md` (purpose, public API, ownership, what it must not depend on) is required for every package and kept current as the package changes.
- `docs/` is updated in the same PR as the change it documents, not as a follow-up.

## Style

- Formatting and linting are automated (config lives in `packages/config`) and enforced in CI — don't hand-format against the tool's output.
