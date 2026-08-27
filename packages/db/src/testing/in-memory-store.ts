import type { DataStore, WorkspaceScopedRecord } from "../data-store.js";

/**
 * A test-only, in-memory implementation of DataStore. Used to prove the
 * WorkspaceScopedRepository's isolation logic without a real database — it
 * deliberately stores everything in one flat map, keyed only by record id,
 * so that a bug in scoping logic (e.g. forgetting to filter by
 * workspaceId) would be caught by the cross-workspace leakage tests rather
 * than masked by physically separate storage per workspace.
 */
export class InMemoryDataStore<TRecord extends WorkspaceScopedRecord> implements DataStore<TRecord> {
  private readonly records = new Map<string, TRecord>();

  async insert(record: TRecord): Promise<TRecord> {
    this.records.set(record.id, record);
    return record;
  }

  async findById(workspaceId: string, id: string): Promise<TRecord | null> {
    const record = this.records.get(id);
    if (!record || record.workspaceId !== workspaceId) return null;
    return record;
  }

  async findAll(workspaceId: string): Promise<TRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.workspaceId === workspaceId);
  }

  async deleteById(workspaceId: string, id: string): Promise<boolean> {
    const record = this.records.get(id);
    if (!record || record.workspaceId !== workspaceId) return false;
    this.records.delete(id);
    return true;
  }
}
