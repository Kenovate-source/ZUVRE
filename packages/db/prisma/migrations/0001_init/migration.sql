-- ============================================================================
-- AUTHORED, NOT EXECUTED.
--
-- This migration was hand-written to mirror packages/db/prisma/schema.prisma
-- exactly, because the Prisma CLI/engine could not be installed in this
-- build sandbox (no npm registry access — see repo-level VALIDATION.md).
--
-- It has NOT been run through `prisma migrate dev`, NOT applied to a real
-- PostgreSQL instance, and NOT verified by the Prisma migration engine.
--
-- REQUIRED before this is trusted: in a real environment, delete this file
-- and run `pnpm --filter @zuvre/db prisma:migrate:dev` against
-- schema.prisma to generate and apply a verified migration. Keep this file
-- only as a reference until that happens.
-- ============================================================================

CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

CREATE TYPE "WorkspaceRole" AS ENUM ('owner', 'admin', 'member');

CREATE TABLE "workspace_memberships" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workspace_memberships_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "workspace_memberships_workspaceId_userId_key" ON "workspace_memberships"("workspaceId", "userId");
CREATE INDEX "workspace_memberships_workspaceId_idx" ON "workspace_memberships"("workspaceId");
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE;
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

CREATE TABLE "projects" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capabilityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "projects_workspaceId_idx" ON "projects"("workspaceId");
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE;

CREATE TYPE "CreationRequestStatus" AS ENUM ('pending', 'specified', 'rejected');

CREATE TABLE "creation_requests" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "rawInput" TEXT NOT NULL,
    "status" "CreationRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "creation_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "creation_requests_workspaceId_idx" ON "creation_requests"("workspaceId");
CREATE INDEX "creation_requests_projectId_idx" ON "creation_requests"("projectId");
ALTER TABLE "creation_requests" ADD CONSTRAINT "creation_requests_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE;
ALTER TABLE "creation_requests" ADD CONSTRAINT "creation_requests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;

CREATE TABLE "creation_specifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "creationRequestId" TEXT NOT NULL,
    "capabilityType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "creation_specifications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "creation_specifications_creationRequestId_key" ON "creation_specifications"("creationRequestId");
CREATE INDEX "creation_specifications_workspaceId_idx" ON "creation_specifications"("workspaceId");
CREATE INDEX "creation_specifications_projectId_idx" ON "creation_specifications"("projectId");
ALTER TABLE "creation_specifications" ADD CONSTRAINT "creation_specifications_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE;
ALTER TABLE "creation_specifications" ADD CONSTRAINT "creation_specifications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "creation_specifications" ADD CONSTRAINT "creation_specifications_creationRequestId_fkey" FOREIGN KEY ("creationRequestId") REFERENCES "creation_requests"("id") ON DELETE CASCADE;

CREATE TYPE "BuildStatus" AS ENUM ('queued', 'planning', 'executing', 'succeeded', 'failed');

CREATE TABLE "builds" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "creationSpecificationId" TEXT NOT NULL,
    "status" "BuildStatus" NOT NULL DEFAULT 'queued',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "builds_workspaceId_idx" ON "builds"("workspaceId");
CREATE INDEX "builds_projectId_idx" ON "builds"("projectId");
ALTER TABLE "builds" ADD CONSTRAINT "builds_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE;
ALTER TABLE "builds" ADD CONSTRAINT "builds_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "builds" ADD CONSTRAINT "builds_creationSpecificationId_fkey" FOREIGN KEY ("creationSpecificationId") REFERENCES "creation_specifications"("id") ON DELETE CASCADE;

CREATE TABLE "assets" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "assets_workspaceId_idx" ON "assets"("workspaceId");
CREATE INDEX "assets_buildId_idx" ON "assets"("buildId");
ALTER TABLE "assets" ADD CONSTRAINT "assets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "builds"("id") ON DELETE CASCADE;

CREATE TYPE "DeploymentStatus" AS ENUM ('pending', 'deploying', 'live', 'failed', 'rolled_back');

CREATE TABLE "deployments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'pending',
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "deployments_workspaceId_idx" ON "deployments"("workspaceId");
CREATE INDEX "deployments_buildId_idx" ON "deployments"("buildId");
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE;
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "builds"("id") ON DELETE CASCADE;
