import { test } from "node:test";
import assert from "node:assert/strict";
import { AgentRuntime } from "./runtime.js";

test("runs every step and reports success when all succeed", async () => {
  const runtime = new AgentRuntime();
  const log: string[] = [];

  const result = await runtime.run([
    { id: "s1", action: async () => { log.push("s1"); return 1; } },
    { id: "s2", action: async () => { log.push("s2"); return 2; } },
  ]);

  assert.equal(result.succeeded, true);
  assert.deepEqual(log, ["s1", "s2"]);
  assert.equal(result.outcomes.length, 2);
});

test("continues past a failed step by default and reports overall failure", async () => {
  const runtime = new AgentRuntime();
  const log: string[] = [];

  const result = await runtime.run([
    { id: "s1", action: async () => { log.push("s1"); throw new Error("boom"); } },
    { id: "s2", action: async () => { log.push("s2"); return "ok"; } },
  ]);

  assert.equal(result.succeeded, false);
  assert.deepEqual(log, ["s1", "s2"], "s2 should still run since stopOnFailure defaults to false");
  assert.equal(result.outcomes[0]?.ok, false);
  assert.equal(result.outcomes[1]?.ok, true);
});

test("stopOnFailure halts remaining steps after the first failure", async () => {
  const runtime = new AgentRuntime();
  const log: string[] = [];

  const result = await runtime.run(
    [
      { id: "s1", action: async () => { log.push("s1"); throw new Error("boom"); } },
      { id: "s2", action: async () => { log.push("s2"); return "ok"; } },
    ],
    { stopOnFailure: true },
  );

  assert.equal(result.succeeded, false);
  assert.deepEqual(log, ["s1"], "s2 must never run");
  assert.equal(result.outcomes.length, 1);
});

test("onStepOutcome is called once per step with the right outcome", async () => {
  const runtime = new AgentRuntime();
  const seen: string[] = [];

  await runtime.run(
    [{ id: "s1", action: async () => "done" }],
    { onStepOutcome: (o) => seen.push(`${o.stepId}:${o.ok}`) },
  );

  assert.deepEqual(seen, ["s1:true"]);
});
