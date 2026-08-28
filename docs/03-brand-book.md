# ZUVRE Brand Book

**Name pronunciation:** Zoo-vray
**Personality:** warm, intelligent, sophisticated, welcoming, mysterious, calm,
futuristic, human, imaginative, premium.

## 1. Why Not the Usual AI Look

Default "AI product" visual language — neon purple/violet gradients on
pure black, glowing orbs, sci-fi sans typefaces — has become generic to the
point of being invisible. It also skews cold and synthetic, which fights
the "warm, human, calm" personality this brand needs. ZUVRE instead borrows
from warmer reference points: analog paper and ink, amber evening light,
well-made physical objects — filtered through a clean, modern execution so
it doesn't read as nostalgic pastiche.

## 2. Two Visual Worlds, Not Light/Dark

Rather than one palette with an inverted light/dark toggle, ZUVRE defines
two named atmospheres with genuinely different color relationships — see
`packages/ui/src/tokens.ts` for the executable source of truth.

### Solmere (daylight world)
Warm ivory background, white paper-like surfaces, terracotta-amber accent,
deep indigo as a quiet counterpoint. The feeling: a well-lit study on a
clear morning.

| Token | Value | Use |
|---|---|---|
| background | `#FAF6EF` | app background |
| surface | `#FFFFFF` | cards, panels |
| accentPrimary | `#B96A34` | primary actions, focus |
| accentSecondary | `#3C4468` | secondary emphasis |
| textPrimary | `#221D17` | body text |

### Duskmere (evening world)
Warm charcoal-plum background — never pure black — with a glowing copper
accent and a muted lavender counterpoint. The feeling: the same study, at
night, lamp-lit.

| Token | Value | Use |
|---|---|---|
| background | `#18141B` | app background |
| surface | `#221C27` | cards, panels |
| accentPrimary | `#E0A257` | primary actions, focus |
| accentSecondary | `#9D9FD6` | secondary emphasis |
| textPrimary | `#F3ECE2` | body text |

Both names end in "-mere" (a lake/pool — calm, reflective) deliberately, to
read as a matched pair rather than "the real theme and its dark mode."

## 3. Typography

- **Display:** Fraunces — a warm, slightly editorial serif for headlines
  and moments that should feel considered rather than templated.
- **Body:** Inter — proven legibility at UI sizes, gets out of the way.
- **Mono:** IBM Plex Mono — for code, IDs, technical surfaces (Owner
  Control Center, capability inspector).

## 4. Color Discipline

Accent colors are used for actions, focus states, and small emphasis
moments only — never as large background fields. Semantic colors
(success/warning/danger/info) are desaturated relative to a typical SaaS
palette to stay consistent with "calm, sophisticated" rather than
alarm-toned.

## 5. Iconography & Motion

Icons: rounded-corner, single-weight line icons — no gradient fills, no
skeuomorphism. Motion: short, purposeful transitions (120–420ms, see
`packages/ui/src/tokens.ts` `motion`), respecting
`prefers-reduced-motion` unconditionally (implemented in `globals.css`).

## 6. Accessibility

Both themes are built to meet WCAG AA contrast for text-on-background and
text-on-surface at the token level; any new token added to either theme
must be checked against both background and surface colors before merging
(tracked as a design-review checklist item, not yet automated — see
`15-testing-strategy.md` for the planned contrast-check test).

## 7. Plan Naming

Plan names avoid industry-default tiers (Free/Pro/Enterprise) in favor of
names that continue the "-mere" world's warmth without being twee: **Spark**
(free, the first light), **Ember** (steady personal use), **Atlas** (teams —
carries weight, holds things up), **Orbit** (organizations — a wider,
custom path). Full entitlement details in `18-monetization-entitlements.md`.
