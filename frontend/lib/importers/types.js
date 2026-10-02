/**
 * Credential Importer - Core Security, Date Normalization & Parsing Utilities
 */

// Private / Link-Local / Metadata IP ranges for SSRF prevention
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^::$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/, // AWS / GCP / Azure metadata endpoint
  /^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\.\d+\.\d+$/, // Carrier-grade NAT
  /\.(internal|local|localhost|corp|lan|home|arpa|onion)$/i,
];

/**
 * Validate URL and ensure it does not target private or metadata services (SSRF protection)
 */
export function validateUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("A valid URL is required.");
  }

  const trimmed = rawUrl.trim();
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Invalid URL format. Please include http:// or https://");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http:// and https:// URLs are supported.");
  }

  const hostname = parsed.hostname.toLowerCase();

  for (const pattern of BLOCKED_HOST_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new Error("Access to internal or private addresses is strictly prohibited.");
    }
  }

  return parsed.toString();
}

/**
 * Safe fetch with strict timeout and maximum response size
 */
export async function safeFetch(url, options = {}) {
  const targetUrl = validateUrl(url);
  const timeoutMs = options.timeoutMs || 8000;
  const maxBytes = options.maxBytes || 2.5 * 1024 * 1024; // 2.5 MB

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Public credential page returned HTTP status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml") &&
      !contentType.includes("application/json") &&
      !contentType.includes("text/plain")
    ) {
      throw new Error("Invalid content type received from credential server.");
    }

    // Read limited bytes to prevent memory exhaustion
    const reader = response.body ? response.body.getReader() : null;
    if (!reader) {
      const text = await response.text();
      return text.slice(0, maxBytes);
    }

    const chunks = [];
    let bytesRead = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.length;
      chunks.push(value);
      if (bytesRead > maxBytes) {
        break; // Truncate safely
      }
    }

    const decoder = new TextDecoder("utf-8");
    let resultText = "";
    for (const chunk of chunks) {
      resultText += decoder.decode(chunk, { stream: true });
    }
    resultText += decoder.decode();
    return resultText;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new Error("Request timed out while connecting to the credential provider.");
    }
    throw err;
  }
}

/**
 * Sanitize plain text string
 */
