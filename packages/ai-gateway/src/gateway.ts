import type {
  AiProviderAdapter,
  AiRequest,
  AiResponse,
  ModelRoute,
  AiUsage,
  TextGenerationRequest,
  ImageGenerationRequest,
} from "./types";

export type UsageSink = (workspaceId: string, usage: AiUsage) => Promise<void>;

export class AiGateway {
  private providers = new Map<string, AiProviderAdapter>();
  private routes: ModelRoute[] = [];
  private usageSink?: UsageSink;

  registerProvider(adapter: AiProviderAdapter): void {
    this.providers.set(adapter.id, adapter);
  }

  setRoutes(routes: ModelRoute[]): void {
    this.routes = routes;
  }

  onUsage(sink: UsageSink): void {
    this.usageSink = sink;
  }

  private resolveRoute(modality: ModelRoute["modality"], scope: string): ModelRoute | undefined {
    return (
      this.routes.find((r) => r.modality === modality && r.scope === scope) ??
      this.routes.find((r) => r.modality === modality && r.scope === "default")
    );
  }

  async generateText(
    req: TextGenerationRequest,
    opts: { workspaceId: string; scope?: string }
  ): Promise<AiResponse<string>> {
    const route = this.resolveRoute("text", opts.scope ?? "default");
    if (!route) throw new Error("No text route configured (default route missing)");
    return this.runWithFallback(
      route,
      (provider, model) => {
        const adapter = this.providers.get(provider);
        if (!adapter?.generateText) throw new Error(`Provider ${provider} has no generateText`);
        return adapter.generateText(req, model);
      },
      opts.workspaceId
    );
  }

  async generateImage(
    req: ImageGenerationRequest,
    opts: { workspaceId: string; scope?: string }
  ): Promise<AiResponse<string>> {
    const route = this.resolveRoute("image", opts.scope ?? "default");
    if (!route) throw new Error("No image route configured (default route missing)");
    return this.runWithFallback(
      route,
      (provider, model) => {
        const adapter = this.providers.get(provider);
        if (!adapter?.generateImage) throw new Error(`Provider ${provider} has no generateImage`);
        return adapter.generateImage(req, model);
      },
      opts.workspaceId
    );
  }

  private async runWithFallback<T>(
    route: ModelRoute,
    call: (provider: string, model: string) => Promise<AiResponse<T>>,
    workspaceId: string
  ): Promise<AiResponse<T>> {
    const primary = this.providers.get(route.primaryProvider);
    try {
      if (!primary?.isConfigured()) throw new Error(`${route.primaryProvider} not configured`);
      const res = await call(route.primaryProvider, route.primaryModel);
      await this.usageSink?.(workspaceId, res.usage);
      return res;
    } catch (primaryErr) {
      if (!route.fallbackProvider || !route.fallbackModel) throw primaryErr;
      const fallback = this.providers.get(route.fallbackProvider);
      if (!fallback?.isConfigured()) throw primaryErr;
      const res = await call(route.fallbackProvider, route.fallbackModel);
      await this.usageSink?.(workspaceId, res.usage);
      return res;
    }
  }
}

export const aiGateway = new AiGateway();
