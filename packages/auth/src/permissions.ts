/**
 * ZUVRE permission model.
 *
 * Permission strings are dot-scoped, e.g.:
 *   "workspace.members.invite"
 *   "capability.execute.image.generate"
 *   "owner.capabilities.disable"
 *
 * A role carries an array of permission strings, which may include a
 * trailing wildcard segment ("capability.execute.*"). This module contains
 * ONLY the matching logic — role storage lives in @zuvre/db, and the
 * platform-owner surface layers additional checks in owner.ts.
 */

export function permissionMatches(granted: string, required: string): boolean {
  if (granted === required) return true;
  if (granted.endsWith(".*")) {
    const prefix = granted.slice(0, -2);
    return required === prefix || required.startsWith(prefix + ".");
  }
  return false;
}

export function hasPermission(grantedPermissions: string[], required: string): boolean {
  return grantedPermissions.some((g) => permissionMatches(g, required));
}

export function assertPermission(grantedPermissions: string[], required: string): void {
  if (!hasPermission(grantedPermissions, required)) {
    throw new PermissionDeniedError(required);
  }
}

export class PermissionDeniedError extends Error {
  constructor(public readonly required: string) {
    super(`Permission denied: missing "${required}"`);
    this.name = "PermissionDeniedError";
  }
}

/** Default role permission sets seeded at workspace creation. Owner-editable thereafter. */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ["workspace.*", "capability.*", "agent.*", "billing.*"],
  editor: [
    "workspace.artifacts.*",
    "capability.execute.*",
    "agent.run",
    "workspace.members.view",
  ],
  viewer: ["workspace.artifacts.view", "workspace.members.view"],
};
