"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import SkillsOrbit from "@/components/animations/SkillsOrbit";
import styles from "./Skills.module.css";

const ORDER = ["Languages", "Web", "IoT & Embedded", "Tools & Platforms", "Professional"];

export default function Skills({ skills = [] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState("All");
  const [viewMode, setViewMode] = useState("orbit"); // "orbit" | "grid"

  const categories = ORDER.filter((c) => skills.some((s) => s.category === c));
  const filters = ["All", ...categories];

  const visible = active === "All" ? skills : skills.filter((s) => s.category === active);

  return (
    <section id="skills" className="block">
      <div className="wrap">
        <SectionHeading
          index="02"
          eyebrow="what I work with"
          title={<>Skills & <span className="gradient-text">technologies</span></>}
          lead={
            <p className="prose">
              The tools I use to go from idea to working software and hardware.
              Listed exactly as they appear on my resume — no invented levels.
            </p>
          }
        />

        {/* Category filter + view toggle */}
        <Reveal delay={0.1}>
          <div className={styles.skills__toolbar}>
            <div className={styles.skills__filters} role="tablist" aria-label="Filter skills by category">
              {filters.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={active === f}
                  className={`chip ${styles.skills__filter} ${active === f ? styles.isActive : ""}`}
                  onClick={() => setActive(f)}
                >
                  {f}
                  {active === f ? <span className={styles.skills__count}>{visible.length}</span> : null}
                </button>
              ))}
            </div>

            <button
              className={`btn btn--ghost btn--sm ${styles.viewToggle}`}
              onClick={() => setViewMode((v) => (v === "orbit" ? "grid" : "orbit"))}
              aria-label={viewMode === "orbit" ? "Switch to grid view" : "Switch to orbital view"}
            >
              {viewMode === "orbit" ? (
                <>
                  <span className="text-mono" style={{ fontSize: 12 }}>⊞</span> Grid
                </>
              ) : (
                <>
                  <span className="text-mono" style={{ fontSize: 12 }}>◯</span> Orbit
                </>
              )}
            </button>
          </div>
        </Reveal>

        {/* Orbital constellation or Grid */}
        {viewMode === "orbit" ? (
          <Reveal delay={0.15}>
            <SkillsOrbit skills={visible} />
          </Reveal>
        ) : (
          <Reveal delay={0.15}>
            <motion.div layout className={styles.skills__grid}>
              <AnimatePresence mode="popLayout">
                {visible.map((skill, i) => (
                  <motion.div
                    key={skill.id ?? `${skill.category}-${skill.name}`}
                    layout
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.45, delay: reduce ? 0 : Math.min(i * 0.04, 0.4), ease: [0.22, 1, 0.36, 1] }}
                    className={`${styles.skillCard} ${active !== "All" ? styles.skillCardActive : ""}`}
                    data-cursor
                  >
                    <span className={styles.skillCard__num}>{String(i + 1).padStart(2, "0")}</span>
                    <div className={styles.skillCard__glyph}>{skill.icon.toUpperCase()}</div>
                    <div className={styles.skillCard__meta}>
                      <h3 className={styles.skillCard__name}>{skill.name}</h3>
                      <span className="text-mono skills__cat">{skill.category}</span>
                    </div>
                    <div className={styles.skillCard__keywords} aria-hidden="true">
                      {(skill.keywords || []).map((k) => <span key={k} className="tag">{k}</span>)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </Reveal>
        )}

        <Reveal delay={0.2}>
          <p className="text-mono skills__note">
            ▸ plus professional strengths: communication · problem-solving · teamwork · time management
          </p>
        </Reveal>
      </div>
    </section>
  );
}