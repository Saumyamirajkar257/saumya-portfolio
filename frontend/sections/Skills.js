"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./Skills.module.css";

// Crisp monochrome SVG icons for technical & professional skills
const SKILL_ICONS = {
  python: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.91 2c-4.43 0-4.16 1.92-4.16 1.92l.01 1.99h4.24v.6H6.18S3.5 6.18 3.5 10.66c0 4.49 2.34 4.33 2.34 4.33h1.4v-2.03s-.08-2.34 2.3-2.34h4.15s2.23.03 2.23-2.19V4.31S16.34 2 11.91 2zm-2.38 1.4a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm2.56 18.6c4.43 0 4.16-1.92 4.16-1.92l-.01-1.99h-4.24v-.6h5.82s2.68.33 2.68-4.15c0-4.49-2.34-4.33-2.34-4.33h-1.4v2.03s.08 2.34-2.3 2.34H9.71s-2.23-.03-2.23 2.19v4.12S7.66 22 12.09 22zm2.38-1.4a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z" />
    </svg>
  ),
  cpp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 17a5 5 0 1 1 0-10" />
      <path d="M17 10v4" />
      <path d="M15 12h4" />
      <path d="M21 10v4" />
      <path d="M19 12h4" />
    </svg>
  ),
  c: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 18a6 6 0 1 1 0-12" />
    </svg>
  ),
  javascript: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M16 8v8a2 2 0 0 1-2 2h-1" />
      <path d="M8 15a2 2 0 0 0 3 0v-7" />
    </svg>
  ),
  html: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="10" y1="20" x2="14" y2="4" />
    </svg>
  ),
  css: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  arduino: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="7" cy="12" r="4.5" />
      <circle cx="17" cy="12" r="4.5" />
      <path d="M5.5 12h3M7 10.5v3" />
      <path d="M15.5 12h3" />
    </svg>
  ),
  sensor: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.48" />
      <path d="M7.76 16.24a6 6 0 0 1 0-8.48" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
    </svg>
  ),
  git: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="9" r="2.5" />
      <line x1="6" y1="8.5" x2="6" y2="15.5" />
      <path d="M18 11.5a8.5 8.5 0 0 1-8.5 6.5" />
    </svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  excel: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  powerpoint: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <path d="M7 8h4a2 2 0 0 1 0 4H7z" />
    </svg>
  ),
  problem: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  comms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  time: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  code: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
};

// Clean icon resolver
function resolveIcon(item) {
  const name = (item.name || "").toLowerCase();
  const icon = (item.icon || "").toLowerCase();
  if (icon && SKILL_ICONS[icon]) return SKILL_ICONS[icon];
  if (name.includes("python")) return SKILL_ICONS.python;
  if (name.includes("c++") || name.includes("cpp")) return SKILL_ICONS.cpp;
  if (name.startsWith("c ") || name === "c") return SKILL_ICONS.c;
  if (name.includes("arduino")) return SKILL_ICONS.arduino;
  if (name.includes("sensor")) return SKILL_ICONS.sensor;
  if (name.includes("javascript") || name.includes("js")) return SKILL_ICONS.javascript;
  if (name.includes("html")) return SKILL_ICONS.html;
  if (name.includes("css")) return SKILL_ICONS.css;
  if (name.includes("github")) return SKILL_ICONS.github;
  if (name.includes("git")) return SKILL_ICONS.git;
  if (name.includes("excel")) return SKILL_ICONS.excel;
  if (name.includes("powerpoint")) return SKILL_ICONS.powerpoint;
  if (name.includes("problem")) return SKILL_ICONS.problem;
  if (name.includes("comm")) return SKILL_ICONS.comms;
  if (name.includes("team")) return SKILL_ICONS.team;
  if (name.includes("time")) return SKILL_ICONS.time;
  return SKILL_ICONS.code;
}

// Intentional 8-Node Constellation Geometry
const CONSTELLATION_NODES = [
  {
    id: "python",
    name: "Python",
    category: "Languages & Logic",
    group: "technical",
    orbit: "outer",
    x: 110,
    y: -190,
    iconKey: "python",
  },
  {
    id: "c_cpp",
    name: "C / C++",
    category: "Systems & Memory",
    group: "technical",
    orbit: "inner",
    x: 130,
    y: -35,
    iconKey: "cpp",
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "Web & Runtime",
    group: "technical",
    orbit: "outer",
    x: 190,
    y: 110,
    iconKey: "javascript",
  },
  {
    id: "html_css",
    name: "HTML5 & CSS3",
    category: "Web Frontend",
    group: "technical",
    orbit: "inner",
    x: 35,
    y: 130,
    iconKey: "html",
  },
  {
    id: "git_github",
    name: "Git & GitHub",
    category: "Version Control",
    group: "technical",
    orbit: "outer",
    x: -110,
    y: 190,
    iconKey: "github",
  },
  {
    id: "arduino",
    name: "Arduino & IoT",
    category: "Microcontrollers",
    group: "technical",
    orbit: "inner",
    x: -130,
    y: 35,
    iconKey: "arduino",
  },
  {
    id: "sensor",
    name: "Sensor Integration",
    category: "Hardware Signals",
    group: "technical",
    orbit: "outer",
    x: -190,
    y: -110,
    iconKey: "sensor",
  },
  {
    id: "problem_solving",
    name: "Problem-Solving",
    category: "Engineering Analysis",
    group: "core",
    orbit: "inner",
    x: -35,
    y: -130,
    iconKey: "problem",
  },
];

