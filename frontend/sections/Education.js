"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./Education.module.css";

function getSemesterNum(key = "") {
  const match = key.match(/\d+/);
  return match ? parseInt(match[0], 10) : 999;
}

function formatSemesterKey(key = "") {
  const match = key.match(/\d+/);
  if (match) {
    const num = String(match[0]).padStart(2, "0");
    return `SEM ${num}`;
  }
  return key.toUpperCase();
}

function formatDateRange(startDate, endDate, isCurrent) {
  if (isCurrent || endDate?.toLowerCase() === "present") {
    return `${startDate} — PRESENT`;
  }
  if (startDate === endDate || !endDate) {
    return `${startDate}`;
  }
  return `${startDate} — ${endDate}`;
}

export default function Education({ education = [] }) {
  const reduce = useReducedMotion();
  const sorted = [...education].sort((a, b) => Number(a.order ?? a.displayOrder ?? 999) - Number(b.order ?? b.displayOrder ?? 999));

  if (!sorted.length) return null;

  return (
    <section id="education" className={styles.section}>
      <div className="wrap">
        {/* Section Header: Large Editorial Heading */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            <span>ACADEMIC PATHWAY</span>
          </div>
          <h2 className={styles.heading}>EDUCATION</h2>
          <p className={styles.subheading}>
            The institutions and milestones that shaped my foundation.
          </p>
        </div>

        {/* Refined Vertical Editorial Timeline */}
        <div className={styles.timeline}>
          {sorted.map((ed, i) => {
            const isPrimary = i === 0;
            const dateStr = formatDateRange(ed.start_date, ed.end_date, ed.current);
            const degreeTitle = ed.degree?.toUpperCase() || "DIPLOMA";
            const gradeEntries = ed.grades
              ? Object.entries(ed.grades).sort(
                  ([aKey], [bKey]) => getSemesterNum(aKey) - getSemesterNum(bKey)
                )
              : [];

            return (
              <motion.article
                key={ed.id ?? `${ed.degree}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -6% 0px" }}
                transition={{
                  duration: reduce ? 0.01 : TIMING.component,
                  delay: reduce ? 0 : i * 0.1,
                  ease: EASE.premium,
                }}
                className={`${styles.timelineItem} ${isPrimary ? styles.isPrimary : styles.isSecondary}`}
              >
                {/* Timeline Dot Node */}
                <div className={styles.nodeTrack}>
                  <div className={`${styles.nodeDot} ${isPrimary ? styles.nodeDotPrimary : ""}`} />
                  {i < sorted.length - 1 && <div className={styles.nodeLine} />}
                </div>

                {/* Editorial Content Block */}
                <div className={styles.contentBlock}>
                  {/* Date Tag */}
                  <div className={styles.dateRow}>
                    <span className={styles.dateText}>{dateStr}</span>
                    {isPrimary && (
                      <span className={styles.currentBadge}>CURRENT PURSUIT</span>
                    )}
                  </div>

                  {/* Title & Institution */}
                  <h3 className={styles.degreeTitle}>{degreeTitle}</h3>
                  <p className={styles.institution}>
                    {ed.institution}
                    {ed.location ? ` · ${ed.location}` : ""}
                  </p>

                  {/* Program Focus Detail */}
                  {ed.details?.[0] && (
                    <p className={styles.description}>{ed.details[0]}</p>
                  )}

                  {/* Compact Editorial Metadata Chips (Semester Results) */}
                  {gradeEntries.length > 0 && (
                    <div className={styles.gradesContainer}>
                      <span className={styles.gradesLabel}>ACADEMIC RECORD:</span>
                      <div className={styles.gradesList}>
                        {gradeEntries.map(([k, v]) => (
                          <div key={k} className={styles.gradeChip}>
                            <span className={styles.gradeKey}>{formatSemesterKey(k)}</span>
                            <span className={styles.gradeVal}>{v}</span>
                          </div>
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
