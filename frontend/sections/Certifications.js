"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import styles from "./Certifications.module.css";

function badgeColor(name = "") {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const palettes = [
    { bg: "rgba(79,220,180,0.12)", fg: "#4fdcb4", bd: "rgba(79,220,180,0.35)" },
    { bg: "rgba(0,229,160,0.12)", fg: "#00e5a0", bd: "rgba(0,229,160,0.35)" },
    { bg: "rgba(22,201,160,0.12)", fg: "#16c9a0", bd: "rgba(22,201,160,0.35)" },
    { bg: "rgba(0,184,127,0.12)", fg: "#00b87f", bd: "rgba(0,184,127,0.35)" },
  ];
  return palettes[hash % palettes.length];
}

export default function Certifications({ certifications = [] }) {
  const [showAll, setShowAll] = useState(false);
  const reduce = useReducedMotion();
  const visible = showAll ? certifications : certifications.slice(0, 6);

  if (!certifications.length) return null;

  return (
    <section id="certifications" className="block">
      <div className="wrap">
        <SectionHeading
          eyebrow="recognized learning"
          title={<>Certifications &amp; <span className="gradient-text">credentials</span></>}
          lead={<p className="prose">Ten verified credentials — from Google, IBM and Cisco.</p>}
        />

        <motion.div layout className={styles.certs__grid}>
          {visible.map((cert, i) => {
            const badge = badgeColor(cert.name);
            return (
              <motion.article
                key={cert.id ?? i}
                layout
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: reduce ? 0 : Math.min((i % 4) * 0.06, 0.24), ease: [0.22, 1, 0.36, 1] }}
                className={styles.certCard}
                data-cursor
              >
                <div className={styles.certCard__top}>
                  <span className={styles.certCard__badge} style={{ background: badge.bg, color: badge.fg, borderColor: badge.bd }}>
                    {(cert.organization?.[0] || "◈")}
                  </span>
                  <span className="text-mono certCard__date">{cert.date}</span>
                </div>

                <h3 className={styles.certCard__name}>{cert.name}</h3>
                <p className={styles.certCard__issuer}>
                  <span className={styles.certCard__org}>{cert.organization}</span>
                  {cert.issuer ? <span className={styles.certCard__sep}>, {cert.issuer}</span> : null}
                </p>

                {cert.credential_url ? (
                  <a href={cert.credential_url} target="_blank" rel="noreferrer noopener" className={styles.certCard__link}>
                    Verify credential
                  </a>
                ) : (
                  <span className={styles.certCard__verifiedTag}>✓ Earned</span>
                )}
              </motion.article>
            );
          })}
        </motion.div>

        {certifications.length > 6 && (
          <div className={styles.certs__more}>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowAll((v) => !v)}>
              {showAll ? `Show less` : `View all ${certifications.length} certifications`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}