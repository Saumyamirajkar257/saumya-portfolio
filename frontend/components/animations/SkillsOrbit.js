"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePrefersReducedMotion, useIsTouch } from "@/lib/hooks";
import styles from "./SkillsOrbit.module.css";

const RING_COUNT = 5; // Languages, Web, IoT, Tools, Professional

function categoryToRing(category) {
  const order = ["Languages", "Web", "IoT & Embedded", "Tools & Platforms", "Professional"];
  return order.indexOf(category);
}

function ringRadius(ring, totalRings, minR = 90, maxR = 300) {
  // exponential spread: inner rings tighter
  const t = ring / Math.max(1, totalRings - 1);
  return minR + (maxR - minR) * (t ** 1.3);
}

export default function SkillsOrbit({ skills = [], onSkillHover }) {
  const reduce = usePrefersReducedMotion();
  const touch = useIsTouch();
  const canvasRef = useRef(null);
  const [dpr, setDpr] = useState(1);
  const [hovered, setHovered] = useState(null);
  const [viewMode, setViewMode] = useState("orbit"); // "orbit" | "grid"

  // Organize skills by ring
  const rings = useRef([]);
  rings.current = Array.from({ length: RING_COUNT }, () => []);
  skills.forEach((s) => {
    const r = categoryToRing(s.category);
    if (r >= 0) rings.current[r].push(s);
  });

  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduce || touch || viewMode === "grid") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf;
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      const newDpr = Math.min(window.devicePixelRatio || 1, 2);
      setDpr(newDpr);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * newDpr;
      canvas.height = height * newDpr;
      ctx.setTransform(newDpr, 0, 0, newDpr, 0, 0);
      centerRef.current = { x: width / 2, y: height / 2 };
    };

    const COLORS = [
      { r: 255, g: 176, b: 84, bg: "rgba(255,176,84," },
      { r: 110, g: 231, b: 216, bg: "rgba(110,231,216," },
      { r: 139, g: 108, b: 255, bg: "rgba(139,108,255," },
      { r: 255, g: 94, b: 98, bg: "rgba(255,94,98," },
      { r: 200, g: 200, b: 210, bg: "rgba(200,200,210," },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const { x: cx, y: cy } = centerRef.current;

      // Draw connecting lines between rings (subtle)
      for (let r = 0; r < RING_COUNT; r++) {
        const ringSkills = rings.current[r];
        const radius = ringRadius(r, RING_COUNT);
        const color = COLORS[r % COLORS.length];

        // Ring guideline
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${color.bg}0.06)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Particles on ring
        ringSkills.forEach((skill, i) => {
          const count = ringSkills.length || 1;
          const baseAngle = (i / count) * Math.PI * 2;
          const speed = 0.00015 + r * 0.00003;
          const angle = baseAngle + time * speed;

          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;

          const isHovered = hovered && hovered.id === skill.id;

          // Glow
          const grad = ctx.createRadialGradient(px, py, 0, px, py, isHovered ? 60 : 35);
          grad.addColorStop(0, `${color.bg}${isHovered ? 0.35 : 0.12})`);
          grad.addColorStop(1, `${color.bg}0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, isHovered ? 35 : 22, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = isHovered
            ? `rgba(${color.r},${color.g},${color.b},1)`
            : `rgba(${color.r},${color.g},${color.b},0.7)`;
          ctx.beginPath();
          ctx.arc(px, py, isHovered ? 14 : 8, 0, Math.PI * 2);
          ctx.fill();

          // Skill label (draw via DOM overlay instead of canvas for accessibility)
        });
      }
    };

    const loop = (ts) => {
      time = ts;
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    loop(0);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduce, touch, viewMode, hovered, skills]);

  if (reduce || touch || viewMode === "grid") {
    return <SkillsGrid skills={skills} onHover={setHovered} />;
  }

  return (
    <div className={styles.orbit} data-view={viewMode}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* DOM overlay for labels + accessibility */}
      <div className={styles.labels}>
        {rings.current.map((ringSkills, r) => {
          const radius = ringRadius(r, RING_COUNT);
          const color = [
            { r: 255, g: 176, b: 84 },
            { r: 110, g: 231, b: 216 },
            { r: 139, g: 108, b: 255 },
            { r: 255, g: 94, b: 98 },
            { r: 200, g: 200, b: 210 },
          ][r];

          return ringSkills.map((skill, i) => {
            const count = ringSkills.length || 1;
            const angle = (i / count) * Math.PI * 2;
            const speed = 0.00015 + r * 0.00003;
            // We'll use CSS animation for position
            const orbitalStyle = {
              ["--angle"]: `${angle}rad`,
              ["--radius"]: `${radius}px`,
              ["--speed"]: `${speed}`,
              ["--color"]: `rgb(${color.r},${color.g},${color.b})`,
              ["--delay"]: `${i * 0.08}s`,
            };
            return (
              <motion.span
                key={skill.id}
                className={styles.orbitalSkill}
                style={orbitalStyle}
                initial={false}
                animate={{ opacity: 1 }}
                onHoverStart={() => setHovered(skill)}
                onHoverEnd={() => setHovered(null)}
                data-skill-id={skill.id}
              >
                <span className={styles.skillName}>{skill.name}</span>
              </motion.span>
            );
          });
        })}
      </div>

      {/* Center label */}
      <div className={styles.center}>
        <span className="text-mono" style={{ fontSize: 12, color: "var(--text-mute)" }}>Skills</span>
        <div className={styles.centerName}>constellation</div>
      </div>

      {/* View toggle */}
      <button
        className={styles.toggle}
        onClick={() => setViewMode((v) => (v === "orbit" ? "grid" : "orbit"))}
        aria-label={viewMode === "orbit" ? "Switch to grid view" : "Switch to orbital view"}
      >
        {viewMode === "orbit" ? (
          <>
            <span className={styles.toggleIcon}>⊞</span> Grid
          </>
        ) : (
          <>
            <span className={styles.toggleIcon}>◯</span> Orbit
          </>
        )}
      </button>
    </div>
  );
}

function SkillsGrid({ skills, onHover }) {
  const categories = [
    "Languages",
    "Web",
    "IoT & Embedded",
    "Tools & Platforms",
    "Professional",
  ];

  return (
    <div className={styles.grid} role="region" aria-label="Skills grid">
      {categories.map((cat) => {
        const catSkills = skills.filter((s) => s.category === cat);
        if (!catSkills.length) return null;
        return (
          <div key={cat} className={styles.gridCategory}>
            <span className="text-mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {cat}
            </span>
            <div className={styles.gridSkills}>
              {catSkills.map((s) => (
                <span
                  key={s.id}
                  className={styles.gridChip}
                  onMouseEnter={() => onHover(s)}
                  onMouseLeave={() => onHover(null)}
                  data-cursor
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}