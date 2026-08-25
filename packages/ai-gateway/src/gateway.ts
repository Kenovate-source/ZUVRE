import type { Logger } from "@zuvre/observability";
import type { GenerateRequest, GenerateResult, ModelProvider, UsageRecord } from "./types.js";
import { ModelProviderError } from "./types.js";

/**
 * The single entry point every capability module uses for AI calls. Routes
 * to a registered provider by id, retries/fails over to a secondary
 * provider on error, and records usage centrally — satisfying ADR-0006's
 * requirement that these concerns live in one place, not per-module.
 */
export class AIGateway {
  private readonly providers = new Map<string, ModelProvider>();
  private readonly usage: UsageRecord[] = [];

  constructor(private readonly logger?: Logger) {}

  registerProvider(provider: ModelProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * `providerId` is the primary provider to try; `fallbackProviderId` (if
   * given and registered) is used if the primary throws.
   */
  async generate(
    providerId: string,
    request: GenerateRequest,
    options?: { fallbackProviderId?: string },
  ): Promise<GenerateResult> {
    const primary = this.providers.get(providerId);
    if (!primary) {
      throw new ModelProviderError(`No provider registered with id "${providerId}"`, providerId);
    }

    try {
      const result = await primary.generate(request);
      this.recordUsage(result);
      return result;
    } catch (primaryError) {
      this.logger?.warn("primary AI provider failed", { providerId, error: String(primaryError) });

      const fallback = options?.fallbackProviderId
        ? this.providers.get(options.fallbackProviderId)
        : undefined;

      if (!fallback) {
        throw primaryError instanceof ModelProviderError
          ? primaryError
          : new ModelProviderError("provider call failed and no fallback was available", providerId, primaryError);
      }

      const result = await fallback.generate(request);
      this.recordUsage(result);
      return result;
    }
  }

  getUsage(): ReadonlyArray<UsageRecord> {
    return this.usage;
  }

  private recordUsage(result: GenerateResult): void {
    this.usage.push({
      providerId: result.providerId,
      model: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      at: new Date(),
    });
  }
}
