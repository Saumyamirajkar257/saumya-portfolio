"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import { ViewportCounter, MagneticButton, EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./About.module.css";

const ABOUT_STATS = [
  { num: 3, suffix: "+", label: "Core Languages" },
  { num: 10, suffix: "+", label: "Certifications" },
  { num: 100, suffix: "%", label: "Commitment" },
];

export default function About({ profile }) {
  const reduce = useReducedMotion();
  const location = profile?.location || "Pune, Maharashtra, India";

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Subtle cinematic parallax for the credentials card
  const yMove = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="about" className="block" ref={sectionRef}>
      <div className="wrap">
        <div className={styles.aboutGrid}>
          {/* Left: Engineering Credentials Card */}
          <motion.div
            style={reduce ? {} : { y: yMove }}
            className={styles.aboutLeft}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: TIMING.section, ease: EASE.premium }}
          >
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: TIMING.component, delay: 0.1, ease: EASE.premium }}
              className={styles.aboutDesc}
            >
              {profile?.summary || "Computer Engineering and IoT student with hands-on experience in web development, Python, C/C++, JavaScript, Arduino, and embedded systems. I enjoy bridging hardware sensors with clean, resilient software."}
            </motion.p>

            {/* 3 Metric Cards */}
            <div className={styles.statsRow}>
              {ABOUT_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: TIMING.component, delay: 0.15 + i * 0.08, ease: EASE.premium }}
                  className={styles.statBox}
                >
                  <span className={styles.statVal}>
                    <ViewportCounter end={stat.num} suffix={stat.suffix} duration={1.6} />
                  </span>
                  <span className={styles.statLbl}>{stat.label}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button with Magnetic Pull */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: TIMING.component, delay: 0.35, ease: EASE.premium }}
              className={styles.aboutCta}
            >
              <MagneticButton strength={0.25}>
                <a
                  href="#projects"
                  className="btn btn--secondary btn--lg"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.querySelector("#projects");
                    if (!el) return;
                    if (window.__lenis) {
                      window.__lenis.scrollTo(el, { offset: -60, duration: 1.2 });
                    } else {
                      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
                    }
                  }}
                >
                  Explore My Work <span className="btn-arrow" aria-hidden="true">→</span>
                </a>
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
