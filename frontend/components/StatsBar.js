"use client";

import { motion } from "framer-motion";
import { Counter } from "@/components/animations/Reveal";
import styles from "./StatsBar.module.css";

const STAT_ITEMS = [
  {
    num: "3",
    suffix: "+",
    label: "Core Languages",
    sub: "Python • C/C++ • JS",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    num: "10",
    suffix: "+",
    label: "Certifications",
    sub: "Technical & Professional",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    num: "4",
    suffix: "",
    label: "Semesters",
    sub: "CWIT Pune (CE & IoT)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    num: "100",
    suffix: "%",
    label: "Commitment",
    sub: "Hardware & Software",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export default function StatsBar() {
  return (
    <div className="wrap">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={styles.statsContainer}
      >
        {STAT_ITEMS.map((item, i) => (
          <div key={item.label} className={styles.statCol}>
            <div className={styles.statIcon} aria-hidden="true">
              {item.icon}
            </div>
            <div className={styles.statText}>
              <span className={styles.statNumber}>
                <Counter end={item.num} suffix={item.suffix} />
              </span>
              <span className={styles.statLabel}>{item.label}</span>
            </div>
            {i < STAT_ITEMS.length - 1 && <span className={styles.divider} aria-hidden="true" />}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

