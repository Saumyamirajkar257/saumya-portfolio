"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { MagneticButton, EASE, TIMING } from "@/components/animations/MotionSystem";
import { useIsTouch } from "@/lib/hooks";
import { getActiveResumeUrl, getResumeFilename } from "@/lib/resume";
import styles from "./Hero.module.css";

export default function Hero({ profile }) {
  const resumeUrl = getActiveResumeUrl(profile);
  const resumeFilename = getResumeFilename(resumeUrl);
  const reduce = useReducedMotion();
  const touch = useIsTouch();
  const heroRef = useRef(null);

  /* ── Mouse-driven parallax (desktop only) ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springCfg = { damping: 32, stiffness: 130, mass: 0.8 };
  const smoothX = useSpring(mouseX, springCfg);
  const smoothY = useSpring(mouseY, springCfg);

  const textX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const textY = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const portraitX = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const portraitY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    if (reduce || touch || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
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
      <motion.div
        className={styles.poster}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.04, ease: EASE.cinematic }}
      >
        {/* Poster top-right discipline badge */}
        <motion.div
          className={styles.poster__labelTR}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.5, ease: EASE.premium }}
        >
          {discipline}
        </motion.div>

        {/* ── Artwork Area: Typography + Portrait ── */}
        <div className={styles.poster__artwork}>
          {/* BACKGROUND TYPOGRAPHY LAYER (z-index 1) */}
          <motion.div
            className={styles.poster__typographyLayer}
            style={reduce || touch ? {} : { x: textX, y: textY }}
          >
            <h1 className={styles.poster__heading} aria-label={fullName}>
              <span className={styles.poster__maskLine}>
                <motion.span
                  className={styles.poster__firstName}
                  initial={{ y: "115%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 1.0, delay: 0.12, ease: EASE.cinematic }}
                >
                  {firstName}
                </motion.span>
              </span>
              <span className={styles.poster__maskLine} aria-hidden="true">
                <motion.span
                  className={styles.poster__lastName}
                  initial={{ y: "115%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 1.0, delay: 0.24, ease: EASE.cinematic }}
                >
                  {lastName}
                </motion.span>
              </span>
            </h1>
          </motion.div>

          {/* PORTRAIT LAYER (z-index 2 — in front of letters) */}
          <motion.div
            className={styles.poster__portraitWrap}
            style={reduce || touch ? {} : { x: portraitX, y: portraitY }}
            initial={{ clipPath: "inset(14% 0% 0% 0%)", opacity: 0, y: 32, scale: 1.03 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.15, delay: 0.18, ease: EASE.cinematic }}
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.58, ease: EASE.premium }}
        >
          {locationText}
        </motion.div>
      </motion.div>

      {/* ═══ BELOW THE POSTER: Actions + Meta ═══ */}
      <div className={styles.hero__footer}>
        {/* Left: CTA Buttons in coordinated sequence */}
        <div className={styles.hero__actions}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.65, ease: EASE.premium }}
          >
            <MagneticButton strength={0.25}>
              <a
                href="#projects"
                className={styles.hero__btnPrimary}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#projects");
                }}
              >
                <span>VIEW SELECTED WORK</span>
                <span aria-hidden="true" className={styles.hero__btnArrow}>
                  →
                </span>
              </a>
            </MagneticButton>
          </motion.div>

          {resumeUrl && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.73, ease: EASE.premium }}
            >
              <MagneticButton strength={0.25}>
                <a
                  href={resumeUrl}
                  download={resumeFilename}
                  className={styles.hero__btnSecondary}
                  title="Download Saumya Mirajkar's Résumé PDF"
                >
                  <span>DOWNLOAD RÉSUMÉ</span>
                  <span aria-hidden="true" className={styles.hero__btnArrow}>
                    ↓
                  </span>
                </a>
              </MagneticButton>
            </motion.div>
          )}
        </div>

        {/* Center: Social Icons */}
        <div className={styles.hero__socials}>
          {[
            {
              href: instagramUrl,
              title: "Instagram",
              label: "Instagram Profile",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              ),
            },
            {
              href: githubUrl,
              title: "GitHub",
              label: "GitHub Profile",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              ),
            },
            {
              href: linkedinUrl,
              title: "LinkedIn",
              label: "LinkedIn Profile",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              ),
            },
          ].map((soc, i) => (
            <motion.div
              key={soc.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.81 + i * 0.06, ease: EASE.premium }}
            >
              <MagneticButton strength={0.35}>
                <a
                  href={soc.href}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.hero__socialIcon}
                  aria-label={soc.label}
                  title={soc.title}
                >
                  {soc.icon}
                </a>
              </MagneticButton>
            </motion.div>
          ))}
        </div>

        {/* Right: Scroll Cue */}
        <motion.button
          type="button"
          className={styles.hero__scrollCue}
          onClick={() => scrollTo("#projects")}
          aria-label="Scroll to selected work"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.98, ease: EASE.premium }}
        >
          <span className={styles.hero__scrollText}>SCROLL TO EXPLORE</span>
          <span className={styles.hero__scrollArrow} aria-hidden="true">
            ↓
          </span>
        </motion.button>
      </div>
    </section>
  );
}
