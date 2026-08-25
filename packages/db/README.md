# @zuvre/db

Prisma/PostgreSQL data access, centralized workspace-scoping (ADR-0004, ADR-0008).

## Public API
- `src/data-store.ts` — the generic `DataStore` interface both the real Prisma-backed store and the test-only in-memory store implement.
- `src/repositories/workspace-scoped-repository.ts` — `WorkspaceScopedRepository`, the ONE place workspace scoping is enforced. No other package accesses data unscoped.
- `src/client.ts`, `src/prisma-store.ts` — the real Prisma-backed implementation. Requires `@prisma/client` installed; not re-exported from the package's main entry point until dependency installation is verified working in a real environment (see Validation Status).
- `prisma/schema.prisma` — the foundation entity schema (ADR-0004 §7 scope only — no capability-specific tables).
- `prisma/migrations/0001_init/` — hand-authored migration SQL. **Not generated or applied by the Prisma engine** — see the warning at the top of that file.

## Ownership
Owner: `@zuvre/platform-data`. No other package should construct its own Prisma client or bypass `WorkspaceScopedRepository`.

## Validation status
- **Executed**: `data-store.ts`, `repositories/`, and `testing/` compile cleanly with `tsc` and their tests (`workspace-isolation.test.ts`, 4 tests) genuinely pass in this build, using an in-memory fake store — see repo-level `VALIDATION.md`.
- **Authored, not executed**: `client.ts` and `prisma-store.ts` require `@prisma/client` (unavailable — no npm registry access in the build sandbox) and fail `tsc` for that reason alone. The migration SQL has not been run against real PostgreSQL. All of this must be verified after `pnpm install` + `docker compose up -d` + `prisma migrate dev` in a real environment before being trusted.
