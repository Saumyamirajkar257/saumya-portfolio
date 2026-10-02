/**
 * Automatic Credential Import Engine
 */

import { safeFetch, validateUrl } from "./types.js";
import { PROVIDER_IMPORTERS } from "./providers.js";

export async function importCredentialFromUrl(rawUrl) {
  try {
    // 1. Validate URL & prevent SSRF
    const validUrl = validateUrl(rawUrl);

    // 2. Fetch page securely
    const html = await safeFetch(validUrl, { timeoutMs: 9000 });

    if (!html || html.length < 50) {
      return {
        success: false,
        message: "Couldn't automatically retrieve certificate details.",
        fallbackManual: true,
      };
    }

    // 3. Select matching provider importer
    const matchedImporter =
      PROVIDER_IMPORTERS.find((importer) => importer.matches(validUrl)) ||
      PROVIDER_IMPORTERS[PROVIDER_IMPORTERS.length - 1];

    // 4. Extract structured details
    let certificate = matchedImporter.extract(validUrl, html);

    // If provider extraction yielded an empty certificate name, fallback to generic
    if (!certificate || !certificate.name) {
      const generic = PROVIDER_IMPORTERS[PROVIDER_IMPORTERS.length - 1];
      certificate = generic.extract(validUrl, html);
    }

    if (!certificate || !certificate.name) {
      return {
        success: false,
        message: "Couldn't automatically retrieve certificate details.",
        fallbackManual: true,
      };
    }

    // Ensure all standard fields exist
    const standardized = {
      name: certificate.name || "Professional Certificate",
      organization: certificate.organization || "Verified Provider",
      issuer: certificate.issuer || certificate.organization || "Verified Provider",
      issueDate: certificate.issueDate || "JUL 2026",
      expiryDate: certificate.expiryDate || null,
      noExpiry: Boolean(certificate.noExpiry),
      expiryStatus: certificate.expiryStatus || "Not provided",
      credentialId: certificate.credentialId || "Not provided",
      credentialUrl: validUrl,
      verificationUrl: certificate.verificationUrl || validUrl,
      sourceCredentialUrl: validUrl,
      description: certificate.description || "",
      imageUrl: certificate.imageUrl || "",
      category: certificate.category || "Professional Certification",
      verified: true,
      published: true,
      featured: false,
    };

    return {
      success: true,
      certificate: standardized,
      provider: matchedImporter.name,
    };
  } catch (err) {
    console.warn("Credential import fetch warning:", err.message);
    return {
      success: false,
      message: "Couldn't automatically retrieve certificate details.",
      detail: err.message,
      fallbackManual: true,
    };
  }
}
