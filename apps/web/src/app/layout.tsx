/**
 * AUTHORED, NOT EXECUTED IN THIS SANDBOX — requires `next` and `react`
 * installed (no npm registry access; see repo-level VALIDATION.md).
 */
import type { ReactNode } from "react";

export const metadata = {
  title: "ZUVRE",
  description: "ZUVRE — an extensible AI creation ecosystem.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
