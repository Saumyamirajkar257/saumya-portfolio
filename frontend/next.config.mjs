/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    // Project covers are local, self-authored SVGs (schematic build diagrams).
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Real product screenshots may come from the backend later; allow remote domains then.
    remotePatterns: [],
  },
};

export default nextConfig;