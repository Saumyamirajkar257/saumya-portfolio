"use client";

import { motion, useReducedMotion } from "framer-motion";
import ContactForm from "@/components/ContactForm";
import { MagneticButton, EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./Contact.module.css";

export default function Contact({ profile }) {
  const reduce = useReducedMotion();
  const socials = profile?.socials || {};
  const email = profile?.email || "saumyamir25@gmail.com";

  return (
    <section id="contact" className={styles.section}>
      <div className="wrap">
        <motion.div
          className={styles.contactWrapper}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: TIMING.section, ease: EASE.premium }}
        >
          {/* Left Column — Heading, Bio & Links */}
          <div className={styles.contactLeft}>
            <div className={styles.contactBadge}>
              <span className={styles.statusDot} />
              <span>AVAILABLE FOR INTERNSHIPS &amp; PROJECTS</span>
            </div>

            <h2 className={styles.minimalTitle}>
              Let's Build<br />
              <span style={{ color: "#FFFFFF" }}>Something Great.</span>
            </h2>

            <p className={styles.minimalDesc}>
              Got a hardware/IoT challenge, a software project, or an internship opportunity? Drop a message or reach out directly.
            </p>

            <div className={styles.directLinks}>
              <MagneticButton strength={0.25}>
                <a href={`mailto:${email}`} className={styles.emailLink}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  {email}
                </a>
              </MagneticButton>

              <div className={styles.socialLinks}>
                <MagneticButton strength={0.25}>
                  <a href="https://linkedin.com/in/saumyamirajkar" target="_blank" rel="noreferrer noopener" className={styles.socialChip}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                    LinkedIn
                  </a>
                </MagneticButton>

                <MagneticButton strength={0.25}>
                  <a href={socials.github || "https://github.com/saumyamirajkar"} target="_blank" rel="noreferrer noopener" className={styles.socialChip}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                </MagneticButton>

                <MagneticButton strength={0.25}>
                  <a href="/resume/Saumya_Mirajkar_Resume.pdf" target="_blank" rel="noreferrer" className={styles.socialChip}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Résumé
                  </a>
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Right Column — Clean Contact Form */}
          <div className={styles.contactRight}>
            <ContactForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
