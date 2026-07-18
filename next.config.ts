import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  experimental: {
    // Bewaart bezochte pagina's client-side kort in cache, zodat wisselen
    // tussen onderbalk-tabs (Dashboard, Draaiboek, etc.) niet telkens
    // opnieuw laadt — pas ververst als de cache verlopen is of bij een
    // expliciete refresh (router.refresh()).
    staleTimes: { dynamic: 30 },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "s3.theperfectwedding.nl" },
    ],
  },
};

export default nextConfig;
