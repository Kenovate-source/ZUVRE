import { aiGateway, createAnthropicProvider } from "@zuvre/ai-gateway";
import { rawDb } from "@zuvre/db";

let configured = false;

export function getAiGateway() {
  if (!configured) {
    aiGateway.registerProvider(createAnthropicProvider());
    aiGateway.setRoutes([
      {
        modality: "text",
        scope: "default",
        primaryProvider: "anthropic",
        primaryModel: process.env.AI_DEFAULT_TEXT_MODEL ?? "claude-sonnet-4-6",
      },
    ]);
    aiGateway.onUsage(async (workspaceId, usage) => {
      // Best-effort usage logging; never blocks the response on failure.
      try {
        await rawDb.auditLog.create({
          data: {
            workspaceId,
            actorType: "system",
            action: "ai.usage",
            metadata: usage as any,
          },
        });
      } catch {
        /* usage logging must never break the request */
      }
    });
    configured = true;
  }
  return aiGateway;
}
