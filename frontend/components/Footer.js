"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const [clickCount, setClickCount] = useState(0);

  if (pathname?.startsWith("/ielts") || pathname?.startsWith("/secret") || pathname?.startsWith("/vault")) {
    return null;
  }

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (!el) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { offset: -60, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Triple-click on the SM monogram to open secret place
  const handleMonogramClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        window.location.href = "/ielts";
        return 0;
      }
      return next;
    });
    setTimeout(() => setClickCount(0), 1200);
  };

  // Secret keyboard sequence listener: typing "1981" anywhere redirects to /ielts
  useEffect(() => {
    let buffer = "";
    const onKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;
      buffer += e.key;
      if (buffer.length > 10) {
        buffer = buffer.slice(-10);
      }
      if (buffer.endsWith("1981")) {
        window.location.href = "/ielts";
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        {/* Top: Brand, Navigation & Back to Top */}
        <div className="footer__main">
          {/* Left: Brand with triple-click easter egg */}
          <div className="footer__brand">
            <span
              className="nav__monogram"
              style={{ width: "32px", height: "32px", fontSize: "12px", cursor: "default" }}
              onClick={handleMonogramClick}
              title=""
            >
              SM
            </span>
            <span className="footer__name">SAUMYA MIRAJKAR</span>
          </div>

          {/* Center: Navigation Links matching Header */}
          <nav className="footer__nav" aria-label="Footer Navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(link.href);
                }}
                className="footer__link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Back to Top */}
          <div className="footer__action">
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => scrollTo("#home")}
              aria-label="Back to top of page"
            >
              Back to top ↑
            </button>
          </div>
        </div>

        {/* Bottom: Copyright, Privacy/Terms & Portfolio Signature */}
        <div className="footer__bottom">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <span>
              © {year} Saumya Mirajkar. All rights reserved
              <span
                onClick={() => {
                  window.location.href = "/ielts";
                }}
                style={{
                  cursor: "default",
                  userSelect: "none",
                  display: "inline-block",
                  padding: "0 1px",
                }}
                title=""
              >
                .
              </span>
            </span>
            <span style={{ color: "var(--line-strong)" }}>•</span>
            <a href="/privacy" className="footer__link" style={{ fontSize: "12px" }}>
              Privacy Policy
            </a>
            <span style={{ color: "var(--line-strong)" }}>•</span>
            <a href="/terms" className="footer__link" style={{ fontSize: "12px" }}>
              Terms of Service
            </a>
          </div>

          <span className="text-mono" style={{ fontSize: "11px", color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Computer Engineering &amp; IoT Portfolio · Pune, India
          </span>
        </div>
      </div>
    </footer>
  );
}