import type { CapabilityDefinition } from "./types";

/**
 * In-process capability registry. The database's CapabilityDefinition table
 * is the source of truth for what's *enabled*; this registry is the source
 * of truth for what *code* is available to run. On boot, the runtime
 * reconciles the two (see apps/web/src/server/capabilities/bootstrap.ts) and
 * refuses to serve a capability that's registered in code but not present
 * (or disabled) in the database, or vice versa.
 */
class CapabilityRegistry {
  private definitions = new Map<string, CapabilityDefinition<any, any>>();

  register(def: CapabilityDefinition<any, any>): void {
    const key = `${def.id}@${def.version}`;
    if (this.definitions.has(key)) {
      throw new Error(`Capability ${key} is already registered`);
    }
    this.definitions.set(key, def);
  }

  get(id: string, version: string): CapabilityDefinition<any, any> | undefined {
    return this.definitions.get(`${id}@${version}`);
  }

  /** Latest registered version for an id, by simple semver-major comparison. */
  getLatest(id: string): CapabilityDefinition<any, any> | undefined {
    const matches = [...this.definitions.values()].filter((d) => d.id === id);
    if (matches.length === 0) return undefined;
    return matches.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];
  }

  list(): CapabilityDefinition<any, any>[] {
    return [...this.definitions.values()];
  }
}

export const capabilityRegistry = new CapabilityRegistry();
