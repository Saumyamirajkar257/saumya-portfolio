/**
 * Canonical Résumé Configuration & Single Source of Truth
 * Managed centrally for the entire portfolio application.
 */

export const CANONICAL_RESUME_PATH = "/resume/Saumya_Mirajkar_Resume.pdf";
export const CANONICAL_RESUME_FILENAME = "Saumya_Mirajkar_Resume.pdf";

/**
 * Resolves the active résumé URL from a profile object or fallback.
 * @param {Object} profile - Profile data object
 * @returns {string} The active résumé URL
 */
export function getActiveResumeUrl(profile) {
  if (profile && typeof profile.resume_url === "string" && profile.resume_url.trim()) {
    return profile.resume_url.trim();
  }
  return CANONICAL_RESUME_PATH;
}

/**
 * Extracts a readable filename from a résumé URL or path.
 * @param {string} url - Résumé URL or path
 * @returns {string} Filename
 */
export function getResumeFilename(url = "") {
  if (!url) return CANONICAL_RESUME_FILENAME;
  try {
    const cleanUrl = url.split("?")[0];
    const segments = cleanUrl.split("/");
    const last = segments[segments.length - 1];
    return decodeURIComponent(last) || CANONICAL_RESUME_FILENAME;
  } catch {
    return CANONICAL_RESUME_FILENAME;
  }
}
