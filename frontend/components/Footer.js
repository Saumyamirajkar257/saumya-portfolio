"use client";

import { useEffect, useState } from "react";
import { getContent } from "@/lib/content";

/** Footer — fetches profile/social data from the API (with fallback). */
export default function Footer() {
  const [profile, setProfile] = useState(null);
  const [source, setSource] = useState("");

  useEffect(() => {
    let alive = true;
    getContent().then((data) => {
      if (!alive) return;
      setProfile(data.profile);
      setSource(data._source || "");
    });
    return () => { alive = false; };
  }, []);

  const year = new Date().getFullYear();
  const socials = profile?.socials || {};
  const socialList = [
    socials.github && { key: "github", label: "GitHub", href: socials.github },
    socials.linkedin && { key: "linkedin", label: "LinkedIn", href: socials.linkedin },
    socials.email && { key: "email", label: "Email", href: socials.email },
    socials.phone && { key: "phone", label: "Phone", href: socials.phone },
  ].filter(Boolean);

  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="text-mono">© {year}</span>
            <span className="footer__name">{profile?.name || "Saumya Mirajkar"}</span>
            <span className="text-mono">{profile?.location || "Pune, Maharashtra"}</span>
          </div>

          <nav className="footer__socials" aria-label="Social links">
            {socialList.length
              ? socialList.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel={s.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="footer__social"
                  >
                    {s.label}
                  </a>
                ))
              : null}
          </nav>

          <a
            href="#home"
            className="btn btn--ghost btn--sm footer__top"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Back to top ↑
          </a>
        </div>

        <div className="footer__bottom text-mono">
          <span>Built with Next.js and a FastAPI backend.</span>
          <span>Content is fetched from the live API.</span>
          {source === "fallback" ? <span className="footer__fallback">demo data mode (backend offline)</span> : null}
        </div>
      </div>
    </footer>
  );
}