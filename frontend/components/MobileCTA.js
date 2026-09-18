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
          document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
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
          document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Contact
      </a>
    </div>
  );
}
