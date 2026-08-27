# @zuvre/ai-gateway

Provider-agnostic AI gateway (ADR-0006). All model-provider communication goes through here — no module or app calls OpenAI/Anthropic/Google SDKs directly.

## Public API
`src/types.ts`, `src/gateway.ts` (`AIGateway`). `src/testing/` — an echo provider and a failing provider for tests, subpath export `@zuvre/ai-gateway/testing`.

## Ownership
Owner: `@zuvre/platform-ai`.

## Validation status
Compiles cleanly with `tsc`; all 4 tests (routing, error normalization, fallback, usage tracking) genuinely pass in this build using the test-only echo/failing providers. No real model provider (OpenAI/Anthropic/etc.) is implemented yet — per ADR-0006, not built until a real capability module needs one.
