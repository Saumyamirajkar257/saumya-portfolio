"use client";

import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useMounted } from "@/lib/hooks";

/** ScrollProgress — gradient bar tracking page scroll with a leading dot. */
export default function ScrollProgress() {
  const pathname = usePathname();
  const isMounted = useMounted();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const dotX = useTransform(scrollYProgress, [0, 1], ["0vw", "100vw"]);

  if (!isMounted || reduce || pathname?.startsWith("/ielts") || pathname?.startsWith("/secret") || pathname?.startsWith("/vault")) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        scaleX,
        transformOrigin: "0% 50%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9998,
        background: "linear-gradient(90deg, #1683FF, #38BDF8)",
        boxShadow: "0 0 8px rgba(56, 189, 248, 0.4)",
        pointerEvents: "none",
      }}
    />
  );
}