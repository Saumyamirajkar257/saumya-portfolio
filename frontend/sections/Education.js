"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import { EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./Education.module.css";

export default function Education({ education = [] }) {
  const reduce = useReducedMotion();

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
            <motion.div
              key={ed.id ?? i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: TIMING.component, delay: reduce ? 0 : i * 0.12, ease: EASE.premium }}
              className={styles.edu__timelineItem}
            >
              <div className={styles.edu__timelineDot} />
              <div className={styles.edu__timelineContent}>
                <div className={styles.edu__header}>
                  <h3 className={styles.edu__degree}>{ed.degree}</h3>
                  <span className={`${styles.edu__years} text-mono`}>{ed.start_date} - {ed.end_date}</span>
                </div>
                <p className={styles.edu__institution}>{ed.institution}</p>

                {ed.details?.length ? (
                  <p className={styles.edu__detail}>{ed.details[0]}</p>
                ) : null}

                {(ed.grades && Object.keys(ed.grades).length > 0) && (
                  <div className={styles.edu__grades}>
                    {Object.entries(ed.grades)
                      .sort(([a], [b]) => {
                        const numA = parseInt(a.replace(/\D/g, ""), 10);
                        const numB = parseInt(b.replace(/\D/g, ""), 10);
                        if (!isNaN(numA) && !isNaN(numB)) {
                          return numA - numB;
                        }
                        return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
                      })
                      .map(([k, v]) => (
                        <span key={k} className={styles.edu__grade}>
                          <span className={styles.edu__gradeKey}>{k}</span>
                          <span className={styles.edu__gradeVal}>{v}</span>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
