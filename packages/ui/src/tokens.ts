/**
 * ZUVRE Design Tokens
 * Full rationale in docs/03-brand-book.md — this file is the executable
 * source of truth; the Brand Book should never drift from it.
 *
 * Two visual worlds, not a light/dark toggle on one palette:
 *   Solmere  — warm ivory + amber-terracotta, daylight, paper-and-ink calm
 *   Duskmere — warm charcoal-plum + copper, an evening study, not "AI black"
 */

export type ZuvreThemeName = "solmere" | "duskmere";

export interface ZuvreTheme {
  name: ZuvreThemeName;
  label: string;
  colors: {
    background: string;
    surface: string;
    surfaceRaised: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentPrimary: string; // brand amber/copper
    accentPrimaryContrast: string;
    accentSecondary: string; // deep indigo/lavender counterpoint
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
}

export const solmere: ZuvreTheme = {
  name: "solmere",
  label: "Solmere",
  colors: {
    background: "#FAF6EF",
    surface: "#FFFFFF",
    surfaceRaised: "#F3ECE0",
    border: "#E4D9C7",
    textPrimary: "#221D17",
    textSecondary: "#544A3D",
    textMuted: "#8A7F6E",
    accentPrimary: "#B96A34", // warm terracotta-amber
    accentPrimaryContrast: "#FFFFFF",
    accentSecondary: "#3C4468", // deep sophisticated indigo
    success: "#3F7A5E",
    warning: "#B8863A",
    danger: "#A8503D",
    info: "#3E6C8C",
  },
};

export const duskmere: ZuvreTheme = {
  name: "duskmere",
  label: "Duskmere",
  colors: {
    background: "#18141B",
    surface: "#221C27",
    surfaceRaised: "#2C2532",
    border: "#3B3340",
    textPrimary: "#F3ECE2",
    textSecondary: "#C9BFB2",
    textMuted: "#8D8390",
    accentPrimary: "#E0A257", // warm copper, glows on dark
    accentPrimaryContrast: "#221408",
    accentSecondary: "#9D9FD6", // muted lavender counterpoint
    success: "#6FBE97",
    warning: "#E0B15E",
    danger: "#D3826C",
    info: "#7FA9C9",
  },
};

export const zuvreThemes: Record<ZuvreThemeName, ZuvreTheme> = { solmere, duskmere };

export const typography = {
  fontDisplay: '"Fraunces", ui-serif, Georgia, serif',
  fontBody: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontMono: '"IBM Plex Mono", ui-monospace, monospace',
  scale: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.5rem",
  },
};

export const radii = { sm: "6px", md: "10px", lg: "16px", xl: "24px", pill: "999px" };

export const spacing = {
  1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px",
  6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px",
};

export const motion = {
  durationFast: "120ms",
  durationBase: "220ms",
  durationSlow: "420ms",
  easingStandard: "cubic-bezier(0.4, 0, 0.2, 1)",
  easingEmphasized: "cubic-bezier(0.2, 0, 0, 1)",
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
};
