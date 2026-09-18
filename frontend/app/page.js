import { getContent } from "@/lib/content";
import Hero from "@/sections/Hero";
import StatsBar from "@/components/StatsBar";
import Projects from "@/sections/Projects";
import Skills from "@/sections/Skills";
import About from "@/sections/About";
import Experience from "@/sections/Experience";
import Education from "@/sections/Education";
import Certifications from "@/sections/Certifications";
import Contact from "@/sections/Contact";

export default async function Home() {
  const content = await getContent();
  const { profile, skills, projects, experience, education, certifications } = content;

  return (
    <>
      <Hero profile={profile} />
      <About profile={profile} />
      <Projects projects={projects} />
      <Experience experience={experience} />
      <Skills skills={skills} />
      <Education education={education} />
      <Certifications certifications={certifications} />
      <Contact profile={profile} />
    </>
  );
}