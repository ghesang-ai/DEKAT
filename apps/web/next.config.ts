import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
      { protocol: "https", hostname: "images.samsung.com" },
      { protocol: "https", hostname: "**.gsmarena.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
  },
};

export default nextConfig;
