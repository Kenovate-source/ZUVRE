# @zuvre/capability-sdk

The typed contract capability modules implement to register with ZUVRE (ADR-0002).

## Public API
- `src/types.ts` — `CapabilityModule`, `CreationSpecification`, `ExecutionPlan`, `ExecutionContext`, `ProgressEvent`, etc.
- `src/testing/` (subpath export `@zuvre/capability-sdk/testing`) — a fixture module and `assertSatisfiesCapabilityContract()` helper for any module's own test suite. **Never imported by production application code.**

## Ownership
Owner: `@zuvre/platform-core` (see CODEOWNERS). Changes to `src/types.ts` are a contract change — they require an ADR amendment per `docs/multi-agent-development.md`, not an ad hoc PR.

## Must never depend on
`@zuvre/core`, any `modules/*` package, `@zuvre/db`, `@zuvre/ai-gateway`, `@zuvre/agent-runtime`, `@zuvre/tool-runtime`. This package is the leaf of the dependency graph that everything else in the capability system points at — it must stay dependency-free from the rest of the platform.

## Validation status
Compiles cleanly with `tsc` and its test suite (`node --test dist/**/*.test.js`) actually passes in this build — see the repo-level `VALIDATION.md` for the full picture.
