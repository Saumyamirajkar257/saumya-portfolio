"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Lenis Smooth Scroll Provider
 * Provides buttery-smooth momentum scrolling, synchronized with RAF,
 * eliminating jitter and wheel-delta conflict.
 */
export default function SmoothScrollProvider({ children }) {
  const reduce = usePrefersReducedMotion();
  const lenisRef = useRef(null);

  useEffect(() => {
    if (reduce) return;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    // Handle internal anchor clicks smoothly with Lenis
    const handleAnchorClick = (e) => {
      const target = e.target.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el, { offset: -60, duration: 1.2 });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    // RAF Loop
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [reduce]);

  return <>{children}</>;
}
