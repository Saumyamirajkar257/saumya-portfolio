"use client";

import { motion } from "framer-motion";
import styles from "./Contact.module.css";

export default function Contact({ profile }) {
  const socials = profile?.socials || {};
  const email = profile?.email || "Saumyamirajkar25@icloud.com";

  return (
    <section id="contact" className="block">
      <div className="wrap">
        <motion.div 
          className={styles.minimalContact}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.minimalTitle}>Let's Build<br/><span className="gradient-text">Something.</span></h2>
          <p className={styles.minimalDesc}>
            Got a project in mind, an internship opportunity, or just want to say hi?<br/>
            I'm currently available and would love to hear from you.
          </p>
          
          <div className={styles.minimalActions}>
            <a href={`mailto:${email}`} className="btn btn--primary btn--lg">
              Say Hello <span className="btn-arrow">→</span>
            </a>
            
            <div className={styles.socialLinks}>
              <a href="https://linkedin.com/in/saumyamirajkar" target="_blank" rel="noreferrer" className={styles.socialLink}>LinkedIn</a>
              <span className={styles.socialDot}>•</span>
              <a href={socials.github || "https://github.com/saumyamirajkar"} target="_blank" rel="noreferrer" className={styles.socialLink}>GitHub</a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
