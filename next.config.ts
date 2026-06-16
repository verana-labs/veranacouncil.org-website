import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,

  // sharp is a native module (logo resizing) — keep it external so the
  // standalone tracer ships its prebuilt musl binaries instead of bundling.
  serverExternalPackages: ["sharp"],

  // Logo uploads ride server actions; the default body limit is 1 MB.
  experimental: { serverActions: { bodySizeLimit: "2mb" } },

  // The Membership Agreement template is read from disk at runtime when a
  // member signs (app/lib/agreement-template.ts). `output: "standalone"` only
  // ships traced files, so include legal/ for the routes that render it.
  outputFileTracingIncludes: {
    "/apply": ["./legal/**"],
    "/account/**": ["./legal/**"],
    "/admin/**": ["./legal/**"],
  },

  // Lint and type-check are run separately in CI; don't fail the
  // production/container build on them.
  eslint: { ignoreDuringBuilds: true },

  // Retired URLs, kept alive for bookmarks and inbound links. The working-
  // groups board became /council-bodies; /governance was folded into it
  // (frameworks + bodies now live on one page).
  async redirects() {
    return [
      { source: "/contribute", destination: "/council-bodies", permanent: true },
      {
        source: "/account/working-groups",
        destination: "/council-bodies",
        permanent: true,
      },
      { source: "/working-groups", destination: "/council-bodies", permanent: true },
      { source: "/governance", destination: "/council-bodies", permanent: true },
      // ECS interest is now collected on the contact form (topic preselected).
      {
        source: "/ecs-interest",
        destination: "/contact?topic=ecs-participant",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Brand assets, illustrations, favicons, og-image. Bounded
        // freshness with stale-while-revalidate so users never block on
        // a background refresh.
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
