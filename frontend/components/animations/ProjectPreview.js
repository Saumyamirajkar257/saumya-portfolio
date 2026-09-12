"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { usePrefersReducedMotion, useIsTouch } from "@/lib/hooks";
import styles from "./ProjectPreview.module.css";

/**
 * ProjectPreview — a floating preview of the project cover that follows
 * the cursor when hovering any project card. Clean, GPU-friendly.
 */
export default function ProjectPreview({ projects = [] }) {
  const reduce = usePrefersReducedMotion();
  const touch = useIsTouch();
  const previewRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [project, setProject] = useState(null);

  const onEnter = useCallback((e, p) => {
    if (reduce || touch) return;
    setProject(p);
    setVisible(true);
  }, [reduce, touch]);

  const onLeave = useCallback(() => {
    setVisible(false);
    setProject(null);
  }, []);

  const onMove = useCallback((e) => {
    if (!visible) return;
    setPos({ x: e.clientX, y: e.clientY });
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [visible, onMove]);

  if (reduce || touch || !visible || !project) return null;

  const coverStyle = (id = 0) => {
    const palettes = [
      ["#ff7a45", "#ff5e62"],
      ["#6ee7d8", "#8b6cff"],
      ["#ffb054", "#ff5e62"],
      ["#8b6cff", "#5e5bd0"],
    ];
    const [a, b] = palettes[id % palettes.length];
    return { "--ca": a, "--cb": b };
  };

  const initial = (project.title || "P").trim()[0].toUpperCase();

  return (
    <div
      ref={previewRef}
      className={styles.preview}
      style={{
        left: pos.x + 24,
        top: pos.y + 24,
        ...coverStyle(project.id),
      }}
      aria-hidden="true"
    >
      <div className={styles.previewInner}>
        <span className={styles.previewInitial}>{initial}</span>
        <span className={styles.previewTitle}>{project.title}</span>
        <span className={styles.previewCat}>{project.category}</span>
        <span className={styles.previewArrow}>→</span>
      </div>
    </div>
  );
}

export function useProjectPreview() {
  const [handlers, setHandlers] = useState({});

  const register = useCallback((id, project) => {
    setHandlers((h) => ({
      ...h,
      [id]: { onMouseEnter: (e) => h.onGlobalEnter?.(e, project), onMouseLeave: h.onGlobalLeave },
    }));
  }, []);

  return { handlers, register };
}