import { test } from "node:test";
import assert from "node:assert/strict";
import { AuthorizationService, UnauthorizedError, ForbiddenError } from "./types.js";
import { createFakeAuthProvider, createFakeRoleLookup } from "./testing/fake-provider.js";

test("requireSession returns the session for a valid token", async () => {
  const provider = createFakeAuthProvider();
  const roles = createFakeRoleLookup({});
  const service = new AuthorizationService(provider, roles);

  const created = await provider.createSession({ userId: "u1", email: "u1@example.com" });
  const session = await service.requireSession(created.id);

  assert.equal(session.identity.userId, "u1");
});

test("requireSession throws UnauthorizedError for an unknown token", async () => {
  const service = new AuthorizationService(createFakeAuthProvider(), createFakeRoleLookup({}));
  await assert.rejects(() => service.requireSession("nonexistent"), UnauthorizedError);
});

test("requireWorkspaceRole succeeds when the member's role meets the minimum", async () => {
  const provider = createFakeAuthProvider();
  const roles = createFakeRoleLookup({ "ws-1": { u1: "admin" } });
  const service = new AuthorizationService(provider, roles);
  const created = await provider.createSession({ userId: "u1", email: "u1@example.com" });

  const result = await service.requireWorkspaceRole(created.id, "ws-1", "member");
  assert.equal(result.role, "admin");
});

test("requireWorkspaceRole throws ForbiddenError when role rank is too low", async () => {
  const provider = createFakeAuthProvider();
  const roles = createFakeRoleLookup({ "ws-1": { u1: "member" } });
  const service = new AuthorizationService(provider, roles);
  const created = await provider.createSession({ userId: "u1", email: "u1@example.com" });

  await assert.rejects(() => service.requireWorkspaceRole(created.id, "ws-1", "owner"), ForbiddenError);
});

test("requireWorkspaceRole throws ForbiddenError for a non-member of the workspace", async () => {
  const provider = createFakeAuthProvider();
  const roles = createFakeRoleLookup({ "ws-1": {} });
  const service = new AuthorizationService(provider, roles);
  const created = await provider.createSession({ userId: "u1", email: "u1@example.com" });

  await assert.rejects(() => service.requireWorkspaceRole(created.id, "ws-1", "member"), ForbiddenError);
});

test("invalidateSession makes the token unusable afterward", async () => {
  const provider = createFakeAuthProvider();
  const created = await provider.createSession({ userId: "u1", email: "u1@example.com" });
  await provider.invalidateSession(created.id);

  const service = new AuthorizationService(provider, createFakeRoleLookup({}));
  await assert.rejects(() => service.requireSession(created.id), UnauthorizedError);
});
