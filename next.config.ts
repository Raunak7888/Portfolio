import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/photo-*",
            },
        ],
    },
};

export default nextConfig;
