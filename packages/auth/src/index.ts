export type {
  Identity,
  Session,
  WorkspaceRole,
  AuthProvider,
  WorkspaceRoleLookup,
} from "./types.js";
export { UnauthorizedError, ForbiddenError, AuthorizationService } from "./types.js";

// providers/better-auth-provider.ts is intentionally NOT re-exported here —
// it requires `better-auth` installed, which this sandbox cannot verify.
// Once dependency installation is confirmed working, re-export
// createBetterAuthProvider from here directly.
