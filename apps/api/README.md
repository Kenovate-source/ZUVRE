# @zuvre/api

ZUVRE backend — tRPC (internal) + versioned REST (external), ADR-0003.

## Structure
- `src/services/health-service.ts` — the shared domain service both surfaces call.
- `src/rest/v1/health.ts`, `src/server.ts` — the REST v1 boundary, plain `node:http`.
- `src/trpc/` — the tRPC boundary (context + router).

## Ownership
Owner: `@zuvre/platform-core`.

## Validation status
- **Executed**: the REST health server genuinely starts and responds. In this build: `GET /api/v1/health` → `200 {"status":"ok","service":"zuvre-api","time":"..."}`; `GET /nonexistent` → `404`. See repo-level `VALIDATION.md` for the exact transcript.
- **Authored, not executed**: `src/trpc/` requires `@trpc/server` and `zod` (unavailable — no npm registry access). The full-package `tsconfig.json` build fails on exactly those two files, as expected; `tsconfig.testable.json` covers everything else and compiles clean.
