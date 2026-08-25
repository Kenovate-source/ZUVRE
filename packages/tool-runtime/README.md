# @zuvre/tool-runtime

Sandboxed, permissioned execution of concrete agent actions.

## Public API
`src/runtime.ts` — `Tool`, `ToolInvocation`, `ToolRuntime` (the one place permission checks happen — tools trust the runtime already verified their required scopes). `src/testing/` — example tools for tests.

## Ownership
Owner: `@zuvre/platform-ai`.

## Scope note
This foundation deliberately does NOT implement unrestricted shell execution or a real sandboxed (containerized) executor — that's later, explicit work once a capability module actually needs it, not something to fake here.

## Validation status
Compiles cleanly with `tsc`; all 4 tests (permission grant/deny, internal-error handling, unregistered-tool handling) genuinely pass in this build.
