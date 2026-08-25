import assert from "node:assert/strict";
import type { CapabilityModule, CreationSpecification, ExecutionContext, ProgressEvent } from "../types.js";

/**
 * Runs a capability module through the shape of the contract it must
 * satisfy: identity is well-formed, validateSpecification distinguishes
 * valid/invalid input, plan() returns steps without side effects, and
 * execute() emits progress events and completes.
 *
 * Intended to be called from any module's own test suite (fixture today,
 * modules/website-creation later) — not a replacement for a module's
 * behavior-specific tests.
 */
export async function assertSatisfiesCapabilityContract<TPayload>(
  module: CapabilityModule<TPayload>,
  validSpec: CreationSpecification<TPayload>,
  invalidSpec: CreationSpecification<TPayload>,
): Promise<void> {
  // Identity
  assert.ok(module.identity.id, "capability identity.id must be set");
  assert.ok(module.identity.version, "capability identity.version must be set");
  assert.ok(module.identity.capabilityTypes.length > 0, "capability must declare at least one capabilityType");

  // Validation must distinguish valid vs invalid input
  const validResult = module.validateSpecification(validSpec);
  assert.equal(validResult.valid, true, "a well-formed specification must validate as valid");

  const invalidResult = module.validateSpecification(invalidSpec);
  assert.equal(invalidResult.valid, false, "a malformed specification must validate as invalid");
  if (!invalidResult.valid) {
    assert.ok(invalidResult.issues.length > 0, "invalid result must report at least one issue");
  }

  // Planning must be side-effect-free and produce at least one step
  const plan = await module.plan(validSpec);
  assert.ok(plan.steps.length > 0, "plan() must return at least one step");

  // Execution must emit progress events and reach a terminal event
  const events: ProgressEvent[] = [];
  const context: ExecutionContext = {
    workspaceId: validSpec.workspaceId,
    projectId: validSpec.projectId,
    emit: (event) => events.push(event),
    ai: undefined,
    agent: undefined,
    tools: undefined,
  };

  await module.execute(plan, context);

  assert.ok(events.length > 0, "execute() must emit at least one progress event");
  const terminal = events.at(-1);
  assert.ok(
    terminal?.kind === "execution-completed" || terminal?.kind === "execution-failed",
    "execute() must end in a terminal execution-completed or execution-failed event",
  );
}
