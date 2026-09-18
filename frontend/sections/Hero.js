"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Magnetic from "@/components/animations/Magnetic";
import Particles from "@/components/Particles";
import Macbook3D from "@/components/Macbook3D";
import { usePrefersReducedMotion } from "@/lib/hooks";
import styles from "./Hero.module.css";

export default function Hero({ profile }) {
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef(null);

  // Scroll-driven subtle parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const laptopY = useTransform(scrollYProgress, [0, 1], [0, 35]);
  const laptopScale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);

  const location = profile?.location || "Pune, Maharashtra";

  const scrollTo = (selector) => {
    document.querySelector(selector)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <section id="home" className={styles.hero} ref={sectionRef}>
      <Particles className={styles.hero__particles} />

      <div className={`wrap ${styles.hero__grid}`}>
        {/* --------- Left Column: Typography & Actions --------- */}
        <div className={styles.hero__left}>
          {/* Eyebrow Technical Tag */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={styles.hero__eyebrow}
          >
            <span className={styles.hero__eyebrowText}>
              COMPUTER ENGINEERING STUDENT
              <span className={styles.hero__eyebrowDot} aria-hidden="true" />
              IOT ENTHUSIAST
            </span>
          </motion.div>

          {/* Greeting & Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={styles.hero__titleBlock}
          >
            <span className={styles.hero__greeting}>Hi, I’m</span>
            <h1 className={styles.hero__name}>
              <span className={styles.hero__nameWhite}>Saumya </span>
              <span className={styles.hero__nameBlue}>Mirajkar</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className={styles.hero__subtitle}
          >
            Building intelligent solutions for a connected world.
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={styles.hero__desc}
          >
            Passionate about software development, embedded systems and the Internet of Things. I love turning ideas into real-world solutions that create impact.
          </motion.p>

          {/* CTA Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className={styles.hero__actions}
          >
            <Magnetic>
              <a
                href="#projects"
                className="btn btn--primary btn--lg"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#projects");
                }}
              >
                View My Projects <span className="btn-arrow" aria-hidden="true">→</span>
              </a>
            </Magnetic>

            <Magnetic>
              <a
                href="#contact"
                className="btn btn--secondary btn--lg"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#contact");
                }}
              >
                Get In Touch
              </a>
            </Magnetic>
          </motion.div>

          {/* Location Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className={styles.hero__metaRow}
          >
            <span>📍 {location}</span>
            <span className={styles.hero__locationLine} aria-hidden="true" />
          </motion.div>
        </div>

        {/* --------- Right Column: Interactive 3D MacBook Pro M5 --------- */}
        <motion.div
          style={{ y: laptopY, scale: laptopScale }}
          className={styles.hero__right}
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Macbook3D interactive={true} />
        </motion.div>
      </div>

      {/* Bottom Scroll Down Hint */}
      <div className={`wrap ${styles.hero__foot}`}>
        <div 
          className={styles.hero__scrollText}
          onClick={() => scrollTo("#about")}
          role="button"
          tabIndex={0}
        >
          <span>SCROLL DOWN</span>
          <span className={styles.hero__scrollArrow}>↓</span>
        </div>
      </div>
    </section>
  );
}