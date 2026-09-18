"use client";

import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import TiltCard from "@/components/animations/TiltCard";
import styles from "./Education.module.css";

/** Deterministic accent per education record. */
const ACCENTS = [
  ["#0070F3", "#00d4ff"],
  ["#38bdf8", "#2563eb"],
  ["#0ea5e9", "#0070F3"],
];

export default function Education({ education = [] }) {
  return (
    <section id="education" className="block">
      <div className="wrap">
        <SectionHeading
          eyebrow="WHERE I STUDIED"
          title={<>Education <span className="gradient-text">&amp; Academics</span></>}
          lead={<p className="prose">Institutes and courses that shaped my foundation.</p>}
        />

        <div className={styles.edu__timeline}>
          {education.map((ed, i) => (
            <Reveal key={ed.id ?? i} delay={i * 0.1}>
              <div className={styles.edu__timelineItem}>
                <div className={styles.edu__timelineDot} />
                <div className={styles.edu__timelineContent}>
                  <div className={styles.edu__header}>
                    <h3 className={styles.edu__degree}>{ed.degree}</h3>
                    <span className={`${styles.edu__years} text-mono`}>{ed.start_date} — {ed.end_date}</span>
                  </div>
                  <p className={styles.edu__institution}>{ed.institution}</p>
                  
                  {ed.details?.length ? (
                    <p className={styles.edu__detail}>{ed.details[0]}</p>
                  ) : null}

                  {(ed.grades && Object.keys(ed.grades).length > 0) && (
                    <div className={styles.edu__grades}>
                      {Object.entries(ed.grades).map(([k, v]) => (
                        <span key={k} className={styles.edu__grade}>
                          <span className={styles.edu__gradeKey}>{k}</span>
                          <span className={styles.edu__gradeVal}>{v}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}