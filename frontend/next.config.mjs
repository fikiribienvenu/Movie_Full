/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow all https image sources
      },
      {
        protocol: "http",
        hostname: "**", // allow all http image sources
      },
    ],
  },
};

export default nextConfig;