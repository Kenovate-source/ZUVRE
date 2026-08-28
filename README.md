# ZUVRE

*Zoo-vray.* A capability-driven AI ecosystem — see `docs/01-product-bible.md`
for the vision and `STATUS.md` for exactly what in this repository is real
versus architected-only.

## Requirements

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- A PostgreSQL database (local, or a free tier from Neon/Supabase/Railway)

## Setup

```bash
pnpm install
cp .env.example .env        # then fill in DATABASE_URL, AUTH_SECRET, ANTHROPIC_API_KEY
pnpm --filter @zuvre/db generate
pnpm --filter @zuvre/db migrate    # creates tables from prisma/schema.prisma
pnpm exec tsx packages/db/prisma/seed.ts   # seeds plans + platform roles
pnpm dev
```

`pnpm install` has **not** been run in the environment this repo was
generated in (no network access) — see `STATUS.md` before assuming
anything beyond static file structure has been validated.

## Environment Variables

See `.env.example` for the full list. Minimum to run locally:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string |
| `AUTH_SECRET` | Yes | 32+ random bytes, used to sign session tokens |
| `ANTHROPIC_API_KEY` | For `ai.chat` to work | Without it, the capability's grant check still works but execution fails clearly (`isConfigured()` guard in the provider adapter) |

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it in Vercel, set the **Root Directory** to `apps/web`.
3. Vercel auto-detects Next.js; set the build command to
   `cd ../.. && pnpm install && pnpm --filter @zuvre/web build` if it
   doesn't pick up the monorepo automatically (Vercel usually does for
   pnpm workspaces without extra config).
4. Add the environment variables above in the Vercel project settings.
5. Provision Postgres (Vercel Postgres, Neon, or Supabase all work — the
   app only assumes a standard Postgres connection string) and run
   `pnpm --filter @zuvre/db migrate deploy` against it before first
   traffic.

## Monorepo Map

See `docs/06-architecture.md` §1.

## Documentation

Start at `docs/README.md` — it indexes the full documentation set and is
explicit about which documents are fully written versus outlined for a
later pass.
