"use client";

import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import SkillsOrbit from "@/components/animations/SkillsOrbit";
import styles from "./Skills.module.css";

const ORDER = ["Languages", "Web", "IoT & Embedded", "Tools & Platforms", "Professional"];

export default function Skills({ skills = [] }) {
  const [active, setActive] = useState("All");

  const categories = ORDER.filter((c) => skills.some((s) => s.category === c));
  const filters = ["All", ...categories];

  const visible = active === "All" ? skills : skills.filter((s) => s.category === active);

  return (
    <section id="skills" className="block">
      <div className="wrap">
        <SectionHeading
          eyebrow="what I work with"
          title={<>Skills & <span className="gradient-text">constellation</span></>}
          lead={
            <p className="prose">
              The tools I use to go from idea to working software and hardware.
              Listed exactly as they appear on my resume — no invented levels.
            </p>
          }
        />

        {/* Category filter */}
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
          </div>
        </Reveal>

        {/* The constellation — this is the centerpiece */}
        <Reveal delay={0.15}>
          <SkillsOrbit skills={visible} />
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-mono skills__note">
            Plus professional strengths: communication, problem-solving, teamwork, and time management.
          </p>
        </Reveal>
      </div>
    </section>
  );
}