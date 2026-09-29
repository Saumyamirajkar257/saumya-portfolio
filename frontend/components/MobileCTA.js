"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./MobileCTA.module.css";

export default function MobileCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/ielts") || pathname?.startsWith("/secret") || pathname?.startsWith("/vault")) return null;
  if (!visible) return null;

  return (
    <div className={styles.bar} role="complementary" aria-label="Quick actions">
      <a
        href="#projects"
        className="btn btn--primary btn--sm"
        style={{ flex: 1 }}
        onClick={(e) => {
          e.preventDefault();
          const el = document.querySelector("#projects");
          if (!el) return;
          if (window.__lenis) {
            window.__lenis.scrollTo(el, { offset: -60, duration: 1.2 });
          } else {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }}
      >
        View Work
      </a>
      <a
        href="#contact"
        className="btn btn--ghost btn--sm"
        style={{ flex: 1 }}
        onClick={(e) => {
          e.preventDefault();
          const el = document.querySelector("#contact");
          if (!el) return;
          if (window.__lenis) {
            window.__lenis.scrollTo(el, { offset: -60, duration: 1.2 });
          } else {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }}
      >
        Contact
      </a>
    </div>
  );
}
