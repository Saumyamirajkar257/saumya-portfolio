"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import styles from "./Experience.module.css";

export default function Experience({ experience = [] }) {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="experience" className="block">
      <div className="wrap">
        <SectionHeading
          eyebrow="MY JOURNEY"
          title={<>My <span className="gradient-text">Experience</span></>}
          lead={<p className="prose">Education, internships, and technical development path.</p>}
        />

        <div className={styles.timeline} ref={containerRef}>
          <motion.div className={styles.timelineLine} style={{ height: lineHeight }} aria-hidden="true" />

          {experience.map((item, i) => (
            <motion.div
              key={item.id ?? i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={styles.timelineItem}
            >
              {/* Blue Circular Node */}
              <div className={styles.nodeWrapper}>
                <span className={styles.timelineNode}>
                  <span className={styles.timelineDot} />
                </span>
              </div>

              {/* Content Card */}
              <div className={styles.timelineContent}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemDates}>
                    {item.start_date} — {item.end_date || "Present"}
                  </span>
                  {item.current && <span className={styles.currentBadge}>CURRENT</span>}
                </div>

                <h3 className={styles.itemPosition}>{item.position}</h3>
                <span className={styles.itemCompany}>
                  {item.company} {item.location ? `• ${item.location}` : ""}
                </span>

                {item.responsibilities?.length > 0 && (
                  <ul className={styles.responsibilitiesList}>
                    {item.responsibilities.map((r, idx) => (
                      <li key={idx} className={styles.resItem}>
                        <span className={styles.resBullet}>›</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {item.technologies?.length > 0 && (
                  <div className={styles.itemChips}>
                    {item.technologies.map((t) => (
                      <span key={t} className={styles.techChip}>{t}</span>
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