"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import styles from "./Projects.module.css";

const FILTERS = ["All", "Hardware + IoT", "Python", "Web Development"];

function ProjectCard({ project, index, onOpen }) {
  const initial = (project.title || "P").trim()[0].toUpperCase();
  const isFeatured = project.featured;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.24), ease: [0.22, 1, 0.36, 1] }}
      className={styles.project}
      onClick={() => onOpen(project)}
      data-cursor
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(project);
        }
      }}
      aria-label={`Open ${project.title} details`}
    >
      {/* 16:9 Cover Image / Visual */}
      <div className={styles.project__cover}>
        {project.image ? (
          <Image
            src={project.image}
            alt={`Screenshot of ${project.title}`}
            fill
            unoptimized
            sizes="(min-width: 1100px) 33vw, (min-width: 760px) 50vw, 100vw"
            className={styles.project__shot}
          />
        ) : (
          <div className={styles.project__fallback}>
            <span className={styles.project__initial}>{initial}</span>
            <div className={styles.project__ambientRing} />
          </div>
        )}
        <div className={styles.project__tagline}>
          <span className={styles.project__tagDot} />
          <span>{project.category || "PROJECT"}</span>
        </div>
      </div>

      {/* Body */}
      <div className={styles.project__body}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <span className={styles.project__cat}>{project.category}</span>
          {isFeatured && (
            <span style={{ fontSize: "10px", color: "#38BDF8", fontFamily: "var(--font-mono)", fontWeight: "600" }}>
              ★ FEATURED
            </span>
          )}
        </div>

        <h3 className={styles.project__title}>{project.title}</h3>
        <p className={styles.project__desc}>{project.short_description}</p>

        {/* Tech Tags */}
        <div className={styles.project__chips}>
          {(project.technologies || []).slice(0, 4).map((t) => (
            <span key={t} className={styles.project__chip}>
              {t}
            </span>
          ))}
        </div>

        {/* Bottom Action */}
        <div className={styles.project__foot}>
          <span className={styles.project__linkText}>
            Explore Case Study <span className={styles.project__arrow}>→</span>
          </span>
          {project.github_url && (
            <span 
              className={styles.project__ghIcon} 
              title="GitHub available"
              onClick={(e) => {
                e.stopPropagation();
                window.open(project.github_url, "_blank", "noopener,noreferrer");
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects({ projects = [] }) {
  const [filter, setFilter] = useState("All");
  const [activeProject, setActiveProject] = useState(null);

  // Normalize categories for matching filter
  const filtered = filter === "All"
    ? projects
    : projects.filter((p) => {
        if (filter === "Hardware + IoT") return p.category === "Hardware + IoT" || p.category === "IoT & Embedded";
        return p.category === filter;
      });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

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
    <section id="projects" className="block">
      <div className="wrap">
        <div className={styles.sectionHeaderRow}>
          <SectionHeading
            eyebrow="REAL WORLD BUILDS"
            title={<>Featured <span className="gradient-text">Projects</span></>}
            lead={
              <p className="prose">
                A mix of hardware and software projects that solve real problems.
              </p>
            }
          />
          <div className={styles.headerAction}>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => setFilter("All")}
            >
              View All Projects →
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <Reveal delay={0.08}>
          <div className={styles.projects__filters} role="tablist" aria-label="Filter projects">
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={`${styles.projects__filter} ${filter === f ? styles.isActive : ""}`}
                onClick={() => setFilter(f)}
                style={{ position: "relative" }}
              >
                {filter === f && (
                  <motion.span
                    layoutId="projectTabActiveBg"
                    className={styles.projects__activeBg}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>{f}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* 3-column Grid */}
        <motion.div layout className={styles.projects__grid}>
          {sorted.map((p, i) => (
            <ProjectCard key={p.id ?? `${p.title}`} project={p} index={i} onOpen={setActiveProject} />
          ))}
        </motion.div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeProject.title} details`}
          >
            <motion.div
              className={styles.modal__panel}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.modal__close} onClick={closeModal} aria-label="Close dialog">
                ✕
              </button>

              <div className={styles.modal__cover}>
                {activeProject.image ? (
                  <Image
                    src={activeProject.image}
                    alt={`Screenshot of ${activeProject.title}`}
                    fill
                    unoptimized
                    sizes="(min-width: 720px) 720px, 100vw"
                    className={styles.modal__shot}
                  />
                ) : (
                  <div className={styles.modal__fallback}>
                    <span className={styles.modal__initial}>{(activeProject.title || "P")[0]}</span>
                  </div>
                )}
                <span className={styles.modal__tag}>{activeProject.category}</span>
              </div>

              <div className={styles.modal__content}>
                <span className={styles.modal__cat}>{activeProject.category}</span>
                <h3 className={styles.modal__title}>{activeProject.title}</h3>
                <p className={styles.modal__desc}>{activeProject.description}</p>

                {(activeProject.problem || activeProject.approach || activeProject.result) && (
                  <div className={styles.modal__section}>
                    <h4 className={styles.modal__h4}>Problem → Approach → Result</h4>
                    <ul className={styles.modal__nar}>
                      {activeProject.problem && (
                        <li><b>Problem:</b> <span>{activeProject.problem}</span></li>
                      )}
                      {activeProject.approach && (
                        <li><b>Approach:</b> <span>{activeProject.approach}</span></li>
                      )}
                      {activeProject.result && (
                        <li><b>Result:</b> <span>{activeProject.result}</span></li>
                      )}
                    </ul>
                  </div>
                )}

                {activeProject.features?.length > 0 && (
                  <div className={styles.modal__section}>
                    <h4 className={styles.modal__h4}>Key Features</h4>
                    <ul className={styles.modal__list}>
                      {activeProject.features.map((f) => (
                        <li key={f} className={styles.modal__listItem}>
                          <span className={styles.modal__check}>✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeProject.contribution && (
                  <div className={styles.modal__section}>
                    <h4 className={styles.modal__h4}>My Contribution</h4>
                    <p className={styles.modal__text}>{activeProject.contribution}</p>
                  </div>
                )}

                <div className={styles.modal__section}>
                  <h4 className={styles.modal__h4}>Technologies Used</h4>
                  <div className={styles.modal__chips}>
                    {(activeProject.technologies || []).map((t) => (
                      <span key={t} className={styles.project__chip}>{t}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.modal__links}>
                  {activeProject.github_url && (
                    <a href={activeProject.github_url} target="_blank" rel="noreferrer noopener" className="btn btn--secondary btn--sm">
                      View on GitHub ↗
                    </a>
                  )}
                  {activeProject.live_url && (
                    <a href={activeProject.live_url} target="_blank" rel="noreferrer noopener" className="btn btn--primary btn--sm">
                      Visit Live Site →
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