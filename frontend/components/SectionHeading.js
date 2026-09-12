import Reveal from "@/components/animations/Reveal";

/**
 * SectionHeading — the consistent eyebrow + big title block used across
 * every section. Optional lead paragraph slots beneath the title.
 */
export default function SectionHeading({ eyebrow, title, lead = null, align = "left" }) {
  return (
    <div className={`section-heading ${align === "center" ? "section-heading--center" : ""}`}>
      <Reveal delay={0.05}>
        <span className="eyebrow">{eyebrow}</span>
      </Reveal>

      <Reveal delay={0.12}>
        <h2 className="display-2 section-heading__title">{title}</h2>
      </Reveal>

      {lead ? <Reveal delay={0.2}><div className="section-heading__lead">{lead}</div></Reveal> : null}

      <Reveal delay={0.26}>
        <div className="divider section-heading__rule" />
      </Reveal>
    </div>
  );
}