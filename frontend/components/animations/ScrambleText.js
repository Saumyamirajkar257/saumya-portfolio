"use client";

import { useEffect, useState, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#________";

export default function ScrambleText({
  text,
  as = "span",
  className = "",
  delay = 0,
  duration = 2.2,
  charset = SCRAMBLE_CHARS,
}) {
  const reduce = usePrefersReducedMotion();
  const [display, setDisplay] = useState("");
  const frameRef = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduce) {
      setDisplay(text);
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    const startAt = performance.now() + delay * 1000;
    const endAt = startAt + duration * 1000;

    const chars = text.split("");
    const state = chars.map(() => ({ char: "", target: "", progress: 0, done: false }));

    const tick = (now) => {
      if (now < startAt) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = Math.min(now, endAt) - startAt;
      const globalProgress = elapsed / (duration * 1000);

      // Staggered reveal
      state.forEach((s, i) => {
        const charDelay = i * (duration / chars.length) * 0.4 * 1000;
        const localProgress = Math.min(1, Math.max(0, (elapsed - charDelay) / (duration * 600)));
        s.progress = localProgress;

        if (localProgress >= 1) {
          s.char = s.target;
          s.done = true;
        } else {
          // Scramble
          s.char = charset[Math.floor(Math.random() * charset.length)];
        }
      });

      setDisplay(state.map((s) => s.char).join(""));

      if (now < endAt || state.some((s) => !s.done)) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, [text, delay, duration, reduce]);

  return <span className={className}>{display}</span>;
}