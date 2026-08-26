# Multi-Agent Development Rules

ZUVRE is built by a mix of human engineers and AI coding agents working concurrently. These rules exist because that mix has different failure modes than a solo-developer or human-only team — mainly: less shared implicit context, more concurrent touches to the same boundaries, and a need for automated checks to carry weight that code review alone can't at this scale.

## The Core Rule

**Package boundaries (see `docs/architecture/README.md` and the repo structure in the foundation spec) are the unit of task assignment.** A task — for a human or an agent — should be scopable to one package or one module. If a task requires touching `packages/core`'s public interface *and* a module, that's a signal the task is actually two tasks, or that a boundary needs an ADR-documented change first.

## Rules

1. **No undocumented architectural changes.** Any change to a package's public exports (`index.ts`), the capability contract, an API shape shared across the tRPC/REST boundary, or the database schema's shape requires an ADR — proposed before the change, not written up after the fact to justify it.
2. **Strict typing is the primary agent-facing contract.** Code that doesn't typecheck doesn't merge — this is treated as more load-bearing here than in a typical team, because it's the fastest automated signal an agent gets that it violated a boundary.
3. **Tests are the definition of correctness, not an afterthought.** A module/package change without corresponding test coverage is incomplete, not "done, tests to follow."
4. **CODEOWNERS is enforced, not advisory.** A PR touching a package requires that package's owner's review, regardless of who (human or agent) authored it.
5. **Small, reviewable PRs.** A PR should correspond to one task scoped to one package/module. Large multi-package PRs should be flagged during review as a process issue, not merged as-is because "the agent already did all of it."
6. **Agents work from written specs, not verbal/implicit intent.** A task given to an AI agent should be traceable to this document, the relevant ADR(s), and (once written) the module-authoring guide — not to an assumption about what "seems right."
7. **No agent modifies `core`, `capability-sdk`, or a cross-cutting package (`ai-gateway`, `auth`, `db`, `tool-runtime`) without that being the explicit, scoped task.** Modules should not need to.
8. **When an agent (or human) hits an ambiguity the docs don't resolve, that's a signal to write or update the doc/ADR — not to guess and move on.**

## What This Enables

Multiple modules being built concurrently by different agents/engineers without coordination overhead beyond the shared contract in `capability-sdk`. That's the entire point of the capability-module architecture (ADR-0002) — this document is the process discipline that keeps the architecture's promise real in practice.
