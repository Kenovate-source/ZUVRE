export type { DataStore, WorkspaceScopedRecord } from "./data-store.js";
export { WorkspaceScopedRepository } from "./repositories/workspace-scoped-repository.js";

// client.ts and prisma-store.ts are intentionally NOT re-exported from the
// main entry point yet — they require @prisma/client to even import, and
// this package must remain importable (for its testable, dependency-free
// parts) in environments where that hasn't been installed. Once dependency
// installation is verified working, re-export them here directly.
