# @zuvre/agent-runtime

Minimal plan/act/observe step runner, capability-agnostic.

## Public API
`src/runtime.ts` — `AgentStep`, `AgentRuntime.run()`.

## Ownership
Owner: `@zuvre/platform-ai`.

## Scope note
Deliberately not a complete autonomous agent system — no dynamic re-planning or goal-directed loop yet. A capability module supplies concrete step actions; this just sequences them and records outcomes.

## Validation status
Compiles cleanly with `tsc`; all 4 tests (success path, continue-past-failure, stopOnFailure, outcome callback) genuinely pass in this build.
