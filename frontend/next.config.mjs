/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Project images may come from a backend later; allow remote domains then.
    remotePatterns: [],
  },
  async rewrites() {
    // In development we usually hit the API directly via NEXT_PUBLIC_API_URL.
    // This optional proxy lets the frontend call /api/* internally if desired.
    return [];
  },
};

export default nextConfig;