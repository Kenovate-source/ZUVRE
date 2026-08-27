/**
 * The domain/application service both the tRPC and REST surfaces call —
 * neither surface implements this logic itself, per ADR-0003's requirement
 * that both API surfaces call the same underlying service. This is the
 * only "real" logic the foundation health check needs; it deliberately
 * doesn't reach into @zuvre/db yet (no live Postgres to check against in
 * this environment) — that's a natural extension once a real database
 * connection exists.
 */
export interface HealthStatus {
  status: "ok";
  service: "zuvre-api";
  time: string;
}

export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    service: "zuvre-api",
    time: new Date().toISOString(),
  };
}
