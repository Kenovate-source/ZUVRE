import type { AiProviderAdapter, AiResponse, TextGenerationRequest } from "../types";

/**
 * Minimal Anthropic Messages API adapter. Kept dependency-free (raw fetch)
 * so the gateway package has no hard SDK lock-in — swapping to the official
 * SDK later is a one-file change.
 */
export function createAnthropicProvider(apiKey?: string): AiProviderAdapter {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY;

  return {
    id: "anthropic",
    supportedModalities: ["text"],
    isConfigured: () => Boolean(key),
    async generateText(req: TextGenerationRequest, model: string): Promise<AiResponse<string>> {
      if (!key) throw new Error("Anthropic provider not configured: ANTHROPIC_API_KEY missing");

      const system = req.messages.find((m) => m.role === "system")?.content;
      const conversational = req.messages.filter((m) => m.role !== "system");

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          system,
          max_tokens: req.maxOutputTokens ?? 1024,
          temperature: req.temperature,
          messages: conversational.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Anthropic API error ${res.status}: ${body}`);
      }

      const data = (await res.json()) as {
        content: { type: string; text?: string }[];
        usage: { input_tokens: number; output_tokens: number };
      };

      const text = data.content
        .filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("\n");

      return {
        output: text,
        usage: {
          provider: "anthropic",
          model,
          inputUnits: data.usage.input_tokens,
          outputUnits: data.usage.output_tokens,
        },
        raw: data,
      };
    },
  };
}
