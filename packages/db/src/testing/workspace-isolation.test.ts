import { test } from "node:test";
import assert from "node:assert/strict";
import { InMemoryDataStore } from "./in-memory-store.js";
import { WorkspaceScopedRepository } from "../repositories/workspace-scoped-repository.js";

interface Note {
  id: string;
  workspaceId: string;
  text: string;
}

function makeRepo() {
  return new WorkspaceScopedRepository<Note>(new InMemoryDataStore<Note>());
}

test("workspace A cannot read a record belonging to workspace B by id", async () => {
  const repo = makeRepo();
  const created = await repo.create("workspace-b", { id: "note-1", text: "secret to B" } as any);

  const asSeenByA = await repo.getById("workspace-a", created.id);
  assert.equal(asSeenByA, null, "workspace A must not be able to fetch workspace B's record");

  const asSeenByB = await repo.getById("workspace-b", created.id);
  assert.equal(asSeenByB?.text, "secret to B", "workspace B can still read its own record");
});

test("workspace A's list() never includes workspace B's records", async () => {
  const repo = makeRepo();
  await repo.create("workspace-a", { id: "note-a1", text: "a1" } as any);
  await repo.create("workspace-b", { id: "note-b1", text: "b1" } as any);
  await repo.create("workspace-b", { id: "note-b2", text: "b2" } as any);

  const aList = await repo.list("workspace-a");
  const bList = await repo.list("workspace-b");

  assert.equal(aList.length, 1);
  assert.equal(aList[0]?.id, "note-a1");
  assert.equal(bList.length, 2);
  assert.ok(bList.every((r) => r.workspaceId === "workspace-b"));
});

test("workspace A cannot delete a record belonging to workspace B", async () => {
  const repo = makeRepo();
  await repo.create("workspace-b", { id: "note-1", text: "b's note" } as any);

  const deletedByA = await repo.remove("workspace-a", "note-1");
  assert.equal(deletedByA, false, "delete attempt from the wrong workspace must fail");

  const stillThere = await repo.getById("workspace-b", "note-1");
  assert.ok(stillThere, "the record must still exist for its real owner");
});

test("every write is stamped with the workspaceId it was created under, regardless of what the caller passes", async () => {
  const repo = makeRepo();
  // Even if a caller's input object claims a different workspaceId, create()
  // always stamps the workspaceId argument it was actually called with.
  const created = await repo.create("workspace-a", {
    id: "note-1",
    workspaceId: "workspace-SPOOFED",
    text: "attempt to spoof",
  } as Note);

  assert.equal(created.workspaceId, "workspace-a");
  const found = await repo.getById("workspace-a", "note-1");
  assert.ok(found);
  const spoofed = await repo.getById("workspace-SPOOFED", "note-1");
  assert.equal(spoofed, null);
});
