"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Magnetic from "@/components/animations/Magnetic";
import TiltCard from "@/components/animations/TiltCard";
import ScrambleText from "@/components/animations/ScrambleText";
import Particles from "@/components/Particles";
import { usePrefersReducedMotion } from "@/lib/hooks";
import styles from "./Hero.module.css";

const TERMINAL_LINES = [
  { prompt: "$", cmd: "whoami", out: "saumya.mirajkar: computer engineering & iot student" },
  { prompt: "$", cmd: "cat languages.txt", out: "C, C++, Python, JavaScript" },
  { prompt: "$", cmd: "cat stack.json", out: "{ web, embedded, automation }" },
  { prompt: "$", cmd: "./apply --type internship", out: "status: OPEN TO OPPORTUNITIES" },
];

function Terminal({ reduce }) {
  const [done, setDone] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (reduce) {
      setDone(TERMINAL_LINES.length);
      setTyped("");
      return;
    }
    let idx = 0;
    let charIdx = 0;

    const tick = window.setInterval(() => {
      const current = TERMINAL_LINES[idx];
      if (charIdx < current.out.length) {
        charIdx++;
        setTyped(current.out.slice(0, charIdx));
        return;
      }
      charIdx = 0;
      idx += 1;
      setTyped("");
      setDone(idx);
      if (idx >= TERMINAL_LINES.length) {
        window.clearInterval(tick);
      }
    }, 38);

    return () => window.clearInterval(tick);
  }, [reduce]);

  const allDone = done >= TERMINAL_LINES.length;
  const typingLine = done < TERMINAL_LINES.length ? TERMINAL_LINES[done] : null;

  return (
    <div className={styles.terminal} role="img" aria-label="A terminal showing who Saumya is">
      <div className={styles.terminal__bar}>
        <span className={styles.terminal__dot} style={{ background: "#ff5e62" }} />
        <span className={styles.terminal__dot} style={{ background: "#ffb054" }} />
        <span className={styles.terminal__dot} style={{ background: "#6ee7d8" }} />
        <span className={styles.terminal__title}>saumya@portfolio: ~</span>
      </div>
      <div className={styles.terminal__body}>
        {TERMINAL_LINES.slice(0, done).map((l, i) => (
          <div key={i} className={styles.terminal__line}>
            <span className={styles.terminal__prompt}>
              <span className={styles.terminal__promptSym}>{l.prompt}</span> {l.cmd}
            </span>
            <div className={styles.terminal__out}>{l.out}</div>
          </div>
        ))}
        {typingLine && (
          <div className={styles.terminal__line}>
            <span className={styles.terminal__prompt}>
              <span className={styles.terminal__promptSym}>{typingLine.prompt}</span> {typingLine.cmd}
            </span>
            <div className={styles.terminal__out}>
              {typed}
              <span className={styles.terminal__cursor}>▊</span>
            </div>
          </div>
        )}
        {allDone && (
          <div className={styles.terminal__last}>
            <span className={styles.terminal__promptSym}>$</span>{" "}
            <span className={styles.terminal__cursorBlink}>▊</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Hero({ profile }) {
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef(null);

  // Parallax: gentle translate of the right visual + heading on mouse move.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  const onMouseMove = (e) => {
    if (reduce || !sectionRef.current) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    mx.set(x);
    my.set(y);
  };

  const resumeHref = profile?.resume_url || "/resume/Saumya_Mirajkar_Resume.docx";
  const tagline =
    profile?.tagline || "I build sensor-driven hardware and the software that runs it.";
  const socials = profile?.socials || {};

  return (
    <section id="home" className={styles.hero} ref={sectionRef} onMouseMove={onMouseMove}>
      <Particles className={styles.hero__particles} />

      <div className={`wrap ${styles.hero__grid}`}>
        {/* --------- Left: the headline --------- */}
        <div className={styles.hero__left}>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={styles.hero__eyebrow}
          >
            <span className={styles.hero__eyebrowDot} aria-hidden="true" />
            <span className="text-mono">open to software & IoT internships</span>
          </motion.p>

          <h1 className={styles.hero__name}>
            <span className={styles.hero__nameRow}>
              <ScrambleText text="Saumya" as="span" delay={0.4} duration={1.8} className={styles.hero__namePlain} />
            </span>
            <span className={styles.hero__nameRow}>
              <ScrambleText text="Mirajkar" as="span" delay={0.7} duration={1.8} className={styles.hero__nameGrad} />
            </span>
            <span className="sr-only">{profile?.name || "Saumya Mirajkar"}</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={styles.hero__tagline}
          >
            {tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className={styles.hero__cta}
          >
            <Magnetic>
              <a href="#projects" className="btn btn--primary btn--lg"
                 onClick={(e) => { e.preventDefault(); document.querySelector("#projects")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }}
                 aria-label="View my projects">
                See my work
              </a>
            </Magnetic>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className={styles.hero__meta}
          >
            <span className="text-mono">based in {profile?.location || "Pune, Maharashtra"}</span>
            <span className={styles.hero__metaDot} aria-hidden="true">·</span>
            <a href={resumeHref} download className={`${styles.hero__resume} text-mono`}>
              download résumé ↓
            </a>
            <span className={styles.hero__metaDot} aria-hidden="true">·</span>
            <span className="text-mono">
              open to internships <span className={styles.hero__pulse}>●</span>
            </span>
          </motion.div>
        </div>

        {/* --------- Right: interactive terminal visual --------- */}
        <motion.div
          style={{ x: sx, y: sy }}
          className={styles.hero__right}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* faint constellation rings echoing the skills orbit */}
          <div className={styles.hero__constel} aria-hidden="true">
            <span className={styles.constel__ring} />
            <span className={styles.constel__ring} />
            <span className={styles.constel__ring} />
            <span className={styles.constel__core} />
          </div>

          <TiltCard max={5} className={styles.hero__tilt}>
            <Terminal reduce={reduce} />
          </TiltCard>

          {/* floating chips — aligned in a consistent column along the terminal's right edge */}
          <motion.div
            className={`${styles.chipFloat} ${styles.chipFloatA}`}
            animate={reduce ? {} : { y: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className={styles.chipFloat__lang}>Python</span>
            <span className={styles.chipFloat__dot} />
          </motion.div>
          <motion.div
            className={`${styles.chipFloat} ${styles.chipFloatAlt} ${styles.chipFloatB}`}
            animate={reduce ? {} : { y: [0, 12, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className={styles.chipFloat__lang}>Arduino</span>
            <span className={styles.chipFloat__ico}>═╪═</span>
          </motion.div>
          <motion.div
            className={`${styles.chipFloat} ${styles.chipFloatSec} ${styles.chipFloatC}`}
            animate={reduce ? {} : { y: [0, -8, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className={styles.chipFloat__lang}>IoT</span>
            <span className={styles.chipFloat__dot} />
          </motion.div>
        </motion.div>
      </div>

      {/* bottom meta strip */}
      <div className={`wrap ${styles.hero__foot}`}>
        <span className="text-mono">scroll to explore ↓</span>
        <span className="text-mono">{socials.github ? "github.com/saumyamirajkar" : ""}</span>
      </div>
    </section>
  );
}