"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion, useIsTouch } from "@/lib/hooks";
import styles from "./EmberCursorTrail.module.css";

/**
 * EmberCursorTrail — a trail of ember-like particles following the cursor.
 * Desktop only, respects reduced motion.
 */
export default function EmberCursorTrail() {
  const reduce = usePrefersReducedMotion();
  const touch = useIsTouch();
  const canvasRef = useRef(null);
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    if (reduce || touch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf;
    let width = 0;
    let height = 0;
    let mouseX = -9999;
    let mouseY = -9999;

    const trail = [];

    const resize = () => {
      const newDpr = Math.min(window.devicePixelRatio || 1, 2);
      setDpr(newDpr);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * newDpr;
      canvas.height = height * newDpr;
      ctx.setTransform(newDpr, 0, 0, newDpr, 0, 0);
    };

    const colors = [
      { r: 255, g: 176, b: 84 },  // amber
      { r: 255, g: 122, b: 69 },  // coral
      { r: 255, g: 94, b: 98 },   // coral2
      { r: 139, g: 108, b: 255 }, // violet
    ];

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // spawn 2-3 particles per frame at cursor
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.2;
        trail.push({
          x: mouseX + (Math.random() - 0.5) * 8,
          y: mouseY + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.15,
          life: 1,
          decay: Math.random() * 0.012 + 0.006,
          size: Math.random() * 3.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      // cap
      if (trail.length > 140) trail.splice(0, trail.length - 140);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gentle gravity
        p.life -= p.decay;
        p.size *= 0.985;

        if (p.life <= 0 || p.size < 0.3) {
          trail.splice(i, 1);
          continue;
        }

        const alpha = p.life * 0.55;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        grad.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha})`);
        grad.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    loop();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [reduce, touch]);

  if (reduce || touch) return null;

  return (
    <canvas
      ref={canvasRef}
      className={styles.trail}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}