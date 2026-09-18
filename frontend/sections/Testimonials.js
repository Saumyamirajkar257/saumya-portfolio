"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import styles from "./Testimonials.module.css";

export default function Testimonials({ testimonials = [] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((v) => (v + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setActive((v) => (v - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (reduce || testimonials.length <= 1) return;
    const id = window.setInterval(next, 7000);
    return () => window.clearInterval(id);
  }, [reduce, next, testimonials.length]);

  if (!testimonials.length) return null;

  return (
    <section id="testimonials" className="block">
      <div className="wrap">
        <SectionHeading
          eyebrow="what people say"
          title={<>Recommendations & <span className="gradient-text">praise</span></>}
        />

        <Reveal delay={0.1}>
          <div className={styles.carousel}>
            <div className={styles.quote} aria-hidden="true">&ldquo;</div>
            <div className={styles.slideTrack}>
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={active}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={styles.slide}
                >
                  <p className={styles.text}>{testimonials[active].text}</p>
                  <footer className={styles.attribution}>
                    <div className={styles.avatar}>
                      <span className={styles.avatar__initial}>
                        {testimonials[active].name.split(" ").map((w) => w[0]).join("").toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <cite className={styles.name}>{testimonials[active].name}</cite>
                      <span className={styles.role}>{testimonials[active].role}</span>
                    </div>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {testimonials.length > 1 && (
              <div className={styles.controls}>
                <button className={styles.navBtn} onClick={prev} aria-label="Previous testimonial">
                  <span aria-hidden="true">&larr;</span>
                  <span className="sr-only">Previous</span>
                </button>
                <div className={styles.dots}>
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
                      onClick={() => setActive(i)}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>
                <button className={styles.navBtn} onClick={next} aria-label="Next testimonial">
                  <span aria-hidden="true">&rarr;</span>
                  <span className="sr-only">Next</span>
                </button>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
