import { test } from "node:test";
import assert from "node:assert/strict";
import { AIGateway } from "./gateway.js";
import { ModelProviderError } from "./types.js";
import { createEchoProvider, createFailingProvider } from "./testing/providers.js";

test("routes a generate() call to the registered provider", async () => {
  const gateway = new AIGateway();
  gateway.registerProvider(createEchoProvider());

  const result = await gateway.generate("test.echo", {
    model: "test-model",
    messages: [{ role: "user", content: "hello" }],
  });

  assert.equal(result.content, "echo: hello");
  assert.equal(result.providerId, "test.echo");
});

test("throws a normalized ModelProviderError for an unregistered provider", async () => {
  const gateway = new AIGateway();
  await assert.rejects(
    () => gateway.generate("does-not-exist", { model: "m", messages: [] }),
    ModelProviderError,
  );
});

test("falls back to the secondary provider when the primary fails", async () => {
  const gateway = new AIGateway();
  gateway.registerProvider(createFailingProvider("primary"));
  gateway.registerProvider(createEchoProvider("secondary"));

  const result = await gateway.generate(
    "primary",
    { model: "m", messages: [{ role: "user", content: "fallback please" }] },
    { fallbackProviderId: "secondary" },
  );

  assert.equal(result.providerId, "secondary");
  assert.equal(result.content, "echo: fallback please");
});

test("records usage centrally after a successful call", async () => {
  const gateway = new AIGateway();
  gateway.registerProvider(createEchoProvider());

  await gateway.generate("test.echo", { model: "m", messages: [{ role: "user", content: "hi" }] });
  await gateway.generate("test.echo", { model: "m", messages: [{ role: "user", content: "again" }] });

  assert.equal(gateway.getUsage().length, 2);
  assert.equal(gateway.getUsage()[0]?.providerId, "test.echo");
});
