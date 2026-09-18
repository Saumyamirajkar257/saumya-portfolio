/**
 * Motion Design System — 10/10 motion language
 * Single source of truth for all animations, stagger, and transitions.
 * Import from here, never write raw Framer Motion variants inline.
 */

import { Variants, Transition } from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// TOKENS — mirror CSS custom properties in globals.css
// ═══════════════════════════════════════════════════════════════

export const easing = {
  spring: [0.22, 1, 0.36, 1] as const,        // default — natural, confident
  snappy: [0.34, 1.56, 0.64, 1] as const,     // micro-interactions — playful
  glide: [0.25, 0.46, 0.45, 0.94] as const,   // page/section transitions — smooth
  sharp: [0.4, 0, 0.2, 1] as const,           // urgent — modals, toasts
};

export const duration = {
  instant: 0.08,
  fast: 0.12,
  base: 0.28,
  slow: 0.48,
  slower: 0.72,
};

export const spring = {
  gentle: { type: "spring", stiffness: 120, damping: 18 } as Transition,
  base: { type: "spring", stiffness: 280, damping: 22 } as Transition,
  snappy: { type: "spring", stiffness: 400, damping: 17 } as Transition,
  stiff: { type: "spring", stiffness: 600, damping: 20 } as Transition,
};

// ═══════════════════════════════════════════════════════════════
// REUSABLE VARIANTS — compose these, don't reinvent
// ═══════════════════════════════════════════════════════════════

/** Standard fade + slide up — used for 90% of reveals */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: easing.spring },
  },
};

/** Fade only — for elements that shouldn't move */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base, ease: easing.spring } },
};

/** Scale + fade — for modals, popovers, cards */
export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: easing.spring },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: duration.fast, ease: easing.sharp },
  },
};

/** Slide from side — for drawers, side panels */
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: easing.glide } },
  exit: { opacity: 0, x: 32, transition: { duration: duration.fast, ease: easing.sharp } },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: easing.glide } },
  exit: { opacity: 0, x: -32, transition: { duration: duration.fast, ease: easing.sharp } },
};

/** Stagger containers — wrap lists/grids */
export const staggerContainer = (
  staggerChildren = 0.06,
  delayChildren = 0
): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren, delayChildren, ease: easing.spring },
  },
});

/** Stagger item — pairs with staggerContainer */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.spring },
  },
};

/** Radial stagger — center out (for constellation, grids) */
export const radialStaggerContainer = (staggerChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren, staggerDirection: -1, ease: easing.spring },
  },
});

// ═══════════════════════════════════════════════════════════════
// MICRO-INTERACTION HOOKS — use on buttons, chips, cards
// ═══════════════════════════════════════════════════════════════

export const buttonTap = {
  whileHover: { scale: 1.02, y: -2, transition: { duration: duration.fast, ease: easing.snappy } },
  whileTap: { scale: 0.96, transition: { duration: duration.instant } },
  transition: spring.snappy,
};

export const chipTap = {
  whileHover: { y: -2, boxShadow: "0 8px 24px -8px rgba(0, 229, 160, 0.45)", transition: { duration: duration.fast, ease: easing.snappy } },
  whileTap: { scale: 0.98, transition: { duration: duration.instant } },
  transition: spring.base,
};

export const cardHover = {
  whileHover: {
    y: -6,
    scale: 1.01,
    rotateX: 2,
    rotateY: -2,
    boxShadow: "0 30px 60px -20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 229, 160, 0.2)",
    transition: { duration: duration.base, ease: easing.spring },
  },
  transition: spring.base,
};

export const linkHover = {
  whileHover: { letterSpacing: "0.04em", transition: { duration: duration.fast, ease: easing.snappy } },
};

export const iconButtonTap = {
  whileHover: { scale: 1.1, rotate: 6, transition: { duration: duration.fast, ease: easing.snappy } },
  whileTap: { scale: 0.9, rotate: -6, transition: { duration: duration.instant } },
  transition: spring.snappy,
};

// ═══════════════════════════════════════════════════════════════
// SCROLL-DRIVEN VARIANTS — use with useScroll/useTransform
// ═══════════════════════════════════════════════════════════════

export const scrollReveal = {
  hidden: { opacity: 0, y: 30 },
  show: (progress: number) => ({
    opacity: progress,
    y: 30 * (1 - progress),
    transition: { duration: 0.01 }, // controlled by scroll timeline
  }),
};

export const scrollScale = {
  hidden: { opacity: 0, scale: 0.9 },
  show: (progress: number) => ({
    opacity: progress,
    scale: 0.9 + 0.1 * progress,
    transition: { duration: 0.01 },
  }),
};

export const scrollRotate = (degrees = 180) => ({
  hidden: { rotate: 0 },
  show: (progress: number) => ({ rotate: degrees * progress }),
});

// ═══════════════════════════════════════════════════════════════
// PAGE TRANSITION — for AnimatePresence route changes
// ═══════════════════════════════════════════════════════════════

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.glide } },
  exit: { opacity: 0, y: -16, transition: { duration: duration.base, ease: easing.sharp } },
};

// ═══════════════════════════════════════════════════════════════
// UTILITY — reduced motion guard
// ═══════════════════════════════════════════════════════════════

export function respectsReducedMotion<T extends Variants>(
  variants: T,
  reduce: boolean
): T | false {
  if (reduce) return false;
  return variants;
}

export function reducedTransition<T extends Transition>(
  transition: T,
  reduce: boolean
): T | { duration: 0 } {
  if (reduce) return { duration: 0 };
  return transition;
}