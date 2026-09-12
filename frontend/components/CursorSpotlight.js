"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion, useIsTouch } from "@/lib/hooks";
import styles from "./CursorSpotlight.module.css";

/**
 * CursorSpotlight — a large, soft radial gradient that follows the cursor,
 * creating a subtle "flashlight in the dark" feel. Uses a single fixed div
 * with a CSS gradient for GPU-friendly performance.
 */
export default function CursorSpotlight() {
  const reduce = usePrefersReducedMotion();
  const touch = useIsTouch();
  const elRef = useRef(null);
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduce || touch) return;

    const el = elRef.current;
    if (!el) return;

    let raf;
    let mx = -9999, my = -9999;
    let cx = -9999, cy = -9999;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) setVisible(true);
    };

    const loop = () => {
      // smooth follow
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      el.style.setProperty("--cx", `${cx}px`);
      el.style.setProperty("--cy", `${cy}px`);
      raf = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      setVisible(false);
    };

    loop();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce, touch, visible]);

  if (reduce || touch) return null;

  return (
    <div
      ref={elRef}
      className={styles.spotlight}
      aria-hidden="true"
      style={{
        "--cx": pos.x,
        "--cy": pos.y,
        opacity: visible ? 1 : 0,
      }}
    />
  );
}