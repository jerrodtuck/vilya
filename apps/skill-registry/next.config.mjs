/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deploy-agnostic: runs locally with `next dev` / `next start`.
  // Add an adapter later (Vercel is zero-config; Cloudflare via @opennextjs/cloudflare).
  async redirects() {
    // /flows renamed to /orchestrator (#134); keep external links working.
    return [{ source: "/flows", destination: "/orchestrator", permanent: true }];
  },
};

export default nextConfig;
