/**
 * ZUVRE AI Gateway — provider abstraction (spec §4).
 *
 * Nothing in the platform calls an AI provider's SDK directly. Everything
 * goes through `AiGateway`, which:
 *   - selects a provider/model per modality and per capability,
 *   - falls back to a secondary provider on failure,
 *   - tracks usage per workspace for billing/quota,
 *   - is the single place new modalities/providers get wired in.
 */

export type AiModality = "text" | "image" | "audio" | "voice" | "video" | "embedding";

export interface AiUsage {
  provider: string;
  model: string;
  inputUnits?: number; // tokens, seconds, or pixels depending on modality
  outputUnits?: number;
  costEstimateMinorUnits?: number;
}

export interface TextGenerationRequest {
  modality: "text";
  messages: { role: "system" | "user" | "assistant" | "tool"; content: string }[];
  tools?: unknown[];
  maxOutputTokens?: number;
  temperature?: number;
}

export interface ImageGenerationRequest {
  modality: "image";
  prompt: string;
  referenceImages?: string[]; // storage refs
  size?: string;
}

export type AiRequest = TextGenerationRequest | ImageGenerationRequest;

export interface AiResponse<T = unknown> {
  output: T;
  usage: AiUsage;
  raw?: unknown;
}

export interface AiProviderAdapter {
  id: string; // e.g. "anthropic", "openai", "local-stub"
  supportedModalities: AiModality[];
  isConfigured(): boolean;
  generateText?(req: TextGenerationRequest, model: string): Promise<AiResponse<string>>;
  generateImage?(req: ImageGenerationRequest, model: string): Promise<AiResponse<string>>;
}

export interface ModelRoute {
  modality: AiModality;
  /** e.g. "capability:image.generate" or "default" */
  scope: string;
  primaryProvider: string;
  primaryModel: string;
  fallbackProvider?: string;
  fallbackModel?: string;
}
