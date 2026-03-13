/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 14.2.x uses experimental.serverComponentsExternalPackages
  experimental: {
    serverComponentsExternalPackages: [
      "@google-cloud/storage",
      "@google-cloud/video-transcoder",
      "@google-cloud/livestream",
      "@google-cloud/pubsub",
      "firebase-admin",
      "googleapis",
    ],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
