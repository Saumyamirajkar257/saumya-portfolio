/**
 * Single source of truth for the canonical site URL.
 *
 * Resolution order (so the OG tags never break again after a deploy):
 *   1. NEXT_PUBLIC_SITE_URL  — set explicitly on the host (Vercel/Netlify).
 *   2. VERCEL_PROJECT_PRODUCTION_URL — auto-injected by Vercel at build time.
 *   3. Known production domain (last resort).
 *   4. localhost (development only).
 *
 * In production the chain always resolves to an https:// URL — never
 * http://localhost:3000.
 */

const PROD_HOST =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  "frontend-kappa-cyan-44.vercel.app";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production"
    ? `https://${PROD_HOST}`
    : "http://localhost:3000");

/** Bare hostname, e.g. "frontend-kappa-cyan-44.vercel.app" — useful for analytics domains. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "").split("/")[0];