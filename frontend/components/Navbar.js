"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CANONICAL_RESUME_PATH, getActiveResumeUrl } from "@/lib/resume";
import { subscribeContent, getContent } from "@/lib/content";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ name }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  const [resumeUrl, setResumeUrl] = useState(CANONICAL_RESUME_PATH);
  const [resumeMenuOpen, setResumeMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  // Keep résumé URL in sync with CMS in real time
  useEffect(() => {
    getContent(false).then((data) => {
      if (data?.profile?.resume_url) setResumeUrl(data.profile.resume_url);
    }).catch(() => {});

    const unsub = subscribeContent((liveData) => {
      if (liveData?.profile?.resume_url) {
        setResumeUrl(liveData.profile.resume_url);
      }
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

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
      const el = document.querySelector(href);
      if (!el) return;
      if (window.__lenis) {
        window.__lenis.scrollTo(el, { offset: -60, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }
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
            <span style={{ fontFamily: "var(--font-anton), 'Anton', sans-serif", fontSize: "18px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#FFFFFF" }}>
              SAUMYA MIRAJKAR
            </span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}
                className={`nav__link ${active === l.href ? "is-active" : ""}`}
              >
                <span>{l.label}</span>
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

          <div className="nav__actions">
            <div
              className="nav__resumeWrapper"
              onMouseEnter={() => setResumeMenuOpen(true)}
              onMouseLeave={() => setResumeMenuOpen(false)}
            >
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="nav__resumeLink"
                title="View or download Saumya's Résumé"
              >
                <span>Résumé</span>
                <span aria-hidden="true" style={{ fontSize: "14px" }}>↓</span>
              </a>

              <AnimatePresence>
                {resumeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="nav__resumeDropdown"
                  >
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="nav__resumeDropdownItem"
                      onClick={() => setResumeMenuOpen(false)}
                    >
                      <span>View in Browser</span>
                      <span>↗</span>
                    </a>
                    <a
                      href={resumeUrl}
                      download="Saumya_Mirajkar_Resume.pdf"
                      className="nav__resumeDropdownItem"
                      onClick={() => setResumeMenuOpen(false)}
                    >
                      <span>Download PDF</span>
                      <span>↓</span>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

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
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`nav-overlay__link ${active === l.href ? "is-active" : ""}`}
                >
                  <span className="nav-overlay__num">0{i + 1}</span>
                  <span>{l.label}</span>
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="nav-overlay__foot"
              >
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn--primary"
                    style={{ width: "fit-content", padding: "10px 18px", borderRadius: "8px" }}
                  >
                    VIEW RÉSUMÉ ↗
                  </a>
                  <a
                    href={resumeUrl}
                    download="Saumya_Mirajkar_Resume.pdf"
                    className="btn btn--secondary"
                    style={{ width: "fit-content", padding: "10px 18px", borderRadius: "8px" }}
                  >
                    DOWNLOAD RÉSUMÉ ↓
                  </a>
                </div>
                <span className="text-mono nav-overlay__tag">PUNE, INDIA</span>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}