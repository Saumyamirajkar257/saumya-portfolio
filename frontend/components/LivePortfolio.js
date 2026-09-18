"use client";

import { useState, useEffect } from "react";
import { getContent } from "@/lib/content";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Projects from "@/sections/Projects";
import Experience from "@/sections/Experience";
import Skills from "@/sections/Skills";
import Education from "@/sections/Education";
import Certifications from "@/sections/Certifications";
import Contact from "@/sections/Contact";

export default function LivePortfolio({ initialContent }) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    // Fetch latest live content from Firestore on client mount
    getContent().then((liveData) => {
      if (liveData && liveData._source === "firebase") {
        setContent(liveData);
      }
    }).catch(console.error);
  }, []);

  const profile = content?.profile || {};
  const skills = content?.skills || [];
  const projects = content?.projects || [];
  const experience = content?.experience || [];
  const education = content?.education || [];
  const certifications = content?.certifications || [];

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
