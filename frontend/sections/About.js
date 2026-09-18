"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import Reveal, { Counter } from "@/components/animations/Reveal";
import styles from "./About.module.css";

const ABOUT_STATS = [
  { num: "3", suffix: "+", label: "Core Languages" },
  { num: "10", suffix: "+", label: "Certifications" },
  { num: "100", suffix: "%", label: "Commitment" },
];

export default function About({ profile }) {
  const location = profile?.location || "Pune, Maharashtra, India";
  
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Subtle cinematic parallax for the credentials card
  const yMove = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="about" className="block" ref={sectionRef}>
      <div className="wrap">
        <div className={styles.aboutGrid}>
          {/* Left: Engineering Credentials Card */}
          <motion.div style={{ y: yMove }} className={styles.aboutLeft}>
            <div className={styles.credentialsCard}>
              <div className={styles.credHeader}>
                <span className={styles.credTitle}>// Background &amp; Focus</span>
                <span className={styles.credBadge}>CWIT Pune</span>
              </div>

              <div className={styles.credRow}>
                <span className={styles.credIcon}>🎓</span>
                <div className={styles.credText}>
                  <span className={styles.credMain}>Diploma in Computer Engineering &amp; IoT</span>
                  <span className={styles.credSub}>Cusrow Wadia Institute of Technology, Pune</span>
                </div>
              </div>

              <div className={styles.credRow}>
                <span className={styles.credIcon}>💼</span>
                <div className={styles.credText}>
                  <span className={styles.credMain}>Web Development Internship</span>
                  <span className={styles.credSub}>Big Bang Tech Solutions (Lifecycle &amp; Frontend)</span>
                </div>
              </div>

              <div className={styles.credRow}>
                <span className={styles.credIcon}>⚡</span>
                <div className={styles.credText}>
                  <span className={styles.credMain}>Core Competency</span>
                  <span className={styles.credSub}>Hardware Sensors • Python • Next.js &amp; FastAPI</span>
                </div>
              </div>

              <div className={styles.credRow}>
                <span className={styles.credIcon}>📍</span>
                <div className={styles.credText}>
                  <span className={styles.credMain}>{location}</span>
                  <span className={styles.credSub}>Available for Full-Time Roles &amp; Internships</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content & Highlights */}
          <div className={styles.aboutRight}>
            <SectionHeading
              eyebrow="GET TO KNOW ME"
              title={<>About <span className="gradient-text">Me</span></>}
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={styles.aboutDesc}
            >
              {profile?.summary || "Computer Engineering and IoT student with hands-on experience in web development, Python, C/C++, JavaScript, Arduino, and embedded systems. I enjoy bridging hardware sensors with clean, resilient software."}
            </motion.p>

            {/* 3 Metric Cards */}
            <div className={styles.statsRow}>
              {ABOUT_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                  className={styles.statBox}
                >
                  <span className={styles.statVal}>
                    <Counter end={stat.num} suffix={stat.suffix} />
                  </span>
                  <span className={styles.statLbl}>{stat.label}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className={styles.aboutCta}
            >
              <a
                href="#projects"
                className="btn btn--secondary btn--lg"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore My Work <span className="btn-arrow" aria-hidden="true">→</span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}