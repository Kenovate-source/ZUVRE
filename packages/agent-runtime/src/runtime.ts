/**
 * The minimal boundary agent-runtime needs at foundation stage: a step
 * runner that takes an ordered list of steps and, for each, calls an
 * action function and records an observation. It knows nothing about
 * capability types, AI, or tools directly — a capability module supplies
 * the actual step actions (which may internally call @zuvre/ai-gateway or
 * @zuvre/tool-runtime through their own context).
 *
 * This is deliberately NOT a complete autonomous agent system (no dynamic
 * re-planning, no goal-directed loop) — that is real future work, not
 * something to fake here to look more finished than it is.
 */

export interface AgentStep<TResult = unknown> {
  id: string;
  action: () => Promise<TResult>;
}

export type AgentStepOutcome<TResult = unknown> =
  | { stepId: string; ok: true; result: TResult }
  | { stepId: string; ok: false; error: string };

export interface AgentRunResult {
  outcomes: AgentStepOutcome[];
  /** True only if every step succeeded. */
  succeeded: boolean;
}

export interface AgentRunOptions {
  /** If true (default false), stop running further steps after the first failure. */
  stopOnFailure?: boolean;
  onStepOutcome?: (outcome: AgentStepOutcome) => void;
}

export class AgentRuntime {
  async run(steps: AgentStep[], options: AgentRunOptions = {}): Promise<AgentRunResult> {
    const outcomes: AgentStepOutcome[] = [];

    for (const step of steps) {
      try {
        const result = await step.action();
        const outcome: AgentStepOutcome = { stepId: step.id, ok: true, result };
        outcomes.push(outcome);
        options.onStepOutcome?.(outcome);
      } catch (err) {
        const outcome: AgentStepOutcome = {
          stepId: step.id,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
        outcomes.push(outcome);
        options.onStepOutcome?.(outcome);
        if (options.stopOnFailure) break;
      }
    }

    return { outcomes, succeeded: outcomes.every((o) => o.ok) };
  }
}
