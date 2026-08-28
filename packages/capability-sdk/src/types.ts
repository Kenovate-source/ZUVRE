import { z } from "zod";

/**
 * A CapabilityDefinition is how a feature registers itself with ZUVRE.
 * This is the contract referenced throughout docs/09-capability-system.md.
 *
 * Design goals (spec §2–3):
 *  - New capabilities register without touching core platform code.
 *  - Every capability declares its own input/output shape, permissions,
 *    and whether it can run async, so the core runtime can host it
 *    uniformly (progress, cancellation, artifacts, events) without
 *    knowing anything about what the capability actually does.
 */

export type CapabilityCategory =
  | "ai"
  | "image"
  | "video"
  | "audio"
  | "code"
  | "website"
  | "application"
  | "game"
  | "document"
  | "research"
  | "automation"
  | "communication"
  | "commerce"
  | "integration"
  | "system";

export interface CapabilityPermissionRequest {
  /** Dot-scoped permission string, e.g. "network.fetch", "storage.write.artifacts" */
  key: string;
  reason: string;
  /** If true, every invocation needs a live approval, not just a one-time grant. */
  requiresPerInvocationApproval?: boolean;
}

export interface CapabilityProgressEvent {
  executionId: string;
  percent?: number;
  message?: string;
  data?: Record<string, unknown>;
}

export interface CapabilityArtifactOutput {
  kind: string;
  title: string;
  /** Provider-agnostic storage pointer; interpreted by the storage adapter. */
  storageRef: string;
  metadata?: Record<string, unknown>;
}

export interface CapabilityExecutionContext {
  executionId: string;
  workspaceId: string;
  initiatedByUserId?: string;
  agentRunId?: string;
  /** Scoped grant details — capabilities must never assume access beyond this. */
  grantedScopes: Record<string, unknown>;
  /** Emit a progress update. Safe to call zero or many times. */
  reportProgress(event: Omit<CapabilityProgressEvent, "executionId">): Promise<void>;
  /** Persist a produced artifact and link it to this execution. */
  emitArtifact(artifact: CapabilityArtifactOutput): Promise<{ artifactId: string }>;
  /** Request a scope not covered by the current grant; pauses execution until resolved. */
  requestPermission(request: CapabilityPermissionRequest): Promise<"granted" | "denied">;
  /** Abort signal wired to cancellation. */
  signal: AbortSignal;
}

export interface CapabilityDefinition<TInput = unknown, TOutput = unknown> {
  id: string; // stable dotted key, e.g. "image.generate"
  version: string; // semver
  displayName: string;
  description: string;
  category: CapabilityCategory;
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  requiredPermissions: CapabilityPermissionRequest[];
  /** true => long-running job semantics (queued/progress/cancellable). false => request/response. */
  isAsync: boolean;
  execute(input: TInput, ctx: CapabilityExecutionContext): Promise<TOutput>;
}

export function defineCapability<TInput, TOutput>(
  def: CapabilityDefinition<TInput, TOutput>
): CapabilityDefinition<TInput, TOutput> {
  return def;
}
