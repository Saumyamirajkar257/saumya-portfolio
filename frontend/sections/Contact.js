"use client";

import { motion, useReducedMotion } from "framer-motion";
import ContactForm from "@/components/ContactForm";
import { EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./Contact.module.css";

const ENVELOPE_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LINKEDIN_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const GITHUB_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const RESUME_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function Contact({ profile }) {
  const reduce = useReducedMotion();
  const socials = profile?.socials || {};
  const email = profile?.email || "Saumyamirajkar25@icloud.com";

  return (
    <section id="contact" className={styles.section}>
      <div className="wrap">
        <div className={styles.contactWrapper}>
          {/* Left Column: Heading, Direct Email & Social Buttons */}
          <div className={styles.contactLeft}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              <span>GET IN TOUCH</span>
            </div>

            <h2 className={styles.heading}>
              LET'S BUILD<br />
              <span className={styles.headingDim}>SOMETHING GREAT.</span>
            </h2>

            <p className={styles.subheading}>
              Got a hardware/IoT challenge, a software project, or an internship opportunity? Drop a message or reach out directly.
            </p>

            <div className={styles.directBlock}>
              <a href={`mailto:${email}`} className={styles.emailRow}>
                <span className={styles.emailIcon}>{ENVELOPE_ICON}</span>
                <span className={styles.emailText}>{email}</span>
              </a>

              <div className={styles.socialRow}>
                <a
                  href="https://linkedin.com/in/saumyamirajkar"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.socialBtn}
                >
                  {LINKEDIN_ICON}
                  <span>LINKEDIN</span>
                </a>

                <a
                  href={socials.github || "https://github.com/saumyamirajkar"}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.socialBtn}
                >
                  {GITHUB_ICON}
                  <span>GITHUB</span>
                </a>

                <a
                  href="/resume/Saumya_Mirajkar_Resume.pdf"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.resumeBtn}
                >
                  {RESUME_ICON}
                  <span>RÉSUMÉ</span>
                  <span className={styles.resumeArrow}>↓</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Editorial Contact Form */}
          <div className={styles.contactRight}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
