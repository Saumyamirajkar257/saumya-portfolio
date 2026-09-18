"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useIsTouch } from "@/lib/hooks";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

/**
 * Navbar — sticky glass nav with active-section tracking. On mobile, a
 * full-screen overlay menu with staggered, oversized links.
 */
export default function Navbar({ name }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  const reduce = useReducedMotion();
  const touch = useIsTouch();

  if (pathname?.startsWith("/ielts") || pathname?.startsWith("/secret") || pathname?.startsWith("/vault")) {
    return null;
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section
  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href)).filter(Boolean);
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-38% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const scrollTo = (href) => {
    setOpen(false);
    setActive(href);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }, open ? 80 : 0);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className={`nav ${scrolled ? "nav--scrolled" : ""}`}
      >
        <div className="wrap nav__inner">
          <a
            href="#home"
            className="nav__logo"
            onClick={(e) => { e.preventDefault(); scrollTo("#home"); }}
            aria-label="Back to top"
          >
            <span className="nav__monogram">SM</span>
            <span className="nav__name">Saumya Mirajkar</span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}
                className={`nav__link ${active === l.href ? "is-active" : ""}`}
                style={{ position: "relative" }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>{l.label}</span>
                {active === l.href && (
                  <motion.span
                    layoutId="navActiveUnderline"
                    className="nav__link-underline"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            className="nav__cta"
            onClick={(e) => { e.preventDefault(); scrollTo("#contact"); }}
          >
            Let's Connect <span aria-hidden="true" style={{ marginLeft: "4px" }}>↗</span>
          </a>

          <button
            className={`nav__burger ${open ? "is-open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <span />
            <span />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="nav-overlay"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="wrap nav-overlay__links" aria-label="Mobile">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`nav-overlay__link ${active === l.href ? "is-active" : ""}`}
                >
                  {l.label}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="nav-overlay__foot"
              >
                <span className="text-mono nav-overlay__tag">Open to internships</span>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}