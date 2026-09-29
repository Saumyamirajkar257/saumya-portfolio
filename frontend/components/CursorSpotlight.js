"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion, useIsTouch, useMounted } from "@/lib/hooks";
import styles from "./CursorSpotlight.module.css";

/**
 * CursorSpotlight — a GPU-composited soft radial glow that follows the cursor.
 * Uses hardware-accelerated transform: translate3d instead of full-screen CSS gradient
 * repaints, maintaining buttery 60/120 FPS during fast scrolling and mouse tracking.
 */
export default function CursorSpotlight() {
  const isMounted = useMounted();
  const reduce = usePrefersReducedMotion();
  const touch = useIsTouch();
  const elRef = useRef(null);

  useEffect(() => {
    if (reduce || touch) return;

    const el = elRef.current;
    if (!el) return;

    let raf;
    let mx = -9999, my = -9999;
    let cx = -9999, cy = -9999;
    let isVisible = false;
    let isMoving = false;
    let idleTimer = null;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!isVisible) {
        isVisible = true;
        el.style.opacity = "1";
      }
      isMoving = true;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isMoving = false;
      }, 150);
    };

    const loop = () => {
      // Smooth lerp
      const dx = mx - cx;
      const dy = my - cy;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        cx += dx * 0.12;
        cy += dy * 0.12;
        el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      }

      raf = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      isVisible = false;
      el.style.opacity = "0";
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce, touch]);

  if (!isMounted || reduce || touch) return null;

  return (
    <div
      ref={elRef}
      className={styles.spotlight}
      aria-hidden="true"
    />
  );
}
