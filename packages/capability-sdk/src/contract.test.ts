import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createFixtureCapabilityModule,
  createFailingFixtureCapabilityModule,
} from "./testing/fixture-module.js";
import { assertSatisfiesCapabilityContract } from "./testing/contract-suite.js";
import type { CreationSpecification } from "./types.js";
import type { FixturePayload } from "./testing/fixture-module.js";

function spec(payload: FixturePayload): CreationSpecification<FixturePayload> {
  return {
    id: "spec-1",
    workspaceId: "ws-1",
    projectId: "proj-1",
    capabilityType: "test-fixture",
    payload,
    createdAt: new Date(),
  };
}

test("fixture module satisfies the capability contract", async () => {
  const module = createFixtureCapabilityModule();
  await assertSatisfiesCapabilityContract(
    module,
    spec({ title: "A valid title" }),
    spec({ title: "" }),
  );
});

test("fixture module reports a validation issue on empty title", () => {
  const module = createFixtureCapabilityModule();
  const result = module.validateSpecification(spec({ title: "" }));
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.issues[0]?.path, "title");
  }
});

test("fixture module emits an artifact-produced event during execution", async () => {
  const module = createFixtureCapabilityModule();
  const validSpec = spec({ title: "Emits artifact" });
  const plan = await module.plan(validSpec);

  const events: string[] = [];
  await module.execute(plan, {
    workspaceId: validSpec.workspaceId,
    projectId: validSpec.projectId,
    emit: (e) => events.push(e.kind),
    ai: undefined,
    agent: undefined,
    tools: undefined,
  });

  assert.ok(events.includes("artifact-produced"), "expected an artifact-produced event");
  assert.equal(events.at(-1), "execution-completed");
});

test("failing fixture module ends in an execution-failed event", async () => {
  const module = createFailingFixtureCapabilityModule();
  const validSpec = spec({ title: "Will fail" });
  const plan = await module.plan(validSpec);

  const events: string[] = [];
  await module.execute(plan, {
    workspaceId: validSpec.workspaceId,
    projectId: validSpec.projectId,
    emit: (e) => events.push(e.kind),
    ai: undefined,
    agent: undefined,
    tools: undefined,
  });

  assert.equal(events.at(-1), "execution-failed");
});
