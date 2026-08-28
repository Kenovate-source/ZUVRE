# ZUVRE Capability System Specification

## 1. Purpose

A capability is the unit of "a thing ZUVRE can do." The system exists so
the core platform never needs architectural surgery to add one — see
Product Bible §2.

## 2. The Contract

Defined in `packages/capability-sdk/src/types.ts`:

```ts
interface CapabilityDefinition<TInput, TOutput> {
  id: string;               // stable dotted key, e.g. "image.generate"
  version: string;          // semver
  displayName: string;
  description: string;
  category: CapabilityCategory;
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  requiredPermissions: CapabilityPermissionRequest[];
  isAsync: boolean;
  execute(input: TInput, ctx: CapabilityExecutionContext): Promise<TOutput>;
}
```

A capability's `execute` function receives a context object
(`CapabilityExecutionContext`) and nothing else — no direct database
access, no ambient ability to reach other workspaces. Everything it can do
is expressed through that context:

- `reportProgress()` — for `isAsync: true` capabilities, surfaces progress
  to the client.
- `emitArtifact()` — persists a produced artifact (image, doc, website,
  etc.) scoped to the calling workspace.
- `requestPermission()` — asks for a scope beyond what was already
  granted; the runtime decides whether that's auto-approved, needs a live
  user/owner approval, or is denied, per the workspace's
  `CapabilityGrant.approvalPolicy`.
- `signal` — an `AbortSignal` for cancellation.

## 3. Registration

`defineCapability()` (a thin identity function for type inference) creates
the definition; `capabilityRegistry.register()` makes it available at
runtime. `bootstrapCapabilities()` (`apps/web/src/server/capabilities/
bootstrap.ts`) is where the app lists which capabilities exist and
reconciles them into the `CapabilityDefinition` table so the Owner Control
Center can see and toggle them without redeploying.

Adding a new capability is: write a file that calls `defineCapability`, add
one line to `bootstrapCapabilities()`. Nothing in the API route, the
execution model, or the UI shell needs to know what the capability does.

## 4. Grants & Permissions

A `CapabilityGrant` (per workspace, per capability) is what actually
authorizes execution — a registered, enabled capability is not callable by
a workspace until it holds a grant. `approvalPolicy` is one of `AUTO`,
`REQUIRE_APPROVAL`, or `BLOCKED`. This is deliberately separate from RBAC
permissions (`packages/auth/src/permissions.ts`, which govern what a
*user* can do inside a workspace) — a user can have permission to execute
capabilities generally while a specific capability is still blocked for
that workspace by policy.

## 5. Execution Lifecycle

`QUEUED → RUNNING → (AWAITING_APPROVAL) → SUCCEEDED | FAILED | CANCELLED`,
tracked on `CapabilityExecution`. Phase 0 implements the synchronous path
(`QUEUED` is skipped; `RUNNING → SUCCEEDED/FAILED`) end to end in
`apps/web/src/app/api/capabilities/execute/route.ts`. The async/worker path
is designed (see Architecture doc §7) but not yet implemented.

## 6. Reference Implementation

`ai.chat` (`apps/web/src/server/capabilities/ai-chat.ts`) is a complete,
real capability: it validates input with zod, calls the AI gateway, and
returns a typed output — proof the contract is usable, not just specified.

## 7. Planned Capabilities (not yet implemented)

Website/app/game generation, image/video/audio generation, sticker
creation, document creation, research workflows, and external
integrations are all designed for by this contract (see `category` enum
and Product Bible §1) but have no `execute()` implementation yet. Each is
future capability-package work, not core platform work — that separation
is the point of this system.
