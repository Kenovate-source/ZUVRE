import type { IncomingMessage, ServerResponse } from "node:http";
import { getHealthStatus } from "../../services/health-service.js";

/**
 * The REST /api/v1/health handler. Deliberately framework-free (plain
 * node:http) at foundation stage — a real framework (Hono/Express/etc.)
 * can replace this once the REST surface has more than a health check,
 * without changing the handler's shape or the underlying service it calls.
 */
export function handleHealth(_req: IncomingMessage, res: ServerResponse): void {
  const body = JSON.stringify(getHealthStatus());
  res.writeHead(200, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}
