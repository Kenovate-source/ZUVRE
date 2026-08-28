# ZUVRE Product Bible

**Pronunciation:** Zoo-vray
**Status:** Foundation (Phase 0) — living document, update via PR alongside product changes.

## 1. What ZUVRE Is

ZUVRE is a capability-driven digital ecosystem, not a single product. It is
the substrate people use to communicate, create, learn, research, build
(websites, apps, games), automate work, run agents, and eventually publish
and monetize what they make — all inside one coherent, evolving interface.

ZUVRE is explicitly **not**: a chatbot with a UI wrapped around it, a website
builder that happens to have AI, a marketplace clone, or a dashboard-first
SaaS tool. Those are all things ZUVRE can *do*, but none of them is what
ZUVRE *is*. What ZUVRE is, is the thing that can eventually do all of them
through one consistent capability and permission model.

## 2. Core Belief

**Capabilities come and go; the platform's job is to host them well.**

Every product decision should be checked against: *does this assume today's
feature list is permanent?* If yes, it's probably core-platform code and
wrong. If a feature can instead be expressed as a capability that registers
itself, declares its own inputs/outputs/permissions, and is hosted by a
generic runtime (execution, progress, artifacts, permissions, billing) —
that's the right shape. See `09-capability-system.md`.

## 3. Who ZUVRE Is For

Deliberately broad, not a single persona. The plan system
(`18-monetization-entitlements.md`) exists precisely so a student, a
hobbyist, a freelancer, and a small team all find a ZUVRE that fits their
budget and needs — see `spark` / `ember` / `atlas` / `orbit`.

## 4. Product Pillars

1. **Capability-driven architecture** — see §2 above and `09-capability-system.md`.
2. **AI-native, provider-agnostic** — ZUVRE is built assuming multiple AI
   providers and modalities will be routed through one gateway, not bound
   to a single vendor. See `08-ai-architecture.md`.
3. **Agency with accountability** — agents can act, including outside
   ZUVRE, but never without a permission model that's visible and
   revocable by the user and the platform owner. See `10-agent-system.md`.
4. **An owner who can see and steer everything** — the Owner Control
   Center is intentionally more powerful than a typical admin panel,
   because ZUVRE intends to grow into something that needs that. See
   `11-owner-control-center.md`.
5. **Memorable, warm, unusual design** — not a generic AI-purple SaaS
   template. See `03-brand-book.md`.
6. **Global from day one, expensive from nowhere** — internationalized
   architecture, but cost-controlled infrastructure. See
   `17-internationalization.md` and `06-architecture.md` §Cost Posture.

## 5. What "Done" Looks Like for Phase 0

Not a landing page. A working vertical slice: a person can register, land
in a themed and personalized workspace, have a real AI conversation that
runs through the capability system (not a hardcoded chat box), see that
conversation logged and auditable, and a platform owner can see that
activity in a control center that's architected to grow. Everything else in
this spec is real and designed-for, but not necessarily built yet — see the
top-level `STATUS.md` for what's implemented versus architected-only.

## 6. Non-Goals (For Now)

- Full marketplace/commerce checkout flows (architecture is entitlement-
  and billing-ready; payment provider integration is a later phase).
- Game engine authoring UI (the capability contract supports it; no game
  capability ships in Phase 0/1).
- Multi-region infrastructure (single-region Postgres + Vercel to start;
  see Architecture doc for the scale-out path).
