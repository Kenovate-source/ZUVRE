/**
 * AUTHORED, NOT EXECUTED IN THIS SANDBOX — requires @trpc/server and zod
 * installed. Mirrors the same underlying service the REST /api/v1/health
 * endpoint calls (ADR-0003: no duplicated business logic between surfaces).
 */
import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "./context.js";
import { getHealthStatus } from "../services/health-service.js";

const t = initTRPC.context<TrpcContext>().create();

export const appRouter = t.router({
  health: t.procedure.query(() => getHealthStatus()),
});

export type AppRouter = typeof appRouter;
