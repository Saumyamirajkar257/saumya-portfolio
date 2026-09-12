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

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();
  const { profile, skills, projects, experience, education, certifications, testimonials } = content;

  return (
    <>
      <Hero profile={profile} />

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