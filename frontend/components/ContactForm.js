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

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setStatus("offline");
      return;
    }

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

    if (data.honeypot) {
      setStatus("success");
      return;
    }

    try {
      const firstName = String(data.firstName || "").substring(0, 50).replace(/[<>]/g, "").trim();
      const lastName = String(data.lastName || "").substring(0, 50).replace(/[<>]/g, "").trim();
      const name = `${firstName} ${lastName}`.trim();
      const email = String(data.email || "").substring(0, 254).replace(/[<>]/g, "").trim();
      const subject = String(data.subject || "").substring(0, 150).replace(/[<>]/g, "").trim();
      const message = String(data.message || "").substring(0, 2000).replace(/[<>]/g, "").trim();

      if (!firstName || !email || !message) {
        throw new Error("Please fill in your name, email, and message.");
      }

      if (db) {
        await withTimeout(
          addDoc(collection(db, "messages"), {
            name,
            email,
            subject: subject || "General Inquiry",
            message,
            handled: false,
            created_at: serverTimestamp(),
          }),
          7000
        );
      }

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
        <h3>Message Received</h3>
        <p>Thank you for reaching out. I'll get back to you shortly.</p>
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
      {/* Row 1: First Name & Last Name */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <input
            type="text"
            id="cf-first-name"
            name="firstName"
            required
            minLength={2}
            maxLength={50}
            placeholder="Your first name"
            className={styles.input}
            disabled={status === "submitting"}
          />
        </div>
        <div className={styles.formGroup}>
          <input
            type="text"
            id="cf-last-name"
            name="lastName"
            maxLength={50}
            placeholder="Your last name"
            className={styles.input}
            disabled={status === "submitting"}
          />
        </div>
      </div>

      {/* Row 2: Email */}
      <div className={styles.formGroup}>
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

      {/* Row 3: How can I help? */}
      <div className={styles.formGroup}>
        <input
          type="text"
          id="cf-subject"
          name="subject"
          maxLength={150}
          placeholder="How can I help?"
          className={styles.input}
          disabled={status === "submitting"}
        />
      </div>

      {/* Row 4: Message Textarea */}
      <div className={styles.formGroup}>
        <textarea
          id="cf-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="Write your message here"
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
        className={styles.submitBtn}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <span className={styles.sendingRow}>
            <span className={styles.spinner} />
            Sending…
          </span>
        ) : (
          <span>Send Message →</span>
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
        <div style={{ marginTop: "10px", textAlign: "center" }}>
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
