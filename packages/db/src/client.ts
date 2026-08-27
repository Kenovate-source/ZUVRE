/**
 * AUTHORED, NOT EXECUTED IN THIS SANDBOX — requires `pnpm install` (for
 * @prisma/client) and `prisma generate` to run, neither of which are
 * possible without npm registry access. See repo-level VALIDATION.md.
 *
 * Exactly one PrismaClient instance for the whole process. No other
 * package may construct its own PrismaClient — everything goes through
 * this module, which is itself only imported from within @zuvre/db.
 */
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __zuvrePrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = globalThis.__zuvrePrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__zuvrePrisma = prisma;
}
