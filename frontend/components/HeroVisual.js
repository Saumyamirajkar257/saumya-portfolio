"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import HeroGlobe from "./HeroGlobe";
import CopyEmailButton from "./CopyEmailButton";
import styles from "./HeroVisual.module.css";

const TECH_MATRIX = [
  { name: "Python", icon: "🐍", tag: "Backend & ML" },
  { name: "Next.js 16", icon: "⚡", tag: "React 19" },
  { name: "FastAPI", icon: "⚙️", tag: "REST & Async" },
  { name: "C++ / IoT", icon: "📡", tag: "Embedded Systems" },
  { name: "SQL & DB", icon: "💾", tag: "Data Architecture" },
  { name: "Docker", icon: "🐳", tag: "Containerization" },
];

export default function HeroVisual({ profile }) {
  const [activeMode, setActiveMode] = useState("card"); // 'card' | 'globe'

  // 3D Mouse Parallax Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 25 });

  const handleMouseMove = (e) => {
    if (activeMode !== "card") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(nx);
    y.set(ny);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const email = profile?.email || "Saumyamirajkar25@icloud.com";
  const location = profile?.location || "Pune, Maharashtra, India";

  return (
    <div 
      className={styles.visualContainer}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.ambientBacklight} />

      {/* Top Mode Switcher Pill */}
      <div className={styles.modeSwitcher}>
        <button
          type="button"
          className={`${styles.modeTab} ${activeMode === "card" ? styles.modeTabActive : ""}`}
          onClick={() => setActiveMode("card")}
        >
          <span>🎴</span> Developer ID
        </button>
        <button
          type="button"
          className={`${styles.modeTab} ${activeMode === "globe" ? styles.modeTabActive : ""}`}
          onClick={() => setActiveMode("globe")}
        >
          <span>🌐</span> 3D Tech Globe
        </button>
      </div>

      {/* Mode 1: 3D Floating Glass Developer ID Suite */}
      {activeMode === "card" && (
        <motion.div 
          className={styles.tiltWrapper}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Main 3D Glass Card */}
          <div className={styles.developerCard}>
            {/* Top ID Header */}
            <div className={styles.cardHeader}>
              <div className={styles.profileCluster}>
                <div className={styles.avatarRing}>
                  <span className={styles.avatarMonogram}>SM</span>
                </div>
                <div className={styles.identityText}>
                  <span className={styles.devName}>Saumya Mirajkar</span>
                  <span className={styles.devRole}>COMPUTER ENGINEER • IOT & FULL-STACK</span>
                </div>
              </div>

              <div className={styles.statusBadge}>
                <span className={styles.statusPulse} />
                <span>OPEN TO WORK</span>
              </div>
            </div>

            {/* Core Tech Stack Matrix */}
            <div className={styles.techMatrixSection}>
              <span className={styles.matrixLabel}>// Core Engineering Stack</span>
              <div className={styles.techGrid}>
                {TECH_MATRIX.map((tech) => (
                  <div key={tech.name} className={styles.techChip}>
                    <span className={styles.chipIcon}>{tech.icon}</span>
                    <span>{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrated Terminal Readout */}
            <div className={styles.cardConsole}>
              <div className={styles.consoleLine}>
                <span className={styles.consolePrompt}>&gt;&gt; saumya.sys</span>
                <span>--status: <strong className={styles.consoleHighlight}>READY</strong></span>
              </div>
              <div className={styles.consoleLine}>
                <span style={{ color: "#64748B" }}>[0.12ms]</span>
                <span>Bridging hardware sensors &amp; high-performance web systems.</span>
              </div>
            </div>

            {/* Footer Action Strip */}
            <div className={styles.cardFooter}>
              <div className={styles.footerMeta}>
                <span>📍 {location.split(",")[0]}, India</span>
                <span>•</span>
                <span>UTC+5:30</span>
              </div>

              <div className={styles.footerActions}>
                <CopyEmailButton email={email} variant="pill" label="Copy Email" />
                <a 
                  href="https://github.com/saumyamirajkar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.cardLink}
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>

          {/* Floating 3D Satellite Badges */}
          <div className={`${styles.satelliteBadge} ${styles.satTopRight}`}>
            <div className={styles.satIconBadge}>📡</div>
            <div className={styles.satTextGroup}>
              <span className={styles.satTitle}>IoT &amp; Embedded</span>
              <span className={styles.satSub}>Arduino • Sensors • ESP32</span>
            </div>
          </div>

          <div className={`${styles.satelliteBadge} ${styles.satBottomLeft}`}>
            <div className={styles.satIconBadge}>⚡</div>
            <div className={styles.satTextGroup}>
              <span className={styles.satTitle}>Modern Full-Stack</span>
              <span className={styles.satSub}>FastAPI + Next.js 16</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mode 2: 3D Interactive Tech Globe */}
      {activeMode === "globe" && (
        <motion.div 
          className={styles.globeWrapper}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <HeroGlobe />
        </motion.div>
      )}
    </div>
  );
}
