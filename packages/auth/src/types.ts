/**
 * ZUVRE-level identity/session/authorization primitives (ADR-0005).
 * Everything outside this package works against these types only — never
 * against Better Auth's own types directly. Swapping the underlying
 * provider later means rewriting the AuthProvider implementation, not any
 * caller of this package.
 */

export interface Identity {
  userId: string;
  email: string;
}

export interface Session {
  id: string;
  identity: Identity;
  expiresAt: Date;
}

export type WorkspaceRole = "owner" | "admin" | "member";

/** What any underlying auth provider (Better Auth today, others later) must implement. */
export interface AuthProvider {
  getSession(sessionToken: string): Promise<Session | null>;
  createSession(identity: Identity): Promise<Session>;
  invalidateSession(sessionToken: string): Promise<void>;
}

/** Supplied by the caller (typically apps/api) so authorization checks know the caller's role without re-deriving it here. */
export interface WorkspaceRoleLookup {
  getRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null>;
}

export class UnauthorizedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Insufficient workspace role") {
    super(message);
    this.name = "ForbiddenError";
  }
}

const ROLE_RANK: Record<WorkspaceRole, number> = { member: 0, admin: 1, owner: 2 };

/**
 * The single place workspace-authorization decisions are made — no module
 * or route handler re-implements role comparison itself.
 */
export class AuthorizationService {
  constructor(
    private readonly provider: AuthProvider,
    private readonly roles: WorkspaceRoleLookup,
  ) {}

  async requireSession(sessionToken: string): Promise<Session> {
    const session = await this.provider.getSession(sessionToken);
    if (!session) throw new UnauthorizedError();
    if (session.expiresAt.getTime() < Date.now()) throw new UnauthorizedError("Session expired");
    return session;
  }

  async requireWorkspaceRole(
    sessionToken: string,
    workspaceId: string,
    minimumRole: WorkspaceRole,
  ): Promise<{ session: Session; role: WorkspaceRole }> {
    const session = await this.requireSession(sessionToken);
    const role = await this.roles.getRole(workspaceId, session.identity.userId);
    if (!role) throw new ForbiddenError("Not a member of this workspace");
    if (ROLE_RANK[role] < ROLE_RANK[minimumRole]) {
      throw new ForbiddenError(`Requires role "${minimumRole}" or higher, has "${role}"`);
    }
    return { session, role };
  }
}
