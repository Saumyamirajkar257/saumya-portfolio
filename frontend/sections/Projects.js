"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/animations/Reveal";
import ProjectPreview from "@/components/animations/ProjectPreview";
import styles from "./Projects.module.css";

const FILTERS = ["All", "IoT & Embedded", "Software"];

/** Deterministic cover art from the project id/title (no fake images). */
function coverStyle(id = 1) {
  const palettes = [
    ["#00c98b", "#00b87f", "rgba(0,201,139,0.15)"],
    ["#4fdcb4", "#16c9a0", "rgba(79,220,180,0.14)"],
    ["#00e5a0", "#00b87f", "rgba(0,229,160,0.15)"],
    ["#16c9a0", "#5e5bd0", "rgba(22,201,160,0.15)"],
  ];
  const [a, b, glow] = palettes[id % palettes.length];
  return { "--ca": a, "--cb": b, "--glow": glow };
}

function ProjectCard({ project, index, onOpen, reduce }) {
  const style = coverStyle(project.id ?? index);
  const initial = (project.title || "P").trim()[0].toUpperCase();

  return (
    <motion.article
      layout
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, delay: reduce ? 0 : Math.min((index % 3) * 0.08, 0.24), ease: [0.22, 1, 0.36, 1] }}
      className={`${styles.project} ${project.featured ? styles.projectFeatured : ""} ${project.category === "IoT & Embedded" ? styles.projectIoT : styles.projectSoft}`}
      onClick={() => onOpen(project)}
      data-cursor
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(project); } }}
      aria-label={`Open ${project.title} details`}
    >
      {/* cover */}
      <div className={`${styles.project__cover} ${project.image ? styles.project__coverShot : ""}`} style={style}>
        {/* real screenshot / demo still when available, decorative cover otherwise */}
        {project.image ? (
          <Image
            src={project.image}
            alt={`Screenshot of ${project.title}`}
            fill
            sizes="(min-width: 1100px) 50vw, (min-width: 760px) 50vw, 100vw"
            priority={project.featured}
            loading={project.featured ? "eager" : "lazy"}
            className={styles.project__shot}
          />
        ) : (
          <>
            <span className={styles.project__initial}>{initial}</span>
            <span className={styles.project__orbit} aria-hidden="true" />
            <span className={styles.project__glow} aria-hidden="true" />
          </>
        )}
        <span className={styles.project__tagline}>{project.featured ? "★ FEATURED" : "CASE STUDY"}</span>
        <div className={styles.project__coverChips}>
          {(project.technologies || []).slice(0, 4).map((t) => (
            <span key={t} className={styles.project__coverChip}>{t}</span>
          ))}
        </div>
        <span className={styles.project__openHint}>View details</span>
      </div>

      {/* body */}
      <div className={styles.project__body}>
        <div className={styles.project__catRow}>
          <span className="text-mono project__cat">{project.category}</span>
        </div>
        <h3 className={styles.project__title}>{project.title}</h3>
        <p className={styles.project__desc}>{project.short_description}</p>
      </div>
    </motion.article>
  );
}

export default function Projects({ projects = [] }) {
  const [filter, setFilter] = useState("All");
  const [activeProject, setActiveProject] = useState(null);
  const reduce = useReducedMotion();

  const filtered = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  // Sort: featured first
  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const closeModal = useCallback(() => setActiveProject(null), []);

  useEffect(() => {
    if (!activeProject) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [activeProject, closeModal]);

  return (
    <section id="projects" className="block">
      <div className="wrap">
        <SectionHeading
          eyebrow="selected work"
          title={<>Projects &amp; <span className="gradient-text">builds</span></>}
          lead={
            <p className="prose">
              Real projects from my resume — embedded systems and software.
              Click any card to read the full case study, my contribution, and the tech involved.
            </p>
          }
        />

        <Reveal delay={0.1}>
          <div className={styles.projects__filters} role="tablist" aria-label="Filter projects">
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={`chip ${styles.projects__filter} ${filter === f ? styles.isActive : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <p className={styles.projects__count}>
            <span className="text-mono">
              {sorted.length} project{sorted.length !== 1 ? "s" : ""}
              {filter !== "All" ? ` in ${filter}` : ""}
            </span>
          </p>
        </Reveal>

        <motion.div layout className={styles.projects__grid}>
          {sorted.map((p, i) => (
            <ProjectCard key={p.id ?? `${p.title}`} project={p} index={i} onOpen={setActiveProject} reduce={reduce} />
          ))}
        </motion.div>
      </div>

      {/* -------- Modal -------- */}
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
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.modal__close} onClick={closeModal} aria-label="Close dialog">
                ✕
              </button>

              <div className={styles.modal__cover} style={coverStyle(activeProject.id ?? 0)}>
                {activeProject.image ? (
                  <Image
                    src={activeProject.image}
                    alt={`Screenshot of ${activeProject.title}`}
                    fill
                    sizes="(min-width: 720px) 720px, 100vw"
                    loading="lazy"
                    className={styles.modal__shot}
                  />
                ) : (
                  <span className={styles.modal__initial}>{(activeProject.title || "P")[0]}</span>
                )}
                <span className={styles.modal__tag}>{activeProject.featured ? "★ FEATURED BUILD" : "CASE STUDY"}</span>
              </div>

              <div className={styles.modal__content}>
                <span className="text-mono modal__cat">{activeProject.category}</span>
                <h3 className={`display-3 ${styles.modal__title}`}>{activeProject.title}</h3>
                <p className={styles.modal__desc}>{activeProject.description}</p>

                {(activeProject.problem || activeProject.approach || activeProject.result) && (
                  <div className={styles.modal__section}>
                    <h4 className={styles.modal__h4}>Problem → Approach → Result</h4>
                    <ul className={styles.modal__nar}>
                      {activeProject.problem ? (
                        <li><b>Problem</b><span>{activeProject.problem}</span></li>
                      ) : null}
                      {activeProject.approach ? (
                        <li><b>Approach</b><span>{activeProject.approach}</span></li>
                      ) : null}
                      {activeProject.result ? (
                        <li><b>Result</b><span>{activeProject.result}</span></li>
                      ) : null}
                    </ul>
                  </div>
                )}

                <div className={styles.modal__section}>
                  <h4 className={styles.modal__h4}>Features</h4>
                  <ul className={styles.modal__list}>
                    {(activeProject.features || []).map((f) => (
                      <li key={f} className={styles.modal__listItem}>
                        <span className={styles.modal__check} aria-hidden="true">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.modal__section}>
                  <h4 className={styles.modal__h4}>My contribution</h4>
                  <p className={styles.modal__text}>{activeProject.contribution}</p>
                </div>

                <div className={styles.modal__section}>
                  <h4 className={styles.modal__h4}>Technologies</h4>
                  <div className={styles.modal__chips}>
                    {(activeProject.technologies || []).map((t) => (
                      <span key={t} className="chip">{t}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.modal__links}>
                  {activeProject.github_url ? (
                    <a href={activeProject.github_url} target="_blank" rel="noreferrer noopener" className="btn btn--ghost btn--sm">
                      View on GitHub
                    </a>
                  ) : null}
                  {activeProject.live_url ? (
                    <a href={activeProject.live_url} target="_blank" rel="noreferrer noopener" className="btn btn--primary btn--sm">
                      Visit live demo
                    </a>
                  ) : null}
                  {!activeProject.github_url && !activeProject.live_url ? (
                    <span className="text-mono modal__src">Source available on request.</span>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating project preview on hover */}
      <ProjectPreview projects={projects} />

    </section>
  );
}