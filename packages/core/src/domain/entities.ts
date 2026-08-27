/**
 * Foundation domain model (see docs/architecture/README.md §6-7).
 *
 * These are plain domain types, deliberately decoupled from @zuvre/db's
 * Prisma models — @zuvre/db maps between its generated Prisma types and
 * these when repository functions return data. This keeps ORM specifics
 * out of core and out of every consumer of core.
 *
 * No capability-specific fields exist anywhere here. A CreationRequest's
 * capabilityType is a plain string core does not interpret.
 */

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceRole = "owner" | "admin" | "member";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMembership {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: Date;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  /** The capability type this project targets, e.g. "website". Opaque to core. */
  capabilityType: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreationRequestStatus = "pending" | "specified" | "rejected";

export interface CreationRequest {
  id: string;
  workspaceId: string;
  projectId: string;
  /** The user's raw, unstructured intent. */
  rawInput: string;
  status: CreationRequestStatus;
  createdAt: Date;
}

export interface CreationSpecificationRecord {
  id: string;
  workspaceId: string;
  projectId: string;
  creationRequestId: string;
  capabilityType: string;
  /** Opaque to core — the owning capability module defines its shape. */
  payload: unknown;
  createdAt: Date;
}

export type BuildStatus = "queued" | "planning" | "executing" | "succeeded" | "failed";

export interface Build {
  id: string;
  workspaceId: string;
  projectId: string;
  creationSpecificationId: string;
  status: BuildStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  createdAt: Date;
}

export interface Asset {
  id: string;
  workspaceId: string;
  projectId: string;
  buildId: string;
  type: string;
  location: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export type DeploymentStatus = "pending" | "deploying" | "live" | "failed" | "rolled-back";

export interface Deployment {
  id: string;
  workspaceId: string;
  projectId: string;
  buildId: string;
  provider: string;
  status: DeploymentStatus;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
}
