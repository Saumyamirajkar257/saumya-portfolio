/**
 * Canonical Résumé Configuration & Single Source of Truth
 * Managed centrally for the entire portfolio application.
 *
 * Data Schema:
 * Resume:
 * - id: string
 * - fileName: string
 * - fileUrl: string
 * - storagePath: string
 * - uploadedAt: string (ISO timestamp)
 * - updatedAt: string (ISO timestamp)
 * - published: boolean
 * - version: string
 */

export const CANONICAL_RESUME_PATH = "/resume/Saumya_Mirajkar_Resume.pdf";
export const CANONICAL_RESUME_FILENAME = "Saumya_Mirajkar_Resume.pdf";

export const DEFAULT_RESUME_RECORD = {
  id: "active",
  fileName: CANONICAL_RESUME_FILENAME,
  fileUrl: CANONICAL_RESUME_PATH,
  storagePath: "canonical",
  uploadedAt: "2026-10-08T00:00:00.000Z",
  updatedAt: "2026-10-08T00:00:00.000Z",
  published: true,
  version: "1.0",
};

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

/**
 * Resolves the active resume record from profile data.
 * @param {Object} profile - Profile data object from Firestore or fallback
 * @returns {Object} Structured Resume record
 */
export function getActiveResumeRecord(profile) {
  if (profile?.resume && typeof profile.resume === "object") {
    const r = profile.resume;
    return {
      id: r.id || "active",
      fileName: r.fileName || getResumeFilename(r.fileUrl || profile.resume_url),
      fileUrl: r.fileUrl || profile.resume_url || CANONICAL_RESUME_PATH,
      storagePath: r.storagePath || "canonical",
      uploadedAt: r.uploadedAt || r.updatedAt || DEFAULT_RESUME_RECORD.uploadedAt,
      updatedAt: r.updatedAt || DEFAULT_RESUME_RECORD.updatedAt,
      published: r.published !== false,
      version: r.version || "1.0",
    };
  }

  if (profile?.resume_url) {
    return {
      ...DEFAULT_RESUME_RECORD,
      fileUrl: profile.resume_url,
      fileName: getResumeFilename(profile.resume_url),
      published: profile.resume_published !== false,
    };
  }

  return DEFAULT_RESUME_RECORD;
}

/**
 * Checks whether an active resume is currently published and available.
 * @param {Object} profile - Profile data object
 * @returns {boolean} True if published, false if unpublished/hidden
 */
export function isResumePublished(profile) {
  const record = getActiveResumeRecord(profile);
  return Boolean(record && record.published !== false && record.fileUrl);
}

/**
 * Resolves the active published résumé URL from a profile object or fallback.
 * Returns null if the resume is explicitly unpublished by Admin CMS.
 * @param {Object} profile - Profile data object
 * @returns {string|null} The active résumé URL, or null if unpublished
 */
export function getActiveResumeUrl(profile) {
  const record = getActiveResumeRecord(profile);
  if (record.published === false) {
    return null;
  }
  return record.fileUrl || CANONICAL_RESUME_PATH;
}
