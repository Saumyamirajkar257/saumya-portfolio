"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Reveal — fades + lifts children into view once.
 * Springs respect prefers-reduced-motion via useReducedMotion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  once = true,
  className = "",
  duration = 0.7,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Counter — animates a number when scrolled into view. Fail-safe: renders
 *  the final value immediately and only animates up from 0 once it is
 *  actually in view, so a stalled observer never leaves a 0 on screen. */
export function Counter({ end, suffix = "", duration = 1.6, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const target = Number(end) || 0;
  const [value, setValue] = useState(target);
  const started = useRef(false);

  useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now) => {
            const t = Math.min((now - startTime) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration, reduce, target]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}

/** useInViewOnce — tiny helper exposing a boolean when an element enters view. */
export function useInViewOnce(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}