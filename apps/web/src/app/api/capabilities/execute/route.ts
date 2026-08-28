import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { capabilityRegistry } from "@zuvre/capability-sdk";
import { rawDb, scopedDb } from "@zuvre/db";
import { bootstrapCapabilities } from "@/server/capabilities/bootstrap";

const requestSchema = z.object({
  workspaceId: z.string(),
  capabilityId: z.string(),
  input: z.unknown(),
});

/**
 * This route is the reference implementation of the capability execution
 * contract described in docs/09-capability-system.md:
 *   1. Verify the workspace holds an enabled grant for the capability.
 *   2. Create a CapabilityExecution row (auditable, resumable).
 *   3. Run the capability with a context that only exposes what the grant allows.
 *   4. Persist the result and any artifacts.
 *
 * NOTE: authentication (identifying the calling user/session) is omitted
 * here for brevity in this foundation — see @zuvre/auth session.ts and
 * docs/07-security-model.md for how a real request would authenticate
 * before ever reaching this handler.
 */
export async function POST(req: NextRequest) {
  await bootstrapCapabilities();

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const { workspaceId, capabilityId, input } = parsed.data;
  const db = scopedDb(workspaceId);

  const grant = await db.raw.capabilityGrant.findUnique({
    where: { workspaceId_capabilityId: { workspaceId, capabilityId } },
  });
  if (!grant || !grant.isEnabled) {
    return NextResponse.json({ error: `Capability "${capabilityId}" is not granted to this workspace` }, { status: 403 });
  }
  if (grant.approvalPolicy === "BLOCKED") {
    return NextResponse.json({ error: `Capability "${capabilityId}" is blocked for this workspace` }, { status: 403 });
  }

  const capability = capabilityRegistry.getLatest(capabilityId);
  if (!capability) {
    return NextResponse.json({ error: `Capability "${capabilityId}" is not registered` }, { status: 404 });
  }

  const inputParse = capability.inputSchema.safeParse(input);
  if (!inputParse.success) {
    return NextResponse.json({ error: "Invalid capability input", issues: inputParse.error.issues }, { status: 400 });
  }

  const execution = await rawDb.capabilityExecution.create({
    data: {
      workspaceId,
      capabilityId,
      status: "RUNNING",
      input: input as any,
      startedAt: new Date(),
    },
  });

  const controller = new AbortController();

  try {
    const output = await capability.execute(inputParse.data, {
      executionId: execution.id,
      workspaceId,
      grantedScopes: (grant.grantedScopes as Record<string, unknown>) ?? {},
      signal: controller.signal,
      async reportProgress() {
        /* stub: a real implementation streams this over SSE/WebSocket */
      },
      async emitArtifact(artifact) {
        const created = await rawDb.artifact.create({
          data: {
            workspaceId,
            executionId: execution.id,
            kind: artifact.kind,
            title: artifact.title,
            storageRef: artifact.storageRef,
            metadata: (artifact.metadata ?? {}) as any,
          },
        });
        return { artifactId: created.id };
      },
      async requestPermission() {
        // A real implementation pauses execution (status AWAITING_APPROVAL)
        // and resumes via a separate approval endpoint. Foundation stub:
        return "denied";
      },
    });

    await rawDb.capabilityExecution.update({
      where: { id: execution.id },
      data: { status: "SUCCEEDED", output: output as any, finishedAt: new Date() },
    });

    return NextResponse.json({ executionId: execution.id, output });
  } catch (err) {
    await rawDb.capabilityExecution.update({
      where: { id: execution.id },
      data: {
        status: "FAILED",
        error: { message: err instanceof Error ? err.message : String(err) },
        finishedAt: new Date(),
      },
    });
    return NextResponse.json({ error: "Capability execution failed" }, { status: 500 });
  }
}
