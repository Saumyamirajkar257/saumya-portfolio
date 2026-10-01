"use client";

import { motion, useReducedMotion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/**
 * ============================================================
 * MOTION SYSTEM — Premium Portfolio Animation Primitives
 * Based on reference video motion principles
 * ============================================================
 */

// Timing constants following reference guidelines
export const TIMING = {
  micro: 0.15,       // Micro interactions (fast)
  button: 0.25,      // Button/hover (fast-medium)
  component: 0.4,    // Component transition (medium)
  section: 0.6,      // Large section transition (medium-slow)
  hero: 0.9,         // Hero animation (cinematic)
};

// Premium easing curves matching reference quality
export const EASE = {
  // Primary: custom cubic-bezier for smooth, natural motion
  premium: [0.22, 1, 0.36, 1],
  // Elastic: for bouncy, playful interactions
  elastic: [0.34, 1.56, 0.64, 1],
  // Sharp: for quick, snappy feedback
  sharp: [0.22, 1, 0.22, 1],
  // Smooth: for ambient, continuous motion
  smooth: [0.4, 0, 0.2, 1],
};

// Base animation variants
export const VARIANTS = {
  // Fade up entrance
  fadeUp: (delay = 0, y = 28) => ({
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: TIMING.component, delay, ease: EASE.premium }
    }
  }),

  // Fade in scale
  fadeScale: (delay = 0, scale = 0.95) => ({
    hidden: { opacity: 0, scale },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: TIMING.component, delay, ease: EASE.premium }
    }
  }),

  // Slide in from direction
  slideIn: (delay = 0, direction = "left", distance = 40) => {
    const directions = {
      left: { x: -distance },
      right: { x: distance },
      up: { y: distance },
      down: { y: -distance },
    };
    return {
      hidden: { opacity: 0, ...directions[direction] },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: TIMING.component, delay, ease: EASE.premium }
      }
    };
  },

  // Stagger container
  staggerContainer: (stagger = 0.06, delay = 0) => ({
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay }
    }
  }),

  // Viewport reveal with custom margin
  reveal: (margin = "-12%") => ({
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: TIMING.component, ease: EASE.premium }
    },
    viewport: { once: true, margin }
  }),
};

/**
 * FadeUp — Primary entrance animation
 * Springs respect prefers-reduced-motion
 */
