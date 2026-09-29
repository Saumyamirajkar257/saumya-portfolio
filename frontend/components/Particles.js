"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Particles — a lightweight, high-performance canvas of ambient drifting particles.
 * GPU-friendly, capped particle count, zero memory leaks, pauses completely when offscreen.
 */
export default function Particles({ density = 32, className = "" }) {
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
    let isVisible = true;

    // Theme-aligned Monochrome Silver & Platinum palette
    const COLORS = ["255,255,255", "228,228,231", "161,161,170", "113,113,122"];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const particles = [];
    const makeParticles = () => {
      particles.length = 0;
      const count = Math.min(Math.max(12, Math.round((width * height) / 50000)), 36);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.8,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          c: COLORS[Math.floor(Math.random() * COLORS.length)],
          a: Math.random() * 0.35 + 0.15,
        });
      }
    };

    const draw = (offset) => {
      ctx.clearRect(0, 0, width, height);

      const pLen = particles.length;
      // Fast connecting lines
      for (let i = 0; i < pLen; i++) {
        for (let j = i + 1; j < pLen; j++) {
          const p = particles[i];
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 100 * 100) {
            const alpha = (1 - distSq / (100 * 100)) * 0.08;
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle circles
      for (let i = 0; i < pLen; i++) {
        const p = particles[i];
        const twinkle = 0.85 + 0.15 * Math.sin(offset * 0.0015 + p.r * 20);
        ctx.fillStyle = `rgba(${p.c},${p.a * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const update = () => {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }
    };

    const loop = (time) => {
      if (!isVisible) return;
      update();
      draw(time);
      raf = requestAnimationFrame(loop);
    };

    const handleResize = () => {
      resize();
      makeParticles();
      if (reduce) draw(0);
    };

    resize();
    makeParticles();

    if (reduce) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    // Pause canvas loop when Hero is out of viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible && !reduce) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.02 }
    );
    observer.observe(canvas);

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [reduce, density]);

  return (
    <canvas
      ref={canvasRef}
      className={`particles ${className}`}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
}
