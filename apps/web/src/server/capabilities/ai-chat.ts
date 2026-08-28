import { z } from "zod";
import { defineCapability } from "@zuvre/capability-sdk";
import { getAiGateway } from "../ai/gateway-instance";

const inputSchema = z.object({
  message: z.string().min(1).max(8000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(50)
    .optional(),
});

const outputSchema = z.object({
  reply: z.string(),
});

export const aiChatCapability = defineCapability({
  id: "ai.chat",
  version: "0.1.0",
  displayName: "AI Chat",
  description: "Converse with ZUVRE's AI using the configured default text model.",
  category: "ai",
  isAsync: false,
  requiredPermissions: [{ key: "ai.text.generate", reason: "Generate a conversational reply" }],
  inputSchema,
  outputSchema,
  async execute(input, ctx) {
    const gateway = getAiGateway();
    await ctx.reportProgress({ message: "Sending request to model" });

    const messages = [
      { role: "system" as const, content: "You are the ZUVRE assistant. Be warm, clear, and concise." },
      ...(input.history ?? []),
      { role: "user" as const, content: input.message },
    ];

    const res = await gateway.generateText(
      { modality: "text", messages },
      { workspaceId: ctx.workspaceId, scope: "capability:ai.chat" }
    );

    return { reply: res.output };
  },
});
