/**
 * Admin AI Engine for Saumya Mirajkar's Portfolio CMS
 * 
 * Capabilities:
 * 1. Multimodal Certificate Ingestion (Links, PDFs, Images) with Firebase Storage upload
 * 2. Full Portfolio CRUD & Content Modification via Natural Language (Profile, Projects, Skills, Experience, Education, Certifications)
 * 3. Gemini 2.0 Flash Integration (with client-side API key support)
 * 4. Zero-Key Smart Offline NLP & Regex Fallback Engine
 * 5. Undo & Rollback System for safety
 */

import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { clearContentCache } from "@/lib/content";

/* ------------------------------------------------------------------ */
/* API Key & Configuration Storage                                    */
/* ------------------------------------------------------------------ */

const STORAGE_KEY_GEMINI = "admin_gemini_api_key";
const DEFAULT_MODEL = "gemini-2.0-flash";

export function getGeminiApiKey() {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  return (
    localStorage.getItem(STORAGE_KEY_GEMINI) ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ""
  );
}

export function setGeminiApiKey(key) {
  if (typeof window === "undefined") return;
  const clean = (key || "").trim();
  if (clean) {
    localStorage.setItem(STORAGE_KEY_GEMINI, clean);
  } else {
    localStorage.removeItem(STORAGE_KEY_GEMINI);
  }
}

export function hasGeminiApiKey() {
  return Boolean(getGeminiApiKey().trim());
}

/* ------------------------------------------------------------------ */
/* File Helpers (Base64 & Firebase Storage)                           */
/* ------------------------------------------------------------------ */

/**
 * Converts a browser File or Blob into base64 format for Gemini API
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64Data = dataUrl.split(",")[1];
      resolve({
        filename: file.name,
        mimeType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        base64Data,
        size: file.size,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a certificate asset (PDF or Image) to Firebase Storage
 */
export async function uploadCertificateAsset(file, storage) {
  if (!storage) {
    // If Firebase Storage is unavailable, create an object URL or base64 fallback
    const base64Info = await fileToBase64(file);
    return {
      downloadUrl: `data:${base64Info.mimeType};base64,${base64Info.base64Data}`,
      storagePath: `local/${file.name}`,
      isLocalFallback: true,
    };
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `certificates/${Date.now()}_${cleanName}`;
  const fileRef = ref(storage, storagePath);

  await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(fileRef);

  return {
    downloadUrl,
    storagePath,
    isLocalFallback: false,
  };
}

/* ------------------------------------------------------------------ */
/* Gemini Direct REST Client                                          */
/* ------------------------------------------------------------------ */

async function callGeminiDirect({
  apiKey,
  systemPrompt,
  userPrompt,
  files = [],
  responseSchema = null,
  model = DEFAULT_MODEL,
}) {
  if (!apiKey) throw new Error("No Gemini API key configured.");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts = [];

  // Add files (PDF, Images)
  for (const file of files) {
    if (file && file.base64Data && file.mimeType) {
      parts.push({
        inline_data: {
          mime_type: file.mimeType,
          data: file.base64Data,
        },
      });
    }
  }

  // Add user prompt text
  parts.push({ text: userPrompt });

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
    },
  };

  if (systemPrompt) {
    payload.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  if (responseSchema) {
    payload.generationConfig.responseMimeType = "application/json";
    payload.generationConfig.responseSchema = responseSchema;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let msg = `Gemini API error (${response.status})`;
    try {
      const errJson = JSON.parse(errorText);
      msg = errJson.error?.message || msg;
    } catch (e) {
      msg = errorText || msg;
    }
    throw new Error(msg);
  }

  const resJson = await response.json();
  const textOutput =
    resJson.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return textOutput;
}

/* ------------------------------------------------------------------ */
/* Certificate Extraction (Link, PDF, Image)                          */
/* ------------------------------------------------------------------ */

