import type { AuthProvider, Identity, Session, WorkspaceRole, WorkspaceRoleLookup } from "../types.js";

/** In-memory AuthProvider used to test AuthorizationService's logic without Better Auth installed. */
export function createFakeAuthProvider(): AuthProvider {
  const sessions = new Map<string, Session>();
  let counter = 0;

  return {
    async createSession(identity: Identity): Promise<Session> {
      counter += 1;
      const session: Session = {
        id: `session-${counter}`,
        identity,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      };
      sessions.set(session.id, session);
      return session;
    },
    async getSession(sessionToken: string): Promise<Session | null> {
      return sessions.get(sessionToken) ?? null;
    },
    async invalidateSession(sessionToken: string): Promise<void> {
      sessions.delete(sessionToken);
    },
  };
}

export function createFakeRoleLookup(roles: Record<string, Record<string, WorkspaceRole>>): WorkspaceRoleLookup {
  return {
    async getRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
      return roles[workspaceId]?.[userId] ?? null;
    },
  };
}
