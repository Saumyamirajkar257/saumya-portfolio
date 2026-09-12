"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import { submitContact } from "@/lib/content";
import styles from "./Contact.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ label, error, children }) {
  return (
    <label className={`${styles.field} ${error ? styles.fieldError : ""}`}>
      <span className={`text-mono ${styles.field__label}`}>{label}</span>
      {children}
      {error ? <span className={styles.field__error}>{error}</span> : null}
    </label>
  );
}

export default function Contact({ profile }) {
  const reduce = useReducedMotion();
  const socials = profile?.socials || {};

  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverError, setServerError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!values.email.trim()) next.email = "Please enter your email.";
    else if (!EMAIL_RE.test(values.email)) next.email = "That email doesn't look right.";
    if (values.message.trim().length < 10) next.message = "Message should be at least 10 characters.";
    return next;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus("sending");
    setServerError("");

    // Intentionally leaving `website` empty — it's the honeypot.
    const res = await submitContact({
      name: values.name.trim(),
      email: values.email.trim(),
      subject: values.subject.trim() || "Message from portfolio",
      message: values.message.trim(),
      website: values.website,
    });

    if (res.ok && res.data?.success) {
      setStatus("success");
      setValues({ name: "", email: "", subject: "", message: "", website: "" });
      window.setTimeout(() => setStatus("idle"), 6000);
    } else if (res.status === 429) {
      setStatus("error");
      setServerError(res.data?.detail || "You've sent a few messages already — please wait a few minutes and try again.");
    } else if (res.status === 422) {
      setStatus("error");
      setServerError("Some fields didn't pass validation. Please check and resubmit.");
    } else {
      setStatus("error");
      setServerError(
        res.data?.detail || "Couldn't reach the server. Make sure the backend is running on port 8000."
      );
    }
  };

  const contactLines = [
    socials.email && { key: "email", label: "Email", href: socials.email, value: profile?.email },
    socials.phone && { key: "phone", label: "Phone", href: socials.phone, value: profile?.phone },
    socials.github && { key: "github", label: "GitHub", href: socials.github, value: "github.com/saumyamirajkar" },
    { key: "location", label: "Based in", href: null, value: profile?.location },
  ].filter(Boolean);

  return (
    <section id="contact" className={`block ${styles.contact}`}>
      <div className="wrap">
        <SectionHeading
          eyebrow="let's talk"
          title={<>Let's build <span className="gradient-text">something</span></>}
          lead={<p className="prose">Have an internship, a project, or just a question? My inbox is open.</p>}
        />

        <div className={styles.contact__grid}>
          {/* left — reach out info */}
          <div className={styles.contact__info}>
            {contactLines.map((line, i) => (
              <Reveal key={line.key} delay={i * 0.07}>
                {line.href ? (
                  <a
                    href={line.href}
                    target={line.href.startsWith("http") ? "_blank" : undefined}
                    rel={line.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className={styles.infoRow}
                  >
                    <span className="text-mono infoRow__label">{line.label}</span>
                    <span className={styles.infoRow__value}>{line.value}</span>
                  </a>
                ) : (
                  <div className={styles.infoRow}>
                    <span className="text-mono infoRow__label">{line.label}</span>
                    <span className={styles.infoRow__value}>{line.value}</span>
                  </div>
                )}
              </Reveal>
            ))}

            <Reveal delay={0.3}>
              <div className={styles.contact__status}>
                <span className={styles.contact__ping} aria-hidden="true" />
                <span className="text-mono">Currently open to internships & collaborations</span>
              </div>
            </Reveal>
          </div>

          {/* right — the form */}
          <Reveal delay={0.12}>
            <form className={`glass ${styles.form}`} onSubmit={onSubmit} noValidate aria-label="Contact form">
              <input
                tabIndex={-1}
                autoComplete="off"
                name="website"
                value={values.website}
                onChange={onChange}
                className={styles.form__honeypot}
                aria-hidden="true"
              />

              <div className={styles.form__row}>
                <Field label="01 · your name" error={errors.name}>
                  <input
                    name="name"
                    value={values.name}
                    onChange={onChange}
                    placeholder="Saumya Mirajkar"
                    className={styles.input}
                    autoComplete="name"
                  />
                </Field>
                <Field label="02 · email" error={errors.email}>
                  <input
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    className={styles.input}
                    autoComplete="email"
                  />
                </Field>
              </div>

              <Field label="03 · subject (optional)" error={errors.subject}>
                <input
                  name="subject"
                  value={values.subject}
                  onChange={onChange}
                  placeholder="Internship opportunity / Project idea / Hello"
                  className={styles.input}
                />
              </Field>

              <Field label="04 · message" error={errors.message}>
                <textarea
                  name="message"
                  value={values.message}
                  onChange={onChange}
                  placeholder="Tell me about the role, project, or anything you'd like to build together…"
                  rows={6}
                  className={`${styles.input} ${styles.textarea}`}
                />
              </Field>

              <div className={styles.form__foot}>
                <button type="submit" className="btn btn--primary btn--lg" disabled={status === "sending"}>
                  {status === "sending" ? (
                    <>
                      <span className={styles.spinner} aria-hidden="true" /> Sending…
                    </>
                  ) : (
                    <>Send message</>
                  )}
                </button>
                <span className="text-mono contact__footHint">usually replies within 24h</span>
              </div>

              <AnimatePresence mode="wait">
                {status === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={styles.form__notice} role="status"
                  >
                    <span className={styles.form__check} aria-hidden="true">✓</span>
                    <div>
                      <strong>Message sent!</strong>
                      <p>Thanks for reaching out — I'll get back to you soon.</p>
                    </div>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`${styles.form__notice} ${styles.form__noticeError}`} role="alert"
                  >
                    <span className={styles.form__check} style={{ background: "var(--accent)" }} aria-hidden="true">!</span>
                    <div>
                      <strong>Something went wrong.</strong>
                      <p>{serverError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}