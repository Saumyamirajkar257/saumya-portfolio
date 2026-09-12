"use client";

import Reveal, { Counter } from "@/components/animations/Reveal";
import SectionHeading from "@/components/SectionHeading";
import TiltCard from "@/components/animations/TiltCard";
import styles from "./About.module.css";

/**
 * Fail-safe stats: these numbers are from the resume and change rarely, so they
 * are hardcoded client-side. They never depend on the backend call and can
 * never render 0 if the API is slow, cold-starting, or offline.
 */
const STATS = [
  { value: 4, label: "Semesters Completed" },
  { value: 3, label: "Programming Languages" },
  { value: 10, label: "Certifications Earned" },
  { value: 2, label: "Academic Projects Built" },
];

export default function About({ profile }) {
  const name = profile?.name || "Saumya Mirajkar";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const interests = profile?.interests || [];

  return (
    <section id="about" className="block">
      <div className="wrap">
        <SectionHeading
          eyebrow="who I am"
          title={<>About <span className="gradient-text">me</span></>}
        />

        <div className={styles.about__grid}>
          {/* left — sticky identity card */}
          <Reveal className={styles.about__left}>
            <div className={styles.about__sticky}>
              <TiltCard max={6} className={styles.about__card}>
                <div className={styles.about__monogram}>{initials}</div>
                <h3 className="heading-3">{name}</h3>
                <p className={styles.about__rolename}>{profile?.role}</p>
                <div className={styles.about__facts}>
                  <div className={styles.about__fact}>
                    <span className="text-mono">📍 location</span>
                    <strong>{profile?.location}</strong>
                  </div>
                  <div className={styles.about__fact}>
                    <span className="text-mono">✉️ email</span>
                    <strong>{profile?.email}</strong>
                  </div>
                  <div className={styles.about__fact}>
                    <span className="text-mono">🎯 status</span>
                    <strong className={styles.about__open}>Open to internships</strong>
                  </div>
                </div>
              </TiltCard>
            </div>
          </Reveal>

          {/* right — narrative */}
          <div className={styles.about__body}>
            <Reveal delay={0.05}>
              <p className={`prose ${styles.about__summary}`}>{profile?.summary}</p>
            </Reveal>

            <Reveal delay={0.12}>
              <p className={`prose ${styles.about__bio}`}>{profile?.bio}</p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className={styles.about__goals}>
                <h4 className={styles.about__h4}>Career goals</h4>
                <ul className={styles.about__goalsList}>
                  {(profile?.career_goals || []).map((g) => (
                    <li key={g} className={styles.about__goal}>
                      <span className={styles.about__goalArrow} aria-hidden="true">→</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className={styles.about__interests}>
                <h4 className={styles.about__h4}>Interests</h4>
                <div className={styles.about__chips}>
                  {interests.map((i) => (
                    <span key={i} className="chip">{i}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* stats band — hardcoded client-side, never 0 on a slow backend */}
        <div className={styles.about__stats}>
          {STATS.map((h, i) => (
            <Reveal key={h.label} delay={i * 0.07} className={styles.about__statCell}>
              <div className={styles.about__statValue}>
                <Counter end={h.value} />
              </div>
              <div className={styles.about__statLabel}>{h.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}