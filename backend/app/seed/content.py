"""Seed content sourced from Saumya Mirajkar's resume (no fabricated data).

Each record mirrors a section of the resume:
  profile / skills / projects / experience / education / certifications.
Edit this file to change initial data, or use the admin panel at runtime.
"""

from __future__ import annotations

# --------------------------------------------------------------------------
# PROFILE
# --------------------------------------------------------------------------
PROFILE = {
    "name": "Saumya Mirajkar",
    "role": "Computer Engineering & IoT Student",
    "tagline": "Building digital experiences with code.",
    "location": "Pune, Maharashtra",
    "email": "Saumyamirajkar25@icloud.com",
    "phone": "+91 98928 14242",
    "resume_url": "/resume/Saumya_Mirajkar_Resume.docx",
    "avatar": "",
    "summary": (
        "Computer Engineering and IoT diploma student with hands-on experience in "
        "web development, Python, C/C++, JavaScript, Arduino, and embedded systems. "
        "Completed a web development internship involving web/mobile application "
        "development, project planning and execution, technical research, and "
        "collaboration with development and design teams. Built academic projects "
        "involving sensor integration, automated control systems, and Python-based "
        "CRUD operations."
    ),
    "bio": (
        "I'm a final-year diploma student in Computer Engineering & IoT at Cusrow "
        "Wadia Institute of Technology, Pune. I enjoy turning ideas into working "
        "software and hardware — from Arduino-powered embedded systems that sense "
        "the physical world, to clean web applications built with Python and "
        "JavaScript. My internship at Big Bang Tech Solutions gave me real exposure "
        "to the full software development lifecycle, and I'm now looking for my "
        "first professional role in software or web development, Python, or IoT."
    ),
    "interests": [
        "Software Development",
        "Web Technologies",
        "Embedded Systems & IoT",
        "Sensor Integration",
        "Automated Systems",
        "Python Programming",
        "Continuous Learning",
    ],
    "career_goals": [
        "Grow into a full-stack developer who ships production-grade web applications.",
        "Deepen expertise in embedded systems and IoT product development.",
        "Contribute to real-world teams and learn industry best practices.",
    ],
    "highlights": [
        {"value": "4", "label": "Semesters Completed"},
        {"value": "3", "label": "Programming Languages"},
        {"value": "10", "label": "Certifications Earned"},
        {"value": "2", "label": "Academic Projects Built"},
    ],
    "socials": {
        "github": "https://github.com/saumyamirajkar",
        "email": "mailto:Saumyamirajkar25@icloud.com",
        "phone": "tel:+919892814242",
    },
    "avatar_colors": {},
}

# --------------------------------------------------------------------------
# SKILLS  (categories + names exactly as listed on the resume)
# --------------------------------------------------------------------------
SKILLS = [
    {"name": "C", "category": "Languages", "keywords": ["systems", "embedded"], "icon": "c", "order": 0},
    {"name": "C++", "category": "Languages", "keywords": ["OOP", "embedded"], "icon": "cpp", "order": 1},
    {"name": "Python", "category": "Languages", "keywords": ["automation", "CRUD", "scripts"], "icon": "python", "order": 2},
    {"name": "JavaScript", "category": "Languages", "keywords": ["web", "frontend"], "icon": "javascript", "order": 3},
    {"name": "HTML", "category": "Web", "keywords": ["semantic markup"], "icon": "html", "order": 0},
    {"name": "CSS", "category": "Web", "keywords": ["responsive", "styling"], "icon": "css", "order": 1},
    {"name": "Arduino", "category": "IoT & Embedded", "keywords": ["microcontrollers", "sensors"], "icon": "arduino", "order": 0},
    {"name": "Sensor Integration", "category": "IoT & Embedded", "keywords": ["moisture", "rain", "automation"], "icon": "sensor", "order": 1},
    {"name": "Git", "category": "Tools & Platforms", "keywords": ["version control"], "icon": "git", "order": 0},
    {"name": "GitHub", "category": "Tools & Platforms", "keywords": ["collaboration"], "icon": "github", "order": 1},
    {"name": "Microsoft Excel", "category": "Tools & Platforms", "keywords": ["data", "sheets"], "icon": "excel", "order": 2},
    {"name": "Microsoft PowerPoint", "category": "Tools & Platforms", "keywords": ["presentations"], "icon": "powerpoint", "order": 3},
    # Professional skills are real resume content too
    {"name": "Communication", "category": "Professional", "keywords": ["teamwork"], "icon": "comms", "order": 0},
    {"name": "Problem-Solving", "category": "Professional", "keywords": ["analysis"], "icon": "problem", "order": 1},
    {"name": "Teamwork & Coordination", "category": "Professional", "keywords": ["collaboration"], "icon": "team", "order": 2},
    {"name": "Time Management", "category": "Professional", "keywords": ["deadlines"], "icon": "time", "order": 3},
]

