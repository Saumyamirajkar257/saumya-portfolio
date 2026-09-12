import { getContent } from "@/lib/content";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Skills from "@/sections/Skills";
import Projects from "@/sections/Projects";
import Experience from "@/sections/Experience";
import Education from "@/sections/Education";
import Testimonials from "@/sections/Testimonials";
import Certifications from "@/sections/Certifications";
import Contact from "@/sections/Contact";
import Marquee from "@/components/Marquee";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();
  const { profile, skills, projects, experience, education, certifications, testimonials } = content;

  const marqueeItems = (skills || []).map((s) => s.name);
  // Add a couple of real descriptor words so the strip isn't purely a list.
  const strip = ["HELLO WORLD", ...marqueeItems, "Pune, IN", "OPEN TO INTERNSHIPS"];

  return (
    <>
      <Hero profile={profile} />

      <div className="marquee-strip" aria-hidden="true" style={{ marginTop: "-18px" }}>
        <Marquee items={strip} speed={36} />
      </div>

      <About profile={profile} />
      <Skills skills={skills} />
      <Projects projects={projects} />
      <Experience experience={experience} />
      <Education education={education} />
      <Testimonials testimonials={testimonials} />
      <Certifications certifications={certifications} />
      <Contact profile={profile} />
    </>
  );
}