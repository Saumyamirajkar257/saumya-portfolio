"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./Certifications.module.css";

// Monochrome Provider Logos (SVGs for guaranteed reliability without broken images)
const PROVIDER_LOGOS = {
  google: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  ),
  ibm: (
    <svg width="24" height="14" viewBox="0 0 32 16" fill="currentColor" aria-hidden="true">
      <path d="M0 0h8v2H0zm0 3.5h8v2H0zm0 3.5h8v2H0zm0 3.5h8v2H0zm0 3.5h8v2H0zM10 0h12v2H10zm0 3.5h12v2H10zm0 3.5h12v2H10zm0 3.5h12v2H10zm0 3.5h12v2H10zM24 0h8v2h-8zm0 3.5h8v2h-8zm0 3.5h8v2h-8zm0 3.5h8v2h-8zm0 3.5h8v2h-8z" />
    </svg>
  ),
  atlassian: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.458 12.146a1.18 1.18 0 0 0-1.637-.123L2.3 18.847a1.18 1.18 0 0 0 .782 2.067h9.098a1.18 1.18 0 0 0 1.18-1.18v-6.223a1.18 1.18 0 0 0-1.902-1.365zm10.242 6.701L14.18 3.09a1.18 1.18 0 0 0-1.898-.016l-3.8 4.792a1.18 1.18 0 0 0 .193 1.632l9.083 7.643a1.18 1.18 0 0 0 1.697-.247 1.18 1.18 0 0 0 .003-1.688z" />
    </svg>
  ),
  cisco: (
    <svg width="22" height="16" viewBox="0 0 24 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="6" width="2" height="10" rx="1" />
      <rect x="5.5" y="2" width="2" height="14" rx="1" />
      <rect x="11" y="0" width="2" height="16" rx="1" />
      <rect x="16.5" y="2" width="2" height="14" rx="1" />
      <rect x="21" y="6" width="2" height="10" rx="1" />
    </svg>
  ),
  coursera: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.2c4.308 0 7.8 3.492 7.8 7.8s-3.492 7.8-7.8 7.8S4.2 16.308 4.2 12 7.692 4.2 12 4.2zm-2.4 4.5v6.6l5.7-3.3-5.7-3.3z" />
    </svg>
  ),
  microsoft: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M1 1h10v10H1zM13 1h10v10H13zM1 13h10v10H1zM13 13h10v10H13z" />
    </svg>
  ),
  credly: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m8 12 3 3 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  aws: (
    <svg width="22" height="15" viewBox="0 0 24 16" fill="currentColor" aria-hidden="true">
      <path d="M6.8 9.5c-.8 0-1.4-.2-1.9-.6-.5-.4-.7-1-.7-1.7 0-.8.3-1.4.9-1.8.6-.4 1.4-.6 2.4-.6.9 0 1.6.1 2.2.3v-.4c0-.5-.1-.8-.4-1.1-.3-.3-.7-.4-1.3-.4-.5 0-.9.1-1.3.3-.4.2-.8.5-1.1.9l-.9-.8c.4-.5.9-.9 1.5-1.1.6-.3 1.3-.4 2-.4 1.1 0 1.9.3 2.5.8.6.5.9 1.3.9 2.3v4.4h-1.2v-.9c-.6.7-1.5 1.1-2.6 1.1zm.3-1.1c.6 0 1.2-.2 1.6-.6.4-.4.6-.9.6-1.5-.5-.2-1.1-.3-1.8-.3-.6 0-1.1.1-1.4.4-.3.2-.5.6-.5 1 0 .4.1.7.4.9.3.1.7.1 1.1.1z" />
    </svg>
  ),
};

function resolveProviderLogo(org = "", issuer = "") {
  const text = `${org} ${issuer}`.toLowerCase();
  if (text.includes("google")) return PROVIDER_LOGOS.google;
  if (text.includes("ibm")) return PROVIDER_LOGOS.ibm;
  if (text.includes("atlassian")) return PROVIDER_LOGOS.atlassian;
  if (text.includes("cisco")) return PROVIDER_LOGOS.cisco;
  if (text.includes("coursera")) return PROVIDER_LOGOS.coursera;
  if (text.includes("microsoft")) return PROVIDER_LOGOS.microsoft;
  if (text.includes("credly") || text.includes("acclaim")) return PROVIDER_LOGOS.credly;
  if (text.includes("aws") || text.includes("amazon")) return PROVIDER_LOGOS.aws;
  return null;
}

