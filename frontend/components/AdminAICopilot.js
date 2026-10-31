"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import {
  getGeminiApiKey,
  setGeminiApiKey,
  hasGeminiApiKey,
  analyzeCertificate,
  planAdminAction,
  executeAdminAction,
  revertLastAction,
  getUndoStack,
} from "@/lib/admin-ai";

export default function AdminAICopilot({
  onRefreshData = () => {},
  currentTab = "overview",
  onSelectTab = () => {},
  isFloatingDrawer = false,
  onCloseDrawer = () => {},
}) {
  // Main AI State
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "intro",
      role: "assistant",
      text: "Hello! I am your AI Admin Copilot. I can edit anything on your portfolio, add new certificates from links, PDFs, or images, update profile details, manage projects & skills, and remove items on command. What would you like to update?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [undoNotice, setUndoNotice] = useState("");

  // Certificate Ingestion Mode & Drag/Drop
  const [activeMode, setActiveMode] = useState("all"); // 'all' | 'cert_link' | 'cert_file' | 'remove'
  const [certUrl, setCertUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewCert, setPreviewCert] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [keyStatus, setKeyStatus] = useState({ connected: false, checking: false, message: "" });

  // Portfolio Snapshot
  const [portfolioSnapshot, setPortfolioSnapshot] = useState({});
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Initialize Snapshot & API Key
  const loadSnapshot = useCallback(async () => {
    try {
      const collectionsToLoad = ["certifications", "projects", "skills", "experience", "education"];
      const snapshot = {};

      for (const col of collectionsToLoad) {
        try {
          const snap = await getDocs(collection(db, col));
          snapshot[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (e) {
          snapshot[col] = [];
        }
      }

      try {
        const profSnap = await getDoc(doc(db, "profile", "main"));
        snapshot.profile = profSnap.exists() ? profSnap.data() : {};
      } catch (e) {
        snapshot.profile = {};
      }

      setPortfolioSnapshot(snapshot);
    } catch (err) {
      console.warn("Failed to load portfolio snapshot for AI:", err.message);
    }
  }, []);

  useEffect(() => {
    loadSnapshot();
    const currentKey = getGeminiApiKey();
    setApiKeyInput(currentKey);
    if (currentKey) {
      setKeyStatus({
        connected: true,
        checking: false,
        message: "Gemini 2.0 Flash Multimodal AI Active",
      });
    } else {
      setKeyStatus({
        connected: false,
        checking: false,
        message: "Using Smart Rule Engine (Add API key for full Multimodal Vision)",
      });
    }
  }, [loadSnapshot]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, pendingAction, previewCert]);

  // Test / Save API Key
  const handleSaveApiKey = async (e) => {
    if (e) e.preventDefault();
    setKeyStatus({ connected: false, checking: true, message: "Validating API key…" });
    const cleanKey = apiKeyInput.trim();

    if (!cleanKey) {
      setGeminiApiKey("");
      setKeyStatus({
        connected: false,
        checking: false,
        message: "Key removed. Using Smart Rule Engine.",
      });
      return;
    }

    try {
      // Test the key with a quick lightweight call
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }],
          }),
        }
      );

      if (res.ok) {
        setGeminiApiKey(cleanKey);
        setKeyStatus({
          connected: true,
          checking: false,
          message: "✓ Gemini 2.0 Flash Connected Successfully!",
        });
        setTimeout(() => setShowSettings(false), 1200);
      } else {
        const errText = await res.text();
        setKeyStatus({
          connected: false,
          checking: false,
          message: "Invalid API Key: " + (errText.slice(0, 100) || "Unauthorized"),
        });
      }
    } catch (err) {
      setKeyStatus({
        connected: false,
        checking: false,
        message: "Connection failed: " + err.message,
      });
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelected(files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const isImg = file.type.startsWith("image/");

    if (!isPdf && !isImg) {
      alert("Please upload a PDF document (.pdf) or image file (.png, .jpg, .webp).");
      return;
    }

    setSelectedFile(file);
    // Trigger instant extraction
    handleAnalyzeUploadedFile(file);
  };

  // Certificate Ingestion from File (PDF / Image)
  const handleAnalyzeUploadedFile = async (file) => {
    setLoading(true);
    setStatusText("Analyzing certificate with AI…");

    try {
      const extracted = await analyzeCertificate({
        file,
        storage,
        onProgress: (msg) => setStatusText(msg),
      });

      setPreviewCert(extracted);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "user",
          text: `Uploaded certificate file: ${file.name}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: `I've analyzed "${file.name}" and extracted the certificate details. Review the preview below and confirm to save it to your portfolio!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      alert("Certificate analysis failed: " + err.message);
    }

    setLoading(false);
    setStatusText("");
  };

  // Certificate Ingestion from Link
  const handleAnalyzeUrl = async (e) => {
    if (e) e.preventDefault();
    if (!certUrl.trim()) return;

    setLoading(true);
    setStatusText("Fetching & analyzing credential link…");

    try {
      const extracted = await analyzeCertificate({
        url: certUrl.trim(),
        storage,
        onProgress: (msg) => setStatusText(msg),
      });

      setPreviewCert(extracted);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "user",
          text: `Import certificate from URL: ${certUrl}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: `Found certificate "${extracted.name}" from ${extracted.organization}! Review and confirm below to add it to your live portfolio.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setCertUrl("");
    } catch (err) {
      alert("Failed to analyze credential URL: " + err.message);
    }

    setLoading(false);
    setStatusText("");
  };

  // Confirm and Save Extracted Certificate
  const handleSavePreviewCert = async () => {
    if (!previewCert || !previewCert.name) return;
    setLoading(true);
    setStatusText("Saving certificate to Firestore…");

    try {
      const action = {
        intent: "create_item",
        collection: "certifications",
        targetName: previewCert.name,
        payload: {
          ...previewCert,
          order: portfolioSnapshot.certifications?.length || 0,
        },
      };

      const result = await executeAdminAction({ action, db });

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "assistant",
          text: `✅ ${result.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      setUndoNotice(result.message);
      setPreviewCert(null);
      setSelectedFile(null);
      await loadSnapshot();
      onRefreshData();
      setTimeout(() => setUndoNotice(""), 5000);
    } catch (err) {
      alert("Save failed: " + err.message);
    }

    setLoading(false);
    setStatusText("");
  };

  // Execute Planned Action
  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setLoading(true);
    setStatusText("Applying changes to Firestore…");

    try {
      const result = await executeAdminAction({ action: pendingAction, db });

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "assistant",
          text: `✅ ${result.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      setUndoNotice(result.message);
      setPendingAction(null);
      await loadSnapshot();
      onRefreshData();
      setTimeout(() => setUndoNotice(""), 5000);
    } catch (err) {
      alert("Failed to execute action: " + err.message);
    }

    setLoading(false);
    setStatusText("");
  };

  // Revert / Undo Last Action
  const handleUndo = async () => {
    setLoading(true);
    setStatusText("Reverting last action…");

    try {
      const result = await revertLastAction(db);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "assistant",
          text: `↩️ ${result.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setUndoNotice("");
      await loadSnapshot();
      onRefreshData();
    } catch (err) {
      alert("Undo failed: " + err.message);
    }

    setLoading(false);
    setStatusText("");
  };

  // Natural Language Prompt Submission
  const handlePromptSubmit = async (e) => {
    if (e) e.preventDefault();
    const userText = prompt.trim();
    if (!userText || loading) return;

    setPrompt("");
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        role: "user",
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    setLoading(true);
    setStatusText("Thinking & planning changes…");

    try {
      const plan = await planAdminAction({
        prompt: userText,
        snapshot: portfolioSnapshot,
        onProgress: (s) => setStatusText(s),
      });

      if (plan.intent === "chat_reply") {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "assistant",
            text: plan.explanation,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        setPendingAction(plan);
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "assistant",
            text: `I've prepared an action plan: ${plan.explanation}. Please confirm below to apply it.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: "I encountered an error processing that instruction: " + err.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }

    setLoading(false);
    setStatusText("");
  };

  // Quick Action Chips
  const quickActions = [
    { label: "📄 Upload Cert (PDF/Img)", action: () => fileInputRef.current?.click() },
    { label: "🔗 Ingest Cert via Link", action: () => setActiveMode("cert_link") },
    { label: "🗑️ Remove a Certificate", action: () => setPrompt("Remove certificate ") },
    { label: "✨ Update Headline", action: () => setPrompt("Update headline to: ") },
    { label: "⚡ Add New Skill", action: () => setPrompt("Add skill TypeScript in Languages") },
    { label: "🚀 Add Project", action: () => setPrompt("Add a new project titled: ") },
  ];

  return (
    <div className={`admin-ai-panel ${isFloatingDrawer ? "admin-ai-panel--floating" : ""}`}>
      {/* ─── Header ─── */}
      <div className="admin-ai-head">
        <div className="admin-ai-title-wrap">
          <div className="admin-ai-badge">✦ AI COPILOT</div>
          <h2>Portfolio AI Assistant</h2>
        </div>

        <div className="admin-ai-head-actions">
          <button
            type="button"
            className={`admin-ai-status-pill ${keyStatus.connected ? "is-connected" : "is-fallback"}`}
            onClick={() => setShowSettings(!showSettings)}
            title="Configure Gemini API Key"
          >
            <span className="admin-ai-dot" />
            <span className="admin-ai-model-tag">
              {keyStatus.connected ? "Gemini 2.0 Flash" : "Smart Offline"}
            </span>
            <span className="admin-ai-gear">⚙</span>
          </button>

          {isFloatingDrawer && (
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              onClick={onCloseDrawer}
              title="Close Copilot"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ─── API Key Settings Bar / Modal ─── */}
      {showSettings && (
        <div className="admin-ai-settings-card">
          <div className="admin-ai-settings-head">
            <strong>Gemini AI API Configuration</strong>
            <button
              type="button"
              className="admin-modal__close"
              onClick={() => setShowSettings(false)}
            >
              ✕
            </button>
          </div>
          <p className="admin-muted" style={{ fontSize: "12.5px", margin: "6px 0 12px" }}>
            Power this AI with Google Gemini 2.0 Flash for instant multimodal certificate scanning (PDF/Images) and complete conversational editing.
            Get a free API key at{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              Google AI Studio ↗
            </a>
          </p>

          <form onSubmit={handleSaveApiKey} className="admin-ai-key-form">
            <input
              type="password"
              placeholder="Paste your Gemini API key (AIzaSy...)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="admin-ai-key-input"
            />
            <button
              type="submit"
              className="admin-btn admin-btn--primary admin-btn--sm"
              disabled={keyStatus.checking}
            >
              {keyStatus.checking ? "Validating…" : "Save Key"}
            </button>
          </form>

          {keyStatus.message && (
            <div
              className={`admin-ai-status-msg ${
                keyStatus.connected ? "is-success" : "is-warning"
              }`}
            >
              {keyStatus.message}
            </div>
          )}
        </div>
      )}

      {/* ─── Undo Notification Banner ─── */}
      {undoNotice && (
        <div className="admin-ai-undo-banner">
          <span>{undoNotice}</span>
          <button
            type="button"
            className="admin-btn admin-btn--sm admin-btn--primary"
            onClick={handleUndo}
          >
            ↩ Revert / Undo Change
          </button>
        </div>
      )}

      {/* ─── Multimodal Certificate Ingestion Hub ─── */}
      <div className="admin-ai-ingest-hub">
        <div className="admin-ai-ingest-tabs">
          <button
            type="button"
            className={`admin-ai-ingest-tab ${activeMode === "all" ? "is-active" : ""}`}
            onClick={() => setActiveMode("all")}
          >
            💬 Copilot Chat & Commands
          </button>
          <button
            type="button"
            className={`admin-ai-ingest-tab ${activeMode === "cert_file" ? "is-active" : ""}`}
            onClick={() => {
              setActiveMode("cert_file");
              fileInputRef.current?.click();
            }}
          >
            📄 Upload Certificate (PDF / Image)
          </button>
          <button
            type="button"
            className={`admin-ai-ingest-tab ${activeMode === "cert_link" ? "is-active" : ""}`}
            onClick={() => setActiveMode("cert_link")}
          >
            🔗 Ingest Certificate via Link
          </button>
        </div>

        {/* Certificate via Link Form */}
        {activeMode === "cert_link" && (
          <form onSubmit={handleAnalyzeUrl} className="admin-ai-link-box">
            <input
              type="url"
              placeholder="Paste credential URL (e.g. Coursera, Credly, Google, Cisco, Udemy, Badgr...)"
              value={certUrl}
              onChange={(e) => setCertUrl(e.target.value)}
              required
              autoFocus
              className="admin-ai-url-input"
            />
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={loading}
            >
              {loading ? "Analyzing…" : "Scan & Add Certificate ↗"}
            </button>
          </form>
        )}

        {/* Certificate Drag-and-Drop Area */}
        <div
          className={`admin-ai-dropzone ${isDragging ? "is-dragging" : ""} ${
            selectedFile ? "has-file" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
            }}
          />
          <div className="admin-ai-dropzone-icon">📥</div>
          <div className="admin-ai-dropzone-text">
            <strong>Drop Certificate PDF or Image here</strong>
            <span>or click to browse from your device (.pdf, .png, .jpg, .webp)</span>
          </div>
          {selectedFile && (
            <div className="admin-ai-file-pill">
              📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>
      </div>

      {/* ─── Certificate Extracted Preview Card ─── */}
      {previewCert && (
        <div className="admin-ai-preview-card">
          <div className="admin-ai-preview-header">
            <div>
              <span className="admin-badge admin-badge--verified">EXTRACTED CERTIFICATE</span>
              <h3 style={{ margin: "4px 0 2px" }}>{previewCert.name}</h3>
              <p className="admin-muted" style={{ fontSize: "13px" }}>
                Issued by <strong>{previewCert.organization}</strong> • {previewCert.issueDate} • Category: {previewCert.category}
              </p>
            </div>
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              onClick={() => setPreviewCert(null)}
            >
              ✕ Dismiss
            </button>
          </div>

          <div className="admin-ai-preview-grid">
            <label className="admin-field">
              <span>CERTIFICATE TITLE</span>
              <input
                type="text"
                value={previewCert.name || ""}
                onChange={(e) => setPreviewCert({ ...previewCert, name: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span>ISSUING ORGANIZATION</span>
              <input
                type="text"
                value={previewCert.organization || ""}
                onChange={(e) => setPreviewCert({ ...previewCert, organization: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span>CATEGORY</span>
              <select
                value={previewCert.category || "AI"}
                onChange={(e) => setPreviewCert({ ...previewCert, category: e.target.value })}
                className="admin-field-select"
              >
                <option value="AI">AI</option>
                <option value="Cloud">Cloud</option>
                <option value="Software">Software</option>
                <option value="Programming">Programming</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="admin-field">
              <span>ISSUE DATE</span>
              <input
                type="text"
                value={previewCert.issueDate || ""}
                onChange={(e) => setPreviewCert({ ...previewCert, issueDate: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span>CREDENTIAL ID</span>
              <input
                type="text"
                value={previewCert.credentialId || ""}
                onChange={(e) => setPreviewCert({ ...previewCert, credentialId: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span>VERIFICATION URL</span>
              <input
                type="text"
                value={previewCert.verificationUrl || ""}
                onChange={(e) => setPreviewCert({ ...previewCert, verificationUrl: e.target.value })}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span>SKILLS COVERED</span>
              <input
                type="text"
                value={previewCert.skills || ""}
                onChange={(e) => setPreviewCert({ ...previewCert, skills: e.target.value })}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span>DESCRIPTION</span>
              <textarea
                rows={2}
                value={previewCert.description || ""}
                onChange={(e) => setPreviewCert({ ...previewCert, description: e.target.value })}
              />
            </label>
          </div>

          <div className="admin-ai-preview-foot">
            <label className="admin-ai-checkbox-label">
              <input
                type="checkbox"
                checked={previewCert.featured || false}
                onChange={(e) => setPreviewCert({ ...previewCert, featured: e.target.checked })}
              />
              <span>Feature on Top of Portfolio Showcase ★</span>
            </label>

            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={handleSavePreviewCert}
              disabled={loading}
            >
              {loading ? "Saving…" : "Confirm & Save to Live Portfolio ✓"}
            </button>
          </div>
        </div>
      )}

      {/* ─── Pending Planned Action Card ─── */}
      {pendingAction && (
        <div className="admin-ai-action-card">
          <div className="admin-ai-action-head">
            <div>
              <span className={`admin-badge admin-badge--${pendingAction.intent === "delete_item" ? "danger" : "published"}`}>
                {pendingAction.intent?.toUpperCase()}
              </span>
              <h4 style={{ margin: "6px 0 2px" }}>
                Target: {pendingAction.collection?.toUpperCase()} {pendingAction.targetName ? `("${pendingAction.targetName}")` : ""}
              </h4>
            </div>
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              onClick={() => setPendingAction(null)}
            >
              ✕ Cancel
            </button>
          </div>

          <p className="admin-ai-action-explain">{pendingAction.explanation}</p>

          {pendingAction.payload && (
            <div className="admin-ai-action-diff">
              <strong>Payload Data:</strong>
              <pre>{JSON.stringify(pendingAction.payload, null, 2)}</pre>
            </div>
          )}

          <div className="admin-ai-action-foot">
            <button
              type="button"
              className="admin-btn"
              onClick={() => setPendingAction(null)}
            >
              Discard Plan
            </button>
            <button
              type="button"
              className={`admin-btn ${
                pendingAction.intent === "delete_item"
                  ? "admin-btn--danger"
                  : "admin-btn--primary"
              }`}
              onClick={handleConfirmAction}
              disabled={loading}
            >
              {loading
                ? "Executing…"
                : pendingAction.intent === "delete_item"
                ? "Yes, Permanently Delete Item 🗑️"
                : "Confirm & Execute Changes ✓"}
            </button>
          </div>
        </div>
      )}

      {/* ─── Chat Message Stream ─── */}
      <div className="admin-ai-chat-stream">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`admin-ai-bubble ${
              m.role === "user" ? "admin-ai-bubble--user" : "admin-ai-bubble--ai"
            }`}
          >
            <div className="admin-ai-bubble-head">
              <strong>{m.role === "user" ? "Admin" : "AI Copilot"}</strong>
              <span>{m.timestamp}</span>
            </div>
            <div className="admin-ai-bubble-content">{m.text}</div>
          </div>
        ))}

        {loading && (
          <div className="admin-ai-loading-pill">
            <span className="admin-ai-spinner" />
            <span>{statusText || "Processing with AI…"}</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ─── Quick Prompt Chips ─── */}
      <div className="admin-ai-chips">
        {quickActions.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            className="admin-ai-chip"
            onClick={chip.action}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ─── Input Form ─── */}
      <form onSubmit={handlePromptSubmit} className="admin-ai-input-bar">
        <textarea
          rows={2}
          placeholder="Ask AI to edit anything (e.g. 'Update my headline to...', 'Remove certificate X', 'Add skill React Native', 'Make all AI certs featured')..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handlePromptSubmit();
            }
          }}
          disabled={loading}
          className="admin-ai-textarea"
        />
        <button
          type="submit"
          className="admin-btn admin-btn--primary admin-ai-send-btn"
          disabled={loading || !prompt.trim()}
        >
          Send ✦
        </button>
      </form>
    </div>
  );
}
