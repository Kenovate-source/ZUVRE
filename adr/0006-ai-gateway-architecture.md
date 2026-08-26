# ADR-0006: AI Gateway Architecture

**Status**: Approved — pending implementation
**Date**: 2026-08-24
**Owner**: AI Platform

## Context
Every capability module (starting with `website-creation`) will need to call AI models — for specification refinement, planning, and code/content generation. Without a single mediating layer, provider-specific calls would leak into modules, making provider swaps and cross-cutting concerns (cost tracking, retries, observability) impossible to manage centrally.

## Problem
How do modules and `agent-runtime` access AI models without coupling to a specific provider, while still getting streaming, structured output, tool calls, and full observability?

## Decision
All model-provider communication goes through `packages/ai-gateway`. No module or other package may call OpenAI, Anthropic, Google, or any other provider SDK directly. The gateway exposes a provider-agnostic interface supporting:

- Provider and model abstraction (callers request a capability/model tier, not a vendor-specific model name, where possible)
- Streaming responses
- Structured output (schema-constrained generation)
- Tool/function calling
- Usage and cost tracking per request
- Request metadata and model/version tracking (for reproducibility and debugging)
- Retries with backoff
- Provider fallback (secondary provider on failure, where feasible)
- Normalized error types across providers

Only the provider(s) actually needed for the first vertical slice are implemented initially — the abstraction is built to allow more providers later, but additional providers are not pre-built speculatively.

## Alternatives Considered
- **Direct provider SDK calls from each module**: rejected outright — this is precisely the coupling this ADR exists to prevent; it would make provider changes, cost tracking, and observability a per-module concern instead of a platform one.
- **Third-party AI gateway product** (e.g. a hosted LLM proxy service): reduces build effort but introduces another vendor dependency and data-flow point for what is likely to become ZUVRE's most sensitive traffic (user creation intent, generated code). Rejected for the foundation stage; revisit only if the in-house gateway's operational burden becomes disproportionate.

## Rationale
Centralizing this is what makes "add a new capability module" and "add/swap a model provider" independent changes — exactly the extensibility property the whole platform is designed around. Cost and usage tracking being centralized also directly enables per-workspace usage limits and billing later, without retrofitting every module.

## Consequences
- Every module author writes against the gateway's interface, never a provider SDK — this needs to be enforced by convention (code review, CODEOWNERS on `ai-gateway`) since TypeScript alone can't fully prevent an import.
- Cost/usage data becomes available platform-wide from day one, which materially simplifies future billing and quota work.
- The gateway becomes a high-traffic, high-importance path — its own observability (latency, error rates, per-provider health) needs to be solid before `website-creation` depends on it heavily.

## Risks
- Building "too much" abstraction before there's a second real provider in use is a real over-engineering risk — mitigated by the explicit instruction to implement only what the first vertical slice needs.
- Structured-output and tool-call interfaces differ meaningfully across providers; normalizing them well is nontrivial and is the likely source of gateway API revisions as real usage begins.

## Reversal Strategy
Because modules only see the gateway's own interface, adding, removing, or reweighting providers behind it doesn't require module changes. If the in-house gateway proves too costly to maintain, it can be reimplemented as a thin wrapper around a third-party gateway product without changing any caller.

## Status Note
Approved. Do not pre-build provider support beyond what `website-creation` actually requires.
