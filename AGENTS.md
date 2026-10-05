# Workspace Rules & Instructions

## Automatic Deployment & Sync
- **GitHub & Cloudflare Pages Sync**: Whenever modifications or updates are made to the project (e.g. `gen_resume_pdf.py`, resume PDF, portfolio code, fallback content, styling, etc.):
  1. Ensure the production build succeeds (`npm run build` in `frontend`).
  2. Commit the changes to git.
  3. Push to GitHub (`git push origin main`), which triggers automatic build and deployment on Cloudflare Pages (`https://saumya-mirajkar-portfolio.pages.dev`).

## Resume Source of Truth
- Whenever a user asks for Saumya's resume, always provide the details from the official single-page resume:
  - **Name**: Saumya Mirajkar
  - **Contact**: Pune, Maharashtra • +91 98928 14242 • saumyamir25@gmail.com
  - **Links**: Portfolio: saumya-mirajkar-portfolio.pages.dev • GitHub: github.com/saumyamirajkar
  - **Education**:
    - Diploma in Computer Engineering & IoT — Cusrow Wadia Institute of Technology, Pune (2023 – Present) | Sem 1: 70.82% | Sem 2: 71.65% | Sem 3: 65.89% | Sem 4: 64.98%
    - SSC — S S Ajmera High School (2023) | 79.80%
  - **Technical Skills**:
    - Programming: C, C++, Python, JavaScript
    - Web: HTML, CSS, React
  - **Experience**:
    - Web Development Intern — Big Bang Tech Solutions Pvt. Ltd., Pune (May 2026 – Sep 2026)
  - **Projects**:
    - AutoInvoice — Invoice & Client Management Web App (React, Vite, JavaScript, jsPDF)
    - LifeTrackr — Personal Productivity Web App (HTML, CSS, JavaScript, Firebase)
    - Automatic Car Wiper System (Arduino, C/C++, Sensors)
  - **Certifications**:
    - IBM AI Developer Professional Certificate — IBM / Coursera (Oct 2026)
    - Google AI Professional Certificate — Google (Jul 2026)
    - Introduction to Cloud Computing — IBM (Aug 2026)
    - Python Essentials 1 — Cisco Networking Academy (Jul 2026)
  - **Downloadable PDF Generator**: `gen_resume_pdf.py` renders this exact layout to `frontend/public/resume/Saumya_Mirajkar_Resume.pdf`.
