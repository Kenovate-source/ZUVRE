export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-6 px-6">
      <p className="font-display text-sm tracking-widest text-text-muted">ZUVRE — ZOO-VRAY</p>
      <h1 className="font-display text-4xl leading-tight text-text-primary">
        A place to think, make, and build — with an ecosystem that grows with you.
      </h1>
      <p className="max-w-lg text-text-secondary">
        This is the Phase 0 foundation shell. Capabilities, agents, and the
        Owner Control Center register into this same interface as they come
        online — nothing here needs to be rebuilt as ZUVRE grows.
      </p>
      <div className="rounded-xl2 border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
        Two visual worlds ship with this foundation: <strong className="text-accent-primary">Solmere</strong>{" "}
        (warm daylight) and <strong className="text-accent-primary">Duskmere</strong> (warm evening) — set via{" "}
        <code>data-zuvre-theme</code> on <code>&lt;html&gt;</code>.
      </div>
    </main>
  );
}
