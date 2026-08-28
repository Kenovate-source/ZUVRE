/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@zuvre/ui",
    "@zuvre/db",
    "@zuvre/auth",
    "@zuvre/ai-gateway",
    "@zuvre/capability-sdk",
  ],
  experimental: { typedRoutes: true },
};
export default nextConfig;
