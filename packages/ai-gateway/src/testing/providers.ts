import type { GenerateRequest, GenerateResult, ModelProvider } from "../types.js";

/** Deterministic test provider — echoes the last user message. */
export function createEchoProvider(id = "test.echo"): ModelProvider {
  return {
    id,
    async generate(request: GenerateRequest): Promise<GenerateResult> {
      const lastUser = [...request.messages].reverse().find((m) => m.role === "user");
      return {
        content: lastUser ? `echo: ${lastUser.content}` : "echo: (no user message)",
        usage: { inputTokens: request.messages.length * 10, outputTokens: 10 },
        model: request.model,
        providerId: id,
      };
    },
  };
}

/** Test provider that always throws, for exercising fallback behavior. */
export function createFailingProvider(id = "test.failing"): ModelProvider {
  return {
    id,
    async generate(): Promise<GenerateResult> {
      throw new Error("simulated provider failure");
    },
  };
}
