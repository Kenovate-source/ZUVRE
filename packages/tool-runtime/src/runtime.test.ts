import { test } from "node:test";
import assert from "node:assert/strict";
import { ToolRuntime } from "./runtime.js";
import { createNoteWriteTool, createAlwaysThrowsTool } from "./testing/example-tools.js";

test("executes a tool when the required scope is granted", async () => {
  const runtime = new ToolRuntime();
  const store = new Map<string, string>();
  runtime.register(createNoteWriteTool(store));

  const result = await runtime.execute({
    toolId: "test.note.write",
    input: { key: "a", value: "hello" },
    permissions: { scopes: ["notes:write"] },
  });

  assert.equal(result.ok, true);
  assert.equal(store.get("a"), "hello");
});

test("refuses to run a tool when the required scope is missing", async () => {
  const runtime = new ToolRuntime();
  const store = new Map<string, string>();
  runtime.register(createNoteWriteTool(store));

  const result = await runtime.execute({
    toolId: "test.note.write",
    input: { key: "a", value: "hello" },
    permissions: { scopes: [] },
  });

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /requires scope/);
  assert.equal(store.has("a"), false, "the tool must not have run at all");
});

test("returns a failure result (not a throw) when a tool errors internally", async () => {
  const runtime = new ToolRuntime();
  runtime.register(createAlwaysThrowsTool());

  const result = await runtime.execute({
    toolId: "test.always.throws",
    input: {},
    permissions: { scopes: [] },
  });

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /simulated tool failure/);
});

test("unregistered tool id fails cleanly", async () => {
  const runtime = new ToolRuntime();
  const result = await runtime.execute({ toolId: "nope", input: {}, permissions: { scopes: [] } });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /No tool registered/);
});