const CERTIFICATE_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING", description: "Official certificate or course name" },
    organization: { type: "STRING", description: "Issuing organization (e.g. IBM, Google, Cisco, AWS, Coursera)" },
    issuer: { type: "STRING", description: "Platform or partner issuer (e.g. Coursera, Credly, Cisco Networking Academy)" },
    category: {
      type: "STRING",
      enum: ["AI", "Cloud", "Software", "Programming", "Other"],
      description: "Best matching category",
    },
    issueDate: { type: "STRING", description: "Issue date in MMM YYYY format, e.g. JUL 2026 or OCT 2026" },
    expiryDate: { type: "STRING", description: "Expiry date if applicable, or empty string" },
    expiryStatus: { type: "STRING", description: "Expiry status, e.g. No expiry explicitly stated" },
    credentialId: { type: "STRING", description: "Credential ID, license code, or verification hash if visible" },
    verificationUrl: { type: "STRING", description: "Verification URL or credential URL if visible in document" },
    recipient: { type: "STRING", description: "Recipient name as written on certificate" },
    skills: { type: "STRING", description: "Comma-separated list of technical skills learned" },
    description: { type: "STRING", description: "Concise 1-2 sentence professional overview of the certification" },
    verified: { type: "BOOLEAN", description: "True if accredited or verified" },
    featured: { type: "BOOLEAN", description: "True if top-tier certificate (e.g. IBM AI, Google AI)" },
  },
  required: ["name", "organization", "issueDate", "category"],
};

/**
 * Smart Offline Certificate Extractor (Fallback when no Gemini Key is provided)
 */
export function extractCertificateOffline({ filename = "", url = "", text = "" }) {
  const combined = `${filename} ${url} ${text}`.toLowerCase();

  let organization = "Professional Institution";
  let issuer = "Accreditation Authority";
  let category = "Software";
  let name = "";
  let issueDate = "JUL 2026";
  let credentialId = "";
  let verificationUrl = url || "";

  // Organization heuristics
  if (combined.includes("ibm")) {
    organization = "IBM";
    issuer = combined.includes("coursera") ? "Coursera" : "IBM";
  } else if (combined.includes("google")) {
    organization = "Google";
    issuer = combined.includes("coursera") ? "Coursera" : "Google";
  } else if (combined.includes("cisco")) {
    organization = "Cisco";
    issuer = "Cisco Networking Academy";
  } else if (combined.includes("upgrad") || combined.includes("thriversity")) {
    organization = "upGrad";
    issuer = "upGrad Thriversity";
  } else if (combined.includes("coursera")) {
    organization = "Coursera";
    issuer = "Coursera";
  } else if (combined.includes("credly")) {
    organization = "Credly Partner";
    issuer = "Credly";
  } else if (combined.includes("aws") || combined.includes("amazon")) {
    organization = "Amazon Web Services (AWS)";
    issuer = "AWS Training & Certification";
  } else if (combined.includes("microsoft")) {
    organization = "Microsoft";
    issuer = "Microsoft Learn";
  } else if (combined.includes("udemy")) {
    organization = "Udemy";
    issuer = "Udemy";
  }

  // Category heuristics
  if (combined.includes("ai") || combined.includes("intelligence") || combined.includes("deep learning") || combined.includes("machine learning") || combined.includes("generative")) {
    category = "AI";
  } else if (combined.includes("cloud") || combined.includes("aws") || combined.includes("azure")) {
    category = "Cloud";
  } else if (combined.includes("python") || combined.includes("javascript") || combined.includes("c++") || combined.includes("programming") || combined.includes("coding")) {
    category = "Programming";
  } else if (combined.includes("software") || combined.includes("developer") || combined.includes("web") || combined.includes("react")) {
    category = "Software";
  } else {
    category = "Other";
  }

  // Name extraction from filename
  if (filename) {
    const base = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    name = base
      .split(" ")
      .filter((w) => !["pdf", "png", "jpg", "jpeg", "certificate", "cert", "scan"].includes(w.toLowerCase()))
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  if (!name && url) {
    try {
      const u = new URL(url);
      const segments = u.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1] || "";
      name = last.replace(/[-_]/g, " ");
      name = name.charAt(0).toUpperCase() + name.slice(1);
    } catch (e) {
      name = "Professional Certificate";
    }
  }

  if (!name) name = "Verified Professional Certificate";

  // Derive date
  const dateMatch = combined.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s_-]*(202[0-9])/i);
  if (dateMatch) {
    issueDate = `${dateMatch[1].toUpperCase().slice(0, 3)} ${dateMatch[2]}`;
  }

  return {
    name,
    organization,
    issuer,
    provider: issuer,
    category,
    issueDate,
    expiryDate: "",
    expiryStatus: "No expiry explicitly stated",
    credentialId: credentialId || "Not provided",
    verificationUrl,
    credentialUrl: verificationUrl,
    recipient: "Saumya Mirajkar",
    skills: category === "AI" ? "Artificial Intelligence, Prompt Engineering, Machine Learning" : "Software Engineering, Best Practices",
    description: `Earned professional credential validating competencies in ${category}.`,
    verified: true,
    featured: category === "AI",
    visible: true,
    status: "published",
  };
}

