import { test } from "node:test";
import assert from "node:assert/strict";
import { InMemoryJobQueue } from "./job-queue.js";

test("drain() processes every enqueued job in order", async () => {
  const processed: string[] = [];
  const queue = new InMemoryJobQueue<{ label: string }>(async (job) => {
    processed.push(job.payload.label);
  });

  queue.enqueue({ id: "1", payload: { label: "a" } });
  queue.enqueue({ id: "2", payload: { label: "b" } });
  assert.equal(queue.pendingCount, 2);

  await queue.drain();

  assert.deepEqual(processed, ["a", "b"]);
  assert.equal(queue.pendingCount, 0);
});

test("drain() rejects re-entrant calls while already draining", async () => {
  const queue = new InMemoryJobQueue(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
  queue.enqueue({ id: "1", payload: {} });

  const first = queue.drain();
  await assert.rejects(() => queue.drain(), /already draining/);
  await first;
});

test("a job enqueued after drain() completes is still processed on the next drain()", async () => {
  const processed: string[] = [];
  const queue = new InMemoryJobQueue<{ label: string }>(async (job) => {
    processed.push(job.payload.label);
  });

  queue.enqueue({ id: "1", payload: { label: "first" } });
  await queue.drain();

  queue.enqueue({ id: "2", payload: { label: "second" } });
  await queue.drain();

  assert.deepEqual(processed, ["first", "second"]);
});
