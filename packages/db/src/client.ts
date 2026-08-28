import { PrismaClient } from "@prisma/client";

// Single shared PrismaClient instance (Next.js hot-reload safe).
declare global {
  // eslint-disable-next-line no-var
  var __zuvrePrisma: PrismaClient | undefined;
}

export const rawDb: PrismaClient =
  globalThis.__zuvrePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__zuvrePrisma = rawDb;
}
