"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, useReducedMotion } from "framer-motion";
import { usePrefersReducedMotion, useMounted } from "@/lib/hooks";
import styles from "./GhostParallax.module.css";

const GHOST_WORDS = [
  { text: "CODE", y: 0.15 },
  { text: "BUILD", y: 0.35 },
  { text: "CREATE", y: 0.55 },
  { text: "SHIP", y: 0.75 },
];

export default function GhostParallax() {
  const reduce = usePrefersReducedMotion();
  const isMounted = useMounted();
  const [isWide, setIsWide] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 861px)");
    setIsWide(mq.matches);
    const handler = (e) => setIsWide(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { scrollYProgress } = useScroll();
  const yOffsets = GHOST_WORDS.map((w) =>
    useTransform(scrollYProgress, [0, 1], [`${-80 * w.y}px`, `${80 * (1 - w.y)}px`])
  );

  if (reduce || !isMounted || !isWide) return null;

  return (
    <div className={styles.container} aria-hidden="true">
      {GHOST_WORDS.map((w, i) => (
        <motion.span
          key={w.text}
          className={styles.word}
          style={{ y: yOffsets[i], opacity: 0.035 }}
        >
          {w.text}
        </motion.span>
      ))}
    </div>
  );
}