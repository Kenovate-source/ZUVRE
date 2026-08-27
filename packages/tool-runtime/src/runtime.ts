/**
 * The boundary agent-runtime and capability modules use to take concrete
 * actions (file writes, running a build command, etc.) — never directly,
 * always through a registered, permissioned Tool. This foundation
 * deliberately does NOT implement unrestricted shell execution; a real
 * sandboxed executor (containerized, resource-limited) is a later,
 * explicit piece of work, not something to fake here just to fill out the
 * skeleton.
 */

export interface ToolPermissions {
  /** Permission scopes this tool call is allowed, e.g. "fs:write:/workspace/output". Enforcement is the ToolRuntime's job, not each tool's. */
  scopes: string[];
}

export interface ToolInvocation<TInput = unknown> {
  toolId: string;
  input: TInput;
  permissions: ToolPermissions;
}

export interface ToolResult<TOutput = unknown> {
  ok: boolean;
  output?: TOutput;
  error?: string;
}

export interface Tool<TInput = unknown, TOutput = unknown> {
  readonly id: string;
  /** Scopes this tool requires to run at all — checked against the invocation's granted permissions before `run` is called. */
  readonly requiredScopes: string[];
  run(input: TInput): Promise<TOutput>;
}

export class ToolPermissionError extends Error {
  constructor(toolId: string, missingScope: string) {
    super(`Tool "${toolId}" requires scope "${missingScope}" which was not granted.`);
    this.name = "ToolPermissionError";
  }
}

/**
 * Executes registered tools after checking the invocation's granted scopes
 * against what the tool requires. This is the ONE place permission
 * enforcement happens — tools themselves trust the runtime already checked.
 */
export class ToolRuntime {
  private readonly tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.id, tool);
  }

  async execute<TInput, TOutput>(invocation: ToolInvocation<TInput>): Promise<ToolResult<TOutput>> {
    const tool = this.tools.get(invocation.toolId) as Tool<TInput, TOutput> | undefined;
    if (!tool) {
      return { ok: false, error: `No tool registered with id "${invocation.toolId}"` };
    }

    for (const required of tool.requiredScopes) {
      if (!invocation.permissions.scopes.includes(required)) {
        return { ok: false, error: new ToolPermissionError(tool.id, required).message };
      }
    }

    try {
      const output = await tool.run(invocation.input);
      return { ok: true, output };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}