export function sanitizeText(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Month lookup table
 */
const MONTH_NAMES = {
  jan: { full: "January", short: "JAN", num: "01" },
  feb: { full: "February", short: "FEB", num: "02" },
  mar: { full: "March", short: "MAR", num: "03" },
  apr: { full: "April", short: "APR", num: "04" },
  may: { full: "May", short: "MAY", num: "05" },
  jun: { full: "June", short: "JUN", num: "06" },
  jul: { full: "July", short: "JUL", num: "07" },
  aug: { full: "August", short: "AUG", num: "08" },
  sep: { full: "September", short: "SEP", num: "09" },
  oct: { full: "October", short: "OCT", num: "10" },
  nov: { full: "November", short: "NOV", num: "11" },
  dec: { full: "December", short: "DEC", num: "12" },
};

/**
 * Normalize dates:
 * Handles:
 * - "July 2026" -> { display: "JUL 2026", iso: "2026-07", hasDay: false }
 * - "Jul 15, 2026" / "2026-07-15" -> { display: "JUL 15, 2026", iso: "2026-07-15", hasDay: true }
 * Does NOT invent a day if source only provides month and year.
 */
export function normalizeDate(dateInput) {
  if (!dateInput) return null;
  const str = String(dateInput).trim();
  if (!str) return null;

  // 1. ISO format: YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthNum = isoMatch[2];
    const day = isoMatch[3];
    const monthKey = Object.keys(MONTH_NAMES).find(
      (k) => MONTH_NAMES[k].num === monthNum
    );
    const monthShort = monthKey ? MONTH_NAMES[monthKey].short : monthNum;

    if (day) {
      const dayNum = parseInt(day, 10);
      return {
        display: `${monthShort} ${dayNum}, ${year}`,
        iso: `${year}-${monthNum}-${String(dayNum).padStart(2, "0")}`,
        hasDay: true,
      };
    }
    return {
      display: `${monthShort} ${year}`,
      iso: `${year}-${monthNum}`,
      hasDay: false,
    };
  }

  // 2. Month Day, Year e.g. "July 15, 2026" or "Jul 15 2026"
  const mdyMatch = str.match(
    /([a-zA-Z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i
  );
  if (mdyMatch) {
    const monthStr = mdyMatch[1].toLowerCase().slice(0, 3);
    const day = parseInt(mdyMatch[2], 10);
    const year = mdyMatch[3];
    const monthInfo = MONTH_NAMES[monthStr];
    if (monthInfo) {
      return {
        display: `${monthInfo.short} ${day}, ${year}`,
        iso: `${year}-${monthInfo.num}-${String(day).padStart(2, "0")}`,
        hasDay: true,
      };
    }
  }

  // 3. Day Month Year e.g. "15 July 2026" or "15-Jul-2026"
  const dmyMatch = str.match(
    /(\d{1,2})(?:st|nd|rd|th)?[\s\-\/]+([a-zA-Z]+)[\s\-\/,]+(\d{4})/i
  );
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthStr = dmyMatch[2].toLowerCase().slice(0, 3);
    const year = dmyMatch[3];
    const monthInfo = MONTH_NAMES[monthStr];
    if (monthInfo) {
      return {
        display: `${monthInfo.short} ${day}, ${year}`,
        iso: `${year}-${monthInfo.num}-${String(day).padStart(2, "0")}`,
        hasDay: true,
      };
    }
  }

  // 4. Month Year e.g. "July 2026" or "Jul 2026"
  const myMatch = str.match(/([a-zA-Z]+)\.?[\s\-\/]+(\d{4})/i);
  if (myMatch) {
    const monthStr = myMatch[1].toLowerCase().slice(0, 3);
    const year = myMatch[2];
    const monthInfo = MONTH_NAMES[monthStr];
    if (monthInfo) {
      return {
        display: `${monthInfo.short} ${year}`,
        iso: `${year}-${monthInfo.num}`,
        hasDay: false,
      };
    }
  }

  // 5. Just Year e.g. "2026"
  const yearMatch = str.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearMatch) {
    return {
      display: yearMatch[1],
      iso: yearMatch[1],
      hasDay: false,
    };
  }

  return {
    display: sanitizeText(str).toUpperCase(),
    iso: str,
    hasDay: false,
  };
}

/**
 * Determine Expiry information adhering strictly to the 3 requirement states:
 * 1. Credential explicitly has an expiry date
 * 2. Credential explicitly states that it does not expire
 * 3. Credential page does not provide expiry information (Do NOT falsely claim no expiry)
 */
export function determineExpiry(rawText, explicitExpiryDate = null) {
  // 1. If explicit expiry date provided or found
  if (explicitExpiryDate) {
    const norm = normalizeDate(explicitExpiryDate);
    if (norm) {
      return {
        expiryDate: norm.display,
        noExpiry: false,
        expiryStatus: `Expires: ${norm.display}`,
      };
    }
  }

  const text = (rawText || "").toLowerCase();

  // Check for explicit "does not expire" statements
  const noExpiryPatterns = [
    /\b(does not expire|no expiration|no expiry|never expires|this credential does not expire|lifetime validity|valid for life)\b/i,
    /\b(badge does not expire|credential has no expiration)\b/i,
  ];

  for (const pattern of noExpiryPatterns) {
    if (pattern.test(text)) {
      return {
        expiryDate: null,
        noExpiry: true,
        expiryStatus: "No expiry",
      };
    }
  }

  // Check for explicit expiry date in text
  const expiryRegex =
    /(?:expires|expiration|valid through|valid until|expiry date|valid to)[\s:]+([A-Za-z]+ \d{1,2},? \d{4}|\d{1,2} [A-Za-z]+ \d{4}|[A-Za-z]+ \d{4}|\d{4}-\d{2}-\d{2})/i;
  const match = text.match(expiryRegex);
  if (match && match[1]) {
    const norm = normalizeDate(match[1]);
    if (norm) {
      return {
        expiryDate: norm.display,
        noExpiry: false,
        expiryStatus: `Expires: ${norm.display}`,
      };
    }
  }

  // 3. Fallback: Not provided (never invent "No expiry")
  return {
    expiryDate: null,
    noExpiry: false,
    expiryStatus: "Not provided",
  };
}
