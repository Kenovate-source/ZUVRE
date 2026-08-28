import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--zuvre-background)",
        surface: "var(--zuvre-surface)",
        "surface-raised": "var(--zuvre-surface-raised)",
        border: "var(--zuvre-border)",
        "text-primary": "var(--zuvre-text-primary)",
        "text-secondary": "var(--zuvre-text-secondary)",
        "text-muted": "var(--zuvre-text-muted)",
        "accent-primary": "var(--zuvre-accent-primary)",
        "accent-secondary": "var(--zuvre-accent-secondary)",
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { xl2: "24px" },
    },
  },
  plugins: [],
} satisfies Config;
