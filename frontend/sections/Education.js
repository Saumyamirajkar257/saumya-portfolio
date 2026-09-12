"use client";

import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import TiltCard from "@/components/animations/TiltCard";
import styles from "./Education.module.css";

/** Deterministic accent per education record. */
const ACCENTS = [
  ["#00e5a0", "#00b87f"],
  ["#4fdcb4", "#16c9a0"],
  ["#16c9a0", "#00e5a0"],
];

export default function Education({ education = [] }) {
  return (
    <section id="education" className="block">
      <div className="wrap">
        <SectionHeading
          eyebrow="where I studied"
          title={<>Education <span className="gradient-text">&amp; academics</span></>}
          lead={<p className="prose">Institutes and courses that shaped my foundation.</p>}
        />

        <div className={styles.edu__grid}>
          {education.map((ed, i) => {
            const [a, b] = ACCENTS[i % ACCENTS.length];
            return (
              <Reveal key={ed.id ?? i} delay={i * 0.1}>
                <TiltCard max={5} className={styles.edu__card} data-cursor>
                  <div className={styles.edu__cardHead} style={{ ["--ea"]: a, ["--eb"]: b }}>
                    <span className={styles.edu__monogram}>
                      {(ed.institution || "E").split(" ").filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "E"}
                    </span>
                    <span className={`${styles.edu__years} text-mono`}>{ed.start_date} — {ed.end_date}</span>
                  </div>

                  <div className={styles.edu__body}>
                    <h3 className={styles.edu__degree}>{ed.degree}</h3>
                    <p className={styles.edu__institution}>{ed.institution}</p>
                    {ed.location ? <p className={`${styles.edu__location} text-mono`}>{ed.location}</p> : null}

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
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}