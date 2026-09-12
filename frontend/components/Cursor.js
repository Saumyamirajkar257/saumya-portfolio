"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion, useIsTouch, useMounted } from "@/lib/hooks";

/**
 * Custom cursor — a glowing dot with a trailing ring that morphs over
 * interactive elements. Desktop pointers only; disabled for touch/reduced
 * motion. Native cursor is hidden via the `has-cursor` body class.
 */
export default function Cursor() {
  const isMounted = useMounted();
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const reduce = usePrefersReducedMotion();
  const touch = useIsTouch();

  useEffect(() => {
    if (reduce || touch) return;

    document.body.classList.add("has-cursor");
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -100, my = -100;   // mouse
    let rx = -100, ry = -100;   // ring eased position
    let raf;
    let visible = false;
    let hoverEl = null;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = 1;
        ring.style.opacity = 1;
        rx = mx; ry = my;
      }
      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx - 20}px, ${ry - 20}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Enlarge over interactive elements (buttons, links, [data-cursor]).
    const stopProp = (t) => {
      const p = t.closest &&
        (t.closest("a, button, [data-cursor], input, textarea, select, .tilt-card"));
      return p;
    };
    const onOver = (e) => {
      const target =
        e.target instanceof Element ? (e.target.closest("a, button, [data-cursor], input, textarea, select, .tilt-card") || e.target) : e.target;
      const isInteractive = stopProp(target);
      ring.classList.toggle("is-hover", Boolean(isInteractive));
      hoverEl = isInteractive || null;
    };

    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");
    const onLeaveDoc = () => {
      visible = false;
      dot.style.opacity = 0;
      ring.style.opacity = 0;
      ring.classList.remove("is-hover", "is-down");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeaveDoc);
    document.addEventListener("mouseleave", onLeaveDoc);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeaveDoc);
      document.removeEventListener("mouseleave", onLeaveDoc);
    };
  }, [reduce, touch]);

  if (!isMounted || reduce || touch) return null;

  return (
    <div aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} />
    </div>
  );
}