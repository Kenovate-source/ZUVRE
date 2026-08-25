/**
 * Provider-agnostic types for the AI gateway (ADR-0006). No module or app
 * imports a provider SDK (OpenAI, Anthropic, Google, etc.) directly — they
 * all go through AIGateway, which routes to a registered ModelProvider.
 *
 * Only a NullProvider (testing/) exists in this foundation build. Real
 * providers are added when a capability module actually needs one — not
 * pre-built speculatively (per ADR-0006's explicit "do not overbuild").
 */

export interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateRequest {
  model: string;
  messages: ModelMessage[];
  /** If set, the provider should attempt to constrain output to this JSON shape. */
  responseSchema?: unknown;
  stream?: boolean;
}

export interface UsageInfo {
  inputTokens: number;
  outputTokens: number;
}

export interface GenerateResult {
  content: string;
  usage: UsageInfo;
  model: string;
  providerId: string;
}

export class ModelProviderError extends Error {
  constructor(
    message: string,
    public readonly providerId: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ModelProviderError";
  }
}

/** What a concrete provider (OpenAI, Anthropic, etc.) implements. */
export interface ModelProvider {
  readonly id: string;
  generate(request: GenerateRequest): Promise<GenerateResult>;
}

export interface UsageRecord extends UsageInfo {
  providerId: string;
  model: string;
  at: Date;
}
