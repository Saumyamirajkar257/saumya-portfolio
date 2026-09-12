"use client";

import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useMounted } from "@/lib/hooks";

/** ScrollProgress — gradient bar tracking page scroll with a leading dot. */
export default function ScrollProgress() {
  const isMounted = useMounted();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const dotX = useTransform(scrollYProgress, [0, 1], ["0vw", "100vw"]);

  if (!isMounted || reduce) return null;

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
          background: "linear-gradient(90deg, #00e5a0, #00c98b, #00b87f)",
          boxShadow: "0 0 20px rgba(0, 201, 139, 0.6), 0 0 40px rgba(0, 201, 139, 0.3)",
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
          background: "#00c98b",
          boxShadow: "0 0 12px rgba(0, 201, 139, 0.8), 0 0 24px rgba(0, 201, 139, 0.4)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
    </>
  );
}