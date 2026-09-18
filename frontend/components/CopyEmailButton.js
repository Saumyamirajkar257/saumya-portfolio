"use client";

import { useState } from "react";
import styles from "./CopyEmailButton.module.css";

export default function CopyEmailButton({
  email = "Saumyamirajkar25@icloud.com",
  label = "Copy Email",
  copiedLabel = "Email Copied! ✓",
  variant = "button",
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = email;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`${styles.pillBtn} ${copied ? styles.copied : ""} ${className}`}
        title={`Click to copy: ${email}`}
        aria-label={`Copy email ${email}`}
      >
        <span className={styles.pillIcon} aria-hidden="true">
          {copied ? "✓" : "📋"}
        </span>
        <span className={styles.pillText}>
          {copied ? copiedLabel : label}
        </span>
      </button>
    );
  }

  if (variant === "card-action") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`${styles.cardActionBtn} ${copied ? styles.copied : ""} ${className}`}
        aria-label={`Copy email ${email}`}
      >
        <span className={styles.cardActionIcon} aria-hidden="true">
          {copied ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </span>
        <span>{copied ? "Copied to Clipboard!" : "Copy Email Address"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${styles.btn} ${copied ? styles.copied : ""} ${className}`}
      aria-label={`Copy email ${email}`}
    >
      <span className={styles.icon} aria-hidden="true">
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </span>
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
