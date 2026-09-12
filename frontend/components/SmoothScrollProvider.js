"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Lenis smooth-scroll wrapper.
 * Initializes once, exposes the instance globally so other components can
 * hook into onScroll / onScrollEnd.
 */
export default function SmoothScrollProvider({ children }) {
  const reduce = usePrefersReducedMotion();
  const lenisRef = useRef(null);

  useEffect(() => {
    if (reduce) return;

    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
        direction: "vertical",
        gestureDirection: "vertical",
        infinite: false,
        lerp: 0.075,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.5,
        normalizeWheel: true,
      });

      lenisRef.current = lenis;
      if (typeof window !== "undefined") {
        window.__lenis = lenis;
      }

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
        if (typeof window !== "undefined") delete window.__lenis;
      };
    });
  }, [reduce]);

  return children;
}