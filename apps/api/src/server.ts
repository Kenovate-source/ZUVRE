import { createServer } from "node:http";
import { handleHealth } from "./rest/v1/health.js";
import { rootLogger } from "@zuvre/observability";

/**
 * The REST v1 boundary's runnable entry point. Genuinely executable with
 * only Node's built-in http module — no framework dependency required to
 * prove the health check actually works end-to-end.
 *
 * The tRPC boundary (src/trpc/) is authored separately and, per ADR-0003,
 * would be mounted alongside this in a real deployment once @trpc/server
 * is installed — this server intentionally only proves the REST side here,
 * since that's what's verifiable without external packages.
 */
const logger = rootLogger.child({ component: "http-server" });

export function createApiServer() {
  return createServer((req, res) => {
    if (req.method === "GET" && req.url === "/api/v1/health") {
      handleHealth(req, res);
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  });
}

const isMainModule = process.argv[1]?.endsWith("server.js");
if (isMainModule) {
  const port = Number(process.env.PORT ?? 3001);
  const server = createApiServer();
  server.listen(port, () => {
    logger.info(`ZUVRE API listening`, { port });
  });
}
