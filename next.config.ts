import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Active AVIF puis WebP (ordre de préférence)
    formats: ["image/avif", "image/webp"],
    // Domaines autorisés pour next/image
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

const withAnalyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
export default withAnalyzer(nextConfig);
