"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * TextReveal — splits text into words/characters and animates them in for a
 * premium editorial feel. Falls back to a plain fade for reduced motion.
 */
export default function TextReveal({
  text,
  as = "span",
  className = "",
  delay = 0,
  stagger = 0.045,
  split = "word", // "word" | "char"
  once = true,
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];
  const unit = split === "char" ? text.split("") : text.split(" ");

  if (reduce) {
    const R = as;
    return <R className={className}>{text}</R>;
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      style={{ display: "inline-block" }}
    >
      {unit.map((seg, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
        >
          <motion.span
            variants={{
              hidden: { y: "115%" },
              show: { y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
            }}
            style={{ display: "inline-block", whiteSpace: "nowrap" }}
          >
            {seg}
            {split === "word" && i < unit.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}