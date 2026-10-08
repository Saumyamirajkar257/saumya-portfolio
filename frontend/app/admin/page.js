"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { auth, db, storage } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { fallbackContent } from "@/lib/fallback";
import { clearContentCache, migrateInitialData } from "@/lib/content";
import {
  CANONICAL_RESUME_PATH,
  CANONICAL_RESUME_FILENAME,
  getActiveResumeUrl,
  getResumeFilename,
} from "@/lib/resume";
import "./admin.css";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const parseLines = (s) =>
  (s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

const joinLines = (arr = []) => (Array.isArray(arr) ? arr.join("\n") : "");

const SKILL_CATEGORIES = [
  "Languages",
  "Web Development",
  "Backend / Database",
  "Tools & Platforms",
  "IoT / Hardware",
  "Professional",
];

/* ------------------------------------------------------------------ */
/* Models Configuration                                               */
/* ------------------------------------------------------------------ */

const MODELS = {
  profile: {
    label: "Profile / About",
    singular: "Profile",
    collection: "profile",
    isSingleton: true,
    fields: [
      { key: "name", label: "Full Name", type: "text", required: true },
      { key: "role", label: "Primary Role / Subtitle", type: "text" },
      { key: "headline", label: "Discipline Badge (e.g. COMPUTER ENGINEERING · IoT · AI)", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "location", label: "Location (e.g. Pune, India)", type: "text" },
      { key: "email", label: "Contact Email", type: "text", required: true },
      { key: "phone", label: "Phone Number", type: "text" },
      { key: "resume_url", label: "Résumé File URL", type: "text" },
      { key: "academic_status", label: "Academic Status", type: "text" },
      { key: "summary", label: "Professional Summary", type: "textarea" },
      { key: "bio", label: "Bio / Narrative (paragraphs separated by blank line)", type: "textarea" },
      { key: "interests", label: "Interests (one per line)", type: "lines" },
      { key: "socials", label: "Social Links (JSON e.g. {\"github\":\"...\", \"linkedin\":\"...\", \"instagram\":\"...\"})", type: "json" },
      { key: "highlights", label: "Highlights / Stats (JSON array e.g. [{\"value\":\"4\",\"label\":\"Semesters\"}])", type: "json" },
    ],
  },
  projects: {
    label: "Projects",
    singular: "Project",
    collection: "projects",
    fields: [
      { key: "title", label: "Project Title", type: "text", required: true },
      { key: "category", label: "Category (e.g. Hardware + IoT, Full-Stack & Web, Python Software)", type: "text", required: true },
      { key: "short_description", label: "Short Description", type: "textarea" },
      { key: "description", label: "Full Description / Overview", type: "textarea" },
      { key: "summary", label: "One-Line P→A→R Summary", type: "textarea" },
      { key: "problem", label: "Problem / Challenge", type: "textarea" },
      { key: "approach", label: "Approach / Engineering Process", type: "textarea" },
      { key: "result", label: "Result / Deliverables", type: "textarea" },
      { key: "features", label: "Key Features (one per line)", type: "lines" },
      { key: "contribution", label: "Scope & Role", type: "textarea" },
      { key: "learned", label: "Engineering Takeaways", type: "textarea" },
      { key: "technologies", label: "Technologies (one per line)", type: "lines" },
      { key: "github_url", label: "GitHub URL", type: "text" },
      { key: "live_url", label: "Live Demo URL", type: "text" },
      { key: "image", label: "Project Image / Cover Path", type: "text" },
      { key: "status", label: "Status (published / draft / hidden)", type: "select", options: ["published", "draft", "hidden"] },
      { key: "featured", label: "Featured (Highlight with badge)", type: "checkbox" },
      { key: "order", label: "Display Order (0 = Top / First)", type: "number" },
    ],
  },
  skills: {
    label: "Skills",
    singular: "Skill",
    collection: "skills",
    fields: [
      { key: "name", label: "Skill Name", type: "text", required: true },
      { key: "category", label: "Category", type: "select-custom", options: SKILL_CATEGORIES, required: true },
      { key: "icon", label: "Icon Key (e.g. python, cpp, c, javascript, react, html, css, firebase, vite, arduino, sensor, git, github, excel, powerpoint, database, cloud, problem, comms, team, time)", type: "text" },
      { key: "proficiency", label: "Proficiency Label (e.g. Advanced, Proficient — text only, no percentages)", type: "text" },
      { key: "keywords", label: "Keywords / Tags (one per line)", type: "lines" },
      { key: "visible", label: "Visible on Portfolio", type: "checkbox" },
      { key: "status", label: "Status (published / draft)", type: "select", options: ["published", "draft"] },
      { key: "featured", label: "Featured in Constellation", type: "checkbox" },
      { key: "order", label: "Display Order (0 = Top / First)", type: "number" },
    ],
  },
  experience: {
    label: "Experience",
    singular: "Experience",
    collection: "experience",
    fields: [
      { key: "position", label: "Role / Position", type: "text", required: true },
      { key: "company", label: "Company / Organization", type: "text", required: true },
      { key: "location", label: "Location", type: "text" },
      { key: "start_date", label: "Start Date (e.g. MAY 2026)", type: "text", required: true },
      { key: "end_date", label: "End Date (or PRESENT)", type: "text" },
      { key: "current", label: "Currently Active Position", type: "checkbox" },
      { key: "company_url", label: "Company URL", type: "text" },
      { key: "responsibilities", label: "Responsibilities (one per line)", type: "lines" },
      { key: "technologies", label: "Technologies (one per line)", type: "lines" },
      { key: "status", label: "Status (published / draft)", type: "select", options: ["published", "draft"] },
      { key: "featured", label: "Featured Role", type: "checkbox" },
      { key: "order", label: "Display Order (0 = Top / First)", type: "number" },
    ],
  },
  education: {
    label: "Education",
    singular: "Education",
    collection: "education",
    fields: [
      { key: "degree", label: "Degree / Program", type: "text", required: true },
      { key: "institution", label: "Institution", type: "text", required: true },
      { key: "location", label: "Location", type: "text" },
      { key: "start_date", label: "Start Year / Date", type: "text", required: true },
      { key: "end_date", label: "End Year (or Present)", type: "text" },
      { key: "current", label: "Currently Enrolled", type: "checkbox" },
      { key: "details", label: "Program Highlights (one per line)", type: "lines" },
      { key: "grades", label: "Academic Record (JSON e.g. {\"Sem 1\":\"70.82%\"})", type: "json" },
      { key: "status", label: "Status (published / draft)", type: "select", options: ["published", "draft"] },
      { key: "order", label: "Display Order (0 = Top / First)", type: "number" },
    ],
  },
  certifications: {
    label: "Certifications",
    singular: "Certification",
    collection: "certifications",
    fields: [
      { key: "name", label: "Certificate Name", type: "text", required: true },
      { key: "organization", label: "Issuing Organization", type: "text", required: true },
      { key: "issuer", label: "Issuer / Platform (e.g. Coursera)", type: "text" },
      { key: "provider", label: "Provider (alias)", type: "text" },
      {
        key: "category",
        label: "Category",
        type: "select-custom",
        options: ["AI", "Cloud", "Software", "Programming", "Other"],
      },
      { key: "issueDate", label: "Issue Date (e.g. JUL 2026)", type: "text", required: true },
      { key: "expiryDate", label: "Expiry Date (leave empty if none)", type: "text" },
      { key: "expiryStatus", label: "Expiry Status (e.g. No expiry explicitly stated / Expires: JUL 2029 / Expiry information unavailable)", type: "text" },
      { key: "credentialId", label: "Credential ID (or Not provided)", type: "text" },
      { key: "verificationUrl", label: "Verification URL", type: "text" },
      { key: "credentialUrl", label: "Credential URL", type: "text" },
      { key: "sourceCredentialUrl", label: "Source Credential URL", type: "text" },
      { key: "recipient", label: "Recipient Name", type: "text" },
      { key: "skills", label: "Skills Covered (comma-separated)", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "imageUrl", label: "Certificate Image / Badge URL", type: "text" },
      { key: "verified", label: "Verified Credential", type: "checkbox" },
      { key: "featured", label: "Featured Credential (Top Showcase)", type: "checkbox" },
      { key: "visible", label: "Visible on Portfolio", type: "checkbox" },
      { key: "status", label: "Status (published / draft)", type: "select", options: ["published", "draft"] },
      { key: "sortOrder", label: "Sort Order (0 = Top / First priority)", type: "number" },
      { key: "order", label: "Display Order (legacy alias)", type: "number" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Auth Component                                                     */
/* ------------------------------------------------------------------ */

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLogin(userCredential.user);
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    }
    setBusy(false);
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <Link href="/" className="admin-login__back">
          ← Back to portfolio
        </Link>
        <div className="admin-login__logo">SM</div>
        <h1>Portfolio CMS</h1>
        <p className="admin-login__sub">Sign in to control your portfolio content in real time.</p>

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}

        <button className="admin-btn admin-btn--primary" disabled={busy}>
          {busy ? "Authenticating…" : "Sign In to CMS"}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dynamic Form Field Input                                           */
/* ------------------------------------------------------------------ */

function FieldInput({ field, value, onChange }) {
  if (field.type === "textarea" || field.type === "lines" || field.type === "json") {
    return (
      <textarea
        rows={field.type === "textarea" ? 4 : 3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.type === "lines" ? "One entry per line" : ""}
      />
    );
  }
  if (field.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }
  if (field.type === "number") {
    return (
      <input
        type="number"
        min="0"
        value={value === undefined || value === null ? "" : value}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
        placeholder="0"
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={value || field.options[0]}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "10px",
          border: "1px solid var(--line-strong)",
          background: "var(--surface)",
          color: "var(--text)",
        }}
      >
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.toUpperCase()}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "select-custom") {
    return (
      <div style={{ display: "grid", gap: "8px" }}>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Select from options or type custom category..."
        />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {field.options.map((opt) => (
            <button
              type="button"
              key={opt}
              className="admin-btn admin-btn--sm"
              style={{
                fontSize: "11px",
                padding: "4px 8px",
                background: value === opt ? "rgba(0, 229, 160, 0.2)" : "rgba(255,255,255,0.05)",
                borderColor: value === opt ? "var(--accent)" : "var(--line)",
              }}
              onClick={() => onChange(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <input
      type="text"
      value={value === undefined || value === null ? "" : value}
      onChange={(e) => onChange(e.target.value)}
      required={Boolean(field.required)}
    />
  );
}

function buildPayload(model, values) {
  const payload = {};
  for (const f of model.fields) {
    let v = values[f.key];
    if (f.type === "lines") {
      v = parseLines(v);
    } else if (f.type === "number") {
      v = v === "" || v === undefined || v === null ? 0 : Number(v);
    } else if (f.type === "checkbox") {
      v = Boolean(v);
    } else if (f.type === "json") {
      const raw = String(v || "").trim();
      if (!raw) {
        v = f.key === "highlights" ? [] : {};
      } else {
        try {
          v = JSON.parse(raw);
        } catch {
          v = f.key === "highlights" ? [] : {};
        }
      }
    }
    payload[f.key] = v;
  }
  if (payload.sortOrder !== undefined && (payload.order === undefined || payload.order === 0)) {
    payload.order = payload.sortOrder;
  } else if (payload.order !== undefined && (payload.sortOrder === undefined || payload.sortOrder === 0)) {
    payload.sortOrder = payload.order;
  }
  if (payload.visible !== undefined) {
    payload.status = payload.visible ? "published" : "draft";
  }
  payload.updatedAt = new Date().toISOString();
  return payload;
}

function valuesFromItem(fields, item) {
  const out = {};
  for (const f of fields) {
    let v = item?.[f.key];
    if (f.key === "issueDate" && !v && item?.date) v = item.date;
    if (f.key === "verificationUrl" && !v && (item?.credential_url || item?.credentialUrl))
      v = item.credential_url || item.credentialUrl;
    if (f.key === "credentialUrl" && !v && (item?.verificationUrl || item?.credential_url))
      v = item.verificationUrl || item.credential_url;
    if (f.key === "provider" && !v && item?.issuer) v = item.issuer;
    if (f.key === "issuer" && !v && item?.provider) v = item.provider;
    if (f.key === "sortOrder" && v === undefined && item?.order !== undefined) v = item.order;
    if (f.key === "order" && v === undefined && item?.sortOrder !== undefined) v = item.sortOrder;
    if (f.key === "visible" && v === undefined) {
      v = item?.visible !== false && item?.status !== "draft";
    }
    if (f.key === "verified" && v === undefined) {
      v = item?.verified !== false;
    }
    if (f.key === "status" && !v) {
      v = item?.published === false || item?.visible === false ? "draft" : "published";
    }

    if (f.type === "lines") v = joinLines(v);
    else if (f.type === "json")
      v = JSON.stringify(
        v ?? (f.key === "highlights" ? [] : {}),
        null,
        1
      );
    out[f.key] =
      v === undefined
        ? f.type === "checkbox"
          ? false
          : f.type === "number"
          ? 0
          : f.type === "select"
          ? f.options[0]
          : ""
        : v;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Delete Confirmation Modal                                          */
/* ------------------------------------------------------------------ */

function DeleteConfirmModal({ title, onCancel, onConfirm, busy }) {
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: "440px" }}>
        <div className="admin-modal__head">
          <h3>Confirm Delete</h3>
          <button className="admin-modal__close" onClick={onCancel}>
            ✕
          </button>
        </div>
        <p style={{ fontSize: "14.5px", color: "var(--text-dim)", lineHeight: "1.6" }}>
          Delete <strong>"{title}"</strong>? This will permanently remove it from the database and public portfolio.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
          <button className="admin-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className="admin-btn admin-btn--danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Deleting…" : "Delete Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* URL-First Certificate Importer & Management                        */
/* ------------------------------------------------------------------ */
/* Credential Fetch Helper (with Cloudflare Edge fallback)            */
/* ------------------------------------------------------------------ */

async function fetchCredentialApi(targetUrl) {
  try {
    const res = await fetch("/api/certificates/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetUrl }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data) return data;
    }
  } catch (err) {
    // Continue to deployed fallback
  }

  // Deployed Cloudflare Pages Function fallback
  try {
    const remoteRes = await fetch(
      "https://saumya-portfolio-acv.pages.dev/api/certificates/fetch",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      }
    );
    if (remoteRes.ok) {
      return await remoteRes.json();
    }
  } catch (err) {
    // Both attempts failed
  }

  return {
    success: false,
    message: "Couldn't automatically retrieve certificate details.",
    fallbackManual: true,
  };
}

function CertificationsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // URL-First State
  const [isUrlBoxOpen, setIsUrlBoxOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [importError, setImportError] = useState("");
  const [previewCert, setPreviewCert] = useState(null); // Found certificate for review

  // Duplicate Detection
  const [duplicateMatch, setDuplicateMatch] = useState(null);

  // Refetch Modal State
  const [refetchModalData, setRefetchModalData] = useState(null); // { current, fetched, busy }

  // Edit / Manual State
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({});

  // Delete State
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const model = MODELS.certifications;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "certifications"));
      const fetched = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      fetched.sort(
        (a, b) =>
          Number(a.order ?? a.displayOrder ?? 999) -
          Number(b.order ?? b.displayOrder ?? 999)
      );
      setItems(fetched);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Check Duplicate
  const checkDuplicate = (certId, url) => {
    const cleanUrl = (url || "").trim().toLowerCase();
    const cleanId = (certId || "").trim().toUpperCase();

    return items.find((item) => {
      const itemUrl = (
        item.verificationUrl ||
        item.credentialUrl ||
        item.sourceCredentialUrl ||
        item.credential_url ||
        ""
      )
        .trim()
        .toLowerCase();
      const itemId = (item.credentialId || "").trim().toUpperCase();

      if (cleanUrl && itemUrl && cleanUrl === itemUrl) return true;
      if (cleanId && cleanId !== "NOT PROVIDED" && itemId && itemId !== "NOT PROVIDED" && cleanId === itemId) {
        return true;
      }
      return false;
    });
  };

  // Fetch Certificate from Backend
  const handleFetchCertificate = async (e) => {
    if (e) e.preventDefault();
    if (!importUrl || !importUrl.trim()) {
      setImportError("Please enter a valid credential or verification URL.");
      return;
    }

    setFetching(true);
    setImportError("");
    setDuplicateMatch(null);

    try {
      const data = await fetchCredentialApi(importUrl.trim());

      if (!data.success || !data.certificate) {
        setImportError(
          data.message || "Couldn't automatically retrieve certificate details."
        );
        setFetching(false);
        return;
      }

      const fetchedCert = data.certificate;

      // Duplicate check
      const dup = checkDuplicate(fetchedCert.credentialId, fetchedCert.verificationUrl);
      if (dup) {
        setDuplicateMatch(dup);
        setImportError("This credential already exists in your portfolio.");
        setFetching(false);
        return;
      }

      // Found! Show editable preview
      setPreviewCert({
        name: fetchedCert.name || "",
        organization: fetchedCert.organization || "",
        issuer: fetchedCert.issuer || fetchedCert.organization || "",
        issueDate: fetchedCert.issueDate || "JUL 2026",
        expiryDate: fetchedCert.expiryDate || "",
        expiryStatus: fetchedCert.expiryStatus || "Not provided",
        noExpiry: Boolean(fetchedCert.noExpiry),
        credentialId: fetchedCert.credentialId || "Not provided",
        credentialUrl: fetchedCert.credentialUrl || importUrl,
        verificationUrl: fetchedCert.verificationUrl || importUrl,
        sourceCredentialUrl: importUrl,
        description: fetchedCert.description || "",
        category: fetchedCert.category || "Professional Certification",
        imageUrl: fetchedCert.imageUrl || "",
        status: "published",
        featured: false,
        verified: true,
      });
    } catch (err) {
      setImportError("Couldn't automatically retrieve certificate details.");
    }
    setFetching(false);
  };

  // Confirm and Save from Preview
  const handleConfirmAndAdd = async () => {
    if (!previewCert || !previewCert.name.trim()) return;

    try {
      const docRef = doc(collection(db, "certifications"));
      const finalPayload = {
        ...previewCert,
        order: items.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(docRef, finalPayload);
      clearContentCache();
      setNotice(`"${previewCert.name}" imported and saved ✓`);
      setPreviewCert(null);
      setIsUrlBoxOpen(false);
      setImportUrl("");
      refresh();
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setImportError("Failed to save certificate: " + err.message);
    }
  };

  // Fallback to manual entry
  const handleOpenManualEntry = () => {
    const initial = valuesFromItem(model.fields, null);
    if (importUrl) {
      initial.sourceCredentialUrl = importUrl;
      initial.verificationUrl = importUrl;
    }
    initial.order = items.length;
    initial.status = "published";
    setValues(initial);
    setEditing("new");
    setPreviewCert(null);
    setIsUrlBoxOpen(false);
    setImportError("");
  };

  // Re-fetch details comparison
  const handleStartRefetch = async (item) => {
    const targetUrl =
      item.sourceCredentialUrl ||
      item.verificationUrl ||
      item.credentialUrl ||
      item.credential_url;

    if (!targetUrl || !targetUrl.startsWith("http")) {
      alert("No valid source credential URL found for this certificate.");
      return;
    }

    setRefetchModalData({
      current: item,
      fetched: null,
      loading: true,
      error: "",
    });

    try {
      const data = await fetchCredentialApi(targetUrl);
      if (!data.success || !data.certificate) {
        setRefetchModalData((prev) => ({
          ...prev,
          loading: false,
          error: data.message || "Could not retrieve updated credential details.",
        }));
        return;
      }

      setRefetchModalData((prev) => ({
        ...prev,
        loading: false,
        fetched: data.certificate,
      }));
    } catch (err) {
      setRefetchModalData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to connect to the credential provider.",
      }));
    }
  };

  const handleApplyRefetchChanges = async () => {
    if (!refetchModalData || !refetchModalData.fetched) return;
    const { current, fetched } = refetchModalData;

    try {
      const updated = {
        name: fetched.name || current.name,
        organization: fetched.organization || current.organization,
        issuer: fetched.issuer || current.issuer || fetched.organization,
        issueDate: fetched.issueDate || current.issueDate,
        expiryStatus: fetched.expiryStatus || current.expiryStatus,
        credentialId:
          fetched.credentialId !== "Not provided"
            ? fetched.credentialId
            : current.credentialId,
        verificationUrl: fetched.verificationUrl || current.verificationUrl,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, "certifications", String(current.id)), updated);
      clearContentCache();
      setNotice("Credential details updated ✓");
      setRefetchModalData(null);
      refresh();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      alert("Failed to apply changes: " + err.message);
    }
  };

  // Standard Save
  const handleSaveItem = async () => {
    setError("");
    const payload = buildPayload(model, values);
    if (!payload.name || !payload.organization) {
      setError("Certificate name and issuing organization are required.");
      return;
    }

    try {
      if (editing === "new") {
        if (payload.order === undefined || payload.order === null) {
          payload.order = items.length;
        }
        payload.createdAt = new Date().toISOString();
        const docRef = doc(collection(db, "certifications"));
        await setDoc(docRef, payload);
      } else {
        await setDoc(doc(db, "certifications", String(editing.id)), payload, {
          merge: true,
        });
      }

      clearContentCache();
      setNotice(`Saved ✓`);
      setEditing(null);
      refresh();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError("Save failed: " + err.message);
    }
  };

  // Move priority order
  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const currentItem = items[index];
    const targetItem = items[targetIndex];

    try {
      await updateDoc(doc(db, "certifications", String(currentItem.id)), {
        order: targetIndex,
      });
      await updateDoc(doc(db, "certifications", String(targetItem.id)), {
        order: index,
      });
      clearContentCache();
      refresh();
    } catch (err) {
      setError("Reorder failed: " + err.message);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteBusy(true);
    try {
      await deleteDoc(doc(db, "certifications", String(itemToDelete.id)));
      clearContentCache();
      setItems((prev) => prev.filter((i) => String(i.id) !== String(itemToDelete.id)));
      setNotice("Certificate deleted ✓");
      setItemToDelete(null);
      refresh();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
    setDeleteBusy(false);
  };

  // Toggle Featured status
  const handleToggleFeatured = async (item) => {
    try {
      const newFeatured = !item.featured;
      await updateDoc(doc(db, "certifications", String(item.id)), {
        featured: newFeatured,
        updatedAt: new Date().toISOString(),
      });
      clearContentCache();
      setNotice(`"${item.name}" ${newFeatured ? "marked as Featured ★" : "unfeatured"}`);
      refresh();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError("Failed to update featured state: " + err.message);
    }
  };

  // Toggle Visibility status (Published vs Draft)
  const handleToggleVisibility = async (item) => {
    try {
      const isHidden = item.visible === false || item.status === "draft";
      const nextVisible = isHidden;
      await updateDoc(doc(db, "certifications", String(item.id)), {
        visible: nextVisible,
        status: nextVisible ? "published" : "draft",
        updatedAt: new Date().toISOString(),
      });
      clearContentCache();
      setNotice(`"${item.name}" is now ${nextVisible ? "Visible on portfolio ✓" : "Hidden from portfolio"}`);
      refresh();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError("Failed to update visibility: " + err.message);
    }
  };

  // Filtered Items via Search and Category
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      if (categoryFilter !== "All") {
        const cat = (item.category || "").toLowerCase();
        const text = `${item.name || ""} ${item.description || ""}`.toLowerCase();
        let derivedCat = "other";
        if (cat) {
          derivedCat = cat;
        } else if (text.includes("ai") || text.includes("artificial intelligence") || text.includes("generative")) {
          derivedCat = "ai";
        } else if (text.includes("cloud") || text.includes("aws") || text.includes("azure")) {
          derivedCat = "cloud";
        } else if (text.includes("software") || text.includes("jira") || text.includes("agile")) {
          derivedCat = "software";
        } else if (text.includes("python") || text.includes("javascript") || text.includes("html") || text.includes("css") || text.includes("programming") || text.includes("developer")) {
          derivedCat = "programming";
        }
        if (derivedCat.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      if (!q) return true;
      const name = (item.name || "").toLowerCase();
      const org = (item.organization || item.issuer || item.provider || "").toLowerCase();
      const id = (item.credentialId || "").toLowerCase();
      const skills = (item.skills || "").toLowerCase();
      return name.includes(q) || org.includes(q) || id.includes(q) || skills.includes(q);
    });
  }, [items, searchQuery, categoryFilter]);

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-panel__head">
        <div>
          <h2>Certifications</h2>
          <p className="admin-muted" style={{ marginTop: "4px" }}>
            {items.length} total credentials live in Firestore
          </p>
        </div>
        <div className="admin-panel__actions">
          {notice ? <span className="admin-notice">{notice}</span> : null}
          <button className="admin-btn" onClick={refresh}>
            ↻ Refresh
          </button>
          <button
            className="admin-btn admin-btn--primary"
            onClick={() => {
              setIsUrlBoxOpen((v) => !v);
              setImportError("");
              setDuplicateMatch(null);
            }}
          >
            + ADD CERTIFICATE
          </button>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      {/* ═══ 1. URL-FIRST CERTIFICATE IMPORTER BOX ═══ */}
      {isUrlBoxOpen && (
        <div className="admin-importer-box">
          <div className="admin-importer-box__head">
            <h3>⚡ Automatic Credential Import</h3>
            <button
              className="admin-btn admin-btn--sm"
              onClick={() => setIsUrlBoxOpen(false)}
            >
              Close ✕
            </button>
          </div>

          <form onSubmit={handleFetchCertificate}>
            <label className="admin-field" style={{ marginBottom: "12px" }}>
              <span>CREDENTIAL / VERIFICATION URL *</span>
              <div className="admin-importer-input-row">
                <input
                  type="url"
                  placeholder="https://coursera.org/verify/..."
                  value={importUrl}
                  onChange={(e) => {
                    setImportUrl(e.target.value);
                    setImportError("");
                    setDuplicateMatch(null);
                  }}
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={fetching}
                  style={{ minWidth: "160px", justifyContent: "center" }}
                >
                  {fetching ? "FETCHING…" : "FETCH CERTIFICATE"}
                </button>
              </div>
            </label>
          </form>

          {/* Fallback Message & Manual Action */}
          {importError && (
            <div style={{ padding: "12px", background: "rgba(255, 100, 100, 0.08)", border: "1px solid rgba(255, 100, 100, 0.25)", borderRadius: "10px" }}>
              <p style={{ color: "#ff8086", fontSize: "13.5px", marginBottom: "8px" }}>
                {importError}
              </p>
              {duplicateMatch ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--sm"
                  onClick={() => {
                    setSearchQuery(duplicateMatch.name);
                    setIsUrlBoxOpen(false);
                  }}
                >
                  VIEW EXISTING →
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-btn admin-btn--sm admin-btn--primary"
                  onClick={handleOpenManualEntry}
                >
                  ENTER DETAILS MANUALLY
                </button>
              )}
            </div>
          )}

          {!importError && !fetching && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="admin-muted" style={{ fontSize: "12px" }}>
                Supports Coursera, Credly, Google, IBM, Cisco, Microsoft, AWS, Udemy, and generic accreditation pages.
              </span>
              <button
                type="button"
                className="admin-btn admin-btn--sm"
                onClick={handleOpenManualEntry}
              >
                Enter Details Manually
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ 4. EDITABLE PREVIEW MODAL BEFORE SAVING ═══ */}
      {previewCert && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__head">
              <h3>CERTIFICATE FOUND</h3>
              <button
                className="admin-modal__close"
                onClick={() => setPreviewCert(null)}
              >
                ✕
              </button>
            </div>

            <p className="admin-muted" style={{ fontSize: "13px" }}>
              Review or edit extracted details before confirming and adding to your live portfolio.
            </p>

            <div className="admin-preview-grid">
              <div className="admin-preview-row">
                <label>Name</label>
                <input
                  type="text"
                  value={previewCert.name}
                  onChange={(e) =>
                    setPreviewCert((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>

              <div className="admin-preview-row">
                <label>Organization</label>
                <input
                  type="text"
                  value={previewCert.organization}
                  onChange={(e) =>
                    setPreviewCert((s) => ({ ...s, organization: e.target.value }))
                  }
                />
              </div>

              <div className="admin-preview-row">
                <label>Issue Date</label>
                <input
                  type="text"
                  value={previewCert.issueDate}
                  onChange={(e) =>
                    setPreviewCert((s) => ({ ...s, issueDate: e.target.value }))
                  }
                />
              </div>

              <div className="admin-preview-row">
                <label>Credential ID</label>
                <input
                  type="text"
                  value={previewCert.credentialId}
                  onChange={(e) =>
                    setPreviewCert((s) => ({ ...s, credentialId: e.target.value }))
                  }
                />
              </div>

              <div className="admin-preview-row">
                <label>Expiry</label>
                <input
                  type="text"
                  value={previewCert.expiryStatus}
                  onChange={(e) =>
                    setPreviewCert((s) => ({ ...s, expiryStatus: e.target.value }))
                  }
                />
              </div>

              <div className="admin-preview-row">
                <label>Verification URL</label>
                <input
                  type="text"
                  value={previewCert.verificationUrl}
                  onChange={(e) =>
                    setPreviewCert((s) => ({ ...s, verificationUrl: e.target.value }))
                  }
                />
              </div>

              {previewCert.imageUrl && (
                <div className="admin-preview-row">
                  <label>Image Preview</label>
                  <img
                    src={previewCert.imageUrl}
                    alt="Certificate Badge"
                    style={{ maxHeight: "60px", objectFit: "contain", borderRadius: "6px" }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="admin-btn" onClick={() => setPreviewCert(null)}>
                CANCEL
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleConfirmAndAdd}
              >
                CONFIRM &amp; ADD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 17. REFETCH DETAILS COMPARISON MODAL ═══ */}
      {refetchModalData && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "620px" }}>
            <div className="admin-modal__head">
              <h3>REFETCH DETAILS</h3>
              <button
                className="admin-modal__close"
                onClick={() => setRefetchModalData(null)}
              >
                ✕
              </button>
            </div>

            {refetchModalData.loading ? (
              <p className="admin-muted">Retrieving latest public credential information…</p>
            ) : refetchModalData.error ? (
              <p className="admin-error">{refetchModalData.error}</p>
            ) : refetchModalData.fetched ? (
              <>
                <p className="admin-muted" style={{ fontSize: "13px" }}>
                  Compare your current database record against newly fetched information. Choose whether to apply updates.
                </p>
                <table className="admin-compare-table">
                  <thead>
                    <tr>
                      <th>FIELD</th>
                      <th>CURRENT</th>
                      <th>FETCHED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: "name", label: "Name" },
                      { key: "organization", label: "Organization" },
                      { key: "issueDate", label: "Issue Date" },
                      { key: "expiryStatus", label: "Expiry" },
                      { key: "credentialId", label: "Credential ID" },
                    ].map((f) => {
                      const curVal =
                        refetchModalData.current[f.key] ||
                        (f.key === "issueDate" ? refetchModalData.current.date : "") ||
                        "—";
                      const fetchVal = refetchModalData.fetched[f.key] || "—";
                      const isDiff =
                        curVal.toLowerCase().trim() !== fetchVal.toLowerCase().trim();

                      return (
                        <tr key={f.key} className={isDiff ? "is-diff" : ""}>
                          <td>
                            <strong>{f.label}</strong>
                            {isDiff && <span className="admin-compare-diff-badge">Changed</span>}
                          </td>
                          <td style={{ color: isDiff ? "var(--text-dim)" : "var(--text)" }}>{curVal}</td>
                          <td style={{ color: isDiff ? "var(--accent)" : "var(--text)" }}>{fetchVal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                  <button className="admin-btn" onClick={() => setRefetchModalData(null)}>
                    KEEP CURRENT
                  </button>
                  <button
                    className="admin-btn admin-btn--primary"
                    onClick={handleApplyRefetchChanges}
                  >
                    APPLY FETCHED CHANGES
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ═══ 16. MANUAL EDIT / NEW FORM ═══ */}
      {editing ? (
        <div className="admin-edit">
          <h3>
            {editing === "new"
              ? "New Certificate"
              : `Edit ${editing.name || "Certificate"}`}
          </h3>
          <div className="admin-edit__grid">
            {model.fields.map((f) => (
              <label
                key={f.key}
                className={`admin-field ${
                  f.type === "lines" || f.type === "textarea" || f.type === "json"
                    ? "admin-field--wide"
                    : ""
                }`}
              >
                <span>{f.label}</span>
                <FieldInput
                  field={f}
                  value={values[f.key]}
                  onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
                />
              </label>
            ))}
          </div>
          <div className="admin-edit__foot">
            <button className="admin-btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="admin-btn admin-btn--primary" onClick={handleSaveItem}>
              Save Certificate
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Search bar & Category filter toolbar */}
          <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
            <div className="admin-search">
              <input
                type="text"
                placeholder="Search certificate, organization, ID, skills…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
              <span className="admin-muted" style={{ fontSize: "11.5px", marginRight: "4px" }}>Filter:</span>
              {["All", "AI", "Cloud", "Software", "Programming", "Other"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`admin-btn admin-btn--sm ${categoryFilter === cat ? "admin-btn--primary" : ""}`}
                  style={{ fontSize: "11px", padding: "4px 10px" }}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Certificate List */}
          <ul className="admin-list">
            {filteredItems.map((item, idx) => {
              const isDraft = item.status === "draft" || item.published === false || item.visible === false;
              const hasUrl = Boolean(
                item.sourceCredentialUrl ||
                item.verificationUrl ||
                item.credentialUrl ||
                item.credential_url
              );

              return (
                <li key={item.id} className="admin-list__item">
                  <div className="admin-list__left">
                    <span
                      className="admin-list__orderBadge"
                      title={`Display Order: ${item.sortOrder ?? item.order ?? idx}`}
                    >
                      #{idx + 1}
                    </span>
                    <div className="admin-list__main">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <strong>{item.name}</strong>
                        {isDraft ? (
                          <span className="admin-badge admin-badge--draft">DRAFT</span>
                        ) : (
                          <span className="admin-badge admin-badge--published">PUBLISHED</span>
                        )}
                        {item.featured && (
                          <span className="admin-badge admin-badge--featured">FEATURED</span>
                        )}
                        {item.category && (
                          <span className="admin-badge" style={{ fontSize: "9.5px" }}>
                            {String(item.category).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="admin-muted">
                        {item.organization || item.issuer || item.provider || "Independent"} · {item.issueDate || item.date || "2026"}
                        {item.credentialId && item.credentialId !== "Not provided" ? ` · ID: ${item.credentialId}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="admin-list__tools">
                    {/* Instant Feature / Unfeature Button */}
                    <button
                      type="button"
                      className={`admin-btn admin-btn--sm ${
                        item.featured ? "admin-btn--featured-active" : ""
                      }`}
                      onClick={() => handleToggleFeatured(item)}
                      title={item.featured ? "Click to unfeature" : "Click to feature at top of portfolio"}
                    >
                      {item.featured ? "★ Featured" : "☆ Feature"}
                    </button>

                    {/* Instant Visibility Toggle (Show / Hide) */}
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm"
                      onClick={() => handleToggleVisibility(item)}
                      title={isDraft ? "Click to publish on portfolio" : "Click to hide from portfolio"}
                    >
                      {isDraft ? "Show" : "Hide"}
                    </button>

                    {/* Reorder */}
                    <div className="admin-reorder-btns">
                      <button
                        type="button"
                        className="admin-reorder-btn"
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="admin-reorder-btn"
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === items.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                    </div>

                    {/* Re-fetch details button */}
                    {hasUrl && (
                      <button
                        className="admin-btn admin-btn--sm"
                        onClick={() => handleStartRefetch(item)}
                        title="Re-fetch latest public details"
                      >
                        ↻ Re-fetch
                      </button>
                    )}

                    <button
                      className="admin-btn admin-btn--sm"
                      onClick={() => {
                        setValues(valuesFromItem(model.fields, item));
                        setEditing(item);
                        setError("");
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="admin-btn admin-btn--sm admin-btn--danger"
                      onClick={() => setItemToDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
            {!loading && filteredItems.length === 0 && (
              <p className="admin-muted">No certificates match your search.</p>
            )}
          </ul>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <DeleteConfirmModal
          title={itemToDelete.name}
          onCancel={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          busy={deleteBusy}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Generic Content Manager (Projects, Skills, Experience, Education)   */
/* ------------------------------------------------------------------ */

function ContentManager({ modelKey }) {
  const model = MODELS[modelKey];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (model.isSingleton) {
        const snap = await getDocs(collection(db, model.collection));
        if (!snap.empty) {
          setItems([{ id: snap.docs[0].id, ...snap.docs[0].data() }]);
        } else {
          setItems([]);
        }
      } else {
        const snap = await getDocs(collection(db, model.collection));
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        fetched.sort(
          (a, b) =>
            Number(a.order ?? a.displayOrder ?? 999) -
            Number(b.order ?? b.displayOrder ?? 999)
        );
        setItems(fetched);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [model.collection, model.isSingleton]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const beginNew = () => {
    const initial = valuesFromItem(model.fields, null);
    if ("order" in initial) {
      initial.order = items.length;
    }
    initial.status = "published";
    setValues(initial);
    setEditing("new");
    setError("");
  };

  const beginEdit = (item) => {
    setValues(valuesFromItem(model.fields, item));
    setEditing(item);
    setError("");
  };

  const save = async () => {
    setError("");
    const payload = buildPayload(model, values);

    // Validation
    for (const f of model.fields) {
      if (f.required && !payload[f.key]) {
        setError(`${f.label} is required.`);
        return;
      }
    }

    try {
      if (editing === "new") {
        if (payload.order === undefined || payload.order === null) {
          payload.order = items.length;
        }
        payload.createdAt = new Date().toISOString();
        const docRef = doc(collection(db, model.collection));
        await setDoc(docRef, payload);
      } else if (model.isSingleton) {
        const targetId = editing?.id || "main";
        await setDoc(doc(db, model.collection, targetId), payload, { merge: true });
      } else {
        await setDoc(doc(db, model.collection, String(editing.id)), payload, {
          merge: true,
        });
      }

      clearContentCache();
      setNotice(`${model.singular} saved ✓`);
      setEditing(null);
      refresh();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError("Save failed: " + err.message);
    }
  };

  const moveItem = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const currentItem = items[index];
    const targetItem = items[targetIndex];

    try {
      await updateDoc(doc(db, model.collection, String(currentItem.id)), {
        order: targetIndex,
      });
      await updateDoc(doc(db, model.collection, String(targetItem.id)), {
        order: index,
      });
      clearContentCache();
      refresh();
    } catch (err) {
      setError("Reorder failed: " + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || model.isSingleton) return;
    setDeleteBusy(true);
    try {
      await deleteDoc(doc(db, model.collection, String(itemToDelete.id)));
      clearContentCache();
      setItems((prev) => prev.filter((i) => String(i.id) !== String(itemToDelete.id)));
      setNotice(`Deleted ${model.singular} ✓`);
      setItemToDelete(null);
      refresh();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
    setDeleteBusy(false);
  };

  const toggleVisibility = async (item) => {
    if (!item || model.isSingleton) return;
    const isCurrentlyHidden =
      item.status === "draft" || item.published === false || item.visible === false;
    const newStatus = isCurrentlyHidden ? "published" : "draft";
    const newVisible = isCurrentlyHidden;

    try {
      await updateDoc(doc(db, model.collection, String(item.id)), {
        status: newStatus,
        visible: newVisible,
        published: newVisible,
      });
      clearContentCache();
      setNotice(`${headline(item)} is now ${newVisible ? "VISIBLE" : "HIDDEN"} ✓`);
      refresh();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError("Failed to update visibility: " + err.message);
    }
  };

  const headline = (item) =>
    item.name ||
    item.title ||
    item.position ||
    item.degree ||
    item.institution ||
    item.company ||
    `#${item.id}`;

  const subtitle = (item) =>
    item.category || item.company || item.institution || item.location || "";

  // Search filter
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || model.isSingleton) return items;
    return items.filter((item) => {
      const h = headline(item).toLowerCase();
      const s = subtitle(item).toLowerCase();
      const tech = Array.isArray(item.technologies)
        ? item.technologies.join(" ").toLowerCase()
        : "";
      return h.includes(q) || s.includes(q) || tech.includes(q);
    });
  }, [items, searchQuery, model.isSingleton]);

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <div>
          <h2>{model.label}</h2>
          {!model.isSingleton && (
            <p className="admin-muted" style={{ marginTop: "4px" }}>
              {items.length} items live in Firestore
            </p>
          )}
        </div>
        <div className="admin-panel__actions">
          {notice ? <span className="admin-notice">{notice}</span> : null}
          <button className="admin-btn" onClick={refresh}>
            ↻ Refresh
          </button>
          {!model.isSingleton && (
            <button className="admin-btn admin-btn--primary" onClick={beginNew}>
              + New {model.singular}
            </button>
          )}
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      {editing ? (
        <div className="admin-edit">
          <h3>
            {editing === "new" ? `New ${model.singular}` : `Edit ${headline(editing)}`}
          </h3>
          <div className="admin-edit__grid">
            {model.fields.map((f) => (
              <label
                key={f.key}
                className={`admin-field ${
                  f.type === "lines" || f.type === "textarea" || f.type === "json"
                    ? "admin-field--wide"
                    : ""
                }`}
              >
                <span>{f.label}</span>
                <FieldInput
                  field={f}
                  value={values[f.key]}
                  onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
                />
              </label>
            ))}
          </div>
          <div className="admin-edit__foot">
            <button className="admin-btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="admin-btn admin-btn--primary" onClick={save}>
              Save
            </button>
          </div>
        </div>
      ) : model.isSingleton ? (
        <div style={{ marginTop: "16px" }}>
          {items.length > 0 ? (
            <div className="admin-list__item" style={{ padding: "20px" }}>
              <div className="admin-list__main">
                <strong style={{ fontSize: "18px" }}>{items[0].name}</strong>
                <p className="admin-muted" style={{ marginTop: "6px" }}>
                  {items[0].role} · {items[0].location}
                </p>
                <p style={{ marginTop: "10px", color: "var(--text-dim)", fontSize: "14px", lineHeight: "1.6" }}>
                  {items[0].summary}
                </p>
              </div>
              <button
                className="admin-btn admin-btn--primary"
                onClick={() => beginEdit(items[0])}
              >
                Edit Profile Content
              </button>
            </div>
          ) : (
            <p className="admin-muted">
              Profile not found in Firestore. Sync from Overview tab.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="admin-search">
            <input
              type="text"
              placeholder={`Search ${model.label.toLowerCase()}…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ul className="admin-list">
            {filteredItems.map((item, idx) => {
              const isDraft = item.status === "draft" || item.published === false;

              return (
                <li key={item.id} className="admin-list__item">
                  <div className="admin-list__left">
                    <span
                      className="admin-list__orderBadge"
                      title={`Order: ${item.order ?? idx}`}
                    >
                      #{idx + 1}
                    </span>
                    <div className="admin-list__main">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <strong>{headline(item)}</strong>
                        {isDraft ? (
                          <span className="admin-badge admin-badge--draft">DRAFT</span>
                        ) : (
                          <span className="admin-badge admin-badge--published">PUBLISHED</span>
                        )}
                        {item.featured && (
                          <span className="admin-badge admin-badge--featured">FEATURED</span>
                        )}
                      </div>
                      <span className="admin-muted">{subtitle(item)}</span>
                    </div>
                  </div>

                  <div className="admin-list__tools">
                    <div className="admin-reorder-btns">
                      <button
                        type="button"
                        className="admin-reorder-btn"
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="admin-reorder-btn"
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === items.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      className={`admin-btn admin-btn--sm ${isDraft ? "admin-btn--primary" : ""}`}
                      onClick={() => toggleVisibility(item)}
                      title={isDraft ? "Publish / Show on public portfolio" : "Hide from public portfolio"}
                    >
                      {isDraft ? "Show" : "Hide"}
                    </button>
                    <button
                      className="admin-btn admin-btn--sm"
                      onClick={() => beginEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn admin-btn--sm admin-btn--danger"
                      onClick={() => setItemToDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
            {!loading && filteredItems.length === 0 && (
              <p className="admin-muted">No items match your search.</p>
            )}
          </ul>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <DeleteConfirmModal
          title={headline(itemToDelete)}
          onCancel={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          busy={deleteBusy}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Messages Inbox                                                     */
/* ------------------------------------------------------------------ */

function MessagesManager() {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "messages"));
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      fetched.sort((a, b) => {
        const ta = a.created_at?.toMillis?.() || 0;
        const tb = b.created_at?.toMillis?.() || 0;
        return tb - ta;
      });
      setMsgs(fetched);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleHandled = async (msg) => {
    try {
      await updateDoc(doc(db, "messages", msg.id), { handled: !msg.handled });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <h2>Contact Messages</h2>
        <button className="admin-btn" onClick={refresh}>
          ↻ Refresh
        </button>
      </div>
      {loading ? (
        <p className="admin-muted">Loading messages…</p>
      ) : (
        <ul className="admin-msgs">
          {msgs.map((m) => (
            <li key={m.id} className={`admin-msg ${m.handled ? "is-handled" : ""}`}>
              <div className="admin-msg__head">
                <strong>{m.name}</strong>
                <a href={`mailto:${m.email}`} className="admin-msg__mail">
                  {m.email}
                </a>
                <span className="admin-msg__date">
                  {m.created_at?.toDate
                    ? m.created_at.toDate().toLocaleString()
                    : ""}
                </span>
                <button
                  className="admin-btn admin-btn--sm"
                  onClick={() => toggleHandled(m)}
                >
                  {m.handled ? "Reopen" : "Mark Done"}
                </button>
              </div>
              <p className="admin-msg__body">{m.message}</p>
            </li>
          ))}
          {!loading && msgs.length === 0 && (
            <p className="admin-muted">No messages in inbox yet.</p>
          )}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Résumé Management Panel                                           */
/* ------------------------------------------------------------------ */

function ResumeManager() {
  const [loading, setLoading] = useState(true);
  const [activeUrl, setActiveUrl] = useState(CANONICAL_RESUME_PATH);
  const [customUrl, setCustomUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "profile", "main"));
      if (snap.exists()) {
        const data = snap.data();
        const resolved = getActiveResumeUrl(data);
        setActiveUrl(resolved);
        setCustomUrl(resolved);
      } else {
        setActiveUrl(CANONICAL_RESUME_PATH);
        setCustomUrl(CANONICAL_RESUME_PATH);
      }
    } catch (err) {
      console.warn("Resume fetch warning:", err.message);
      setActiveUrl(CANONICAL_RESUME_PATH);
      setCustomUrl(CANONICAL_RESUME_PATH);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateActiveResume = async (newUrl) => {
    setError("");
    setNotice("");
    try {
      await setDoc(doc(db, "profile", "main"), { resume_url: newUrl }, { merge: true });
      clearContentCache();
      setActiveUrl(newUrl);
      setCustomUrl(newUrl);
      setNotice("Active résumé updated successfully! Reflecting live on portfolio ✓");
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setError("Failed to update résumé: " + err.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF document (.pdf)");
      return;
    }

    setUploading(true);
    setError("");
    setNotice("");

    try {
      if (!storage) {
        throw new Error(
          "Firebase Storage is not initialized in this environment. You can set a custom URL or use the canonical PDF."
        );
      }
      const fileRef = ref(storage, `resumes/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      await updateActiveResume(downloadUrl);
      setNotice(`Uploaded "${file.name}" and set as active résumé ✓`);
    } catch (err) {
      setError("Upload failed: " + err.message);
    }
    setUploading(false);
  };

  const handleResetCanonical = async () => {
    if (
      !window.confirm(
        `Reset active résumé to default canonical file (${CANONICAL_RESUME_PATH})?`
      )
    )
      return;
    await updateActiveResume(CANONICAL_RESUME_PATH);
  };

  const filename = getResumeFilename(activeUrl);
  const isCanonical = activeUrl === CANONICAL_RESUME_PATH;

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <div>
          <h2>Active Résumé Management</h2>
          <p className="admin-muted" style={{ marginTop: "4px" }}>
            Single managed resource consumed by Navigation, Hero CTA, and Contact section.
          </p>
        </div>
        <div className="admin-panel__actions">
          {notice ? <span className="admin-notice">{notice}</span> : null}
          <button className="admin-btn" onClick={refresh}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-resume-grid">
        {/* Left Column: Active Resume Status & Management */}
        <div className="admin-resume-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="admin-resume-badge">
              ● {isCanonical ? "ACTIVE (CANONICAL)" : "ACTIVE (STORAGE / CUSTOM)"}
            </span>
            <span className="admin-muted" style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}>
              SOURCE: FIRESTORE
            </span>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-mute)", textTransform: "uppercase" }}>
              Active Filename
            </label>
            <div style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px", wordBreak: "break-all" }}>
              {filename}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-mute)", textTransform: "uppercase" }}>
              Current Active URL / Path
            </label>
            <div style={{ fontSize: "12.5px", fontFamily: "var(--font-mono)", color: "var(--text-dim)", marginTop: "4px", wordBreak: "break-all", background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "6px" }}>
              {activeUrl}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
            <a
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
              className="admin-btn admin-btn--sm"
            >
              Open in New Tab ↗
            </a>
            <a
              href={activeUrl}
              download={filename}
              className="admin-btn admin-btn--sm"
            >
              Test Download ↓
            </a>
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              onClick={handleResetCanonical}
              disabled={isCanonical}
            >
              Reset to Canonical
            </button>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "8px 0" }} />

          {/* Upload New Resume */}
          <div>
            <h4 style={{ fontSize: "13.5px", marginBottom: "8px", fontWeight: "600" }}>Upload &amp; Replace Active Résumé</h4>
            <label className="admin-dropzone">
              <span style={{ fontSize: "24px" }}>📄</span>
              <span style={{ fontWeight: "600", fontSize: "13px" }}>
                {uploading ? "Uploading to Cloud Storage..." : "Choose or drag new PDF résumé"}
              </span>
              <span className="admin-muted" style={{ fontSize: "11.5px" }}>
                Accepts .pdf (Updates all portfolio links instantly)
              </span>
              <input
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Direct URL Update */}
          <div style={{ marginTop: "4px" }}>
            <h4 style={{ fontSize: "13.5px", marginBottom: "8px", fontWeight: "600" }}>Or Set Custom Résumé URL / Path</h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="/resume/Saumya_Mirajkar_Resume.pdf or https://..."
                className="admin-input"
                style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line-strong)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "13px" }}
              />
              <button
                type="button"
                className="admin-btn admin-btn--primary admin-btn--sm"
                onClick={() => updateActiveResume(customUrl)}
              >
                Set Active
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Embedded Preview */}
        <div className="admin-resume-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "14px", margin: 0, fontWeight: "600" }}>Live Document Preview</h4>
            <span className="admin-muted" style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)" }}>
              {filename}
            </span>
          </div>
          <iframe
            src={`${activeUrl}#toolbar=0`}
            title="Active Résumé Preview"
            className="admin-resume-preview-frame"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview Dashboard Tab                                             */
/* ------------------------------------------------------------------ */

function Overview({ onLogout, onSelectTab }) {
  const [counts, setCounts] = useState({
    certifications: 0,
    projects: 0,
    skills: 0,
    experience: 0,
    education: 0,
  });
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const collections = ["certifications", "projects", "skills", "experience", "education"];
        const res = await Promise.all(collections.map((c) => getDocs(collection(db, c))));
        setCounts({
          certifications: res[0].size,
          projects: res[1].size,
          skills: res[2].size,
          experience: res[3].size,
          education: res[4].size,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchCounts();
  }, []);

  const handleSyncInitialData = async () => {
    if (!window.confirm("Safely sync initial portfolio content to Firestore? Existing items will not be overwritten.")) return;
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await migrateInitialData(false);
      setSyncMsg("Sync completed successfully! All items live in Firestore ✓");
      clearContentCache();
    } catch (err) {
      setSyncMsg("Sync failed: " + err.message);
    }
    setSyncing(false);
  };

  return (
    <div className="admin-panel">
      <div className="admin-overview">
        <div className="admin-panel__head">
          <div>
            <h2>CMS Overview</h2>
            <p className="admin-muted" style={{ marginTop: "4px" }}>
              Firestore is your Single Source of Truth. Changes reflect publicly in real time.
            </p>
          </div>
          <button className="admin-btn" onClick={onLogout}>
            Sign Out
          </button>
        </div>

        {/* Live Counters */}
        <div className="admin-stats" style={{ marginTop: "24px" }}>
          <div
            className="admin-stat"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectTab("certifications")}
          >
            <div className="admin-stat__value" style={{ color: "var(--accent)" }}>
              {counts.certifications}
            </div>
            <div className="admin-stat__label">CERTIFICATIONS →</div>
          </div>

          <div
            className="admin-stat"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectTab("projects")}
          >
            <div className="admin-stat__value">{counts.projects}</div>
            <div className="admin-stat__label">PROJECTS →</div>
          </div>

          <div
            className="admin-stat"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectTab("skills")}
          >
            <div className="admin-stat__value">{counts.skills}</div>
            <div className="admin-stat__label">SKILLS →</div>
          </div>

          <div
            className="admin-stat"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectTab("experience")}
          >
            <div className="admin-stat__value">{counts.experience}</div>
            <div className="admin-stat__label">EXPERIENCE →</div>
          </div>

          <div
            className="admin-stat"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectTab("education")}
          >
            <div className="admin-stat__value">{counts.education}</div>
            <div className="admin-stat__label">EDUCATION →</div>
          </div>
        </div>

        {/* Sync / Migrate Box */}
        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "14px",
          }}
        >
          <h3 style={{ fontSize: "16px", marginBottom: "6px", color: "#FFFFFF" }}>
            Database Integrity &amp; Fallback Migration
          </h3>
          <p className="admin-muted" style={{ marginBottom: "14px", fontSize: "13px" }}>
            Ensure all foundational projects, skills, education, and credentials are initialized as independent Firestore documents without duplicating existing records.
          </p>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSyncInitialData}
            disabled={syncing}
          >
            {syncing ? "Syncing…" : "⚡ Verify & Sync Initial Records"}
          </button>
          {syncMsg && (
            <p
              style={{
                marginTop: "12px",
                fontSize: "13px",
                color: syncMsg.includes("failed") ? "#ff8086" : "var(--cyan)",
              }}
            >
              {syncMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Admin Page Export                                             */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("certifications");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div style={{ padding: "40px", color: "white", fontFamily: "var(--font-mono)" }}>
        Loading CMS…
      </div>
    );

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="admin">
      <aside className="admin__side">
        <div className="admin__brand">
          <span className="admin__logo">SM</span>
          <span className="admin__brandName">Portfolio CMS</span>
        </div>
        <nav className="admin__nav">
          <button
            className={`admin__navBtn ${tab === "overview" ? "is-active" : ""}`}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            className={`admin__navBtn ${tab === "certifications" ? "is-active" : ""}`}
            onClick={() => setTab("certifications")}
          >
            Certifications ⚡
          </button>
          <button
            className={`admin__navBtn ${tab === "projects" ? "is-active" : ""}`}
            onClick={() => setTab("projects")}
          >
            Projects
          </button>
          <button
            className={`admin__navBtn ${tab === "skills" ? "is-active" : ""}`}
            onClick={() => setTab("skills")}
          >
            Skills
          </button>
          <button
            className={`admin__navBtn ${tab === "experience" ? "is-active" : ""}`}
            onClick={() => setTab("experience")}
          >
            Experience
          </button>
          <button
            className={`admin__navBtn ${tab === "education" ? "is-active" : ""}`}
            onClick={() => setTab("education")}
          >
            Education
          </button>
          <button
            className={`admin__navBtn ${tab === "profile" ? "is-active" : ""}`}
            onClick={() => setTab("profile")}
          >
            Profile &amp; About
          </button>
          <button
            className={`admin__navBtn ${tab === "resume" ? "is-active" : ""}`}
            onClick={() => setTab("resume")}
          >
            Active Résumé 📄
          </button>
          <button
            className={`admin__navBtn ${tab === "messages" ? "is-active" : ""}`}
            onClick={() => setTab("messages")}
          >
            Messages
          </button>
        </nav>
        <div className="admin__foot">
          <Link
            href="/"
            className="admin-btn"
            style={{ width: "100%", justifyContent: "center" }}
          >
            View Live Site ↗
          </Link>
        </div>
      </aside>
      <main className="admin__main">
        {tab === "overview" && (
          <Overview onLogout={() => signOut(auth)} onSelectTab={setTab} />
        )}
        {tab === "certifications" && <CertificationsManager />}
        {tab === "resume" && <ResumeManager />}
        {tab in MODELS && tab !== "certifications" && (
          <ContentManager modelKey={tab} />
        )}
        {tab === "messages" && <MessagesManager />}
      </main>
    </div>
  );
}
