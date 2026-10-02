"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./About.module.css";

const DEFAULT_CREDENTIAL_ROWS = [
  {
    index: "01",
    main: "Diploma in Computer Engineering & IoT",
    sub: "Cusrow Wadia Institute of Technology, Pune",
  },
  {
    index: "02",
    main: "Web Development Internship",
    sub: "Big Bang Tech Solutions (Full Lifecycle & Web)",
  },
  {
    index: "03",
    main: "Core Competencies",
    sub: "Hardware Sensors · Python · JavaScript · Next.js · IoT",
  },
  {
    index: "04",
    main: "Pune, Maharashtra, India",
    sub: "Current Academic & Development Base",
  },
];

export default function About({
  profile = {},
  certifications = [],
  skills = [],
  education = [],
}) {
  const reduce = useReducedMotion();

  // Dynamic calculations directly from database collections
  const certCount =
    certifications && certifications.length > 0
      ? String(certifications.length)
      : profile?.highlights?.find((h) =>
          h.label?.toLowerCase().includes("certification")
        )?.value || "21";

  const languageSkillsCount = skills.filter((s) => {
    const cat = (s.category || "").toLowerCase();
    return cat.includes("lang") || cat.includes("prog");
  }).length;

  const languagesCount =
    languageSkillsCount > 0
      ? String(languageSkillsCount)
      : profile?.highlights?.find((h) =>
          h.label?.toLowerCase().includes("language")
        )?.value || "4";

  const semestersCount =
    profile?.semesters_completed ||
    profile?.highlights?.find((h) =>
      h.label?.toLowerCase().includes("semester")
    )?.value ||
    "4";

  const stats = [
    { val: languagesCount, label: "CORE LANGUAGES" },
    { val: certCount, label: "CERTIFICATIONS" },
    { val: semestersCount, label: "SEMESTERS COMPLETED" },
  ];

  // Dynamic Background & Focus Rows
  const primaryEdu = education?.[0];
  const credentialRows = profile?.aboutRows || [
    {
      index: "01",
      main:
        primaryEdu?.degree ||
        profile?.academic_status ||
        DEFAULT_CREDENTIAL_ROWS[0].main,
      sub: primaryEdu?.institution || DEFAULT_CREDENTIAL_ROWS[0].sub,
    },
    {
      index: "02",
      main: "Web Development Internship",
      sub: "Big Bang Tech Solutions (Full Lifecycle & Web)",
    },
    {
      index: "03",
      main: "Core Competencies",
      sub:
        profile?.core_competencies ||
        DEFAULT_CREDENTIAL_ROWS[2].sub,
    },
    {
      index: "04",
      main: profile?.location || DEFAULT_CREDENTIAL_ROWS[3].main,
      sub: "Current Academic & Development Base",
    },
  ];

  const bioParagraphs = profile?.bio
    ? profile.bio.split("\n\n").filter(Boolean)
    : [
        "Computer Engineering and IoT diploma student with hands-on experience in web development, Python, C/C++, JavaScript, Arduino, and embedded systems.",
        "Completed a web development internship involving web/mobile application development, project planning, technical research, and team collaboration. Passionate about bridging hardware sensors with resilient software systems.",
      ];

  return (
    <section id="about" className={styles.section}>
      <div className="wrap">
        <div className={styles.aboutGrid}>
          {/* Left Column: Background & Focus Information Panel */}
          <motion.div
            className={styles.aboutLeft}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -6% 0px" }}
            transition={{ duration: reduce ? 0.01 : TIMING.section, ease: EASE.premium }}
          >
            <div className={styles.credentialsPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelEyebrow}>BACKGROUND &amp; FOCUS</span>
                <span className={styles.panelTag}>ACADEMIC &amp; INDUSTRY</span>
              </div>

              <div className={styles.rowsList}>
                {credentialRows.map((row, idx) => (
                  <div key={row.index || idx} className={styles.credRow}>
                    <span className={styles.credIndex}>{row.index || `0${idx + 1}`}</span>
                    <div className={styles.credText}>
                      <span className={styles.credMain}>{row.main}</span>
                      <span className={styles.credSub}>{row.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Profile & Statistics */}
          <div className={styles.aboutRight}>
            <div className={styles.header}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />
                <span>GET TO KNOW ME</span>
              </div>
              <h2 className={styles.heading}>ABOUT</h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.01 : TIMING.component, delay: 0.08, ease: EASE.premium }}
              className={styles.aboutDesc}
            >
              {bioParagraphs.map((para, i) => (
                <p key={i} style={{ marginBottom: i < bioParagraphs.length - 1 ? "1.25em" : 0 }}>
                  {para}
                </p>
              ))}
            </motion.div>

            {/* Factual Editorial Statistics */}
            <div className={styles.statsGrid}>
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: reduce ? 0.01 : TIMING.component,
                    delay: 0.12 + i * 0.06,
                    ease: EASE.premium,
                  }}
                  className={styles.statBox}
                >
                  <span className={styles.statVal}>{stat.val}</span>
                  <span className={styles.statLbl}>{stat.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Minimal Editorial CTA */}
            <div className={styles.ctaWrapper}>
              <a
                href="#projects"
                className={styles.exploreBtn}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector("#projects");
                  if (!el) return;
                  if (window.__lenis) {
                    window.__lenis.scrollTo(el, { offset: -60, duration: 1.2 });
                  } else {
                    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
                  }
                }}
              >
                <span>EXPLORE MY WORK</span>
                <span className={styles.exploreArrow}>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
