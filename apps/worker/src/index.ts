import { rootLogger } from "@zuvre/observability";
import { InMemoryJobQueue } from "./job-queue.js";
export { InMemoryJobQueue } from "./job-queue.js";
export type { Job, JobHandler } from "./job-queue.js";

const logger = rootLogger.child({ component: "worker" });

const isMainModule = process.argv[1]?.endsWith("index.js");
if (isMainModule) {
  const queue = new InMemoryJobQueue(async (job) => {
    logger.info("processed job", { jobId: job.id });
  });
  logger.info("worker started (in-memory queue, foundation stage — no creation engine wired yet)", {
    pending: queue.pendingCount,
  });
}
