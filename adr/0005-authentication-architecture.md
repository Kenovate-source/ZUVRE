# ADR-0005: Authentication Architecture

**Status**: Approved — pending implementation
**Date**: 2026-08-24
**Owner**: Auth/Platform

## Context
ZUVRE needs identity, session management, and workspace/team-scoped authorization from the foundation stage, exposed through `packages/auth` as ZUVRE-level primitives, with the underlying provider replaceable. Unlike the other ADRs in this batch, this one was explicitly left open for evaluation rather than pre-decided.

## Problem
Which authentication approach — custom-built, self-hosted library, or managed vendor — best satisfies Next.js compatibility, TypeScript support, OAuth/social + email-password login, workspace/team support, future external-API authentication, vendor lock-in exposure, security posture, and cost at ZUVRE's expected scale?

## Options Evaluated (current as of August 2026)

- **Clerk** (managed): fastest to ship, polished pre-built UI, native Organizations primitive for team/workspace support, strong Next.js App Router integration. Free to 10,000 MAU, then per-MAU pricing (~$0.02/MAU, roughly $800/mo at 50,000 MAU). Data lives in Clerk's systems; no EU data residency option as of 2026; outage/pricing-change exposure is real vendor lock-in.
- **WorkOS** (managed, enterprise-leaning): generous free tier (1M MAU), strong SSO/SCIM/directory-sync/audit-log support aimed at B2B enterprise onboarding — but not itself a full consumer auth/session system; commonly paired with another layer for day-to-day login.
- **Better Auth** (self-hosted, TypeScript-native): open source, full data ownership, integrates directly with Prisma (schema lives in our own `packages/db`), no per-MAU cost, no SAML/SCIM yet (in active development) — teams needing that today typically bolt on WorkOS alongside it.
- **Auth.js / NextAuth v5** (self-hosted): the longest-established Next.js auth library, broadest OAuth provider coverage, but a more manual email/password flow and more accumulated API surface quirks than the newer alternatives.
- **Custom-built from scratch**: explicitly excluded per your instruction — not evaluated further.

## Decision (Recommendation)

Adopt **Better Auth**, self-hosted, as the primary authentication layer, integrated with `packages/db` (Prisma/PostgreSQL) so ZUVRE owns its identity data outright. Wrap it entirely behind `packages/auth`'s own interface (session, identity, and workspace-authorization primitives) so the underlying library is a swappable implementation detail, not something `core` or any module depends on directly.

Reserve **WorkOS** as the addition point for enterprise SSO/SCIM/directory sync once real enterprise customers require it — added alongside Better Auth behind the same `packages/auth` boundary, not as a replacement.

## Alternatives Considered
- **Clerk**: rejected as the primary layer specifically because of data-ownership and per-MAU cost exposure at scale, and because it's a managed dependency for something ADR-005's own criteria flag as needing to avoid vendor lock-in. It remains a legitimate fallback if implementation speed becomes more urgent than data ownership — noted for reconsideration, not dismissed outright.
- **Auth.js v5**: solid and battle-tested, but Better Auth's TypeScript-native design and tighter Prisma integration are a better fit for a strongly-typed, agent-authored codebase; Auth.js remains the fallback if a specific OAuth provider Better Auth doesn't yet support becomes a hard requirement.
- **WorkOS alone**: not a full session/login system by itself; rejected as the sole solution, retained as the enterprise-SSO complement.

## Rationale
Self-hosting via Better Auth satisfies the "avoid vendor lock-in" and "no custom-built-from-scratch" constraints simultaneously — it's a maintained library, not a hand-rolled auth system, but the data and session logic live in ZUVRE's own database. It has native support for the OAuth/email-password/session requirements, and its schema lives directly in `packages/db`, keeping the database boundary (ADR-0004) intact rather than introducing a second, vendor-owned identity store. The main real gap — SAML/SCIM — is exactly the enterprise feature set WorkOS specializes in, so the pairing covers the full requirement list without over-committing to a managed vendor for the whole system.

## Consequences
- `packages/auth` owns session issuance/validation and workspace-scoped authorization checks; no other package implements its own auth logic.
- Auth-related schema (users, sessions, credentials) lives in `packages/db` alongside the rest of the domain model.
- External/programmatic API authentication (for the REST surface in ADR-0003) needs its own token/API-key mechanism, layered on top of the same `packages/auth` boundary — to be detailed when the external API is actually built, not now.

## Risks
- Better Auth is newer than Auth.js; smaller (though fast-growing) ecosystem and community resources.
- No hosted SAML/SCIM today — real risk only if an enterprise deal needs it before the WorkOS addition is built.

## Reversal Strategy
Because all consuming code depends only on `packages/auth`'s own primitives, swapping Better Auth for Auth.js, Clerk, or another provider is isolated to that package's internals and a data migration (session/credential schema) — the two-engineer-week migration estimate cited in current comparisons is a reasonable planning number if this is ever revisited.

## Status Note
Approved. Better Auth is the initial implementation direction, self-hosted and integrated with `packages/db`. WorkOS is reserved as a future addition for enterprise SSO/SCIM once actually required — it is not part of the initial implementation. Both are accessed only through `packages/auth`'s own primitives, never directly by `core` or any module.
