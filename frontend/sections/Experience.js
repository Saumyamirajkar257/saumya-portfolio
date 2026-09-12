"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import styles from "./Experience.module.css";

export default function Experience({ experience = [] }) {
  const reduce = useReducedMotion();
  const lineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 75%", "end 60%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 22, restDelta: 0.001 });

  return (
    <section id="experience" className="block">
      <div className="wrap">
        <SectionHeading
          index="06"
          eyebrow="where I've worked"
          title={<>Experience <span className="gradient-text">timeline</span></>}
          lead={<p className="prose">Professional and hands-on background, in order.</p>}
        />

        <div className={styles.timeline} ref={lineRef}>
          {!reduce && (
            <motion.span
              className={styles.timeline__line}
              style={{ scaleY }}
              aria-hidden="true"
            />
          )}
          <span className={styles.timeline__base} aria-hidden="true" />

          {experience.map((exp, i) => (
            <div
              key={exp.id ?? i}
              className={`${styles.timeline__item} ${i % 2 === 0 ? styles.timeline__itemLeft : styles.timeline__itemRight}`}
            >
              <span className={styles.timeline__dot} aria-hidden="true">
                <span className={styles.timeline__dotCore} />
              </span>

              <Reveal
                delay={0.08}
                y={30}
                className={`${styles.timeline__card} ${i % 2 === 0 ? styles.cardLeft : styles.cardRight}`}
              >
                <div className={styles.job}>
                  <div className={styles.job__top}>
                    <h3 className={styles.job__position}>{exp.position}</h3>
                    <span className={styles.job__company}>{exp.company}</span>
                  </div>
                  <div className={`${styles.job__dates} text-mono`}>
                    <span className={styles.job__date}>{exp.start_date}</span>
                    <span className={styles.job__arrow}>—</span>
                    <span className={styles.job__date}>{exp.end_date}</span>
                    {exp.current && <span className={styles.job__now}>now</span>}
                  </div>
                  <ul className={styles.job__list}>
                    {(exp.responsibilities || []).map((r) => (
                      <li key={r} className={styles.job__li}>
                        <span className={styles.job__liArrow} aria-hidden="true">▸</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.job__tech}>
                    {(exp.technologies || []).map((t) => (
                      <span key={t} className="chip">{t}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}