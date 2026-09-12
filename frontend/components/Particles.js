"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Particles — a lightweight canvas of drifting ember-like dots with subtle
 * connecting lines. GPU-friendly (transform offsets via 2d canvas), low count.
 * Respects prefers-reduced-motion (renders a static frame instead).
 */
export default function Particles({ density = 46, className = "" }) {
  const canvasRef = useRef(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const COLORS = ["255,176,84", "255,122,69", "255,94,98", "139,108,255"];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const particles = [];
    const makeParticles = () => {
      particles.length = 0;
      const count = Math.max(8, Math.round((width * height) / 38000) * density / 46);
      for (let i = 0; i < Math.min(count, 90); i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.6 + 0.5,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          c: COLORS[Math.floor(Math.random() * COLORS.length)],
          a: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const draw = (offset) => {
      ctx.clearRect(0, 0, width, height);

      // Lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p = particles[i];
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = dx * dx + dy * dy;
          if (dist < 120 * 120) {
            const alpha = (1 - dist / (120 * 120)) * 0.16;
            ctx.strokeStyle = `rgba(255,160,110,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // Dots with a soft glow
      for (const p of particles) {
        const twinkle = 0.75 + 0.25 * Math.sin(offset * 0.001 + p.r * 40);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `rgba(${p.c},${p.a * twinkle})`);
        grad.addColorStop(1, `rgba(${p.c},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const update = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }
    };

    const loop = (time) => {
      update();
      draw(time);
      raf = requestAnimationFrame(loop);
    };

    const init = () => {
      resize();
      makeParticles();
      if (reduce) {
        draw(0); // static single frame
        return;
      }
      loop(0);
    };

    init();
    window.addEventListener("resize", () => {
      resize();
      makeParticles();
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
    };
  }, [reduce, density]);

  return (
    <canvas
      ref={canvasRef}
      className={`particles ${className}`}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}