/**
 * Main Multimodal Certificate Extractor
 * Accepts:
 * - { file: File, storage: FirebaseStorage } (PDF or Image)
 * - { url: string } (Web Link)
 */
export async function analyzeCertificate({
  file = null,
  url = "",
  storage = null,
  onProgress = () => {},
}) {
  const apiKey = getGeminiApiKey();
  let uploadedAsset = null;

  // 1. If a file is provided, upload it first to Firebase Storage
  if (file) {
    onProgress("Uploading certificate document to Firebase Storage…");
    uploadedAsset = await uploadCertificateAsset(file, storage);
  }

  // 2. If Gemini API key is configured, run Multimodal Gemini 2.0 Flash Extraction
  if (apiKey) {
    try {
      onProgress("Analyzing certificate with Gemini 2.0 Flash AI…");

      let filesPayload = [];
      let userPrompt = "";

      if (file) {
        const b64 = await fileToBase64(file);
        filesPayload.push(b64);
        userPrompt = `Please inspect the attached certificate file (${file.name}, ${b64.mimeType}).
Extract every detail with 100% precision:
1. Exact official name of the certificate
2. Issuing organization (e.g. IBM, Google, Cisco, Coursera, Meta, etc.)
3. Issuer platform or verification authority
4. Recipient name
5. Issue date (format as MMM YYYY, e.g. JUL 2026)
6. Expiry date / status if explicitly written
7. Credential ID, certificate number, or verification code
8. Verification URL if printed on document
9. Key technical skills demonstrated
10. Best category ("AI", "Cloud", "Software", "Programming", or "Other")
11. Professional 1-2 sentence description.`;
      } else if (url) {
        // Fetch URL content via edge helper if possible
        let siteText = "";
        try {
          const res = await fetch("/api/certificates/fetch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.certificate) {
              return {
                ...data.certificate,
                verificationUrl: url,
                credentialUrl: url,
                sourceCredentialUrl: url,
                visible: true,
                status: "published",
              };
            }
            siteText = JSON.stringify(data);
          }
        } catch (e) {
          // Continue to direct prompt
        }

        userPrompt = `Analyze this credential verification URL: ${url}.
Additional fetched context: ${siteText || "None"}.
Identify the course/credential name, issuing organization, issuer platform, issue date, credential ID, skills covered, and category.`;
      }

      const systemPrompt = `You are an elite academic credential verification agent.
Extract verified certificate metadata accurately and structure the response strictly matching the schema.
Always output issueDate as uppercase 3-letter month and 4-digit year (e.g. 'JUL 2026', 'OCT 2026').
If recipient is found, record it. Ensure category is strictly one of: AI, Cloud, Software, Programming, Other.`;

      const geminiResult = await callGeminiDirect({
        apiKey,
        systemPrompt,
        userPrompt,
        files: filesPayload,
        responseSchema: CERTIFICATE_SCHEMA,
      });

      const parsed = JSON.parse(geminiResult);

      const finalCert = {
        name: parsed.name || "Professional Certificate",
        organization: parsed.organization || "Accreditation Partner",
        issuer: parsed.issuer || parsed.organization || "Certification Authority",
        provider: parsed.issuer || parsed.organization,
        category: parsed.category || "AI",
        issueDate: (parsed.issueDate || "JUL 2026").toUpperCase(),
        expiryDate: parsed.expiryDate || "",
        expiryStatus: parsed.expiryStatus || "No expiry explicitly stated",
        credentialId: parsed.credentialId || "Not provided",
        verificationUrl: parsed.verificationUrl || url || "",
        credentialUrl: uploadedAsset?.downloadUrl || url || "",
        sourceCredentialUrl: url || "",
        imageUrl: (file && file.type?.startsWith("image/")) ? uploadedAsset?.downloadUrl : (parsed.imageUrl || ""),
        recipient: parsed.recipient || "Saumya Mirajkar",
        skills: parsed.skills || "",
        description: parsed.description || "",
        verified: parsed.verified !== false,
        featured: Boolean(parsed.featured),
        visible: true,
        status: "published",
      };

      return finalCert;
    } catch (err) {
      console.warn("Gemini certificate analysis failed, falling back to smart rules:", err.message);
    }
  }

  // 3. Fallback: Edge Importer or Smart Offline Rules
  onProgress("Applying smart extraction rules…");
  const fallback = extractCertificateOffline({
    filename: file?.name || "",
    url: url || "",
  });

  if (uploadedAsset?.downloadUrl) {
    if (file?.type?.startsWith("image/")) {
      fallback.imageUrl = uploadedAsset.downloadUrl;
    }
    fallback.credentialUrl = uploadedAsset.downloadUrl;
  }

  return fallback;
}

