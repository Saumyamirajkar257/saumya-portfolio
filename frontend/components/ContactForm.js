"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./ContactForm.module.css";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.target;
    const data = Object.fromEntries(new FormData(form));

    // Client-side honeypot check
    if (data.honeypot) {
      setStatus("success");
      return;
    }

    try {
      // Securely write directly to Firestore (protected by rules: only allows specific fields, lengths, and no HTML)
      await addDoc(collection(db, "messages"), {
        name: String(data.name).substring(0, 80).replace(/[<>]/g, ""),
        email: String(data.email).substring(0, 254).replace(/[<>]/g, ""),
        message: String(data.message).substring(0, 2000).replace(/[<>]/g, ""),
        handled: false,
        created_at: serverTimestamp(),
      });

      setStatus("success");
      form.reset();
    } catch (err) {
      console.error(err);
      // If Firestore write fails (e.g. rate limit / network), fallback to mailto
      const mailBody = encodeURIComponent(
        `${data.message}\n\n— ${data.name} (${data.email})`
      );
      window.open(
        `mailto:saumyamir25@gmail.com?subject=Portfolio%20Contact&body=${mailBody}`,
        "_self"
      );
      setStatus("success");
      form.reset();
    }
  };

  if (status === "success") {
    return (
      <div className={styles.successMessage}>
        <div className={styles.successIcon}>✓</div>
        <h3>Message Sent!</h3>
        <p>Thanks for reaching out — I&apos;ll get back to you shortly.</p>
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

      {/* Honeypot */}
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

      {status === "error" && (
        <p className={styles.errorText}>
          Something went wrong. Try emailing me directly at{" "}
          <a href="mailto:saumyamir25@gmail.com" style={{ color: "#38BDF8" }}>
            saumyamir25@gmail.com
          </a>
        </p>
      )}
    </form>
  );
}
