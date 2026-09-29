"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./ContactForm.module.css";

const COOLDOWN_SECONDS = 30;

function withTimeout(promise, ms = 6000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), ms)
  );
  return Promise.race([promise, timeout]);
}

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error | ratelimited | offline
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: Check online status
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setStatus("offline");
      return;
    }

    // Guard: Prevent duplicate submission spam (Client-side cooldown rate limit)
    const lastSent = localStorage.getItem("portfolio_last_contact_ts");
    const now = Date.now();
    if (lastSent && now - Number(lastSent) < COOLDOWN_SECONDS * 1000) {
      const remaining = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - Number(lastSent))) / 1000);
      setErrorMsg(`Please wait ${remaining}s before sending another message.`);
      setStatus("ratelimited");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    const form = e.target;
    const data = Object.fromEntries(new FormData(form));

    // Honeypot check for automated bots
    if (data.honeypot) {
      setStatus("success");
      return;
    }

    try {
      const sanitizedName = String(data.name || "").substring(0, 80).replace(/[<>]/g, "").trim();
      const sanitizedEmail = String(data.email || "").substring(0, 254).replace(/[<>]/g, "").trim();
      const sanitizedMessage = String(data.message || "").substring(0, 2000).replace(/[<>]/g, "").trim();

      if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
        throw new Error("Please fill in all required fields.");
      }

      await withTimeout(
        addDoc(collection(db, "messages"), {
          name: sanitizedName,
          email: sanitizedEmail,
          message: sanitizedMessage,
          handled: false,
          created_at: serverTimestamp(),
        }),
        7000
      );

      // Record timestamp for rate limit cooldown
      localStorage.setItem("portfolio_last_contact_ts", String(Date.now()));

      setStatus("success");
      form.reset();
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMsg(err.message || "Unable to send message.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.successMessage}>
        <div className={styles.successIcon}>✓</div>
        <h3>Message Sent</h3>
        <p>Thank you for reaching out. I will get back to you shortly.</p>
        <button
          onClick={() => setStatus("idle")}
          className="btn btn--secondary btn--sm"
          style={{ marginTop: "16px" }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} autoComplete="on">
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="cf-name" className={styles.label}>Name</label>
          <input
            type="text"
            id="cf-name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="Your name"
            className={styles.input}
            disabled={status === "submitting"}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="cf-email" className={styles.label}>Email</label>
          <input
            type="email"
            id="cf-email"
            name="email"
            required
            maxLength={254}
            placeholder="you@example.com"
            className={styles.input}
            disabled={status === "submitting"}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cf-message" className={styles.label}>Message</label>
        <textarea
          id="cf-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="Tell me about your project, team, or idea..."
          className={styles.textarea}
          disabled={status === "submitting"}
        />
      </div>

      {/* Honeypot field */}
      <input
        type="text"
        name="honeypot"
        style={{ display: "none" }}
        tabIndex="-1"
        autoComplete="off"
        aria-hidden="true"
      />

      <button
        type="submit"
        className={`btn btn--primary btn--lg ${styles.submitBtn}`}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <span className={styles.sendingRow}>
            <span className={styles.spinner} />
            Sending…
          </span>
        ) : (
          <>Send Message <span className="btn-arrow" aria-hidden="true">→</span></>
        )}
      </button>

      {status === "ratelimited" && (
        <p className={styles.errorText} style={{ color: "#FBBF24" }}>
          {errorMsg}
        </p>
      )}

      {status === "offline" && (
        <p className={styles.errorText}>
          You appear to be offline. Please check your internet connection.
        </p>
      )}

      {status === "error" && (
        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <p className={styles.errorText}>
            {errorMsg.includes("timed out")
              ? "Connection timed out. "
              : "Something went wrong. "}
            You can email me directly at{" "}
            <a href="mailto:saumyamir25@gmail.com" style={{ color: "#FFFFFF", textDecoration: "underline" }}>
              saumyamir25@gmail.com
            </a>
          </p>
        </div>
      )}
    </form>
  );
}
