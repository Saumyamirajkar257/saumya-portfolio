#!/usr/bin/env python3
"""Generate a clean, single-page PDF résumé from the portfolio data."""
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
    KeepTogether
)

PDF_PATH = Path(__file__).parent / "frontend" / "public" / "resume" / "Saumya_Mirajkar_Resume.pdf"

# Colour palette — matches the site "Signal" theme
DARK = HexColor("#0b0e12")
ACCENT = HexColor("#00e5a0")
ACCENT_DARK = HexColor("#00b87f")
MINT = HexColor("#4fdcb4")
WHITE = HexColor("#f4f3f0")
MUTED = HexColor("#9ca3af")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Name", fontName="Helvetica-Bold", fontSize=26, leading=30, textColor=WHITE, spaceAfter=2))
styles.add(ParagraphStyle(name="Role", fontName="Helvetica", fontSize=13, leading=16, textColor=MINT, spaceAfter=8))
styles.add(ParagraphStyle(name="Section", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=ACCENT, spaceBefore=14, spaceAfter=4, textTransform="uppercase", tracking=1.2))
styles.add(ParagraphStyle(name="Body", fontName="Helvetica", fontSize=9.5, leading=13, textColor=WHITE, spaceAfter=2))
styles.add(ParagraphStyle(name="Muted", fontName="Helvetica-Oblique", fontSize=9.5, leading=13, textColor=MUTED, spaceAfter=2))
styles.add(ParagraphStyle(name="BulletStyle", fontName="Helvetica", fontSize=9.5, leading=13, textColor=WHITE, leftIndent=18, bulletIndent=6, spaceAfter=1, bulletFontName="Helvetica", bulletFontSize=9.5))
styles.add(ParagraphStyle(name="Meta", fontName="Helvetica", fontSize=9, leading=12, textColor=MUTED, spaceAfter=0))

# --- Résumé content (mirrors portfolio seed) ---
profile = {
    "name": "Saumya Mirajkar",
    "role": "Computer Engineering & IoT Student",
    "location": "Pune, Maharashtra",
    "email": "saumyamir25@gmail.com",
    "phone": "+91 98928 14242",
    "github": "github.com/saumyamirajkar",
    "summary": "Computer Engineering and IoT diploma student with hands-on experience in web development, Python, C/C++, JavaScript, Arduino, and embedded systems. Completed a web development internship involving web/mobile application development, project planning and execution, technical research, and collaboration with development and design teams. Built academic projects involving sensor integration, automated control systems, and Python-based CRUD operations.",
}

skills = {
    "Languages": ["C", "C++", "Python", "JavaScript"],
    "Web": ["HTML", "CSS"],
    "IoT & Embedded": ["Arduino", "Sensor Integration"],
    "Tools & Platforms": ["Git", "GitHub", "Microsoft Excel", "Microsoft PowerPoint"],
    "Professional": ["Communication", "Problem-Solving", "Teamwork & Coordination", "Time Management"],
}

projects = [
    {
        "title": "Automatic Car Wiper System",
        "category": "IoT & Embedded",
        "short": "Arduino-based wiper system that detects rainfall and activates the wiper automatically.",
        "problem": "Manual wipers demand constant attention the moment rain starts.",
        "approach": "Detected rain with moisture and rain sensors wired to an Arduino, then automated the wiper activation logic.",
        "result": "The wiper engages on its own the instant rain is sensed, so the driver never scrambles for the stalk.",
        "technologies": ["Arduino", "C", "C++", "Sensor Integration"],
    },
    {
        "title": "Library Management System",
        "category": "Software",
        "short": "Python-based system for managing book records, members, and issue/return tracking.",
        "problem": "Paper-based records made books, members, and issue/return tracking unreliable.",
        "approach": "Designed a clean data model and a Python CRUD flow for books, members, and transactions.",
        "result": "Records stay accurate and searchable, with a clear audit trail for every issue and return.",
        "technologies": ["Python", "CRUD", "Data Handling"],
    },
]

experience = [
    {
        "company": "Big Bang Tech Solutions Pvt. Ltd.",
        "position": "Web Development Intern",
        "location": "Pune, Maharashtra",
        "dates": "May 2026 – Sep 2026",
        "responsibilities": [
            "Assisted with web and mobile application development activities.",
            "Supported project planning and execution while meeting project deadlines.",
            "Conducted technical research and supported implementation of technical solutions.",
            "Collaborated with development and design teams on project activities.",
        ],
        "technologies": ["Web Development", "JavaScript", "Python", "Git"],
    },
]

