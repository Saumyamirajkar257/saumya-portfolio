"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion, useMounted } from "@/lib/hooks";
import styles from "./GhostParallax.module.css";

const GHOST_WORDS = [
  { text: "CODE", y: 0.15 },
  { text: "BUILD", y: 0.35 },
  { text: "CREATE", y: 0.55 },
  { text: "SHIP", y: 0.75 },
];

function GhostWord({ word, scrollYProgress }) {
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-80 * word.y}px`, `${80 * (1 - word.y)}px`]
  );

  return (
    <motion.span
      className={styles.word}
      style={{ y, opacity: 0.035 }}
    >
      {word.text}
    </motion.span>
  );
}

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

  if (reduce || !isMounted || !isWide) return null;

  return (
    <div className={styles.container} aria-hidden="true">
      {GHOST_WORDS.map((w) => (
        <GhostWord key={w.text} word={w} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}