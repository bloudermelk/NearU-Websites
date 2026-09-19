import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // TODO: migrate these images into /public and remove remote patterns
    // once final production assets are provided by the client.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "carolinaheating.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "carolinaheating.mojopsg.xyz",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "energysaversair.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "happyhomeheatingandcooling.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
