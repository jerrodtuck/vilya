/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deploy-agnostic: runs locally with `next dev` / `next start`.
  // Add an adapter later (Vercel is zero-config; Cloudflare via @opennextjs/cloudflare).
  async redirects() {
    // /orch is the page name (#285); keep old routes working.
    return [
      { source: "/orchestrator", destination: "/orch", permanent: true },
      { source: "/flows", destination: "/orch", permanent: true },
    ];
  },
};

export default nextConfig;
