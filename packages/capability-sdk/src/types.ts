/**
 * The Capability Module Contract (ADR-0002).
 *
 * This is the only thing a capability module needs to know about ZUVRE.
 * `core` depends on these types; modules implement them. `core` never
 * imports a module directly — modules are registered explicitly at
 * application composition time (see @zuvre/core's CapabilityRegistry).
 *
 * Concrete modules typically use a schema library (e.g. Zod) internally to
 * build a ValidationResult — this contract itself has no dependency on any
 * particular validation library, to keep the SDK's own dependency surface
 * minimal.
 */

/** A single structured validation problem, independent of the validation library used to produce it. */
export interface ValidationIssue {
  /** Dot-path to the offending field, e.g. "pages.0.title". Empty string for a whole-object issue. */
  path: string;
  message: string;
  code?: string;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; issues: ValidationIssue[] };

/**
 * The structured, validated representation of what a user wants created.
 * `payload` is intentionally opaque to `core` and to the SDK itself — only
 * the owning module knows its shape. `core` persists it as-is.
 */
export interface CreationSpecification<TPayload = unknown> {
  id: string;
  workspaceId: string;
  projectId: string;
  capabilityType: string;
  payload: TPayload;
  createdAt: Date;
}

export interface PlanStep {
  id: string;
  description: string;
  /** Rough relative weight for progress reporting, not a hard time estimate. */
  estimatedWeight?: number;
}

/** The result of planning: an ordered list of steps, produced with no side effects. */
export interface ExecutionPlan {
  steps: PlanStep[];
  /** Free-form metadata a module wants to carry from plan() into execute(). */
  metadata?: Record<string, unknown>;
}

export type ArtifactType = string;

export interface ArtifactDeclaration {
  id: string;
  type: ArtifactType;
  /** Where the artifact can be found once produced — module-defined shape (e.g. a storage URI). */
  location: string;
  metadata?: Record<string, unknown>;
}

export type ProgressEvent =
  | { kind: "step-started"; stepId: string; at: Date }
  | { kind: "step-log"; stepId: string; message: string; at: Date }
  | { kind: "step-completed"; stepId: string; at: Date }
  | { kind: "artifact-produced"; artifact: ArtifactDeclaration; at: Date }
  | { kind: "execution-completed"; at: Date }
  | { kind: "execution-failed"; stepId?: string; error: string; at: Date };

/**
 * Scoped access to the platform's cross-cutting capabilities, handed to a
 * module only for the duration of one execute() call. A module never
 * imports @zuvre/ai-gateway, @zuvre/agent-runtime, or @zuvre/tool-runtime
 * directly and reaches for a provider itself — it only ever sees what this
 * context exposes.
 */
export interface ExecutionContext {
  workspaceId: string;
  projectId: string;
  /** Emit a progress event; `core` is responsible for persisting/streaming it onward. */
  emit(event: ProgressEvent): void;
  /** Scoped handle into @zuvre/ai-gateway — see ADR-0006. Typed as unknown at the SDK boundary so capability-sdk itself never depends on ai-gateway's package. */
  ai: unknown;
  /** Scoped handle into @zuvre/agent-runtime — see the agent-runtime package. */
  agent: unknown;
  /** Scoped handle into @zuvre/tool-runtime — see the tool-runtime package. */
  tools: unknown;
}

export interface CapabilityIdentity {
  id: string;
  name: string;
  version: string;
  /** Creation type identifiers this module handles, e.g. ["website"]. */
  capabilityTypes: string[];
  /** Artifact types this module can produce, e.g. ["static-site", "nextjs-app"]. */
  outputArtifactTypes: ArtifactType[];
}

export interface CapabilityModule<TPayload = unknown> {
  readonly identity: CapabilityIdentity;

  validateSpecification(spec: CreationSpecification<TPayload>): ValidationResult;

  plan(spec: CreationSpecification<TPayload>): Promise<ExecutionPlan> | ExecutionPlan;

  execute(plan: ExecutionPlan, context: ExecutionContext): Promise<void>;
}
