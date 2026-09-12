"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePrefersReducedMotion, useMounted } from "@/lib/hooks";
import styles from "./Preloader.module.css";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const reduce = usePrefersReducedMotion();
  const isMounted = useMounted();

  useEffect(() => {
    if (reduce) {
      setProgress(100);
      setLoaded(true);
      return;
    }

    let resolved = false;
    const timer = window.setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12 + 4;
        if (next >= 90) {
          window.clearInterval(timer);
          return 90;
        }
        return next;
      });
    }, 90);

    const finish = () => {
      if (resolved) return;
      resolved = true;
      window.clearInterval(timer);
      setProgress(100);
      setTimeout(() => setLoaded(true), 300);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => { resolved = true; window.clearInterval(timer); };
  }, [reduce]);

  if (loaded || !isMounted) return null;

  return (
    <motion.div
      className={styles.preloader}
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
      role="status"
      aria-label="Loading portfolio"
    >
      <div className={styles.curtain} />
      <div className={styles.content}>
        <motion.div
          className={styles.loader}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className={styles.loader__mark}>SM</span>
        </motion.div>

        <motion.div
          className={styles.counter}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className={styles.counter__num}>{progress}%</span>
          <span className={styles.counter__bar}>
            <motion.div
              className={styles.counter__fill}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center" }}
            />
          </span>
        </motion.div>

        <motion.p
          className={styles.hint}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          loading portfolio…
        </motion.p>
      </div>
    </motion.div>
  );
}