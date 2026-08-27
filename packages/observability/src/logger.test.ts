import { test } from "node:test";
import assert from "node:assert/strict";
import { createLogger } from "./logger.js";

function captureConsole<T>(fn: () => T): { result: T; lines: string[] } {
  const lines: string[] = [];
  const original = { log: console.log, warn: console.warn, error: console.error };
  console.log = (msg: string) => lines.push(msg);
  console.warn = (msg: string) => lines.push(msg);
  console.error = (msg: string) => lines.push(msg);
  try {
    const result = fn();
    return { result, lines };
  } finally {
    Object.assign(console, original);
  }
}

test("logger emits a structured JSON line with level and message", () => {
  const { lines } = captureConsole(() => {
    const logger = createLogger();
    logger.info("hello world");
  });

  assert.equal(lines.length, 1);
  const parsed = JSON.parse(lines[0]!);
  assert.equal(parsed.level, "info");
  assert.equal(parsed.message, "hello world");
  assert.ok(parsed.time);
});

test("child() merges base fields into every subsequent log line", () => {
  const { lines } = captureConsole(() => {
    const logger = createLogger({ service: "api" });
    const scoped = logger.child({ requestId: "req-1" });
    scoped.warn("something odd", { detail: 42 });
  });

  const parsed = JSON.parse(lines[0]!);
  assert.equal(parsed.service, "api");
  assert.equal(parsed.requestId, "req-1");
  assert.equal(parsed.detail, 42);
  assert.equal(parsed.level, "warn");
});
