"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { EASE, TIMING } from "@/components/animations/MotionSystem";
import styles from "./Projects.module.css";

const FILTERS = ["ALL", "HARDWARE + IoT", "FULL-STACK & WEB", "PYTHON SOFTWARE"];

const GITHUB_ICON = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const ARROW_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function filterProject(project, activeFilter) {
  if (activeFilter === "ALL") return true;
  const cat = (project.category || "").toLowerCase();
  if (activeFilter === "HARDWARE + IoT") {
    return cat.includes("hardware") || cat.includes("iot") || cat.includes("embedded");
  }
  if (activeFilter === "FULL-STACK & WEB") {
    return cat.includes("full-stack") || cat.includes("web") || cat.includes("frontend") || cat.includes("app");
  }
  if (activeFilter === "PYTHON SOFTWARE") {
    return cat.includes("python") || cat.includes("software");
  }
  return true;
}

function ProjectCard({ project, index, onOpen }) {
  const reduce = useReducedMotion();
  const techList = project.technologies || [];

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{
        duration: reduce ? 0.01 : TIMING.component,
        delay: reduce ? 0 : Math.min(index * 0.08, 0.24),
        ease: EASE.premium,
      }}
      className={styles.card}
    >
      {/* Project Image Area */}
      <div
        className={styles.cardImageWrapper}
        onClick={() => onOpen(project)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(project);
          }
        }}
        aria-label={`Open case study for ${project.title}`}
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={`Screenshot of ${project.title}`}
            fill
            unoptimized
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className={styles.cardImage}
          />
        ) : (
          <div className={styles.cardImageFallback}>
            <span>{project.title}</span>
          </div>
        )}
        <div className={styles.cardImageOverlay} />
      </div>

      {/* Card Content Block */}
      <div className={styles.cardBody}>
        {/* Category & Featured Metadata */}
        <div className={styles.cardMetaRow}>
          <span className={styles.cardCategory}>
            {project.category?.toUpperCase() || "ENGINEERING"}
          </span>
          {project.featured && (
            <span className={styles.featuredBadge}>
              <span className={styles.featuredDot}>●</span>
              <span>FEATURED</span>
            </span>
          )}
        </div>

        {/* Project Title */}
        <h3
          className={styles.cardTitle}
          onClick={() => onOpen(project)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen(project);
            }
          }}
        >
          {project.title}
        </h3>

        {/* Project Description */}
        <p className={styles.cardDesc}>
          {project.short_description || project.description}
        </p>

        {/* Card Footer: Tech Tags & Bottom Actions */}
        <div className={styles.cardFooter}>
          {techList.length > 0 && (
            <div className={styles.techTagsList}>
              {techList.slice(0, 5).map((t) => (
                <span key={t} className={styles.techTag}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Action Row: Explore Case Study & GitHub */}
          <div className={styles.cardActionRow}>
            <button
              type="button"
              className={styles.caseStudyBtn}
              onClick={() => onOpen(project)}
              aria-label={`Explore case study for ${project.title}`}
            >
              <span>EXPLORE CASE STUDY</span>
              <span className={styles.caseStudyArrow}>{ARROW_ICON}</span>
            </button>

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.githubIconBtn}
                aria-label={`View ${project.title} source code on GitHub`}
                title="View GitHub Repository"
              >
                {GITHUB_ICON}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects({ projects = [] }) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeProject, setActiveProject] = useState(null);
  const reduce = useReducedMotion();

  const filtered = projects.filter((p) => filterProject(p, activeFilter));
  const sorted = [...filtered].sort((a, b) => Number(a.order ?? 99) - Number(b.order ?? 99));

  const closeModal = useCallback(() => setActiveProject(null), []);

  useEffect(() => {
    if (!activeProject) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [activeProject, closeModal]);

  return (
    <section id="projects" className={styles.projectsSection}>
      <div className="wrap">
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              <span>REAL WORLD BUILDS</span>
            </div>
            <h2 className={styles.heading}>FEATURED PROJECTS</h2>
            <p className={styles.subheading}>
              A mix of hardware and software projects that solve real problems.
            </p>
          </div>

          <div className={styles.headerRight}>
            <a
              href="https://github.com/saumyamirajkar"
              target="_blank"
              rel="noreferrer noopener"
              className={styles.viewAllBtn}
            >
              <span>VIEW ALL PROJECTS</span>
              <span className={styles.viewAllArrow}>→</span>
            </a>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className={styles.filterBar} role="tablist" aria-label="Filter project categories">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={activeFilter === f}
              className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {activeFilter === f && (
                <motion.span
                  layoutId="activeFilterHighlight"
                  className={styles.filterActiveHighlight}
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className={styles.filterLabel}>{f}</span>
            </button>
          ))}
        </div>

        {/* Project Cards Grid Showcase */}
        <div className={styles.cardsGrid}>
          {sorted.map((project, i) => (
            <ProjectCard
              key={project.id ?? `${project.title}-${i}`}
              project={project}
              index={i}
              onOpen={setActiveProject}
            />
          ))}
        </div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeProject.title} case study`}
          >
            <motion.div
              className={styles.modal__panel}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              transition={{ duration: reduce ? 0.01 : 0.3, ease: EASE.premium }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.modal__close}
                onClick={closeModal}
                aria-label="Close modal dialog"
              >
                ✕
              </button>

              {activeProject.image && (
                <div className={styles.modal__cover}>
                  <Image
                    src={activeProject.image}
                    alt={`Preview of ${activeProject.title}`}
                    fill
                    unoptimized
                    sizes="(min-width: 760px) 760px, 100vw"
                    className={styles.modal__shot}
                  />
                  <span className={styles.modal__coverTag}>
                    {activeProject.category?.toUpperCase()}
                  </span>
                </div>
              )}

              <div className={styles.modal__content}>
                <div className={styles.modal__header}>
                  <span className={styles.modal__cat}>
                    {activeProject.category?.toUpperCase()}
                  </span>
                  <h3 className={styles.modal__title}>{activeProject.title}</h3>
                  <p className={styles.modal__desc}>
                    {activeProject.description || activeProject.short_description}
                  </p>
                </div>

                {(activeProject.problem || activeProject.approach || activeProject.result) && (
                  <div className={styles.modal__section}>
                    <h4 className={styles.modal__h4}>PROBLEM → APPROACH → RESULT</h4>
                    <div className={styles.modal__narrativeGrid}>
                      {activeProject.problem && (
                        <div className={styles.modal__narrativeBlock}>
                          <span className={styles.modal__narrativeLabel}>The Challenge</span>
                          <p className={styles.modal__narrativeText}>{activeProject.problem}</p>
                        </div>
                      )}
                      {activeProject.approach && (
                        <div className={styles.modal__narrativeBlock}>
                          <span className={styles.modal__narrativeLabel}>The Engineering Approach</span>
                          <p className={styles.modal__narrativeText}>{activeProject.approach}</p>
                        </div>
                      )}
                      {activeProject.result && (
                        <div className={styles.modal__narrativeBlock}>
                          <span className={styles.modal__narrativeLabel}>Outcome &amp; Deliverables</span>
                          <p className={styles.modal__narrativeText}>{activeProject.result}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeProject.features?.length > 0 && (
                  <div className={styles.modal__section}>
                    <h4 className={styles.modal__h4}>KEY FEATURES &amp; CAPABILITIES</h4>
                    <ul className={styles.modal__featureList}>
                      {activeProject.features.map((f) => (
                        <li key={f} className={styles.modal__featureItem}>
                          <span className={styles.modal__featureBullet}>›</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeProject.learned && (
                  <div className={styles.modal__section}>
                    <h4 className={styles.modal__h4}>ENGINEERING TAKEAWAYS</h4>
                    <p className={styles.modal__text}>{activeProject.learned}</p>
                  </div>
                )}

                {activeProject.contribution && (
                  <div className={styles.modal__section}>
                    <h4 className={styles.modal__h4}>MY ROLE &amp; SCOPE</h4>
                    <p className={styles.modal__text}>{activeProject.contribution}</p>
                  </div>
                )}

                <div className={styles.modal__section}>
                  <h4 className={styles.modal__h4}>TECH STACK</h4>
                  <div className={styles.modal__chips}>
                    {(activeProject.technologies || []).map((t) => (
                      <span key={t} className={styles.modal__chip}>{t}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.modal__links}>
                  {activeProject.github_url && (
                    <a
                      href={activeProject.github_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={styles.modal__btnSecondary}
                    >
                      <span>VIEW ON GITHUB</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {activeProject.live_url && (
                    <a
                      href={activeProject.live_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={styles.modal__btnPrimary}
                    >
                      <span>VISIT LIVE DEMO</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