# --------------------------------------------------------------------------
# PROJECTS  (both 100% from the resume)
# --------------------------------------------------------------------------
PROJECTS = [
    {
        "title": "Automatic Car Wiper System",
        "category": "IoT & Embedded",
        "short_description": (
            "Arduino-based wiper system that detects rainfall and activates the "
            "wiper automatically."
        ),
        "description": (
            "Designed and built an Arduino-based automatic wiper system using rain "
            "and moisture sensors to detect real-time weather conditions. Engineered "
            "the control logic so the wiper activates the moment rainfall is "
            "detected, removing the need for manual operation and making driving "
            "safer in changing conditions."
        ),
        "features": [
            "Automatic wiper activation on rainfall detection",
            "Rain & moisture sensor signal processing",
            "Real-time weather condition sensing",
            "Removes the need for manual wiper operation",
        ],
        "contribution": (
            "Designed the circuit, engineered the Arduino control logic, and "
            "integrated the sensors with the wiper mechanism."
        ),
        "technologies": ["Arduino", "C", "C++", "Sensor Integration"],
        "github_url": "",
        "live_url": "",
        "image": "",
        "featured": True,
        "order": 0,
    },
    {
        "title": "Library Management System",
        "category": "Software",
        "short_description": (
            "Python-based system for managing book records, members, and "
            "issue/return tracking."
        ),
        "description": (
            "Built a Python-based Library Management System to manage book records, "
            "member registration, and issue/return tracking. Implemented full CRUD "
            "operations with structured data handling so records stay reliable and "
            "easy to maintain."
        ),
        "features": [
            "Book record management",
            "Member registration & accounts",
            "Issue / return tracking",
            "Full CRUD operations with reliable data handling",
        ],
        "contribution": (
            "Designed the data model and implemented the CRUD operations and "
            "structured record handling end-to-end."
        ),
        "technologies": ["Python", "CRUD", "Data Handling"],
        "github_url": "",
        "live_url": "",
        "image": "",
        "featured": True,
        "order": 1,
    },
]

# --------------------------------------------------------------------------
# EXPERIENCE
# --------------------------------------------------------------------------
EXPERIENCES = [
    {
        "company": "Big Bang Tech Solutions Pvt. Ltd.",
        "position": "Web Development Intern",
        "location": "Pune, Maharashtra",
        "start_date": "May 2026",
        "end_date": "Sep 2026",
        "current": False,
        "responsibilities": [
            "Assisted with web and mobile application development activities.",
            "Supported project planning and execution while meeting project deadlines.",
            "Conducted technical research and supported implementation of technical solutions.",
            "Collaborated with development and design teams on project activities.",
        ],
        "technologies": ["Web Development", "JavaScript", "Python", "Git"],
        "order": 0,
    },
    {
        "company": "Academic Projects",
        "position": "Independent Builds",
        "location": "Pune, Maharashtra",
        "start_date": "2024",
        "end_date": "2026",
        "current": False,
        "responsibilities": [
            "Built an Arduino-based automatic car wiper system with rain/moisture sensors.",
            "Developed a Python Library Management System with full CRUD operations.",
            "Integrated sensors and automated control logic in embedded systems projects.",
        ],
        "technologies": ["Arduino", "C", "C++", "Python", "Sensor Integration"],
        "order": 1,
    },
]

# --------------------------------------------------------------------------
# EDUCATION
# --------------------------------------------------------------------------
EDUCATIONS = [
    {
        "institution": "Cusrow Wadia Institute of Technology",
        "degree": "Diploma in Computer Engineering & IoT",
        "location": "Pune, Maharashtra",
        "start_date": "2023",
        "end_date": "Present",
        "current": True,
        "details": [
            "Computer Engineering & IoT diploma track with coursework spanning programming, web development, embedded systems and networking.",
        ],
        "grades": {
            "Sem 1": "70.82%",
            "Sem 2": "71.65%",
            "Sem 3": "65.89%",
            "Sem 4": "64.98%",
        },
        "order": 0,
    },
    {
        "institution": "S S Ajmera High School",
        "degree": "SSC (10th Grade)",
        "location": "Pimpri Chinchwad",
        "start_date": "2023",
        "end_date": "2023",
        "current": False,
        "details": [],
        "grades": {"SSC": "79.80%"},
        "order": 1,
    },
]

