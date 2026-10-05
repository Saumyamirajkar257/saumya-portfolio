#!/usr/bin/env python3
"""Generate a clean, single-page, ATS-compliant PDF résumé matching the official resume layout."""
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable
)

PDF_PATH = Path(__file__).parent / "frontend" / "public" / "resume" / "Saumya_Mirajkar_Resume.pdf"
PDF_PATH.parent.mkdir(parents=True, exist_ok=True)

# Classic ATS clean palette (pure black / dark gray on white background)
TEXT_COLOR = HexColor("#0f172a") # Dark slate / black
MUTED_COLOR = HexColor("#334155") # Dark neutral

styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    name="ResumeName",
    fontName="Helvetica-Bold",
    fontSize=22,
    leading=26,
    alignment=1, # Center
    textColor=TEXT_COLOR,
    spaceAfter=4
))

styles.add(ParagraphStyle(
    name="ResumeContact",
    fontName="Helvetica",
    fontSize=9.5,
    leading=14,
    alignment=1, # Center
    textColor=TEXT_COLOR,
    spaceAfter=1
))

styles.add(ParagraphStyle(
    name="ResumeSection",
    fontName="Helvetica-Bold",
    fontSize=11,
    leading=14,
    textColor=TEXT_COLOR,
    spaceBefore=11,
    spaceAfter=4,
    textTransform="uppercase"
))

styles.add(ParagraphStyle(
    name="ItemTitle",
    fontName="Helvetica-Bold",
    fontSize=9.5,
    leading=13.5,
    textColor=TEXT_COLOR,
    spaceAfter=1
))

styles.add(ParagraphStyle(
    name="ItemSub",
    fontName="Helvetica",
    fontSize=9,
    leading=13,
    textColor=MUTED_COLOR,
    spaceAfter=2
))

styles.add(ParagraphStyle(
    name="ResumeBullet",
    fontName="Helvetica",
    fontSize=9,
    leading=13,
    textColor=TEXT_COLOR,
    leftIndent=14,
    bulletIndent=4,
    spaceAfter=1.5
))

styles.add(ParagraphStyle(
    name="SkillsLine",
    fontName="Helvetica",
    fontSize=9.5,
    leading=14,
    textColor=TEXT_COLOR,
    spaceAfter=2
))

def build_pdf():
    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
    )

    story = []

    # Header
    story.append(Paragraph("<b>Saumya Mirajkar</b>", styles["ResumeName"]))
    story.append(Paragraph("Pune, Maharashtra &nbsp;&bull;&nbsp; +91 98928 14242 &nbsp;&bull;&nbsp; saumyamir25@gmail.com", styles["ResumeContact"]))
    story.append(Paragraph("Portfolio: saumya-mirajkar-portfolio.pages.dev &nbsp;&bull;&nbsp; GitHub: github.com/saumyamirajkar", styles["ResumeContact"]))
    story.append(Spacer(1, 4))

    # EDUCATION
    story.append(Paragraph("EDUCATION", styles["ResumeSection"]))
    story.append(Paragraph("<b>Diploma in Computer Engineering &amp; IoT</b> &mdash; Cusrow Wadia Institute of Technology", styles["ItemTitle"]))
    story.append(Paragraph("Pune, Maharashtra &nbsp;&bull;&nbsp; 2023 &ndash; Present", styles["ItemSub"]))
    story.append(Paragraph("Sem 1: 70.82% &nbsp;|&nbsp; Sem 2: 71.65% &nbsp;|&nbsp; Sem 3: 65.89% &nbsp;|&nbsp; Sem 4: 64.98%", styles["ItemSub"]))
    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>SSC</b> &mdash; S S Ajmera High School &nbsp;&bull;&nbsp; 2023 &nbsp;&bull;&nbsp; 79.80%", styles["ItemTitle"]))

    # TECHNICAL SKILLS
    story.append(Paragraph("TECHNICAL SKILLS", styles["ResumeSection"]))
    story.append(Paragraph("<b>Programming:</b> C, C++, Python, JavaScript", styles["SkillsLine"]))
    story.append(Paragraph("<b>Web:</b> HTML, CSS, React", styles["SkillsLine"]))

    # EXPERIENCE
    story.append(Paragraph("EXPERIENCE", styles["ResumeSection"]))
    story.append(Paragraph("<b>Web Development Intern</b> &mdash; <b>Big Bang Tech Solutions Pvt. Ltd.</b>", styles["ItemTitle"]))
    story.append(Paragraph("Pune, Maharashtra &nbsp;&bull;&nbsp; May 2026 &ndash; Sep 2026", styles["ItemSub"]))
    exp_bullets = [
        "Assisted with web and mobile application development.",
        "Supported project planning, implementation and testing.",
        "Conducted technical research and helped with technical solutions.",
        "Worked with development and design teams on project tasks.",
    ]
    for b in exp_bullets:
        story.append(Paragraph(f"&bull; &nbsp; {b}", styles["ResumeBullet"]))

    # PROJECTS
    story.append(Paragraph("PROJECTS", styles["ResumeSection"]))
    
    # AutoInvoice
    story.append(Paragraph("<b>AutoInvoice</b> &mdash; Invoice &amp; Client Management Web App &mdash; React, Vite, JavaScript, jsPDF", styles["ItemTitle"]))
    story.append(Paragraph("&bull; &nbsp; Built a web app for managing clients, invoices and payment information.", styles["ResumeBullet"]))
    story.append(Paragraph("&bull; &nbsp; Added invoice PDF generation, email invoice workflow and UPI payment functionality.", styles["ResumeBullet"]))
    story.append(Spacer(1, 2))

    # LifeTrackr
    story.append(Paragraph("<b>LifeTrackr</b> &mdash; Personal Productivity Web App &mdash; HTML, CSS, JavaScript, Firebase", styles["ItemTitle"]))
    story.append(Paragraph("&bull; &nbsp; Developed a personal dashboard for tracking tasks, habits, finance, journal entries and productivity.", styles["ResumeBullet"]))
    story.append(Paragraph("&bull; &nbsp; Implemented authentication, cloud data storage and a responsive interface.", styles["ResumeBullet"]))
    story.append(Spacer(1, 2))

    # Automatic Car Wiper System
    story.append(Paragraph("<b>Automatic Car Wiper System</b> &mdash; Arduino, C/C++, Sensors", styles["ItemTitle"]))
    story.append(Paragraph("&bull; &nbsp; Built an automatic wiper system using moisture and rain sensors.", styles["ResumeBullet"]))
    story.append(Paragraph("&bull; &nbsp; Used Arduino to control the wiper according to detected rain.", styles["ResumeBullet"]))

    # CERTIFICATIONS
    story.append(Paragraph("CERTIFICATIONS", styles["ResumeSection"]))
    certs = [
        "<b>IBM AI Developer Professional Certificate</b> &mdash; IBM / Coursera (Oct 2026)",
        "<b>Google AI Professional Certificate</b> &mdash; Google (Jul 2026)",
        "<b>Introduction to Cloud Computing</b> &mdash; IBM (Aug 2026)",
        "<b>Python Essentials 1</b> &mdash; Cisco Networking Academy (Jul 2026)",
    ]
    for c in certs:
        story.append(Paragraph(f"&bull; &nbsp; {c}", styles["ResumeBullet"]))

    doc.build(story)
    print(f"PDF generated successfully at {PDF_PATH} ({PDF_PATH.stat().st_size} bytes)")

if __name__ == "__main__":
    build_pdf()