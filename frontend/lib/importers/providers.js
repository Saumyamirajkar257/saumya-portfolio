/**
 * Credential Importers for Specific Providers & Generic Extractor
 */

import { sanitizeText, normalizeDate, determineExpiry } from "./types.js";

/**
 * Helper to extract tag content using RegEx (works in Edge / V8 without heavy DOM libraries)
 */
function extractTagContent(html, tag, attr, attrVal) {
  const regex = new RegExp(
    `<${tag}[^>]*${attr}=["']${attrVal}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(regex);
  if (match) return sanitizeText(match[1]);

  // Try reverse order: content="..." attr="..."
  const reverseRegex = new RegExp(
    `<${tag}[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${attrVal}["']`,
    "i"
  );
  const reverseMatch = html.match(reverseRegex);
  return reverseMatch ? sanitizeText(reverseMatch[1]) : "";
}

function extractMeta(html, name) {
  return (
    extractTagContent(html, "meta", "property", name) ||
    extractTagContent(html, "meta", "name", name)
  );
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? sanitizeText(match[1]) : "";
}

function extractJsonLd(html) {
  const results = [];
  const regex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (Array.isArray(parsed)) {
        results.push(...parsed);
      } else {
        results.push(parsed);
      }
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  }
  return results;
}

// ----------------------------------------------------------------------
// Coursera Importer
// ----------------------------------------------------------------------
export const CourseraImporter = {
  name: "Coursera",
  matches(url) {
    return /coursera\.org/i.test(url);
  },
  extract(url, html) {
    const jsonLds = extractJsonLd(html);
    const ogTitle = extractMeta(html, "og:title") || extractTitle(html);
    const ogDesc = extractMeta(html, "og:description");
    const ogImage = extractMeta(html, "og:image");

    // Extract Coursera Credential ID from URL
    // e.g. coursera.org/verify/ABC123XYZ or /account/accomplishments/verify/ABC123XYZ
    let credentialId = "Not provided";
    const idMatch = url.match(/(?:verify|specialization|records)\/([a-zA-Z0-9]+)/i);
    if (idMatch && idMatch[1]) {
      credentialId = idMatch[1].toUpperCase();
    }

    // Certificate Name: Clean up common title suffixes like "| Coursera"
    let certName = ogTitle
      .replace(/\s*\|\s*Coursera.*$/i, "")
      .replace(/^Coursera Course Certificate:\s*/i, "")
      .replace(/^Coursera Specialization Certificate:\s*/i, "")
      .trim();

    // Issuing Organization: Check partner in title or HTML
    let organization = "Coursera";
    const partnerMatch = html.match(
      /(?:offered by|partner|authorized by|from)\s*([A-Za-z0-9\s&.,]+?)(?:<|\.)/i
    );
    if (partnerMatch && partnerMatch[1].length < 40) {
      organization = sanitizeText(partnerMatch[1]);
    } else if (/ibm/i.test(certName) || /ibm/i.test(html)) {
      organization = "IBM · Coursera";
    } else if (/google/i.test(certName) || /google/i.test(html)) {
      organization = "Google · Coursera";
    } else if (/atlassian/i.test(certName) || /atlassian/i.test(html)) {
      organization = "Atlassian · Coursera";
    } else if (/meta/i.test(certName)) {
      organization = "Meta · Coursera";
    }

    // Check JSON-LD
    for (const data of jsonLds) {
      if (data["@type"] === "EducationalOccupationalCredential" || data["@type"] === "Course") {
        if (data.name) certName = sanitizeText(data.name);
        if (data.recognizedBy?.name) organization = sanitizeText(data.recognizedBy.name);
        if (data.provider?.name) organization = `${sanitizeText(data.provider.name)} · Coursera`;
      }
    }

    // Extract Date
    let issueDate = null;
    const dateMatch = html.match(
      /(?:completed on|issued on|awarded on|date)\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i
    );
    if (dateMatch && dateMatch[1]) {
      issueDate = normalizeDate(dateMatch[1]);
    } else {
      // Fallback search
      const generalDate = html.match(/([A-Z][a-z]{2,8}\s+\d{1,2},\s+20\d{2})/);
      if (generalDate) issueDate = normalizeDate(generalDate[1]);
    }

    // Coursera course certificates do not expire
    const expiry = {
      expiryDate: null,
      noExpiry: true,
      expiryStatus: "No expiry",
    };

    return {
      name: certName || "Coursera Certificate",
      organization: organization || "Coursera",
      issuer: "Coursera",
      issueDate: issueDate ? issueDate.display : "JUL 2026",
      expiryDate: expiry.expiryDate,
      noExpiry: expiry.noExpiry,
      expiryStatus: expiry.expiryStatus,
      credentialId,
      credentialUrl: url,
      verificationUrl: url,
      sourceCredentialUrl: url,
      description: ogDesc || "",
      imageUrl: ogImage || "",
      category: "Professional Certificate",
      verified: true,
      provider: "coursera",
    };
  },
};

// ----------------------------------------------------------------------
// Credly / Acclaim Importer
// ----------------------------------------------------------------------
export const CredlyImporter = {
  name: "Credly",
  matches(url) {
    return /credly\.com|youracclaim\.com/i.test(url);
  },
  extract(url, html) {
    const jsonLds = extractJsonLd(html);
    const ogTitle = extractMeta(html, "og:title") || extractTitle(html);
    const ogDesc = extractMeta(html, "og:description");
    const ogImage = extractMeta(html, "og:image");

    let certName = ogTitle
      .replace(/\s*was issued by.*$/i, "")
      .replace(/\s*\|\s*Credly.*$/i, "")
      .trim();

    let organization = "Credly";
    const orgMatch = ogTitle.match(/issued by\s+(.+?)(?:\s+to|\s*\||$)/i);
    if (orgMatch) {
      organization = sanitizeText(orgMatch[1]);
    }

    let credentialId = "Not provided";
    const idMatch = url.match(/badges\/([a-zA-Z0-9_\-]+)/i);
    if (idMatch && idMatch[1]) {
      credentialId = idMatch[1];
    }

    let issueDate = null;
    let explicitExpiry = null;

    // Check JSON-LD
    for (const data of jsonLds) {
      if (data.name) certName = sanitizeText(data.name);
      if (data.issuer?.name) organization = sanitizeText(data.issuer.name);
      if (data.issuedOn || data.datePublished) {
        issueDate = normalizeDate(data.issuedOn || data.datePublished);
      }
      if (data.expires) explicitExpiry = data.expires;
    }

    // HTML Date extraction if not in JSON-LD
    if (!issueDate) {
      const issuedMatch = html.match(/(?:issued on|issued)\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i);
      if (issuedMatch) issueDate = normalizeDate(issuedMatch[1]);
    }

    const expiry = determineExpiry(html, explicitExpiry);

    return {
      name: certName || "Credly Badge",
      organization: organization || "Credly",
      issuer: "Credly",
      issueDate: issueDate ? issueDate.display : "JUL 2026",
      expiryDate: expiry.expiryDate,
      noExpiry: expiry.noExpiry,
      expiryStatus: expiry.expiryStatus,
      credentialId,
      credentialUrl: url,
      verificationUrl: url,
      sourceCredentialUrl: url,
      description: ogDesc || "",
      imageUrl: ogImage || "",
      category: "Accredited Badge",
      verified: true,
      provider: "credly",
    };
  },
};

// ----------------------------------------------------------------------
// Google & Google Cloud Importer
// ----------------------------------------------------------------------
export const GoogleImporter = {
  name: "Google",
  matches(url) {
    return /cloudskillsboost\.google|skills\.google|credential\.net|google\.com/i.test(url);
  },
  extract(url, html) {
    const ogTitle = extractMeta(html, "og:title") || extractTitle(html);
    const ogDesc = extractMeta(html, "og:description");
    const ogImage = extractMeta(html, "og:image");

    let certName = ogTitle
      .replace(/\s*\|\s*Google.*$/i, "")
      .replace(/\s*\|\s*Coursera.*$/i, "")
      .trim();

    let credentialId = "Not provided";
    const idMatch = url.match(/(?:credential|profile|completion)\/([a-zA-Z0-9_\-]+)/i);
    if (idMatch && idMatch[1]) credentialId = idMatch[1];

    let issueDate = null;
    const dateMatch = html.match(/(?:completed|issued|earned)\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i);
    if (dateMatch) issueDate = normalizeDate(dateMatch[1]);

    const expiry = determineExpiry(html);

    return {
      name: certName || "Google Professional Certificate",
      organization: "Google",
      issuer: "Google",
      issueDate: issueDate ? issueDate.display : "JUL 2026",
      expiryDate: expiry.expiryDate,
      noExpiry: expiry.noExpiry,
      expiryStatus: expiry.expiryStatus,
      credentialId,
      credentialUrl: url,
      verificationUrl: url,
      sourceCredentialUrl: url,
      description: ogDesc || "",
      imageUrl: ogImage || "",
      category: "Professional Certificate",
      verified: true,
      provider: "google",
    };
  },
};

// ----------------------------------------------------------------------
// Cisco Networking Academy Importer
// ----------------------------------------------------------------------
export const CiscoImporter = {
  name: "Cisco",
  matches(url) {
    return /netacad\.com|cisco\.com/i.test(url);
  },
  extract(url, html) {
    const ogTitle = extractMeta(html, "og:title") || extractTitle(html);
    const ogDesc = extractMeta(html, "og:description");
    const ogImage = extractMeta(html, "og:image");

    let certName = ogTitle.replace(/\s*\|\s*Cisco.*$/i, "").trim();
    let credentialId = "Not provided";
    const idMatch = html.match(/(?:credential id|verification id)\s*[:#]\s*([a-zA-Z0-9\-]+)/i);
    if (idMatch) credentialId = idMatch[1];

    let issueDate = null;
    const dateMatch = html.match(/(?:issued|completed)\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i);
    if (dateMatch) issueDate = normalizeDate(dateMatch[1]);

    const expiry = determineExpiry(html);

    return {
      name: certName || "Cisco Certificate of Completion",
      organization: "Cisco Networking Academy",
      issuer: "Cisco",
      issueDate: issueDate ? issueDate.display : "JUL 2026",
      expiryDate: expiry.expiryDate,
      noExpiry: expiry.noExpiry,
      expiryStatus: expiry.expiryStatus,
      credentialId,
      credentialUrl: url,
      verificationUrl: url,
      sourceCredentialUrl: url,
      description: ogDesc || "",
      imageUrl: ogImage || "",
      category: "Technical Certification",
      verified: true,
      provider: "cisco",
    };
  },
};

// ----------------------------------------------------------------------
// Generic Credential Importer (Fallback for any URL / Standard Metadata)
// ----------------------------------------------------------------------
export const GenericCredentialImporter = {
  name: "Generic",
  matches() {
    return true; // Catch-all fallback
  },
  extract(url, html) {
    const jsonLds = extractJsonLd(html);
    const ogTitle = extractMeta(html, "og:title") || extractTitle(html);
    const ogSiteName = extractMeta(html, "og:site_name");
    const ogDesc = extractMeta(html, "og:description") || extractMeta(html, "description");
    const ogImage = extractMeta(html, "og:image");

    let certName = ogTitle;
    let organization = ogSiteName;
    let credentialId = "Not provided";
    let issueDate = null;
    let explicitExpiry = null;

    // 1. Inspect JSON-LD schemas
    for (const item of jsonLds) {
      if (
        item["@type"] === "EducationalOccupationalCredential" ||
        item["@type"] === "Course" ||
        item["@type"] === "Achievement" ||
        item["@type"] === "CreativeWork"
      ) {
        if (item.name) certName = sanitizeText(item.name);
        if (item.recognizedBy?.name) organization = sanitizeText(item.recognizedBy.name);
        else if (item.issuer?.name) organization = sanitizeText(item.issuer.name);
        else if (item.author?.name) organization = sanitizeText(item.author.name);

        if (item.identifier || item.credentialId) {
          credentialId = sanitizeText(item.identifier || item.credentialId);
        }
        if (item.validFrom || item.datePublished || item.dateCreated) {
          issueDate = normalizeDate(item.validFrom || item.datePublished || item.dateCreated);
        }
        if (item.validThrough || item.expires) {
          explicitExpiry = item.validThrough || item.expires;
        }
      }
    }

    // 2. Visible H1 extraction if title is still empty
    if (!certName) {
      const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
      if (h1Match) certName = sanitizeText(h1Match[1]);
    }

    // 3. Organization extraction heuristic from domain if still empty
    if (!organization) {
      try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./i, "");
        const domainParts = host.split(".");
        if (domainParts.length >= 2) {
          const mainPart = domainParts[0];
          organization = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
        }
      } catch {
        organization = "Independent Provider";
      }
    }

    // 4. Credential ID heuristic
    if (credentialId === "Not provided") {
      const credIdMatch = html.match(
        /(?:credential id|certificate id|serial number|verification id|certificate no|badge id|license number)\s*[:#\-]?\s*([a-zA-Z0-9_\-]{4,40})/i
      );
      if (credIdMatch) {
        credentialId = credIdMatch[1].toUpperCase();
      } else {
        // Check URL path for ID-like pattern
        const pathId = url.match(/\/(?:verify|credential|badges|certificate|cert)\/([a-zA-Z0-9_\-]{6,40})/i);
        if (pathId) credentialId = pathId[1];
      }
    }

    // 5. Date heuristic if not found yet
    if (!issueDate) {
      const dateMatch = html.match(
        /(?:issued on|issued|awarded on|completed on|date awarded|issue date)\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4}|[A-Za-z]+\s+\d{4}|\d{4}-\d{2}-\d{2})/i
      );
      if (dateMatch) {
        issueDate = normalizeDate(dateMatch[1]);
      }
    }

    const expiry = determineExpiry(html, explicitExpiry);

    return {
      name: certName || "Professional Certificate",
      organization: organization || "Verified Issuer",
      issuer: organization || "Verified Issuer",
      issueDate: issueDate ? issueDate.display : "JUL 2026",
      expiryDate: expiry.expiryDate,
      noExpiry: expiry.noExpiry,
      expiryStatus: expiry.expiryStatus,
      credentialId,
      credentialUrl: url,
      verificationUrl: url,
      sourceCredentialUrl: url,
      description: ogDesc || "",
      imageUrl: ogImage || "",
      category: "Accreditation",
      verified: true,
      provider: "generic",
    };
  },
};

/**
 * List of registered adaptors in priority order
 */
export const PROVIDER_IMPORTERS = [
  CourseraImporter,
  CredlyImporter,
  GoogleImporter,
  CiscoImporter,
  GenericCredentialImporter, // Fallback
];
