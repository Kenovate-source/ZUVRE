/**
 * A minimal generic store interface that both a real Prisma-backed
 * implementation (src/prisma-store.ts, authored but not executable in this
 * sandbox) and an in-memory fake (src/testing/in-memory-store.ts, used for
 * real tests here) implement.
 *
 * This indirection is what lets ADR-0008's workspace-isolation logic be
 * unit-tested without a running PostgreSQL instance. It is NOT a substitute
 * for real integration tests against Postgres — see README.md's Validation
 * Status section.
 */
export interface WorkspaceScopedRecord {
  id: string;
  workspaceId: string;
}

export interface DataStore<TRecord extends WorkspaceScopedRecord> {
  insert(record: TRecord): Promise<TRecord>;
  findById(workspaceId: string, id: string): Promise<TRecord | null>;
  findAll(workspaceId: string): Promise<TRecord[]>;
  deleteById(workspaceId: string, id: string): Promise<boolean>;
}
