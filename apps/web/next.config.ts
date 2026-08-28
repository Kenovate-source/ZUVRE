// AUTHORED, NOT EXECUTED — requires `next` installed (no npm registry
// access in this sandbox).
//
// outputFileTracingRoot is required for pnpm-workspace monorepos deployed
// to Vercel: it tells Next.js's build-output file tracer where the real
// monorepo root is, so symlinked workspace packages (e.g. @zuvre/ui) are
// correctly included in the deployed serverless function bundle. Without
// it, a build can succeed locally/in CI while the deployed function still
// crashes at invocation time due to a missing/incomplete traced bundle.
// See: https://nextjs.org/docs/app/api-reference/config/next-config-js/output#caveats
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
