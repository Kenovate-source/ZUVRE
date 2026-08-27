/**
 * AUTHORED, NOT EXECUTED IN THIS SANDBOX — see client.ts's header. This is
 * a reference implementation of DataStore backed by the real Prisma
 * client, for the Workspace model, showing the intended production shape.
 * Repeat this pattern (one small adapter per model) as each is actually
 * needed by application code — not all nine models are pre-built here,
 * per "prefer simple working implementations over speculative abstraction."
 */
import type { DataStore, WorkspaceScopedRecord } from "./data-store.js";
import { prisma } from "./client.js";

export interface WorkspaceRecord extends WorkspaceScopedRecord {
  name: string;
  slug: string;
}

/**
 * Workspace itself is the tenant root, not a workspace-owned resource, so
 * this adapter is a special case (workspaceId === id) rather than the
 * general pattern every other model's adapter follows.
 */
export class PrismaWorkspaceStore implements DataStore<WorkspaceRecord> {
  async insert(record: WorkspaceRecord): Promise<WorkspaceRecord> {
    const created = await prisma.workspace.create({
      data: { id: record.id, name: record.name, slug: record.slug },
    });
    return { id: created.id, workspaceId: created.id, name: created.name, slug: created.slug };
  }

  async findById(_workspaceId: string, id: string): Promise<WorkspaceRecord | null> {
    const found = await prisma.workspace.findUnique({ where: { id } });
    if (!found) return null;
    return { id: found.id, workspaceId: found.id, name: found.name, slug: found.slug };
  }

  async findAll(_workspaceId: string): Promise<WorkspaceRecord[]> {
    // Workspace has no parent workspace to scope by; listing "all workspaces
    // visible to a caller" is an authorization concern for @zuvre/auth, not
    // this store.
    const all = await prisma.workspace.findMany();
    return all.map((w: { id: string; name: string; slug: string }) => ({
      id: w.id,
      workspaceId: w.id,
      name: w.name,
      slug: w.slug,
    }));
  }

  async deleteById(_workspaceId: string, id: string): Promise<boolean> {
    try {
      await prisma.workspace.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
