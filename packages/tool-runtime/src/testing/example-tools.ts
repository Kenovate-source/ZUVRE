import type { Tool } from "../runtime.js";

/** A trivial in-memory "write a note" tool, standing in for a real fs/shell tool for testing permission enforcement. */
export function createNoteWriteTool(store: Map<string, string>): Tool<{ key: string; value: string }, { written: true }> {
  return {
    id: "test.note.write",
    requiredScopes: ["notes:write"],
    async run(input) {
      store.set(input.key, input.value);
      return { written: true };
    },
  };
}

export function createAlwaysThrowsTool(): Tool<unknown, never> {
  return {
    id: "test.always.throws",
    requiredScopes: [],
    async run() {
      throw new Error("simulated tool failure");
    },
  };
}
