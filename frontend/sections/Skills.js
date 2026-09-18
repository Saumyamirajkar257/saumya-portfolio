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
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 2C6.48 2 5.5 3.5 5.5 6V8H12V9H3.5C2 9 1 10.5 1 13s1 4 2.5 4H5v-2.5C5 12.5 6.5 11 8.5 11H13c1.5 0 3-1.5 3-3V6c0-2.5-1.5-4-4-4h0zm-2 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        <path d="M12 22c5.52 0 6.5-1.5 6.5-4v-2H12v-1h8.5c1.5 0 2.5-1.5 2.5-4s-1-4-2.5-4H19v2.5c0 2-1.5 3.5-3.5 3.5H11c-1.5 0-3 1.5-3 3v2c0 2.5 1.5 4 4 4h0zm2-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
      </svg>
    ),
  },
  {
    name: "C / C++",
    category: "Systems & Embedded",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3" />
      </svg>
    ),
  },
  {
    name: "Arduino & IoT",
    category: "Microcontrollers & Sensors",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
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
    category: "Frontend & Fullstack",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M16 8v8a2 2 0 0 1-2 2h-1" />
        <path d="M8 15a2 2 0 0 0 3 0v-7" />
      </svg>
    ),
  },
  {
    name: "React & Next.js",
    category: "Modern Web UI",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Git & GitHub",
    category: "Version Control",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="9" r="3" />
        <line x1="6" y1="9" x2="6" y2="15" />
        <path d="M18 12a9 9 0 0 1-9 9" />
      </svg>
    ),
  },
  {
    name: "Linux & Terminal",
    category: "Environment & Bash",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    name: "HTML5 & CSS3",
    category: "Responsive Layouts",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
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
    const radius = isInner ? 140 : 250;
    // Offsets to make it look a bit more organic
    const offset = i * 0.5; 
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
              Tools and technologies I work with to bring ideas to life.
            </p>
          }
        />

        <div className={styles.constellationContainer}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="-350 -350 700 700">
            {/* Orbits */}
            <circle cx="0" cy="0" r="140" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" strokeDasharray="4 6" />
            <circle cx="0" cy="0" r="250" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" strokeDasharray="4 8" />

            {/* Connecting lines */}
            {nodes.map((n, i) => {
              const isHovered = hoveredNode === n.name;
              return (
                <motion.line
                  key={`line-${i}`}
                  x1="0"
                  y1="0"
                  x2={n.x}
                  y2={n.y}
                  stroke={isHovered ? "rgba(56, 189, 248, 0.4)" : "rgba(255, 255, 255, 0.08)"}
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              )
            })}
            
            {/* Cross connections for constellation feel */}
            {nodes.map((n, i) => {
               if (i === 0) return null;
               const prev = nodes[i - 1];
               // only connect if they are on same orbit roughly or adjacent
               if (Math.abs(Math.hypot(n.x, n.y) - Math.hypot(prev.x, prev.y)) < 50) {
                 const isHovered = hoveredNode === n.name || hoveredNode === prev.name;
                 return (
                   <motion.line
                     key={`cross-${i}`}
                     x1={prev.x}
                     y1={prev.y}
                     x2={n.x}
                     y2={n.y}
                     stroke={isHovered ? "rgba(56, 189, 248, 0.25)" : "rgba(255, 255, 255, 0.04)"}
                     strokeWidth="1"
                     initial={{ pathLength: 0 }}
                     whileInView={{ pathLength: 1 }}
                     transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                   />
                 )
               }
               return null;
            })}
          </svg>
          
          <div className={styles.centerNode}>
             <span className={styles.centerText}>Core</span>
          </div>

          {nodes.map((n, i) => (
            <motion.div
              key={n.name}
              className={styles.skillNode}
              style={{
                 left: `calc(50% + ${n.x}px)`,
                 top: `calc(50% + ${n.y}px)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
              onMouseEnter={() => setHoveredNode(n.name)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className={`${styles.skillIcon} ${hoveredNode === n.name ? styles.hovered : ''}`}>
                {n.icon}
              </div>
              <div className={styles.skillLabel}>{n.name}</div>
            </motion.div>
          ))}
        </div>

        {/* Section Quote Banner */}
        <Reveal delay={0.2}>
          <div className={styles.quoteCard}>
            <span className={styles.quoteMark}>“</span>
            <p className={styles.quoteText}>Small systems. Bigger possibilities.</p>
            <span className={styles.quoteTag}>IoT &amp; SOFTWARE PHILOSOPHY</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}