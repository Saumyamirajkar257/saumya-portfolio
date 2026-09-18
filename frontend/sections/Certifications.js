"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import styles from "./Certifications.module.css";

export default function Certifications({ certifications = [] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? certifications : certifications.slice(0, 6);

  if (!certifications.length) return null;

  return (
    <section id="certifications" className="block">
      <div className="wrap">
        <SectionHeading
          eyebrow="RECOGNIZED LEARNING"
          title={<>Verified <span className="gradient-text">Certifications</span></>}
          lead={<p className="prose">Professional credentials earned from Google, IBM, and Cisco.</p>}
        />

        <div className={styles.certsGrid}>
          {visible.map((cert, i) => (
            <motion.div
              key={cert.id ?? i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -6% 0px" }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
              className={styles.certCard}
            >
              <div className={styles.certTop}>
                <span className={styles.certBadge}>
                  {cert.logo ? (
                    <img src={cert.logo} alt={cert.organization} className={styles.certLogoImg} />
                  ) : (
                    cert.organization?.[0] || "◈"
                  )}
                </span>
                <span className={styles.certDate}>{cert.date}</span>
              </div>

              <h3 className={styles.certName}>{cert.name}</h3>
              <p className={styles.certIssuer}>
                {cert.organization}
                {cert.issuer ? ` • ${cert.issuer}` : ""}
              </p>

              {cert.credential_url ? (
                <a
                  href={cert.credential_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.certLink}
                >
                  Verify Credential ↗
                </a>
              ) : (
                <span className={styles.verifiedBadge}>✓ Verified</span>
              )}
            </motion.div>
          ))}
        </div>

        {certifications.length > 6 && (
          <div className={styles.moreAction}>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show Less" : `View All ${certifications.length} Certifications`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}