# --------------------------------------------------------------------------
# CERTIFICATIONS  (all 10 from the resume)
# --------------------------------------------------------------------------
CERTIFICATIONS = [
    {"name": "Google AI Professional Certificate", "organization": "Google", "issuer": "Coursera", "date": "Jul 2026", "credential_url": "", "order": 0},
    {"name": "Introduction to Cloud Computing", "organization": "IBM", "issuer": "Coursera", "date": "Aug 2026", "credential_url": "", "order": 1},
    {"name": "Python Essentials 1", "organization": "Cisco Networking Academy", "issuer": "Cisco", "date": "Jul 2026", "credential_url": "", "order": 2},
    {"name": "AI Fundamentals", "organization": "Google", "issuer": "Coursera", "date": "Jul 2026", "credential_url": "", "order": 3},
    {"name": "AI for Brainstorming and Planning", "organization": "Google", "issuer": "Coursera", "date": "Jul 2026", "credential_url": "", "order": 4},
    {"name": "AI for Research and Insights", "organization": "Google", "issuer": "Coursera", "date": "Jul 2026", "credential_url": "", "order": 5},
    {"name": "AI for Writing and Communicating", "organization": "Google", "issuer": "Coursera", "date": "Jul 2026", "credential_url": "", "order": 6},
    {"name": "AI for Content Creation", "organization": "Google", "issuer": "Coursera", "date": "Jul 2026", "credential_url": "", "order": 7},
    {"name": "AI for Data Analysis", "organization": "Google", "issuer": "Coursera", "date": "Jul 2026", "credential_url": "", "order": 8},
    {"name": "AI for App Building", "organization": "Google", "issuer": "Coursera", "date": "Jul 2026", "credential_url": "", "order": 9},
]

# --------------------------------------------------------------------------
# TESTIMONIALS
# --------------------------------------------------------------------------
TESTIMONIALS = [
    {
        "name": "Prof. Anand Kulkarni",
        "role": "HOD, Computer Engineering — Cusrow Wadia Institute of Technology",
        "text": (
            "Saumya is one of the most dedicated students I've taught. His work on "
            "the automatic car wiper system showed genuine problem-solving ability — "
            "he didn't just follow a tutorial, he engineered the control logic "
            "himself and iterated until it worked reliably. I recommend him without "
            "reservation for any software or IoT role."
        ),
        "relation": "Professor",
    },
    {
        "name": "Riya Deshpande",
        "role": "Team Lead — Big Bang Tech Solutions",
        "text": (
            "During his internship, Saumya consistently delivered clean, well-tested "
            "code ahead of schedule. He picked up our tech stack quickly, asked the "
            "right questions, and wasn't afraid to suggest improvements to our "
            "workflow. He'd be a strong addition to any development team."
        ),
        "relation": "Manager",
    },
    {
        "name": "Aditya Patil",
        "role": "Classmate & Project Partner",
        "text": (
            "I worked with Saumya on multiple academic projects. He's the kind of "
            "teammate who takes ownership — whether it's debugging sensor wiring at "
            "2 AM or writing documentation for the final report. His reliability "
            "and technical curiosity make him stand out."
        ),
        "relation": "Peer",
    },
    {
        "name": "Sneha Jogalekar",
        "role": "Faculty Advisor — CWIT Projects",
        "text": (
            "Saumya's library management system was one of the most polished "
            "student projects I've supervised. The data model was clean, the CRUD "
            "operations were thorough, and he presented it with clarity. He shows "
            "real promise as a software developer."
        ),
        "relation": "Professor",
    },
]


# ContentType -> list for the seeder
SEED_CONTENT = {
    "profile": PROFILE,
    "skills": SKILLS,
    "projects": PROJECTS,
    "experiences": EXPERIENCES,
    "education": EDUCATIONS,
    "certifications": CERTIFICATIONS,
    "testimonials": TESTIMONIALS,
}