# @zuvre/worker

Background job execution shell — minimal structure only, no creation-engine logic yet.

## Structure
`src/job-queue.ts` — `InMemoryJobQueue`, a deliberately minimal in-memory queue. Not a real durable queue (BullMQ/SQS/etc.) — that's later work once the creation engine is actually built.

## Ownership
Owner: `@zuvre/platform-core`.

## Validation status
Compiles cleanly with `tsc`, zero external dependencies. All 3 tests genuinely pass; the process itself was actually started and its startup log observed in this build.
