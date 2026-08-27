# ZUVRE Foundation Skeleton — Validation Report

Generated in the build sandbox, 2026-08-26. This sandbox has **no npm registry access, no Docker, no pnpm, and no PostgreSQL** — confirmed directly (`npm ping` → 403; `docker`, `pnpm`, `psql` all absent). Everything below is split strictly into what was **actually executed here** and what is **authored but requires a real environment to verify**. Nothing in the first category is claimed without a command and output to back it up.

---

## ACTUALLY EXECUTED

### Compilation (`tsc`, real TypeScript 6.0.3, strict mode, from a clean `dist/`)

All of these compiled with **zero errors**, freshly, in the final verification pass:

| Package | Result |
|---|---|
| `packages/capability-sdk` | clean |
| `packages/core` | clean |
| `packages/observability` | clean |
| `packages/ai-gateway` | clean |
| `packages/tool-runtime` | clean |
| `packages/agent-runtime` | clean |
| `packages/db` (testable subset — see Known Limitations) | clean |
| `packages/auth` (testable subset — see Known Limitations) | clean |
| `apps/api` (testable subset — see Known Limitations) | clean |
| `apps/worker` | clean |

Cross-package imports (`@zuvre/core` importing `@zuvre/capability-sdk`, `apps/api` importing `@zuvre/observability`, etc.) resolve and compile correctly through real workspace symlinks under `node_modules/@zuvre/*`, set up in this sandbox to emulate what `pnpm install` would produce for a real workspace.

### Unit tests (Node's built-in `node --test`, run against the compiled output above)

**37 of 37 tests pass**, freshly re-run in the final verification pass:

| Suite | Tests | Result |
|---|---|---|
| `capability-sdk` contract tests | 4 | 4 pass |
| `core` capability registry (registration/discovery) | 6 | 6 pass |
| `observability` logger | 2 | 2 pass |
| `ai-gateway` (routing, error normalization, fallback, usage tracking) | 4 | 4 pass |
| `tool-runtime` (permission grant/deny, error handling) | 4 | 4 pass |
| `agent-runtime` (step loop, stopOnFailure, callbacks) | 4 | 4 pass |
| `db` cross-workspace isolation (ADR-0008) | 4 | 4 pass |
| `auth` authorization service (ADR-0005) | 6 | 6 pass |
| `worker` in-memory job queue | 3 | 3 pass |
| **Total** | **37** | **37 pass, 0 fail** |

Notably, this process caught and fixed a real bug: a wrong relative import path in `packages/db/src/repositories/workspace-scoped-repository.ts` that the testable-subset compile surfaced immediately — fixed, recompiled, and re-verified before commit.

### Capability contract — registration/discovery proven end-to-end

`packages/core`'s tests genuinely register the real fixture module (`@zuvre/capability-sdk/testing`) into a real `CapabilityRegistry` instance and confirm: lookup by `capabilityType` works, duplicate-id registration is rejected, duplicate-`capabilityType` registration is rejected, and `list()` returns exactly what was registered. This is real cross-package integration, not two isolated unit tests.

### Live HTTP server

`apps/api`'s compiled server was **actually started** with `node dist/server.js` and hit with real HTTP requests:

```
$ node dist/server.js
{"level":"info","message":"ZUVRE API listening","port":3001,...}

$ curl http://localhost:3001/api/v1/health
{"status":"ok","service":"zuvre-api","time":"2026-08-26T07:04:18.678Z"}   [HTTP 200]

$ curl http://localhost:3001/nonexistent
{"error":"Not Found"}   [HTTP 404]
```

### `apps/worker` process

Actually started with `node dist/index.js`; its startup log was observed for real (see the `worker` package's git history / this report's earlier working notes).

### Capability-agnostic core — verified by grep, not just by design intent

```
grep -rn "website\|game\|video\|mobile\|desktop" packages/core/src/ apps/api/src/ apps/worker/src/
```
The only hit across all three is a **doc comment** in `packages/core/src/domain/entities.ts` ("e.g. \"website\"") — not conditional logic. No branching on capability type exists anywhere in `core` or the apps.

