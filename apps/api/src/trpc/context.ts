/**
 * AUTHORED, NOT EXECUTED IN THIS SANDBOX — requires @trpc/server installed
 * (no npm registry access; see repo-level VALIDATION.md).
 */
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";

export interface TrpcContext {
  // Populated from the request in a real deployment — session lookup via
  // @zuvre/auth's AuthorizationService, workspace context, etc. Kept
  // minimal here since the foundation only needs the health procedure.
  requestId: string;
}

export function createContext(_opts: CreateHTTPContextOptions): TrpcContext {
  return { requestId: crypto.randomUUID() };
}
