"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { label: "Skills", href: "#skills" },
  { href: "#certifications", label: "Certifications" },
  { href: "#contact", label: "Contact" },
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
    if (el) el.scrollIntoView({ behavior: "smooth" });
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
      // Ignore if user is currently typing in an input or textarea
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
        <div className="footer__main">
          {/* Left: Brand with triple-click secret trigger */}
          <div className="footer__brand">
            <span
              className="nav__monogram"
              style={{ width: "32px", height: "32px", fontSize: "12px", cursor: "default" }}
              onClick={handleMonogramClick}
              title=""
            >
              SM
            </span>
            <span className="footer__name">Saumya Mirajkar</span>
          </div>

          {/* Center: Navigation Links */}
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

        <div className="footer__bottom">
          <span>
            © {year} Saumya Mirajkar. All rights reserved
            {/* Hidden secret period trigger that only you know */}
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
          <span className="text-mono" style={{ fontSize: "11.5px", color: "var(--text-faint)" }}>
            Next.js • FastAPI • IoT &amp; Software Engineering
          </span>
        </div>
      </div>
    </footer>
  );
}