### Configuration syntax

- Root `package.json`, `turbo.json`, `tsconfig.base.json` — parsed successfully with `JSON.parse`.
- `.github/workflows/ci.yml` — parsed successfully with `yaml.safe_load` (PyYAML).

---

## AUTHORED BUT NOT EXECUTED

These require dependencies or infrastructure unavailable in this sandbox. They are written correctly against current (2026) library APIs to the best of this build's knowledge, but **have not been run** and must be verified after import into a real environment.

| Item | Requires | Where |
|---|---|---|
| `pnpm install` across the whole workspace | pnpm + npm registry | root |
| Full `packages/db` build (`prisma.workspace.create(...)` etc.) | `@prisma/client` | `packages/db/src/client.ts`, `src/prisma-store.ts` |
| Prisma migration generation/application | `prisma` CLI + running PostgreSQL | `packages/db/prisma/migrations/0001_init/migration.sql` — **hand-authored to mirror `schema.prisma`, never run through the Prisma engine** |
| Real Postgres integration tests (beyond the in-memory isolation tests already passing) | running PostgreSQL | not yet written — noted as a gap, not faked |
| Full `packages/auth` build (`betterAuth(...)` adapter) | `better-auth` | `packages/auth/src/providers/better-auth-provider.ts` |
| tRPC router/context | `@trpc/server`, `zod` | `apps/api/src/trpc/` |
| `apps/web` — Next.js build/dev server | `next`, `react`, `react-dom` | all of `apps/web` |
| `packages/ui` — JSX/component typecheck | `react`, `@types/react` | `packages/ui/src/button.tsx` |
| ESLint | `eslint`, `typescript-eslint` | `packages/config/eslint/base.js` |
| Tailwind build | `tailwindcss` | `packages/config/tailwind/base.js` |
| `docker compose up` (local Postgres) | Docker | `docker-compose.yml` |
| GitHub Actions CI itself running | a GitHub Actions runner | `.github/workflows/ci.yml` — YAML syntax verified locally, but the workflow has never executed |
| Turborepo task orchestration (`turbo run build/lint/test`) | `turbo` binary + `pnpm install` | root `turbo.json` — each package's own build/test was run directly with `tsc`/`node --test` instead, since `turbo` itself isn't installed |

**None of the above are claimed as passing.** Each package's own `README.md` repeats this same executed/authored split for that package specifically.

---

## Known Limitations

1. **No real integration tests against PostgreSQL.** The workspace-isolation tests prove the *scoping logic* correctly, using an in-memory fake store — they do not prove the real Prisma-backed store behaves identically. This is flagged in `packages/db/README.md` as required follow-up work, not glossed over.
2. **The hand-authored Prisma migration SQL is unverified.** It was written to mirror `schema.prisma` field-for-field, but only the real Prisma engine (`prisma migrate dev`) can confirm it's actually correct SQL that applies cleanly. Treat it as a reference, delete and regenerate it properly as the very first step in a real environment.
3. **`modules/` directory does not exist yet.** Per scope, `website-creation` was intentionally not started.
4. **Turborepo itself was never invoked** — `turbo.json`'s task graph is authored but unverified; every package was built/tested directly instead, since `turbo` isn't installed here.
5. **CODEOWNERS references placeholder GitHub team handles** (`@zuvre/platform-core`, etc.) — flagged as a prerequisite in the earlier architecture phase, unchanged here.
6. **No `pnpm-lock.yaml` exists** — it can only be generated by running `pnpm install` against a real registry, which this sandbox cannot do.

---

## Bottom Line

Everything that could genuinely be verified without network access, Docker, or a package registry — every dependency-free package, the cross-package capability contract, the workspace-isolation logic, and a real running HTTP server — was verified, and one real bug was caught and fixed in the process. Everything that structurally requires those unavailable resources is clearly labeled and excluded from any "passing" claim. The Definition of Done from the original milestone spec is met **for what this sandbox can prove**; the remaining items are a short, explicit list for the first work done in a real environment.
