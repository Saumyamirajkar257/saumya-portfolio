"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useReducedMotion } from "framer-motion";
import { usePrefersReducedMotion, useMounted } from "@/lib/hooks";
import styles from "./ScrollRail.module.css";

const SECTIONS = [
  { id: "home", label: "Home", icon: "◈" },
  { id: "about", label: "About", icon: "1" },
  { id: "skills", label: "Skills", icon: "2" },
  { id: "projects", label: "Projects", icon: "3" },
  { id: "experience", label: "Experience", icon: "4" },
  { id: "education", label: "Education", icon: "5" },
  { id: "certifications", label: "Certs", icon: "6" },
  { id: "contact", label: "Contact", icon: "7" },
];

export default function ScrollRail() {
  const reduce = usePrefersReducedMotion();
  const isMounted = useMounted();
  const [activeId, setActiveId] = useState("home");
  const [visible, setVisible] = useState(false);

  // Scroll-driven active section detection
  const refs = useRef({});

  useEffect(() => {
    if (reduce || !isMounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [reduce, isMounted]);

  // Show rail after scrolling past hero
  const { scrollY } = useScroll();
  useEffect(() => {
    if (reduce) return;
    const unsub = scrollY.on("change", (v) => {
      setVisible(v > 0.08); // appears after ~8% scroll
    });
    return unsub;
  }, [reduce, scrollY]);

  if (reduce || !isMounted) return null;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.aside
      className={styles.rail}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: visible ? 1 : 0, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Section navigation"
    >
      <ul className={styles.list}>
        {SECTIONS.map((s) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * SECTIONS.indexOf(s), duration: 0.4 }}
          >
            <button
              className={`${styles.item} ${activeId === s.id ? styles.active : ""}`}
              onClick={() => scrollTo(s.id)}
              aria-current={activeId === s.id ? "true" : "false"}
              aria-label={`Go to ${s.label}`}
            >
              <span className={styles.itemIcon} aria-hidden="true">{s.icon}</span>
              <span className={styles.itemLabel}>{s.label}</span>
              {activeId === s.id && <span className={styles.itemBar} aria-hidden="true" />}
            </button>
          </motion.li>
        ))}
      </ul>

      <div className={styles.progress}>
        <motion.div
          className={styles.progressFill}
          animate={{ scaleY: SECTIONS.findIndex((s) => s.id === activeId) / (SECTIONS.length - 1) }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "top" }}
        />
      </div>
    </motion.aside>
  );
}