// Constellation Cluster Perimeter / Ring Edges
const CONSTELLATION_EDGES = [
  // Inner diamond loop
  ["c_cpp", "html_css"],
  ["html_css", "arduino"],
  ["arduino", "problem_solving"],
  ["problem_solving", "c_cpp"],
  // Outer square loop
  ["python", "javascript"],
  ["javascript", "git_github"],
  ["git_github", "sensor"],
  ["sensor", "python"],
  // Radiating cross-ties between inner and outer
  ["python", "c_cpp"],
  ["javascript", "html_css"],
  ["git_github", "arduino"],
  ["sensor", "problem_solving"],
];

// Structured Quick-Scan Categorized List (Recruiter Fast Scan)
const SCANNER_CATEGORIES = [
  {
    id: "technical",
    title: "TECHNICAL & PROGRAMMING",
    skills: [
      { name: "Python", icon: SKILL_ICONS.python },
      { name: "C", icon: SKILL_ICONS.c },
      { name: "C++", icon: SKILL_ICONS.cpp },
      { name: "JavaScript", icon: SKILL_ICONS.javascript },
      { name: "HTML5", icon: SKILL_ICONS.html },
      { name: "CSS3", icon: SKILL_ICONS.css },
    ],
  },
  {
    id: "hardware",
    title: "HARDWARE, IOT & TOOLS",
    skills: [
      { name: "Arduino", icon: SKILL_ICONS.arduino },
      { name: "Sensor Integration", icon: SKILL_ICONS.sensor },
      { name: "Git", icon: SKILL_ICONS.git },
      { name: "GitHub", icon: SKILL_ICONS.github },
      { name: "Microsoft Excel", icon: SKILL_ICONS.excel },
      { name: "Microsoft PowerPoint", icon: SKILL_ICONS.powerpoint },
    ],
  },
  {
    id: "core",
    title: "CORE & PROFESSIONAL",
    skills: [
      { name: "Problem-Solving", icon: SKILL_ICONS.problem },
      { name: "Communication", icon: SKILL_ICONS.comms },
      { name: "Teamwork & Coordination", icon: SKILL_ICONS.team },
      { name: "Time Management", icon: SKILL_ICONS.time },
    ],
  },
];