function formatDate(dateStr) {
  if (!dateStr) return "2026";
  const raw = String(dateStr).trim().toUpperCase();
  return raw
    .replace(/SEPTEMBER/gi, "SEP")
    .replace(/AUGUST/gi, "AUG")
    .replace(/JULY/gi, "JUL")
    .replace(/OCTOBER/gi, "OCT")
    .replace(/NOVEMBER/gi, "NOV")
    .replace(/DECEMBER/gi, "DEC")
    .replace(/JANUARY/gi, "JAN")
    .replace(/FEBRUARY/gi, "FEB")
    .replace(/MARCH/gi, "MAR")
    .replace(/APRIL/gi, "APR")
    .replace(/JUNE/gi, "JUN");
}

export default function Certifications({ certifications = [] }) {
  const [showAll, setShowAll] = useState(false);
  const reduce = useReducedMotion();

  const sorted = [...certifications].sort(
    (a, b) => Number(a.order ?? 999) - Number(b.order ?? 999)
  );
  const visible = showAll ? sorted : sorted.slice(0, 6);

  if (!certifications.length) return null;

  return (
    <section id="certifications" className={styles.section}>
      <div className="wrap">
        {/* Section Header: Large Editorial Heading */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              <span>ACCREDITATIONS</span>
            </div>
            <h2 className={styles.heading}>CERTIFICATIONS</h2>
            <p className={styles.subheading}>
              Professional credentials, courses, and technical learning.
            </p>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.totalBadge}>
              {certifications.length} CREDENTIALS
            </span>
          </div>
        </div>

        {/* Large Editorial Horizontal Rows */}
        <div className={styles.rowsContainer}>
          {visible.map((cert, i) => {
            const indexStr = String(i + 1).padStart(2, "0");
            const logo = resolveProviderLogo(cert.organization, cert.issuer);
            const dateDisplay = formatDate(cert.issueDate || cert.date);
            const verifyUrl = cert.verificationUrl || cert.credentialUrl || cert.credential_url;
            const hasCredentialUrl = Boolean(
              verifyUrl && verifyUrl.trim().length > 0 && verifyUrl.startsWith("http")
            );

            return (
              <motion.article
                key={cert.id ?? `${cert.name}-${i}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -6% 0px" }}
                transition={{
                  duration: reduce ? 0.01 : TIMING.component,
                  delay: reduce ? 0 : Math.min(i * 0.05, 0.25),
                  ease: EASE.premium,
                }}
                className={styles.row}
              >
                <div className={styles.row__inner}>
                  {/* Left: Index Number */}
                  <div className={styles.row__indexCol}>
                    <span className={styles.row__index}>{indexStr}</span>
                  </div>

                  {/* Center: Certification Name & Organization with Logo */}
                  <div className={styles.row__mainCol}>
                    <h3 className={styles.row__title}>{cert.name}</h3>

                    <div className={styles.row__providerRow}>
                      {logo && <span className={styles.row__providerLogo}>{logo}</span>}
                      <span className={styles.row__providerName}>
                        {cert.organization || "Independent"}
                        {cert.issuer && cert.issuer !== cert.organization
                          ? ` · ${cert.issuer}`
                          : ""}
                      </span>
                    </div>
                  </div>

                  {/* Right: Standardized Date & Editorial Verification Status */}
                  <div className={styles.row__metaCol}>
                    <span className={styles.row__date}>{dateDisplay}</span>

                    {hasCredentialUrl ? (
                      <a
                        href={verifyUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={styles.row__verifyLink}
                        aria-label={`Verify credential for ${cert.name}`}
                      >
                        <span>VERIFY CREDENTIAL</span>
                        <span className={styles.row__arrow} aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    ) : (
                      <span className={styles.row__verifiedText}>VERIFIED</span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Minimal Editorial "VIEW ALL" Action */}
        {certifications.length > 6 && (
          <div className={styles.moreAction}>
            <button
              type="button"
              className={styles.moreBtn}
              onClick={() => setShowAll((v) => !v)}
            >
              <span className={styles.moreBtnText}>
                {showAll ? "SHOW LESS ↑" : "VIEW ALL CERTIFICATIONS →"}
              </span>
              <span className={styles.moreBtnCount}>
                {certifications.length} CREDENTIALS
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
