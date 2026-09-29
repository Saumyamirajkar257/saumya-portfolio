"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion, useMounted } from "@/lib/hooks";
import styles from "./Preloader.module.css";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const reduce = usePrefersReducedMotion();
  const isMounted = useMounted();

  useEffect(() => {
    if (reduce) {
      setLoaded(true);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 16) + 12;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setLoaded(true), 240);
      } else {
        setProgress(current);
      }
    }, 55);

    return () => clearInterval(interval);
  }, [reduce]);

  if (!isMounted || reduce) return null;

  return (
    <AnimatePresence>
      {!loaded && (
        <motion.div
          className={styles.preloader}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
          role="status"
          aria-label="Loading portfolio"
        >
          <div className={styles.curtain} />
          <div className={styles.content}>
            <motion.div
              className={styles.loader}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className={styles.loader__mark}>SM</span>
            </motion.div>

            <div className={styles.counter}>
              <span className={styles.counter__num}>{progress}%</span>
              <span className={styles.counter__bar}>
                <motion.div
                  className={styles.counter__fill}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  style={{ transformOrigin: "left center" }}
                />
              </span>
            </div>

            <p className={styles.hint}>
              loading portfolio…
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
