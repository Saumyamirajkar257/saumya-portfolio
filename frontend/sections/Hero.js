"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { MagneticButton, EASE, TIMING } from "@/components/animations/MotionSystem";
import { getActiveResumeUrl, getResumeFilename } from "@/lib/resume";
import styles from "./Hero.module.css";

export default function Hero({ profile }) {
  const resumeUrl = getActiveResumeUrl(profile);
  const resumeFilename = getResumeFilename(resumeUrl);
  const reduce = useReducedMotion();
  const heroRef = useRef(null);

  /* ── Mouse-driven parallax ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springCfg = { damping: 30, stiffness: 120, mass: 0.85 };
  const smoothX = useSpring(mouseX, springCfg);
  const smoothY = useSpring(mouseY, springCfg);

  const textX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const textY = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const portraitX = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const portraitY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    if (reduce || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

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

  const fullName = (profile?.name || "Saumya Mirajkar").trim();
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0]?.toUpperCase() || "SAUMYA";
  const lastName = nameParts.slice(1).join(" ")?.toUpperCase() || "MIRAJKAR";
  const discipline = profile?.headline || profile?.discipline || "COMPUTER ENGINEERING · IoT · AI";
  const locationText = profile?.location?.toUpperCase() || "PUNE, INDIA";

  return (
    <section
      id="home"
      className={styles.hero}
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ═══ THE POSTER FRAME ═══ */}
      <div className={styles.poster}>


        {/* Poster top-right discipline badge */}
        <motion.div
          className={styles.poster__labelTR}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.65, ease: EASE.premium }}
        >
          {discipline}
        </motion.div>

        {/* ── Artwork Area: Typography + Portrait ── */}
        <div className={styles.poster__artwork}>

          {/* BACKGROUND TYPOGRAPHY LAYER (z-index 1) */}
          <motion.div
            className={styles.poster__typographyLayer}
            style={reduce ? {} : { x: textX, y: textY }}
          >
            <motion.h1
              className={styles.poster__firstName}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.12, ease: EASE.premium }}
              aria-label={fullName}
            >
              {firstName}
            </motion.h1>
            <motion.div
              className={styles.poster__lastName}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.22, ease: EASE.premium }}
              aria-hidden="true"
            >
              {lastName}
            </motion.div>
          </motion.div>

          {/* PORTRAIT LAYER (z-index 2 — in front of letters) */}
          <motion.div
            className={styles.poster__portraitWrap}
            style={reduce ? {} : { x: portraitX, y: portraitY }}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.18, ease: EASE.premium }}
          >
            <img
              src="/saumya-noir.png"
              alt="Saumya Mirajkar — Portrait"
              className={styles.poster__portraitImg}
              loading="eager"
              draggable="false"
            />
          </motion.div>
        </div>

        {/* Poster bottom-left: Location */}
        <motion.div
          className={styles.poster__labelBL}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7, ease: EASE.premium }}
        >
          {locationText}
        </motion.div>



      </div>

      {/* ═══ BELOW THE POSTER: Actions + Meta ═══ */}
      <motion.div
        className={styles.hero__footer}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.section, delay: 0.5, ease: EASE.premium }}
      >
        {/* Left: CTA Buttons */}
        <div className={styles.hero__actions}>
          <MagneticButton strength={0.25} duration={0.25}>
            <a
              href="#projects"
              className={styles.hero__btnPrimary}
              onClick={(e) => { e.preventDefault(); scrollTo("#projects"); }}
            >
              <span>VIEW SELECTED WORK</span>
              <span aria-hidden="true" className={styles.hero__btnArrow}>→</span>
            </a>
          </MagneticButton>

          {resumeUrl && (
            <MagneticButton strength={0.25} duration={0.25}>
              <a
                href={resumeUrl}
                download={resumeFilename}
                className={styles.hero__btnSecondary}
                title="Download Saumya Mirajkar's Résumé PDF"
              >
                <span>DOWNLOAD RÉSUMÉ</span>
                <span aria-hidden="true" className={styles.hero__btnArrow}>↓</span>
              </a>
            </MagneticButton>
          )}
        </div>

        {/* Center: Social Icons */}
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </MagneticButton>
        </div>

        {/* Right: Scroll Cue */}
        <button
          type="button"
          className={styles.hero__scrollCue}
          onClick={() => scrollTo("#projects")}
          aria-label="Scroll to selected work"
        >
          <span className={styles.hero__scrollText}>SCROLL TO EXPLORE</span>
          <span className={styles.hero__scrollArrow} aria-hidden="true">↓</span>
        </button>
      </motion.div>
    </section>
  );
}
