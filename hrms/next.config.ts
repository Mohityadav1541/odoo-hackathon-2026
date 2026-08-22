import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/v1/:path*", 
      },
      {
        source: "/auth/google",
        destination: "http://localhost:8069/auth/google",
      },
      {
        source: "/auth/google/:path*",
        destination: "http://localhost:8069/auth/google/:path*",
      },
    ];
  },
};

export default nextConfig;
