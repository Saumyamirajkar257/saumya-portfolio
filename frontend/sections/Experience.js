"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./Experience.module.css";

const FALLBACK_EXPERIENCE = [
  {
    id: 1,
    company: "Big Bang Tech Solutions Pvt. Ltd.",
    position: "Web Development Intern",
    location: "Pune, Maharashtra",
    start_date: "MAY 2026",
    end_date: "SEP 2026",
    current: false,
    responsibilities: [
      "Assisted with web and mobile application development.",
      "Supported project planning and execution.",
      "Conducted technical research and supported implementation.",
      "Collaborated with development and design teams.",
    ],
    technologies: ["WEB DEVELOPMENT", "JAVASCRIPT", "PYTHON", "GIT"],
  },
];

function formatDateDisplay(startDate = "", endDate = "", current = false) {
  const start = String(startDate).trim().toUpperCase();
  const end = current ? "PRESENT" : String(endDate).trim().toUpperCase();
  if (start && end) return `${start} — ${end}`;
  if (start) return start;
  return "MAY 2026 — SEP 2026";
}

// Clean concise formatting for standard responsibility bullets
function cleanBullet(text = "") {
  let cleaned = text.trim();
  if (!cleaned.endsWith(".")) cleaned += ".";
  cleaned = cleaned
    .replace(/ activities\.$/i, ".")
    .replace(/ while meeting project deadlines\.$/i, ".")
    .replace(/ of technical solutions\.$/i, ".")
    .replace(/ on project activities\.$/i, ".");
  return cleaned;
}

export default function Experience({ experience = [] }) {
  const reduce = useReducedMotion();
  const rawList = experience.length > 0 ? experience : FALLBACK_EXPERIENCE;
  const sorted = [...rawList].sort((a, b) => Number(a.order ?? a.displayOrder ?? 999) - Number(b.order ?? b.displayOrder ?? 999));

  return (
    <section id="experience" className={styles.section}>
      <div className="wrap">
        {/* Section Header: Large Editorial Heading */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            <span>CAREER PATHWAY</span>
          </div>
          <h2 className={styles.heading}>EXPERIENCE</h2>
          <p className={styles.subheading}>
            Education, internships, and technical development.
          </p>
        </div>

        {/* Vertical Editorial Timeline */}
        <div className={styles.timeline}>
          {sorted.map((item, i) => {
            const dateStr = formatDateDisplay(item.start_date, item.end_date, item.current);
            const bullets = (item.responsibilities || []).map(cleanBullet);
            const techList = item.technologies || [];

            return (
              <motion.article
                key={item.id ?? `${item.company}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -6% 0px" }}
                transition={{
                  duration: reduce ? 0.01 : TIMING.component,
                  delay: reduce ? 0 : i * 0.1,
                  ease: EASE.premium,
                }}
                className={styles.timelineItem}
              >
                {/* Node Track */}
                <div className={styles.nodeTrack}>
                  <div className={`${styles.nodeDot} ${item.current || i === 0 ? styles.nodeDotActive : ""}`} />
                  {i < sorted.length - 1 && <div className={styles.nodeLine} />}
                </div>

                {/* Compact Editorial Content Block */}
                <div className={styles.contentBlock}>
                  {/* Date Tag */}
                  <div className={styles.dateRow}>
                    <span className={styles.dateText}>{dateStr}</span>
                    {item.current && (
                      <span className={styles.currentBadge}>ACTIVE ROLE</span>
                    )}
                  </div>

                  {/* Role Title (Primary Visual Focal Point) */}
                  <h3 className={styles.roleTitle}>
                    {item.position?.toUpperCase() || "WEB DEVELOPMENT INTERN"}
                  </h3>

                  {/* Company & Location */}
                  <p className={styles.companyRow}>
                    <span className={styles.companyName}>{item.company}</span>
                    {item.location && (
                      <span className={styles.locationText}> · {item.location}</span>
                    )}
                  </p>

                  {/* Concise Editorial Bullets */}
                  {bullets.length > 0 && (
                    <ul className={styles.bulletList}>
                      {bullets.map((b, idx) => (
                        <li key={idx} className={styles.bulletItem}>
                          <span className={styles.bulletSymbol}>•</span>
                          <span className={styles.bulletText}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Editorial Technology Tags */}
                  {techList.length > 0 && (
                    <div className={styles.techContainer}>
                      <span className={styles.techLabel}>STACK &amp; TOOLS:</span>
                      <div className={styles.techList}>
                        {techList.map((t) => (
                          <span key={t} className={styles.techTag}>
                            {String(t).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
