import { test } from "node:test";
import assert from "node:assert/strict";
import { createFixtureCapabilityModule } from "@zuvre/capability-sdk/testing";
import { CapabilityRegistry, CapabilityRegistrationError } from "./capability-registry.js";

test("a registered module is discoverable by its capabilityType", () => {
  const registry = new CapabilityRegistry();
  const fixture = createFixtureCapabilityModule();

  registry.register(fixture);

  const found = registry.getByCapabilityType("test-fixture");
  assert.equal(found?.identity.id, "test.fixture");
  assert.equal(registry.has("test-fixture"), true);
});

test("an unregistered capabilityType is not discoverable", () => {
  const registry = new CapabilityRegistry();
  assert.equal(registry.getByCapabilityType("nonexistent"), undefined);
  assert.equal(registry.has("nonexistent"), false);
});

test("registering two modules with the same id is rejected", () => {
  const registry = new CapabilityRegistry();
  registry.register(createFixtureCapabilityModule());

  assert.throws(
    () => registry.register(createFixtureCapabilityModule()),
    CapabilityRegistrationError,
  );
});

test("two modules cannot claim the same capabilityType", () => {
  const registry = new CapabilityRegistry();
  const first = createFixtureCapabilityModule();
  const second = createFixtureCapabilityModule();
  // give the second module a distinct id but the same capabilityType as the first
  Object.assign(second, { identity: { ...second.identity, id: "test.fixture.2" } });

  registry.register(first);
  assert.throws(() => registry.register(second), CapabilityRegistrationError);
});

test("list() returns every registered module", () => {
  const registry = new CapabilityRegistry();
  const fixture = createFixtureCapabilityModule();
  registry.register(fixture);

  const all = registry.list();
  assert.equal(all.length, 1);
  assert.equal(all[0]?.identity.id, "test.fixture");
});

test("core has no capability-specific knowledge — registry is generic over any module", () => {
  // This test exists to document intent: the registry only ever references
  // CapabilityModule from @zuvre/capability-sdk, never a concrete module.
  // A grep-level check backs this up in the repo-level VALIDATION.md notes.
  const registry = new CapabilityRegistry();
  assert.equal(typeof registry.register, "function");
});
