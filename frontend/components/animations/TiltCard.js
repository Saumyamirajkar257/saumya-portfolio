"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useCallback } from "react";

/**
 * TiltCard — subtle 3D tilt + glare that follows the cursor.
 * Interactive cards keep this tasteful (max ~7deg). Disabled for reduced
 * motion and touch screens (pointer: fine only).
 */
export default function TiltCard({ children, className = "", max = 7, glare = true }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const onMove = useCallback(
    (e) => {
      if (reduce) return;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * max;
      const ry = (px - 0.5) * max;
      node.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      node.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      if (glare) {
        node.style.setProperty("--gx", `${px * 100}%`);
        node.style.setProperty("--gy", `${py * 100}%`);
        node.style.setProperty("--glare-opacity", "1");
      }
    },
    [reduce, max, glare]
  );

  const onLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--glare-opacity", "0");
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-card ${className}`}
      style={{
        transform: "perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
        transformStyle: "preserve-3d",
        transition: "transform 0.18s ease-out",
        willChange: "transform",
      }}
    >
      {children}
      {glare && (
        <span
          className="tilt-glare"
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.14), transparent 55%)`,
            opacity: "var(--glare-opacity, 0)",
          }}
        />
      )}
    </motion.div>
  );
}