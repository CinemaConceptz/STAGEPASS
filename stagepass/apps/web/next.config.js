/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Prevent Next.js from bundling heavy server-only GCP packages
  // These run as native Node.js requires on Cloud Run
  experimental: {
    serverExternalPackages: [
      "@google-cloud/storage",
      "@google-cloud/video-transcoder",
      "@google-cloud/livestream",
      "firebase-admin",
      "googleapis",
    ],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