export function FadeUp({ children, delay = 0, y = 28, duration = TIMING.component, className = "" }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0.01 : duration,
        delay: reduce ? 0 : delay,
        ease: EASE.premium
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn — Simple opacity fade
 */
export function FadeIn({ children, delay = 0, duration = TIMING.button, className = "" }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reduce ? 0.01 : duration,
        delay: reduce ? 0 : delay
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn — Scale entrance with opacity
 */
export function ScaleIn({ children, delay = 0, scale = 0.92, duration = TIMING.component, className = "" }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reduce ? 0.01 : duration,
        delay: reduce ? 0 : delay,
        ease: EASE.premium
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn — Directional slide entrance
 */
export function SlideIn({ children, delay = 0, direction = "left", distance = 40, duration = TIMING.component, className = "" }) {
  const reduce = useReducedMotion();

  const directions = {
    left: { x: -distance },
    right: { x: distance },
    up: { y: distance },
    down: { y: -distance },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: reduce ? 0.01 : duration,
        delay: reduce ? 0 : delay,
        ease: EASE.premium
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerChildren — Stagger animation for multiple children
 */
export function StaggerChildren({ children, delay = 0, stagger = 0.05, className = "" }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: reduce ? 0 : delay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem — Individual item in stagger group
 */
export function StaggerItem({ children, y = 24, duration = TIMING.button }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduce ? 0.01 : duration,
            ease: EASE.premium
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * HoverLift — Lift effect on hover
 */
export function HoverLift({ children, lift = -6, duration = TIMING.button, className = "" }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reduce ? {} : { y: lift, transition: { duration, ease: EASE.premium } }}
      whileTap={reduce ? {} : { scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * MagneticButton — Subtle magnetic pull effect on hover
 */
export function MagneticButton({ children, strength = 0.3, duration = TIMING.button, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    setPosition({
      x: mouseX * strength,
      y: mouseY * strength
    });
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={resetPosition}
      animate={{ x: position.x, y: position.y }}
      transition={{ duration: reduce ? 0 : duration, ease: EASE.premium }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ParallaxMove — Parallax movement based on mouse position
 */
export function ParallaxMove({ children, strength = 0.3, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useRef(0);
  const y = useRef(0);

  useEffect(() => {
    if (reduce) return;

    const handleMouseMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      x.current = ((e.clientX - centerX) / rect.width) * strength * 100;
      y.current = ((e.clientY - centerY) / rect.height) * strength * 100;
    };

    const element = ref.current;
    if (element) {
      element.addEventListener("mousemove", handleMouseMove);
    }

    let animating = true;
    const animate = () => {
      if (!animating) return;
      element.style.transform = `translate(${x.current}px, ${y.current}px)`;
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      animating = false;
      if (element) {
        element.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [reduce, strength]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

/**
 * ScrollReveal — Reveal on scroll with controlled opacity
 */
export function ScrollReveal({ children, delay = 0, y = 32, threshold = 0.15, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-12% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: reduce ? 0.01 : TIMING.component,
        delay: reduce ? 0 : delay,
        ease: EASE.premium
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollParallax — Parallax effect based on scroll position
 */
export function ScrollParallax({ children, speed = 0.5, direction = "y", className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const transform = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "y"
      ? [`-${speed * 100}%`, `${speed * 100}%`]
      : [`-${speed * 50}px`, `${speed * 50}px`]
  );

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} className={className} style={{ [direction]: transform }}>
      {children}
    </motion.div>
  );
}

/**
 * TextRevealLine — Single line text reveal with clip path
 */
export function TextRevealLine({ children, delay = 0, className = "" }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0.01 : TIMING.component,
        delay: reduce ? 0 : delay,
        ease: EASE.premium
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * WordReveal — Split text into words and animate each
 */
export function WordReveal({ text, className = "", delay = 0, stagger = 0.04 }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <motion.span
      className={className}
      style={{ display: "inline" }}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay }
        }
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", marginRight: "0.25em" }}
          variants={{
            hidden: { opacity: 0, y: "120%" },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: reduce ? 0.01 : 0.6, ease: EASE.premium }
            }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/**
 * CharReveal — Split text into characters and animate each
 */
export function CharReveal({ text, className = "", delay = 0, stagger = 0.025 }) {
  const reduce = useReducedMotion();
  const chars = text.split("");

  return (
    <motion.span
      className={className}
      style={{ display: "inline" }}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay }
        }
      }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          variants={{
            hidden: { opacity: 0, y: "120%" },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: reduce ? 0.01 : 0.5, ease: EASE.premium }
            }
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/**
 * ClipReveal — Image/element reveal with clip path animation
 */
export function ClipReveal({ children, delay = 0, className = "" }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{
        duration: reduce ? 0.01 : TIMING.section,
        delay: reduce ? 0 : delay,
        ease: EASE.premium
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * LineReveal — Horizontal line reveal animation
 */
export function LineReveal({ delay = 0, width = "100%", className = "" }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{
        duration: reduce ? 0.01 : TIMING.section,
        delay: reduce ? 0 : delay,
        ease: EASE.premium
      }}
      style={{
        width,
        height: "2px",
        background: "linear-gradient(90deg, rgba(255,255,255,0.4), transparent)",
        transformOrigin: "left"
      }}
    />
  );
}

/**
 * ViewportCounter — Animated counter when scrolled into view
 */
export function ViewportCounter({ end, suffix = "", duration = 1.8, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [count, setCount] = useState(reduce ? end : 0);
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" });

  useEffect(() => {
    if (reduce || !isInView) {
      setCount(end);
      return;
    }

    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(end * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [end, duration, isInView, reduce]);

  return (
    <span ref={ref} className={className}>
      {count}{suffix}
    </span>
  );
}

/**
 * SmoothScrollSection — Wrapper for smooth scroll-based animations
 */
export function SmoothScrollSection({ children, className = "" }) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  return (
    <motion.section
      ref={ref}
      className={className}
      style={{ opacity: scrollYProgress, scale: scrollYProgress }}
    >
      {children}
    </motion.section>
  );
}

/**
 * ProgressLine — Animated progress line based on scroll
 */
export function ProgressLine({ className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });

  if (reduce) return null;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "2px",
        background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.6), transparent)",
        transformOrigin: "top",
        scaleY: scrollYProgress
      }}
    />
  );
}

/**
 * GlowPulse — Ambient glow pulse effect
 */
export function GlowPulse({ color = "rgba(255,255,255,0.15)", size = 300, className = "" }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(80px)",
        pointerEvents: "none"
      }}
      animate={reduce ? {} : {
        scale: [1, 1.1, 1],
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={reduce ? {} : {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity
      }}
    />
  );
}

/**
 * BorderGlow — Animated border glow effect
 */
export function BorderGlow({ children, className = "", glowColor = "rgba(255,255,255,0.4)" }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={{ position: "relative", borderRadius: "inherit" }}
      initial={{ "--glow-opacity": 0 }}
      whileHover={reduce ? {} : { "--glow-opacity": 1 }}
      transition={{ duration: TIMING.button }}
    >
      {!reduce && (
        <div
          style={{
            position: "absolute",
            inset: "-1px",
            borderRadius: "inherit",
            padding: "1px",
            background: `linear-gradient(135deg, ${glowColor}, transparent 50%, ${glowColor})`,
            opacity: "var(--glow-opacity, 0)",
            transition: "opacity 0.3s ease",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "xor",
            WebkitMaskComposite: "xor"
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

export default {
  TIMING,
  EASE,
  VARIANTS,
  FadeUp,
  FadeIn,
  ScaleIn,
  SlideIn,
  StaggerChildren,
  StaggerItem,
  HoverLift,
  MagneticButton,
  ParallaxMove,
  ScrollReveal,
  ScrollParallax,
  TextRevealLine,
  WordReveal,
  CharReveal,
  ClipReveal,
  LineReveal,
  ViewportCounter,
  ProgressLine,
  GlowPulse,
  BorderGlow
};