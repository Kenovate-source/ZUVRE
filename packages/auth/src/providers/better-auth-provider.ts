/**
 * AUTHORED, NOT EXECUTED IN THIS SANDBOX — requires `better-auth` installed
 * (no npm registry access in the build sandbox; see repo-level
 * VALIDATION.md). This adapts Better Auth's session API to ZUVRE's own
 * AuthProvider interface (ADR-0005) so the rest of the platform never
 * imports `better-auth` directly.
 */
import { betterAuth } from "better-auth";
import type { AuthProvider, Identity, Session } from "../types.js";

export interface BetterAuthProviderConfig {
  /** Better Auth's own config — database adapter, secret, social providers, etc. Wired up in apps/api's composition root, not here. */
  betterAuthInstance: ReturnType<typeof betterAuth>;
}

export function createBetterAuthProvider(config: BetterAuthProviderConfig): AuthProvider {
  const auth = config.betterAuthInstance;

  return {
    async getSession(sessionToken: string): Promise<Session | null> {
      const result = await auth.api.getSession({ headers: new Headers({ cookie: sessionToken }) });
      if (!result?.session || !result.user) return null;

      const identity: Identity = { userId: result.user.id, email: result.user.email };
      return {
        id: result.session.id,
        identity,
        expiresAt: new Date(result.session.expiresAt),
      };
    },

    async createSession(_identity: Identity): Promise<Session> {
      // Real session creation goes through Better Auth's sign-in/sign-up
      // flows (email/password, OAuth callback), not a direct call here —
      // this method exists to satisfy the AuthProvider contract for flows
      // (e.g. internal service tokens) that don't go through those.
      throw new Error("createSession: wire up to the specific Better Auth flow apps/api needs.");
    },

    async invalidateSession(sessionToken: string): Promise<void> {
      await auth.api.signOut({ headers: new Headers({ cookie: sessionToken }) });
    },
  };
}