/* ------------------------------------------------------------------ */
/* Universal Admin Action Planner (Gemini & Smart NLP Fallback)       */
/* ------------------------------------------------------------------ */

const ADMIN_ACTION_SCHEMA = {
  type: "OBJECT",
  properties: {
    intent: {
      type: "STRING",
      enum: ["update_profile", "create_item", "update_item", "delete_item", "batch_action", "chat_reply"],
      description: "Type of action to execute",
    },
    collection: {
      type: "STRING",
      enum: ["profile", "certifications", "projects", "skills", "experience", "education", "none"],
      description: "Target CMS collection or entity",
    },
    targetId: {
      type: "STRING",
      description: "Document ID or identifier of existing item if updating or deleting",
    },
    targetName: {
      type: "STRING",
      description: "Human-readable label or name of the item being touched",
    },
    payload: {
      type: "OBJECT",
      description: "Data fields to set, create, or update",
    },
    explanation: {
      type: "STRING",
      description: "Natural language explanation for the admin user about what was understood and what will change",
    },
  },
  required: ["intent", "explanation"],
};

/**
 * Smart Regex/Keyword NLP Fallback when no Gemini Key is provided
 */
export function planActionOffline(prompt, snapshot = {}) {
  const p = prompt.trim();
  const lower = p.toLowerCase();

  // 1. DELETE / REMOVE
  const deleteMatch = lower.match(/(?:delete|remove|destroy|trash)\s+(?:the\s+)?(certificate|cert|project|skill|experience|job|education|degree)\s+["']?([^"']+)["']?/i);
  if (deleteMatch) {
    const rawEntity = deleteMatch[1].toLowerCase();
    const query = deleteMatch[2].trim().toLowerCase();
    let col = "projects";
    if (rawEntity.includes("cert")) col = "certifications";
    else if (rawEntity.includes("skill")) col = "skills";
    else if (rawEntity.includes("exp") || rawEntity.includes("job")) col = "experience";
    else if (rawEntity.includes("edu") || rawEntity.includes("degree")) col = "education";

    const items = snapshot[col] || [];
    const found = items.find((item) => {
      const name = (item.name || item.title || item.position || item.degree || "").toLowerCase();
      return name.includes(query) || (item.id && String(item.id).toLowerCase() === query);
    });

    if (found) {
      return {
        intent: "delete_item",
        collection: col,
        targetId: String(found.id),
        targetName: found.name || found.title || found.position || found.degree || query,
        explanation: `Found ${col.slice(0, -1)} "${found.name || found.title || found.position || found.degree}". Ready to permanently delete it from your portfolio.`,
      };
    } else {
      return {
        intent: "chat_reply",
        collection: col,
        explanation: `Could not find a ${col.slice(0, -1)} matching "${query}". Please check the name or view the list.`,
      };
    }
  }

  // 2. UPDATE PROFILE FIELDS
  // e.g. "change my headline to...", "update bio to...", "change email to..."
  const headlineMatch = lower.match(/(?:change|update|set)\s+(?:my\s+)?headline\s+(?:to\s+)?["']?([^"']+)["']?/i);
  if (headlineMatch) {
    return {
      intent: "update_profile",
      collection: "profile",
      targetId: "main",
      targetName: "Profile Headline",
      payload: { headline: headlineMatch[1].trim() },
      explanation: `Update portfolio discipline badge / headline to "${headlineMatch[1].trim()}".`,
    };
  }

  const roleMatch = lower.match(/(?:change|update|set)\s+(?:my\s+)?role\s+(?:to\s+)?["']?([^"']+)["']?/i);
  if (roleMatch) {
    return {
      intent: "update_profile",
      collection: "profile",
      targetId: "main",
      targetName: "Profile Role",
      payload: { role: roleMatch[1].trim() },
      explanation: `Update primary role / subtitle to "${roleMatch[1].trim()}".`,
    };
  }

  const bioMatch = lower.match(/(?:change|update|set)\s+(?:my\s+)?bio\s+(?:to\s+)?["']?([\s\S]+)["']?/i);
  if (bioMatch) {
    return {
      intent: "update_profile",
      collection: "profile",
      targetId: "main",
      targetName: "Profile Bio",
      payload: { bio: bioMatch[1].trim() },
      explanation: `Update bio narrative text.`,
    };
  }

  const emailMatch = lower.match(/(?:change|update|set)\s+(?:my\s+)?email\s+(?:to\s+)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (emailMatch) {
    return {
      intent: "update_profile",
      collection: "profile",
      targetId: "main",
      targetName: "Contact Email",
      payload: { email: emailMatch[1].trim() },
      explanation: `Update portfolio contact email to "${emailMatch[1].trim()}".`,
    };
  }

  // 3. ADD SKILL
  // e.g. "add skill Next.js category Web Development"
  const skillMatch = lower.match(/(?:add|create)\s+skill\s+["']?([^"']+)["']?(?:\s+(?:under|in|category)\s+["']?([^"']+)["']?)?/i);
  if (skillMatch) {
    const skillName = skillMatch[1].trim();
    const cat = skillMatch[2] ? skillMatch[2].trim() : "Languages";
    return {
      intent: "create_item",
      collection: "skills",
      targetName: skillName,
      payload: {
        name: skillName,
        category: cat,
        icon: skillName.toLowerCase().replace(/[^a-z0-9]/g, ""),
        proficiency: "Proficient",
        keywords: [skillName.toLowerCase()],
        visible: true,
        status: "published",
        featured: true,
        order: (snapshot.skills?.length || 0) + 1,
      },
      explanation: `Create and publish new skill "${skillName}" under category "${cat}".`,
    };
  }

  // Default conversational answer
  return {
    intent: "chat_reply",
    collection: "none",
    explanation: `I understood: "${p}".
You can ask me to:
• "Add certificate [via link or file upload]"
• "Remove certificate [name]"
• "Update headline to [text]"
• "Add skill [name] category [category]"
• "Delete project [name]"
Or connect your Gemini API Key in the settings below for complete conversational superpowers across all fields!`,
  };
}

/**
 * Plans an admin modification using Gemini 2.0 Flash (with offline fallback)
 */
export async function planAdminAction({ prompt, snapshot = {}, onProgress = () => {} }) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return planActionOffline(prompt, snapshot);
  }

  try {
    onProgress("Interpreting instruction with Gemini AI…");

    // Build condensed snapshot representation
    const condensedContext = {
      profile: snapshot.profile ? {
        name: snapshot.profile.name,
        role: snapshot.profile.role,
        headline: snapshot.profile.headline,
        email: snapshot.profile.email,
        bio: snapshot.profile.bio ? snapshot.profile.bio.slice(0, 150) + "..." : "",
      } : {},
      certifications: (snapshot.certifications || []).map((c) => ({ id: c.id, name: c.name, organization: c.organization, category: c.category, featured: c.featured })),
      projects: (snapshot.projects || []).map((p) => ({ id: p.id, title: p.title, category: p.category, live_url: p.live_url, github_url: p.github_url })),
      skills: (snapshot.skills || []).map((s) => ({ id: s.id, name: s.name, category: s.category })),
      experience: (snapshot.experience || []).map((e) => ({ id: e.id, position: e.position, company: e.company })),
      education: (snapshot.education || []).map((e) => ({ id: e.id, degree: e.degree, institution: e.institution })),
    };

    const systemPrompt = `You are the AI Admin Copilot for Saumya Mirajkar's portfolio CMS.
You have FULL authority to modify ANY section: profile, certifications, projects, skills, experience, education.
The user will give you natural language commands (e.g. "remove certificate X", "edit headline to Y", "add new project Z", "change AutoInvoice live URL", "mark all AI certs featured").
Match existing items using their IDs from the provided portfolio snapshot.
Respond strictly with a structured action JSON matching the schema.`;

    const userPrompt = `PORTFOLIO CURRENT STATE:
${JSON.stringify(condensedContext, null, 2)}

USER INSTRUCTION:
"${prompt}"

Determine the exact intent, target collection, target document ID (if modifying/deleting existing), payload data, and a clear explanation.`;

    const resultText = await callGeminiDirect({
      apiKey,
      systemPrompt,
      userPrompt,
      responseSchema: ADMIN_ACTION_SCHEMA,
    });

    const parsed = JSON.parse(resultText);
    return parsed;
  } catch (err) {
    console.warn("Gemini action planning error, using offline rules:", err.message);
    return planActionOffline(prompt, snapshot);
  }
}

/* ------------------------------------------------------------------ */
/* Action Executor (Live Firestore Operations)                        */
/* ------------------------------------------------------------------ */

// Session undo stack
const undoStack = [];

export function getUndoStack() {
  return [...undoStack];
}

export async function executeAdminAction({ action, db }) {
  if (!action || !action.intent) {
    throw new Error("Invalid action specification.");
  }

  const { intent, collection: colName, targetId, payload, targetName } = action;

  // 1. UPDATE PROFILE
  if (intent === "update_profile") {
    const profileRef = doc(db, "profile", "main");
    const snap = await getDoc(profileRef);
    const prevData = snap.exists() ? snap.data() : {};

    await setDoc(profileRef, { ...prevData, ...payload, updatedAt: new Date().toISOString() }, { merge: true });
    clearContentCache();

    undoStack.push({
      action: "update_profile",
      colName: "profile",
      id: "main",
      prevData,
      description: `Revert profile update: ${Object.keys(payload).join(", ")}`,
    });

    return {
      success: true,
      message: `Profile updated successfully (${Object.keys(payload).join(", ")}) ✓`,
      undoAvailable: true,
    };
  }

  // 2. CREATE ITEM (certifications, projects, skills, etc.)
  if (intent === "create_item") {
    const colRef = collection(db, colName);
    const newDocRef = doc(colRef);
    const completePayload = {
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(newDocRef, completePayload);
    clearContentCache();

    undoStack.push({
      action: "create_item",
      colName,
      id: newDocRef.id,
      description: `Delete newly created ${colName.slice(0, -1)} "${targetName || payload.name || payload.title}"`,
    });

    return {
      success: true,
      id: newDocRef.id,
      message: `Added new ${colName.slice(0, -1)}: "${targetName || payload.name || payload.title}" ✓`,
      undoAvailable: true,
    };
  }

  // 3. UPDATE ITEM
  if (intent === "update_item") {
    if (!targetId) throw new Error("Missing item ID for update.");
    const docRef = doc(db, colName, String(targetId));
    const snap = await getDoc(docRef);
    const prevData = snap.exists() ? snap.data() : {};

    await updateDoc(docRef, {
      ...payload,
      updatedAt: new Date().toISOString(),
    });
    clearContentCache();

    undoStack.push({
      action: "update_item",
      colName,
      id: String(targetId),
      prevData,
      description: `Restore previous state of "${targetName || targetId}"`,
    });

    return {
      success: true,
      message: `Updated "${targetName || targetId}" in ${colName} ✓`,
      undoAvailable: true,
    };
  }

  // 4. DELETE ITEM
  if (intent === "delete_item") {
    if (!targetId) throw new Error("Missing item ID for deletion.");
    const docRef = doc(db, colName, String(targetId));
    const snap = await getDoc(docRef);
    const prevData = snap.exists() ? snap.data() : null;

    await deleteDoc(docRef);
    clearContentCache();

    if (prevData) {
      undoStack.push({
        action: "delete_item",
        colName,
        id: String(targetId),
        prevData,
        description: `Restore deleted ${colName.slice(0, -1)} "${targetName || targetId}"`,
      });
    }

    return {
      success: true,
      message: `Deleted "${targetName || targetId}" from ${colName} ✓`,
      undoAvailable: Boolean(prevData),
    };
  }

  if (intent === "chat_reply") {
    return {
      success: true,
      message: action.explanation,
      isReplyOnly: true,
    };
  }

  throw new Error(`Unsupported intent: ${intent}`);
}

/**
 * Reverts the most recent action from the undo stack
 */
export async function revertLastAction(db) {
  const item = undoStack.pop();
  if (!item) throw new Error("Nothing to undo.");

  const { action, colName, id, prevData } = item;

  if (action === "create_item") {
    await deleteDoc(doc(db, colName, id));
    clearContentCache();
    return { success: true, message: `Reverted creation: removed item from ${colName} ✓` };
  }

  if (action === "delete_item" && prevData) {
    await setDoc(doc(db, colName, id), prevData);
    clearContentCache();
    return { success: true, message: `Restored deleted item back into ${colName} ✓` };
  }

  if ((action === "update_item" || action === "update_profile") && prevData) {
    await setDoc(doc(db, colName, id), prevData, { merge: true });
    clearContentCache();
    return { success: true, message: `Reverted updates to ${colName} ✓` };
  }

  return { success: false, message: "Could not revert action." };
}
