"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./AISection.module.css";

export default function AISection({ certifications = [], projects = [] }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "ai",
      text: "Hi! I am Saumya's Portfolio AI Assistant. You can ask me about his AI certifications, engineering projects, skills, or launch the Admin AI Copilot to edit content live.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Filter AI certifications
  const aiCerts = (certifications || []).filter((c) => {
    const text = `${c.name || ""} ${c.organization || ""} ${c.category || ""}`.toLowerCase();
    return text.includes("ai") || text.includes("intelligence") || text.includes("generative");
  });

  const handleSend = (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || busy) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: "user", text: query },
    ]);
    setBusy(true);

    setTimeout(() => {
      let reply = "Saumya Mirajkar is a Computer Engineering & IoT student specializing in AI systems, embedded IoT, and modern web applications.";
      const lower = query.toLowerCase();

      if (lower.includes("cert") || lower.includes("ibm") || lower.includes("google") || lower.includes("credential")) {
        reply = "Saumya holds the IBM AI Developer Professional Certificate (Coursera) and the Google AI Professional Certificate, demonstrating hands-on mastery in machine learning, generative AI, and prompt engineering.";
      } else if (lower.includes("project") || lower.includes("work") || lower.includes("autoinvoice")) {
        reply = "Saumya built AutoInvoice (Invoice & client management app), LifeTrackr (productivity app with Firebase), and an Automatic Car Wiper embedded IoT system using Arduino & C++.";
      } else if (lower.includes("skill") || lower.includes("tech") || lower.includes("language")) {
        reply = "Core technical skills: Python, JavaScript, C/C++, React, HTML/CSS, Arduino microcontrollers, Firebase Firestore, and Git/GitHub.";
      } else if (lower.includes("admin") || lower.includes("edit") || lower.includes("cms")) {
        reply = "You can access the AI Admin Copilot at /admin to add new certificates via links, PDFs, or images, modify any portfolio section, or remove items.";
      }

      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: "ai", text: reply },
      ]);
      setBusy(false);
    }, 400);
  };

  return (
    <section id="ai" className={styles.section}>
      <div className={styles.glow} />
      <div className="wrap">
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              <span>INTELLIGENCE &amp; AI ENGINEERING</span>
            </div>
            <h2 className={styles.heading}>AI &amp; MACHINE LEARNING</h2>
            <p className={styles.subheading}>
              Building intelligent developer workflows, multimodal vision tools, and generative AI systems alongside embedded IoT engineering.
            </p>
          </div>

          <Link href="/admin" className={styles.adminLinkBadge}>
            <span>✦ OPEN AI ADMIN COPILOT</span>
            <span>↗</span>
          </Link>
        </div>

        {/* 2-Column Grid */}
        <div className={styles.grid}>
          {/* Left Column: AI Capabilities & Credentials */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Professional AI Stack &amp; Credentials</div>
            <p className={styles.cardDesc}>
              Certified in practical AI development through industry benchmarks from IBM and Google. Specialized in building autonomous copilot engines, multimodal document processing (PDF/Vision OCR), and LLM-assisted full-stack architectures.
            </p>

            <div className={styles.tagRow}>
              <span className={`${styles.tag} ${styles.tagActive}`}>IBM AI Developer</span>
              <span className={`${styles.tag} ${styles.tagActive}`}>Google AI Certified</span>
              <span className={styles.tag}>Multimodal Vision</span>
              <span className={styles.tag}>Prompt Engineering</span>
              <span className={styles.tag}>Gemini 2.0 Flash</span>
              <span className={styles.tag}>FastAPI / Python</span>
              <span className={styles.tag}>Autonomous Agents</span>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "14px" }}>
              <Link href="/admin" className="btn btn--primary btn--sm" style={{ width: "fit-content" }}>
                <span>Launch Admin AI Section ⚡</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Portfolio AI Assistant */}
          <div className={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className={styles.cardTitle}>Interactive Portfolio Assistant</div>
              <span className="admin-badge admin-badge--published" style={{ fontSize: "11px" }}>
                ● ONLINE
              </span>
            </div>

            <p className={styles.cardDesc}>
              Test Saumya&apos;s embedded AI assistant below. Ask about his qualifications, certificates, projects, or request CMS changes.
            </p>

            <div className={styles.chatBox}>
              <div className={styles.chatMessages}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.chatBubble} ${
                      m.role === "user" ? styles.chatBubbleUser : styles.chatBubbleAi
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {busy && (
                  <div className={`${styles.chatBubble} ${styles.chatBubbleAi}`}>
                    <em>Thinking…</em>
                  </div>
                )}
              </div>

              <form onSubmit={handleSend} className={styles.chatInputRow}>
                <input
                  type="text"
                  placeholder="Ask about AI certificates, skills, or projects…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={styles.chatInput}
                />
                <button type="submit" className="btn btn--primary btn--sm" disabled={busy || !input.trim()}>
                  Ask ✦
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