education = [
    {
        "institution": "Cusrow Wadia Institute of Technology",
        "degree": "Diploma in Computer Engineering & IoT",
        "location": "Pune, Maharashtra",
        "dates": "2023 – Present",
        "details": "Computer Engineering & IoT diploma track with coursework spanning programming, web development, embedded systems and networking.",
        "grades": {"Sem 1": "70.82%", "Sem 2": "71.65%", "Sem 3": "65.89%", "Sem 4": "64.98%"},
    },
    {
        "institution": "S S Ajmera High School",
        "degree": "SSC (10th Grade)",
        "location": "Pimpri Chinchwad",
        "dates": "2023",
        "grades": {"SSC": "79.80%"},
    },
]

certifications = [
    {"name": "Google AI Professional Certificate", "org": "Google", "date": "Jul 2026"},
    {"name": "Introduction to Cloud Computing", "org": "IBM", "date": "Aug 2026"},
    {"name": "Python Essentials 1", "org": "Cisco Networking Academy", "date": "Jul 2026"},
    {"name": "AI Fundamentals", "org": "Google", "date": "Jul 2026"},
    {"name": "AI for Brainstorming and Planning", "org": "Google", "date": "Jul 2026"},
    {"name": "AI for Research and Insights", "org": "Google", "date": "Jul 2026"},
    {"name": "AI for Writing and Communicating", "org": "Google", "date": "Jul 2026"},
    {"name": "AI for Content Creation", "org": "Google", "date": "Jul 2026"},
    {"name": "AI for Data Analysis", "org": "Google", "date": "Jul 2026"},
    {"name": "AI for App Building", "org": "Google", "date": "Jul 2026"},
]

# Build the PDF
doc = SimpleDocTemplate(
    str(PDF_PATH),
    pagesize=letter,
    leftMargin=0.9*inch, rightMargin=0.9*inch,
    topMargin=0.7*inch, bottomMargin=0.7*inch,
)

story = []

# Header bar
header_data = [[
    Paragraph(profile["name"], styles["Name"]),
    Paragraph(f'{profile["location"]}  •  {profile["email"]}  •  {profile["phone"]}', styles["Meta"]),
]]
header = Table(header_data, colWidths=[4.5*inch, 2.7*inch])
header.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ALIGN", (1,0), (1,0), "RIGHT"),
    ("TOPPADDING", (0,0), (-1,-1), 0),
    ("BOTTOMPADDING", (0,0), (-1,-1), 0),
]))
story.append(header)
story.append(Paragraph(profile["role"], styles["Role"]))
story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=6, spaceBefore=0))

# Summary
story.append(Paragraph("Summary", styles["Section"]))
story.append(Paragraph(profile["summary"], styles["Body"]))

# Skills
story.append(Paragraph("Skills", styles["Section"]))
for cat, items in skills.items():
    story.append(Paragraph(f"<b>{cat}:</b> {', '.join(items)}", styles["Body"]))

# Projects
story.append(Paragraph("Projects", styles["Section"]))
for p in projects:
    story.append(Paragraph(f"<b>{p['title']}</b>  <font color='#4fdcb4'>{p['category']}</font>", styles["Body"]))
    story.append(Paragraph(f"Problem → Approach → Result: {p['problem']} | {p['approach']} | {p['result']}", styles["Muted"]))
    story.append(Paragraph(f"Tech: {', '.join(p['technologies'])}", styles["Muted"]))

# Experience
story.append(Paragraph("Experience", styles["Section"]))
for e in experience:
    story.append(Paragraph(f"<b>{e['position']}</b>  —  {e['company']}", styles["Body"]))
    story.append(Paragraph(f"{e['location']}  •  {e['dates']}", styles["Muted"]))
    for r in e["responsibilities"]:
        story.append(Paragraph(r, styles["BulletStyle"], bulletText="•"))
    story.append(Paragraph(f"Technologies: {', '.join(e['technologies'])}", styles["Muted"]))

# Education
story.append(Paragraph("Education", styles["Section"]))
for ed in education:
    story.append(Paragraph(f"<b>{ed['degree']}</b>  —  {ed['institution']}", styles["Body"]))
    story.append(Paragraph(f"{ed['location']}  •  {ed['dates']}", styles["Muted"]))
    if ed.get("details"):
        story.append(Paragraph(ed["details"][0], styles["Body"]))
    if ed.get("grades"):
        for k, v in ed["grades"].items():
            story.append(Paragraph(f"{k}: {v}", styles["BulletStyle"], bulletText="•"))

# Certifications
story.append(Paragraph("Certifications", styles["Section"]))
for c in certifications:
    story.append(Paragraph(f"<b>{c['name']}</b>  —  {c['org']}  ({c['date']})", styles["Body"]))

# Footer
story.append(Spacer(1, 12))
story.append(HRFlowable(width="100%", thickness=0.5, color=MUTED, spaceAfter=4, spaceBefore=0))
story.append(Paragraph("Open to software, web, Python and IoT internships.  github.com/saumyamirajkar", styles["Meta"]))

doc.build(story)
print(f"PDF generated at {PDF_PATH} ({PDF_PATH.stat().st_size/1024:.1f} KB)")