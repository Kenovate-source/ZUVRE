import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZUVRE",
  description: "A radically flexible AI-powered digital ecosystem.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Theme defaults to Solmere; a real implementation reads the user's saved
  // preference (or system light/dark hint) server-side and sets this
  // attribute before first paint to avoid a flash. See docs/03-brand-book.md.
  return (
    <html lang="en" data-zuvre-theme="solmere">
      <body className="font-body min-h-screen antialiased">{children}</body>
    </html>
  );
}
