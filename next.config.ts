import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
