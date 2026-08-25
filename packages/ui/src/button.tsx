/**
 * AUTHORED, NOT EXECUTED IN THIS SANDBOX — requires `react` and
 * `@types/react` installed (no npm registry access; see repo-level
 * VALIDATION.md) for a real JSX/tsc pass. Structurally minimal on purpose:
 * the foundation only needs to prove `packages/ui` exists as a boundary
 * apps/web pulls shared components from, not a full component library.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({ children, variant = "primary", className, ...rest }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium";
  const variantClass =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-700"
      : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200";

  return (
    <button className={[base, variantClass, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </button>
  );
}
