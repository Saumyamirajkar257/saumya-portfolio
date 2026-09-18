"use client";

import styles from "./HeroConstellation.module.css";

/**
 * HeroConstellation — a lightweight, always-readable echo of the Skills
 * constellation that anchors the hero above the fold.
 *
 * Unlike the canvas-based SkillsOrbit (which reveals labels on hover and
 * needs interaction), every label here is visible at rest so the hero reads
 * as an illustrated diagram. Decorative rings and sparks carry the gentle
 * motion; labels themselves never move, so nothing becomes unreadable.
 * Node positions are precomputed in JS (no CSS trig needed).
 */

const RINGS = [
  {
    r: 108,
    speed: 38,
    nodes: [
      { name: "Git", angle: -35 },
      { name: "IoT", angle: 45 },
      { name: "HTML", angle: 135 },
      { name: "CSS", angle: 215 },
      { name: "Excel", angle: 310 },
    ],
  },
  {
    r: 168,
    speed: 52,
    nodes: [
      { name: "Arduino", angle: 8 },
      { name: "C", angle: 88 },
      { name: "Sensors", angle: 168 },
      { name: "C++", angle: 248 },
      { name: "Python", angle: 320 },
    ],
  },
  {
    r: 216,
    speed: 66,
    nodes: [
      { name: "JavaScript", angle: 0 },
      { name: "Embedded", angle: 90 },
      { name: "Automation", angle: 200 },
    ],
  },
];

const ALL_SKILLS = RINGS.flatMap((ring) => ring.nodes.map((n) => n.name));

export default function HeroConstellation() {
  return (
    <div
      className={styles.constel}
      role="img"
      aria-label={`Constellation of my technical skills: ${ALL_SKILLS.join(", ")}.`}
    >
      {RINGS.map((ring, ri) => (
        <div
          key={ri}
          className={styles.ring}
          style={{ "--cr": `${ring.r}px`, "--cs": `${ring.speed}s` }}
        >
          {ring.nodes.map((n) => {
            const rad = (n.angle * Math.PI) / 180;
            const ox = ring.r * Math.cos(rad);
            const oy = ring.r * Math.sin(rad);
            return (
              <span
                key={n.name}
                className={styles.node}
                style={{ "--ox": `${ox.toFixed(1)}px`, "--oy": `${oy.toFixed(1)}px` }}
                aria-hidden="true"
              >
                {n.name}
              </span>
            );
          })}
          {/* spark dot riding the ring */}
          <span className={styles.spark} aria-hidden="true" />
        </div>
      ))}

      {/* core */}
      <div className={styles.core} aria-hidden="true">
        <span className={styles.coreName}>constellation</span>
        <span className={`text-mono ${styles.coreSub}`}>of skills</span>
      </div>
    </div>
  );
}