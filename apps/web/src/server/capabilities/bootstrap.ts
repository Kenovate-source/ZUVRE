import { capabilityRegistry } from "@zuvre/capability-sdk";
import { rawDb } from "@zuvre/db";
import { aiChatCapability } from "./ai-chat";

let bootstrapped = false;

/**
 * Registers all in-code capabilities and ensures each has a matching,
 * enabled row in CapabilityDefinition. This is what makes "capabilities
 * register themselves" real rather than aspirational: add a new
 * `defineCapability(...)` call, list it here, and it's live — no core
 * platform changes required (spec §2–3).
 */
export async function bootstrapCapabilities() {
  if (bootstrapped) return;

  const definitions = [aiChatCapability];
  for (const def of definitions) {
    capabilityRegistry.register(def);
    await rawDb.capabilityDefinition.upsert({
      where: { id_version: { id: def.id, version: def.version } },
      create: {
        id: def.id,
        version: def.version,
        displayName: def.displayName,
        description: def.description,
        category: def.category,
        inputSchema: {} as any,
        outputSchema: {} as any,
        requiredPermissions: def.requiredPermissions as any,
      },
      update: {
        displayName: def.displayName,
        description: def.description,
        category: def.category,
        requiredPermissions: def.requiredPermissions as any,
      },
    });
  }

  bootstrapped = true;
}
