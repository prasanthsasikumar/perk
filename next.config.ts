import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@resvg/resvg-js", "sharp", "passkit-generator"],
  experimental: {
    serverActions: {
      // Logo uploads (up to 5 MB) travel through server actions.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
