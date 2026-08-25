import type { CapabilityModule } from "@zuvre/capability-sdk";

/**
 * Holds explicitly-registered capability modules and looks them up by the
 * capabilityType a CreationRequest/Project targets. This is the ONLY place
 * `core` knows about capability modules at all — it never imports a module
 * from `modules/*` directly. Registration happens in application
 * composition code (apps/api, apps/worker), not here and not via
 * filesystem scanning (ADR-0002).
 */
export class CapabilityRegistry {
  private readonly modulesById = new Map<string, CapabilityModule<unknown>>();
  private readonly moduleIdsByType = new Map<string, string>();

  register(module: CapabilityModule<unknown>): void {
    if (this.modulesById.has(module.identity.id)) {
      throw new CapabilityRegistrationError(
        `A capability module with id "${module.identity.id}" is already registered.`,
      );
    }

    for (const type of module.identity.capabilityTypes) {
      const existingOwnerId = this.moduleIdsByType.get(type);
      if (existingOwnerId) {
        throw new CapabilityRegistrationError(
          `capabilityType "${type}" is already handled by module "${existingOwnerId}"; ` +
            `cannot also register it to "${module.identity.id}".`,
        );
      }
    }

    this.modulesById.set(module.identity.id, module);
    for (const type of module.identity.capabilityTypes) {
      this.moduleIdsByType.set(type, module.identity.id);
    }
  }

  getByCapabilityType(capabilityType: string): CapabilityModule<unknown> | undefined {
    const moduleId = this.moduleIdsByType.get(capabilityType);
    return moduleId ? this.modulesById.get(moduleId) : undefined;
  }

  getById(moduleId: string): CapabilityModule<unknown> | undefined {
    return this.modulesById.get(moduleId);
  }

  list(): ReadonlyArray<CapabilityModule<unknown>> {
    return Array.from(this.modulesById.values());
  }

  has(capabilityType: string): boolean {
    return this.moduleIdsByType.has(capabilityType);
  }
}

export class CapabilityRegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CapabilityRegistrationError";
  }
}
