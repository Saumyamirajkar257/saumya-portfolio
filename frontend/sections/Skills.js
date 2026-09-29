"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import styles from "./Skills.module.css";

const TECH_LIST = [
  {
    name: "Python",
    category: "Languages & OOP",
    description: "OOP, Automation, Scripting, Backends",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 2C6.48 2 5.5 3.5 5.5 6V8H12V9H3.5C2 9 1 10.5 1 13s1 4 2.5 4H5v-2.5C5 12.5 6.5 11 8.5 11H13c1.5 0 3-1.5 3-3V6c0-2.5-1.5-4-4-4h0zm-2 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        <path d="M12 22c5.52 0 6.5-1.5 6.5-4v-2H12v-1h8.5c1.5 0 2.5-1.5 2.5-4s-1-4-2.5-4H19v2.5c0 2-1.5 3.5-3.5 3.5H11c-1.5 0-3 1.5-3 3v2c0 2.5 1.5 4 4 4h0zm2-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
      </svg>
    ),
  },
  {
    name: "C / C++",
    category: "Systems & Embedded",
    description: "Low-level Memory, Embedded Logic, Algorithms",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3" />
      </svg>
    ),
  },
  {
    name: "Arduino & IoT",
    category: "Hardware & Sensors",
    description: "ESP8266/ESP32, Microcontrollers, Sensors",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="6" cy="12" r="4" />
        <circle cx="18" cy="12" r="4" />
        <line x1="10" y1="12" x2="14" y2="12" />
        <line x1="6" y1="10" x2="6" y2="14" />
        <line x1="18" y1="10" x2="18" y2="14" />
        <line x1="16" y1="12" x2="20" y2="12" />
      </svg>
    ),
  },
  {
    name: "JavaScript",
    category: "Web & Runtime",
    description: "ES6+, Async/Await, Web APIs, Node.js",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M16 8v8a2 2 0 0 1-2 2h-1" />
        <path d="M8 15a2 2 0 0 0 3 0v-7" />
      </svg>
    ),
  },
  {
    name: "React & Next.js",
    category: "Modern UI Engineering",
    description: "Server Components, App Router, Hooks",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Git & GitHub",
    category: "Version Control & CI/CD",
    description: "Branching, Collaboration, Actions, Releases",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="9" r="3" />
        <line x1="6" y1="9" x2="6" y2="15" />
        <path d="M18 12a9 9 0 0 1-9 9" />
      </svg>
    ),
  },
  {
    name: "Linux & CLI",
    category: "Environment & Systems",
    description: "POSIX Shell, Bash scripting, Server admin",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    name: "HTML5 & Modern CSS",
    category: "Styling & Responsive UI",
    description: "Flexbox/Grid, Animations, Design Systems",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polygon points="12 2 2 5 4 19 12 22 20 19 22 5 12 2" />
        <path d="M12 6v12" />
        <path d="M7 10h10" />
        <path d="M8 14h8" />
      </svg>
    ),
  },
];

export default function Skills({ skills = [] }) {
  const nodes = TECH_LIST.map((tech, i) => {
    const isInner = i < 3;
    const radius = isInner ? 135 : 240;
    const offset = i * 0.45;
    const angle = isInner ? (i / 3) * Math.PI * 2 + offset : ((i - 3) / 5) * Math.PI * 2 + offset;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { ...tech, x, y };
  });

  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <section id="skills" className="block">
      <div className="wrap">
        <SectionHeading
          eyebrow="MY TOOLKIT"
          title={<>Skills &amp; <span className="gradient-text">Technologies</span></>}
          lead={
            <p className="prose">
              Tools, languages, and technologies I work with to bring hardware and software systems to life.
            </p>
          }
        />

        {/* Desktop Constellation View */}
        <div className={styles.constellationContainer}>
          <svg
            className={styles.constellationSvg}
            viewBox="-350 -350 700 700"
            aria-hidden="true"
          >
            {/* Ambient Radial Gradient Background in SVG */}
            <defs>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1683FF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="0" cy="0" r="280" fill="url(#centerGlow)" />

            {/* Orbit Rings */}
            <circle cx="0" cy="0" r="135" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" strokeDasharray="4 6" />
            <circle cx="0" cy="0" r="240" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" strokeDasharray="4 8" />

            {/* Connecting Rays */}
            {nodes.map((n, i) => {
              const isHovered = hoveredNode === n.name;
              return (
                <motion.line
                  key={`line-${i}`}
                  x1="0"
                  y1="0"
                  x2={n.x}
                  y2={n.y}
                  stroke={isHovered ? "rgba(56, 189, 248, 0.6)" : "rgba(255, 255, 255, 0.08)"}
                  strokeWidth={isHovered ? "2" : "1"}
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.06 }}
                />
              );
            })}

            {/* Cross connections */}
            {nodes.map((n, i) => {
              if (i === 0) return null;
              const prev = nodes[i - 1];
              if (Math.abs(Math.hypot(n.x, n.y) - Math.hypot(prev.x, prev.y)) < 60) {
                const isHovered = hoveredNode === n.name || hoveredNode === prev.name;
                return (
                  <motion.line
                    key={`cross-${i}`}
                    x1={prev.x}
                    y1={prev.y}
                    x2={n.x}
                    y2={n.y}
                    stroke={isHovered ? "rgba(56, 189, 248, 0.4)" : "rgba(255, 255, 255, 0.04)"}
                    strokeWidth="1"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.08 }}
                  />
                );
              }
              return null;
            })}
          </svg>

          {/* Central Core Node */}
          <div className={styles.centerNode}>
            <span className={styles.centerText}>Core</span>
            <div className={styles.centerPulse} />
          </div>

          {/* Orbiting Skill Nodes */}
          {nodes.map((n, i) => (
            <motion.div
              key={n.name}
              className={styles.skillNode}
              style={{
                left: `calc(50% + ${n.x}px)`,
                top: `calc(50% + ${n.y}px)`,
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 220, damping: 20 }}
              onMouseEnter={() => setHoveredNode(n.name)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className={`${styles.skillIcon} ${hoveredNode === n.name ? styles.hovered : ""}`}>
                {n.icon}
              </div>
              <div className={styles.skillLabel}>{n.name}</div>
            </motion.div>
          ))}
        </div>

        {/* Mobile / Tablet Responsive Grid Fallback */}
        <div className={styles.mobileSkillsGrid}>
          {TECH_LIST.map((tech, i) => (
            <motion.div
              key={tech.name}
              className={styles.mobileSkillCard}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className={styles.mobileSkillIcon}>{tech.icon}</div>
              <div className={styles.mobileSkillInfo}>
                <div className={styles.mobileSkillHeader}>
                  <h3 className={styles.mobileSkillName}>{tech.name}</h3>
                  <span className={styles.mobileSkillCat}>{tech.category}</span>
                </div>
                <p className={styles.mobileSkillDesc}>{tech.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Philosophy Quote Card */}
        <Reveal delay={0.15}>
          <div className={styles.quoteCard}>
            <span className={styles.quoteMark}>“</span>
            <p className={styles.quoteText}>Small systems. Bigger possibilities.</p>
            <span className={styles.quoteTag}>IoT &amp; Software Philosophy</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
