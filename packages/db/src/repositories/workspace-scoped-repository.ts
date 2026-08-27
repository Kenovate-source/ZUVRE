import type { DataStore, WorkspaceScopedRecord } from "../data-store.js";

/**
 * Wraps a DataStore so every operation requires an explicit workspaceId and
 * can never accidentally read/write another workspace's rows. This is the
 * centralization ADR-0008 calls for: callers cannot bypass scoping by
 * forgetting a WHERE clause, because there is no unscoped code path here to
 * forget.
 */
export class WorkspaceScopedRepository<TRecord extends WorkspaceScopedRecord> {
  constructor(private readonly store: DataStore<TRecord>) {}

  async create(workspaceId: string, record: Omit<TRecord, "workspaceId"> & { workspaceId?: string }): Promise<TRecord> {
    const full = { ...record, workspaceId } as TRecord;
    return this.store.insert(full);
  }

  async getById(workspaceId: string, id: string): Promise<TRecord | null> {
    return this.store.findById(workspaceId, id);
  }

  async list(workspaceId: string): Promise<TRecord[]> {
    return this.store.findAll(workspaceId);
  }

  async remove(workspaceId: string, id: string): Promise<boolean> {
    return this.store.deleteById(workspaceId, id);
  }
}
