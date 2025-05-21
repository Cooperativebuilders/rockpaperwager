import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  images: {
    remotePatterns: [
      /* Placeholder images */
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },

      /* Original Google Storage host (kept for other assets) */
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/**",
      },

      /* ✅ Correct Firebase Storage REST host */
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/**/o/**",
      },

      /* Signed URLs (if you ever generate `https://<bucket>.appspot.com/...`) */
      {
        protocol: "https",
        hostname: "*.appspot.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
