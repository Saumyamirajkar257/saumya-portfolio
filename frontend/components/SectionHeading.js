"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FadeUp, LineReveal, EASE, TIMING } from "@/components/animations/MotionSystem";

/**
 * SectionHeading — Consistent, high-craft section title block with
 * subtle motion rhythm, animated rule divider, and fluid text typography.
 */
export default function SectionHeading({ eyebrow, title, lead = null, align = "left" }) {
  const reduce = useReducedMotion();

  return (
    <div className={`section-heading ${align === "center" ? "section-heading--center" : ""}`}>
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: reduce ? 0.01 : TIMING.button, ease: EASE.premium }}
        >
          <span className="eyebrow">{eyebrow}</span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: reduce ? 0.01 : TIMING.component, delay: reduce ? 0 : 0.08, ease: EASE.premium }}
      >
        <h2 className="display-2 section-heading__title">{title}</h2>
      </motion.div>

      {lead && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: reduce ? 0.01 : TIMING.component, delay: reduce ? 0 : 0.16, ease: EASE.premium }}
          className="section-heading__lead"
        >
          {lead}
        </motion.div>
      )}

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: reduce ? 0.01 : TIMING.section, delay: reduce ? 0 : 0.22, ease: EASE.premium }}
        style={{ transformOrigin: align === "center" ? "center" : "left" }}
        className="divider section-heading__rule"
      />
    </div>
  );
}
