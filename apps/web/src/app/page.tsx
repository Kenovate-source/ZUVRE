/**
 * AUTHORED, NOT EXECUTED IN THIS SANDBOX — same constraint as layout.tsx.
 * Minimal placeholder page proving the app shell exists; no real dashboard
 * UI is built yet (that depends on the API/auth boundaries being wired up
 * for real, which itself depends on dependency installation working).
 */
import { Button } from "@zuvre/ui";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>ZUVRE</h1>
      <p>Foundation skeleton — dashboard UI not yet built.</p>
      <Button>Get started</Button>
    </main>
  );
}
