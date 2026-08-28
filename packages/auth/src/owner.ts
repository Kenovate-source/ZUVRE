import { ownerDb } from "@zuvre/db";

/**
 * Every platform-owner administrative action (disabling a capability,
 * editing another workspace's grants, impersonating for support, etc.)
 * MUST go through this wrapper. It guarantees an AuditLog row is written
 * even if the action throws, and it's the single choke point a reviewer
 * can grep for ("withOwnerAudit(") to find every place owner power is used.
 *
 * This does not itself check `isPlatformOwner` — callers (API route
 * handlers) are expected to have already authenticated the caller as the
 * owner; this wrapper's job is auditability, not authentication.
 */
export async function withOwnerAudit<T>(
  params: {
    actorUserId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  },
  fn: () => Promise<T>
): Promise<T> {
  const db = ownerDb();
  let result: T;
  let error: unknown;
  try {
    result = await fn();
  } catch (err) {
    error = err;
    throw err;
  } finally {
    await db.auditLog.create({
      data: {
        actorUserId: params.actorUserId,
        actorType: "user",
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata: {
          ...params.metadata,
          outcome: error ? "error" : "success",
          error: error instanceof Error ? error.message : undefined,
        } as any,
      },
    });
  }
  // @ts-expect-error — assigned in try unless it threw, in which case we already rethrew.
  return result;
}