export default function Skills({ skills = [] }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const reduce = useReducedMotion();

  // Find node lookup map
  const nodeMap = CONSTELLATION_NODES.reduce((acc, n) => {
    acc[n.id] = n;
    return acc;
  }, {});

  const activeNodeData = hoveredNode ? nodeMap[hoveredNode] : null;

  return (
    <section id="skills" className={styles.section}>
      <div className="wrap">
        {/* Section Header: Large Editorial Heading */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            <span>TECHNICAL COMPETENCIES</span>
          </div>
          <h2 className={styles.heading}>SKILLS</h2>
          <p className={styles.subheading}>
            Sensor-driven hardware, software engineering, and core technical proficiencies.
          </p>
        </div>

        {/* Visual Centerpiece: Skill Constellation Network */}
        <div className={styles.constellationCard}>
          <div className={styles.constellationMetaHeader}>
            <span className={styles.constellationTag}>CONSTELLATION MAP</span>
            <span className={styles.constellationStatus}>
              {activeNodeData
                ? `${activeNodeData.name.toUpperCase()} · ${activeNodeData.category.toUpperCase()}`
                : "HOVER NODES TO INSPECT CONNECTIVITY"}
            </span>
          </div>

          <div className={styles.constellationWrapper}>
            <svg
              className={styles.constellationSvg}
              viewBox="-300 -260 600 520"
              aria-hidden="true"
            >
              {/* Center Ambient Glow */}
              <defs>
                <radialGradient id="constellationCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="0" cy="0" r="260" fill="url(#constellationCenterGlow)" />

              {/* Orbit Rings */}
              <circle
                cx="0"
                cy="0"
                r="135"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="4 6"
              />
              <circle
                cx="0"
                cy="0"
                r="220"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="4 8"
              />

              {/* Central Rays to each node */}
              {CONSTELLATION_NODES.map((n, i) => {
                const isHovered = hoveredNode === n.id;
                return (
                  <motion.line
                    key={`ray-${n.id}`}
                    x1="0"
                    y1="0"
                    x2={n.x}
                    y2={n.y}
                    stroke={isHovered ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.12)"}
                    strokeWidth={isHovered ? 2 : 1}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: reduce ? 0.01 : 0.8,
                      delay: reduce ? 0 : i * 0.05,
                      ease: EASE.premium,
                    }}
                  />
                );
              })}

              {/* Cluster / Inter-node Connective Edges */}
              {CONSTELLATION_EDGES.map(([srcId, dstId], i) => {
                const src = nodeMap[srcId];
                const dst = nodeMap[dstId];
                if (!src || !dst) return null;
                const isEdgeActive = hoveredNode === srcId || hoveredNode === dstId;

                return (
                  <motion.line
                    key={`edge-${srcId}-${dstId}`}
                    x1={src.x}
                    y1={src.y}
                    x2={dst.x}
                    y2={dst.y}
                    stroke={isEdgeActive ? "rgba(255, 255, 255, 0.65)" : "rgba(255, 255, 255, 0.05)"}
                    strokeWidth={isEdgeActive ? 1.5 : 1}
                    strokeDasharray={isEdgeActive ? "none" : "3 3"}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: reduce ? 0.01 : 1,
                      delay: reduce ? 0 : 0.3 + i * 0.04,
                      ease: EASE.premium,
                    }}
                  />
                );
              })}
            </svg>

            {/* Central CORE Node */}
            <div className={styles.centerNode}>
              <span className={styles.centerText}>CORE</span>
              <div className={styles.centerPulse} />
            </div>

            {/* Interactive Orbiting Skill Nodes */}
            {CONSTELLATION_NODES.map((n, i) => {
              const isHovered = hoveredNode === n.id;
              const iconNode = SKILL_ICONS[n.iconKey] || SKILL_ICONS.code;

              return (
                <motion.div
                  key={n.id}
                  className={`${styles.skillNode} ${isHovered ? styles.skillNodeHovered : ""}`}
                  style={{
                    left: `calc(50% + (${n.x}px * var(--node-scale, 1)))`,
                    top: `calc(50% + (${n.y}px * var(--node-scale, 1)))`,
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: reduce ? 0 : i * 0.06,
                    type: "spring",
                    stiffness: 240,
                    damping: 22,
                  }}
                  onMouseEnter={() => setHoveredNode(n.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.name} (${n.category})`}
                >
                  <div className={`${styles.nodeButton} ${isHovered ? styles.nodeButtonActive : ""}`}>
                    {iconNode}
                  </div>
                  <div className={`${styles.nodeLabel} ${isHovered ? styles.nodeLabelActive : ""}`}>
                    {n.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick-Scan Categorized List (Recruiter Scanner Layout) */}
        <div className={styles.scannerSection}>
          <div className={styles.scannerHeader}>
            <div className={styles.scannerEyebrowRow}>
              <span className={styles.scannerEyebrowDot} />
              <span className={styles.scannerEyebrow}>FAST SCAN REPOSITORY</span>
            </div>
            <h3 className={styles.scannerTitle}>CATEGORIZED CAPABILITIES</h3>
          </div>

          <div className={styles.scannerGrid}>
            {SCANNER_CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -6% 0px" }}
                transition={{
                  duration: reduce ? 0.01 : TIMING.component,
                  delay: reduce ? 0 : idx * 0.08,
                  ease: EASE.premium,
                }}
                className={styles.scannerRow}
              >
                {/* Category Heading & Index */}
                <div className={styles.categoryCol}>
                  <span className={styles.categoryIndex}>0{idx + 1}</span>
                  <span className={styles.categoryName}>{cat.title}</span>
                </div>

                {/* Skill Chips List */}
                <div className={styles.chipsCol}>
                  {cat.skills.map((skill) => (
                    <div key={skill.name} className={styles.skillChip}>
                      <span className={styles.skillChipIcon}>{skill.icon}</span>
                      <span className={styles.skillChipName}>{skill.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Minimal Editorial Philosophy Sign-off */}
        <motion.div
          className={styles.footerNote}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: TIMING.section, ease: EASE.premium }}
        >
          <p className={styles.footerQuote}>
            “With great power comes great responsibility.”
          </p>
          <span className={styles.footerTag}>
            POWER · RESPONSIBILITY · PURPOSE
          </span>
        </motion.div>
      </div>
    </section>
  );
}
