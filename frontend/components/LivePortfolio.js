"use client";

import { useState, useEffect } from "react";
import { getContent, subscribeContent } from "@/lib/content";
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
    // 1. Initial fresh fetch on client mount
    getContent(true)
      .then((liveData) => {
        if (liveData) {
          setContent(liveData);
        }
      })
      .catch(console.error);

    // 2. Attach real-time Firestore listener for instant live CMS updates
    const unsubscribe = subscribeContent((liveData) => {
      if (liveData) {
        setContent(liveData);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
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
      <About
        profile={profile}
        certifications={certifications}
        skills={skills}
        education={education}
      />
      <Projects projects={projects} />
      <Experience experience={experience} />
      <Skills skills={skills} />
      <Education education={education} />
      <Certifications certifications={certifications} />
      <Contact profile={profile} />
    </>
  );
}
