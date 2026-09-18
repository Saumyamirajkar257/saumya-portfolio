"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion, useIsTouch, useMounted } from "@/lib/hooks";
import styles from "./HeroGlobe.module.css";

const LABELS = [
  {
    tag: "SENSORS",
    desc: "Collect Data",
    icon: "📡",
    positionClass: styles.labelTopLeft,
    delay: 0.8,
  },
  {
    tag: "DEVICES",
    desc: "Connect Things",
    icon: "⚡",
    positionClass: styles.labelTopRight,
    delay: 0.95,
  },
  {
    tag: "IDEAS",
    desc: "Create Impact",
    icon: "💡",
    positionClass: styles.labelBottomLeft,
    delay: 1.1,
  },
  {
    tag: "SOLUTIONS",
    desc: "A Better Tomorrow",
    icon: "🌐",
    positionClass: styles.labelBottomRight,
    delay: 1.25,
  },
];

export default function HeroGlobe() {
  const isMounted = useMounted();
  const reduce = usePrefersReducedMotion();
  const touch = useIsTouch();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isMounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf;
    let width = 0;
    let height = 0;
    let rot = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Generate fixed random points on a sphere (Fibonacci sphere algorithm)
    const NUM_DOTS = 180;
    const dots = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < NUM_DOTS; i++) {
      const y = 1 - (i / (NUM_DOTS - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const isBeacon = i % 12 === 0;
      dots.push({ x, y, z, isBeacon });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const globeRadius = Math.min(width, height) * 0.36;

      // Draw background sphere shadow & dark body
      const bgGrad = ctx.createRadialGradient(cx, cy, globeRadius * 0.2, cx, cy, globeRadius);
      bgGrad.addColorStop(0, "#18181B");
      bgGrad.addColorStop(0.7, "#121215");
      bgGrad.addColorStop(1, "#09090B");
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric silver & ice-cyan rim glow
      const rimGrad = ctx.createRadialGradient(cx, cy, globeRadius * 0.85, cx, cy, globeRadius * 1.08);
      rimGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      rimGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.18)");
      rimGrad.addColorStop(0.85, "rgba(255, 255, 255, 0.25)");
      rimGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius * 1.08, 0, Math.PI * 2);
      ctx.fill();

      // Draw latitude / longitude grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 1;

      // Latitude circles
      [-0.6, -0.3, 0, 0.3, 0.6].forEach((lat) => {
        const r = Math.sqrt(1 - lat * lat) * globeRadius;
        const y = lat * globeRadius;
        ctx.beginPath();
        ctx.ellipse(cx, cy + y, r, r * 0.26, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Longitude lines rotated
      [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach((long) => {
        ctx.beginPath();
        const angle = long + rot;
        const rx = Math.abs(Math.cos(angle)) * globeRadius;
        ctx.ellipse(cx, cy, rx, globeRadius, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Rotate and project 3D dots
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      const projected = dots.map((dot) => {
        // Rotate around Y axis
        const rx = dot.x * cosR - dot.z * sinR;
        const rz = dot.x * sinR + dot.z * cosR;
        const ry = dot.y;

        // Perspective scale based on Z
        const zScale = (rz + 2) / 3;
        const px = cx + rx * globeRadius;
        const py = cy + ry * globeRadius;
        return { px, py, rz, isBeacon: dot.isBeacon, zScale };
      });

      // Sort by Z so front dots draw on top of back dots
      projected.sort((a, b) => a.rz - b.rz);

      // Draw connection lines between nearby front-facing dots
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.rz < 0.1) continue; // Only front side

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          if (p2.rz < 0.1) continue;

          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < globeRadius * 0.38) {
            const alpha = (1 - dist / (globeRadius * 0.38)) * 0.22 * Math.min(p1.rz, p2.rz);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      projected.forEach((p) => {
        const isFront = p.rz > 0;
        const alpha = isFront ? 0.35 + p.rz * 0.65 : 0.08;
        const size = isFront ? (p.isBeacon ? 3.5 : 1.8) * p.zScale : 1;

        if (p.isBeacon && isFront) {
          // Beacon glow ring
          ctx.beginPath();
          ctx.arc(p.px, p.py, size * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0, (alpha * 0.35)).toFixed(2)})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
          ctx.fillStyle = isFront ? `rgba(228, 228, 231, ${alpha.toFixed(2)})` : `rgba(255, 255, 255, 0.10)`;
          ctx.fill();
        }
      });

      if (!reduce) {
        rot += 0.0035;
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [isMounted, reduce]);

  return (
    <div className={styles.globeWrapper} aria-hidden="true">
      {/* Ambient background glow */}
      <div className={styles.globeBackglow} />

      {/* Decorative orbital SVG rings */}
      <svg className={styles.orbitSvg} viewBox="0 0 500 500" fill="none">
        <ellipse cx="250" cy="250" rx="230" ry="90" transform="rotate(-20 250 250)" stroke="rgba(22, 131, 255, 0.22)" strokeWidth="1" strokeDasharray="6 8" />
        <ellipse cx="250" cy="250" rx="210" ry="70" transform="rotate(35 250 250)" stroke="rgba(62, 166, 255, 0.16)" strokeWidth="1" />
      </svg>

      {/* 3D Canvas Globe */}
      <canvas ref={canvasRef} className={styles.globeCanvas} />

      {/* Floating IoT Concept Labels */}
      <div className={styles.labelsContainer}>
        {LABELS.map((item) => (
          <motion.div
            key={item.tag}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: item.delay, ease: [0.22, 1, 0.36, 1] }}
            className={`${styles.floatingCard} ${item.positionClass}`}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardDot} />
              <span className={styles.cardTag}>{item.tag}</span>
            </div>
            <span className={styles.cardDesc}>{item.desc}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
