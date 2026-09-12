"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, useCallback } from "react";

/**
 * Magnetic — makes a child subtly "pull" toward the cursor within its bounds.
 * With reduced motion, or on touch, it renders without the effect.
 */
export default function Magnetic({ children, strength = 0.35, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (e) => {
      if (reduce) return;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      setPos({ x: x * strength, y: y * strength });
    },
    [reduce, strength]
  );

  const onLeave = useCallback(() => setPos({ x: 0, y: 0 }), []);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.6 }}
      style={{ display: "inline-flex" }}
    >
      {children}
    </motion.div>
  );
}