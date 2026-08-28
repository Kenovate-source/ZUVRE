import { rawDb } from "./client";

/**
 * ZUVRE workspace isolation guard.
 *
 * Rule (see docs/12-data-model.md and docs/07-security-model.md):
 * application code must never query a workspace-owned table with a raw
 * `PrismaClient`. Instead it asks for a `ScopedDb`, which pins every query
 * to a single `workspaceId` and refuses cross-workspace reads/writes.
 *
 * This is a thin, explicit wrapper rather than Prisma middleware so that
 * the isolation boundary is visible at every call site during review,
 * rather than hidden in global middleware that's easy to forget exists.
 */

const WORKSPACE_SCOPED_MODELS = [
  "workspaceMember",
  "capabilityGrant",
  "capabilityExecution",
  "artifact",
  "agent",
  "agentRun",
  "conversation",
  "zuvreLink",
  "qrCode",
  "auditLog",
  "entitlementOverride",
] as const;

export type ScopedModel = (typeof WORKSPACE_SCOPED_MODELS)[number];

export class WorkspaceIsolationError extends Error {
  constructor(model: string) {
    super(
      `Refused query on "${model}": workspaceId filter missing or mismatched. ` +
        `Use scopedDb(workspaceId) for all workspace-owned models.`
    );
    this.name = "WorkspaceIsolationError";
  }
}

export interface ScopedDb {
  workspaceId: string;
  raw: typeof rawDb;
  /** Assert a record's workspaceId matches this scope before use. */
  assertOwned<T extends { workspaceId: string }>(record: T | null): T;
}

export function scopedDb(workspaceId: string): ScopedDb {
  if (!workspaceId) {
    throw new WorkspaceIsolationError("(unknown)");
  }
  return {
    workspaceId,
    raw: rawDb,
    assertOwned<T extends { workspaceId: string }>(record: T | null): T {
      if (!record) {
        throw new Error("Record not found");
      }
      if (record.workspaceId !== workspaceId) {
        throw new WorkspaceIsolationError("assertOwned");
      }
      return record;
    },
  };
}

/**
 * Platform-owner administrative access. Every call MUST be paired with an
 * AuditLog write in the same operation — see @zuvre/auth `withOwnerAudit`.
 * This function exists so that unscoped access is searchable
 * (`grep ownerDb`) and never accidental.
 */
export function ownerDb() {
  return rawDb;
}

export { WORKSPACE_SCOPED_MODELS };
