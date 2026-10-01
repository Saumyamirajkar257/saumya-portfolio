"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import Particles from "@/components/Particles";
import { MagneticButton, EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./Hero.module.css";

export default function Hero({ profile }) {
  const reduce = useReducedMotion();
  const heroRef = useRef(null);

  // Mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 130, mass: 0.85 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax layer transforms
  const textX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const textY = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const portraitX = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const portraitY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);
  const lightX = useTransform(smoothX, [-0.5, 0.5], [-25, 25]);
  const lightY = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);

  const handleMouseMove = (e) => {
    if (reduce || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const scrollTo = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { offset: -60, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }
  };

  const githubUrl = profile?.socials?.github || profile?.github || "https://github.com/saumyamirajkar";
  const linkedinUrl = profile?.socials?.linkedin || profile?.linkedin || "https://linkedin.com/in/saumyamirajkar";
  const instagramUrl = profile?.socials?.instagram || profile?.instagram || "https://instagram.com/saumyamirajkar";

  return (
    <section
      id="home"
      className={styles.hero}
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Studio Lighting Accents */}
      <motion.div
        className={styles.hero__lightBeam}
        style={reduce ? {} : { x: lightX, y: lightY }}
        aria-hidden="true"
      />
      <motion.div
        className={styles.hero__backlight}
        style={reduce ? {} : { x: lightX, y: lightY }}
        aria-hidden="true"
      />
      <Particles className={styles.hero__particles} />

      {/* Main Editorial Stage */}
      <div className={styles.hero__stage}>
        {/* Layer 1: Left Typography & Action Controls */}
        <motion.div
          className={styles.hero__textLayer}
          style={reduce ? {} : { x: textX, y: textY }}
        >
          {/* Tagline / Subtitle */}
          <motion.div
            className={styles.hero__subHeader}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE.premium }}
          >
            <span className={styles.hero__subHeaderDot} />
            <span>Computer Engineering · IoT · AI</span>
          </motion.div>

          <div className={styles.hero__titleStack}>
            <div className={styles.hero__lineOverflow}>
              <motion.h1
                className={styles.hero__giantWord}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.18, ease: EASE.premium }}
              >
                SAUMYA
              </motion.h1>
            </div>

            <div className={styles.hero__lineOverflow}>
              <motion.div
                className={styles.hero__giantWordSecondary}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.28, ease: EASE.premium }}
              >
                MIRAJKAR
              </motion.div>
            </div>
          </div>

          {/* Editorial Actions (Crisp Brutalist Buttons) */}
          <motion.div
            className={styles.hero__actions}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: TIMING.section, delay: 0.45, ease: EASE.premium }}
          >
            <MagneticButton strength={0.25} duration={0.25}>
              <a
                href="#projects"
                className={styles.hero__btnPrimary}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#projects");
                }}
              >
                <span>VIEW SELECTED WORK</span>
                <span aria-hidden="true" className={styles.hero__btnArrow}>→</span>
              </a>
            </MagneticButton>

            <MagneticButton strength={0.25} duration={0.25}>
              <a
                href="/resume/Saumya_Mirajkar_Resume.pdf"
                target="_blank"
                rel="noreferrer"
                className={styles.hero__btnSecondary}
              >
                <span>DOWNLOAD RÉSUMÉ</span>
                <span aria-hidden="true" className={styles.hero__btnArrow}>↓</span>
              </a>
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Layer 2: Seamlessly Integrated Portrait Cutout (Enlarged presence by ~10%) */}
        <motion.div
          className={styles.hero__portraitWrap}
          style={reduce ? {} : { x: portraitX, y: portraitY }}
          initial={{ opacity: 0, y: 45, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.22, ease: EASE.premium }}
        >
          <img
            src="/saumya-noir.png"
            alt="Saumya Mirajkar — Computer Engineering & IoT"
            className={styles.hero__portraitImg}
            loading="eager"
            draggable="false"
          />
        </motion.div>
      </div>

      {/* Bottom Editorial Meta Bar (Balanced Lower-Left & Lower-Right) */}
      <div className={styles.hero__bottomBar}>
        {/* Lower Left: Engineering & City Metadata + Social Links */}
        <div className={styles.hero__metaLeft}>
          <div className={styles.hero__metaInfo}>
            <span className={styles.hero__metaTitle}>COMPUTER ENGINEERING &amp; IoT</span>
            <span className={styles.hero__metaSub}>PUNE, INDIA</span>
          </div>

          <div className={styles.hero__socials}>
            <MagneticButton strength={0.35}>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.hero__socialIcon}
                aria-label="Instagram Profile"
                title="Instagram"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            </MagneticButton>

            <MagneticButton strength={0.35}>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.hero__socialIcon}
                aria-label="GitHub Profile"
                title="GitHub"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </MagneticButton>

            <MagneticButton strength={0.35}>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.hero__socialIcon}
                aria-label="LinkedIn Profile"
                title="LinkedIn"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </MagneticButton>
          </div>
        </div>

        {/* Lower Right: Editorial Scroll Cue */}
        <div className={styles.hero__metaRight}>
          <button
            type="button"
            className={styles.hero__scrollCue}
            onClick={() => scrollTo("#projects")}
            aria-label="Scroll to selected work"
          >
            <span className={styles.hero__scrollText}>SCROLL TO EXPLORE</span>
            <span className={styles.hero__scrollArrow} aria-hidden="true">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
