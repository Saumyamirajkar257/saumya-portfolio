"use client";

import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";

/** ScrollProgress — gradient bar tracking page scroll with a leading dot. */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const dotX = useTransform(scrollYProgress, [0, 1], ["0vw", "100vw"]);

  if (reduce) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{
          scaleX,
          transformOrigin: "0% 50%",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          zIndex: 9998,
          background: "linear-gradient(90deg, #ffb054, #ff7a45, #ff5e62)",
          boxShadow: "0 0 20px rgba(255,122,69,0.6), 0 0 40px rgba(255,122,69,0.3)",
        }}
      />
      <motion.div
        aria-hidden="true"
        style={{
          x: dotX,
          position: "fixed",
          top: -3,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#ff7a45",
          boxShadow: "0 0 12px rgba(255,122,69,0.8), 0 0 24px rgba(255,122,69,0.4)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
    </>
  );
}