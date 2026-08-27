/**
 * A mock capability module used ONLY to prove the capability contract works
 * end-to-end (registration, discovery, validation, planning, execution,
 * progress events, artifact reporting) — per the ADR-0002 correction, this
 * is a test fixture, not a permanent no-op module. It must never be
 * registered by apps/api or apps/worker outside of tests.
 */
import type {
  CapabilityModule,
  CreationSpecification,
  ExecutionContext,
  ExecutionPlan,
  ValidationResult,
} from "../types.js";

export interface FixturePayload {
  title: string;
  shouldFail?: boolean;
}

export function createFixtureCapabilityModule(): CapabilityModule<FixturePayload> {
  return {
    identity: {
      id: "test.fixture",
      name: "Test Fixture Capability",
      version: "0.0.0-test",
      capabilityTypes: ["test-fixture"],
      outputArtifactTypes: ["test-artifact"],
    },

    validateSpecification(spec: CreationSpecification<FixturePayload>): ValidationResult {
      if (!spec.payload || typeof spec.payload.title !== "string" || spec.payload.title.trim() === "") {
        return {
          valid: false,
          issues: [{ path: "title", message: "title is required", code: "required" }],
        };
      }
      return { valid: true };
    },

    plan(spec: CreationSpecification<FixturePayload>): ExecutionPlan {
      return {
        steps: [
          { id: "step-1", description: `Prepare "${spec.payload.title}"`, estimatedWeight: 1 },
          { id: "step-2", description: "Produce artifact", estimatedWeight: 1 },
        ],
        metadata: { fixture: true },
      };
    },

    async execute(plan: ExecutionPlan, context: ExecutionContext): Promise<void> {
      for (const step of plan.steps) {
        context.emit({ kind: "step-started", stepId: step.id, at: new Date() });

        if (step.id === "step-2") {
          context.emit({
            kind: "artifact-produced",
            artifact: {
              id: "artifact-1",
              type: "test-artifact",
              location: `memory://fixture/${context.workspaceId}/${context.projectId}/artifact-1`,
            },
            at: new Date(),
          });
        }

        context.emit({ kind: "step-completed", stepId: step.id, at: new Date() });
      }

      context.emit({ kind: "execution-completed", at: new Date() });
    },
  };
}

/** Variant that fails partway through execute(), for testing failure-path handling. */
export function createFailingFixtureCapabilityModule(): CapabilityModule<FixturePayload> {
  const base = createFixtureCapabilityModule();
  return {
    ...base,
    identity: { ...base.identity, id: "test.fixture.failing" },
    async execute(plan: ExecutionPlan, context: ExecutionContext): Promise<void> {
      context.emit({ kind: "step-started", stepId: plan.steps[0]!.id, at: new Date() });
      context.emit({
        kind: "execution-failed",
        stepId: plan.steps[0]!.id,
        error: "simulated failure",
        at: new Date(),
      });
    },
  };
}
