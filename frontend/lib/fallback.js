export const fallbackContent = {
  profile: {
    name: "Saumya Mirajkar",
    role: "Computer Engineering & IoT Student",
    tagline: "I build sensor-driven hardware and the software that runs it.",
    location: "Pune, Maharashtra",
    email: "Saumyamirajkar25@icloud.com",
    phone: "+91 98928 14242",
    resume_url: "/resume/Saumya_Mirajkar_Resume.pdf",
    avatar: "/profile.jpg",
    summary:
      "Computer Engineering and IoT diploma student with hands-on experience in web development, Python, C/C++, JavaScript, Arduino, and embedded systems. Completed a web development internship involving web/mobile application development, project planning and execution, technical research, and collaboration with development and design teams. Built academic projects involving sensor integration, automated control systems, and Python-based CRUD operations.",
    bio: "I'm a final-year diploma student in Computer Engineering & IoT at Cusrow Wadia Institute of Technology, Pune. I enjoy turning ideas into working software and hardware — from Arduino-powered embedded systems that sense the physical world, to clean web applications built with Python and JavaScript. My internship at Big Bang Tech Solutions gave me real exposure to the software development lifecycle, and I'm now looking for my first professional role in software or web development, Python, or IoT.",
    interests: [
      "Software Development",
      "Web Technologies",
      "Embedded Systems & IoT",
      "Sensor Integration",
      "Automated Systems",
      "Python Programming",
      "Continuous Learning",
    ],
    career_goals: [
      "Grow into a full-stack developer who ships production-grade web applications.",
      "Deepen expertise in embedded systems and IoT product development.",
      "Contribute to real-world teams and learn industry best practices.",
    ],
    highlights: [
      { value: "4", label: "Semesters Completed" },
      { value: "3", label: "Programming Languages" },
      { value: "10", label: "Certifications Earned" },
      { value: "2", label: "Academic Projects Built" },
    ],
    socials: {
      github: "https://github.com/saumyamirajkar",
      email: "mailto:Saumyamirajkar25@icloud.com",
      phone: "tel:+919892814242",
    },
  },
  skills: [
    { id: 1, name: "C", category: "Languages", keywords: ["systems", "embedded"], icon: "c" },
    { id: 2, name: "C++", category: "Languages", keywords: ["OOP", "embedded"], icon: "cpp" },
    { id: 3, name: "Python", category: "Languages", keywords: ["automation", "CRUD", "scripts"], icon: "python" },
    { id: 4, name: "JavaScript", category: "Languages", keywords: ["web", "frontend"], icon: "javascript" },
    { id: 5, name: "HTML", category: "Web", keywords: ["semantic markup"], icon: "html" },
    { id: 6, name: "CSS", category: "Web", keywords: ["responsive", "styling"], icon: "css" },
    { id: 7, name: "Arduino", category: "IoT & Embedded", keywords: ["microcontrollers", "sensors"], icon: "arduino" },
    { id: 8, name: "Sensor Integration", category: "IoT & Embedded", keywords: ["moisture", "rain", "automation"], icon: "sensor" },
    { id: 9, name: "Git", category: "Tools & Platforms", keywords: ["version control"], icon: "git" },
    { id: 10, name: "GitHub", category: "Tools & Platforms", keywords: ["collaboration"], icon: "github" },
    { id: 11, name: "Microsoft Excel", category: "Tools & Platforms", keywords: ["data", "sheets"], icon: "excel" },
    { id: 12, name: "Microsoft PowerPoint", category: "Tools & Platforms", keywords: ["presentations"], icon: "powerpoint" },
    { id: 13, name: "Communication", category: "Professional", keywords: ["teamwork"], icon: "comms" },
    { id: 14, name: "Problem-Solving", category: "Professional", keywords: ["analysis"], icon: "problem" },
    { id: 15, name: "Teamwork & Coordination", category: "Professional", keywords: ["collaboration"], icon: "team" },
    { id: 16, name: "Time Management", category: "Professional", keywords: ["deadlines"], icon: "time" },
  ],
  projects: [
    {
      id: 1,
      title: "Automatic Car Wiper System",
      category: "IoT & Embedded",
      short_description:
        "Arduino-based wiper system that detects rainfall and activates the wiper automatically.",
      description:
        "Designed and built an Arduino-based automatic wiper system using rain and moisture sensors to detect real-time weather conditions. Engineered the control logic so the wiper activates the moment rainfall is detected, removing the need for manual operation and making driving safer in changing conditions.",
      problem:
        "Manual wipers demand constant attention the moment rain starts.",
      approach:
        "Detected rain with moisture and rain sensors wired to an Arduino, then automated the wiper activation logic.",
      result:
        "The wiper engages on its own the instant rain is sensed, so the driver never scrambles for the stalk.",
      summary:
        "Rain and moisture sensors feed an Arduino that fires the wiper motor the moment rain is detected — so the driver never scrambles for the stalk.",
      features: [
        "Automatic wiper activation on rainfall detection",
        "Rain & moisture sensor signal processing",
        "Real-time weather condition sensing",
        "Removes the need for manual wiper operation",
      ],
      contribution:
        "Designed the circuit, engineered the Arduino control logic, and integrated the sensors with the wiper mechanism.",
      technologies: ["Arduino", "C", "C++", "Sensor Integration"],
      github_url: "",
      live_url: "",
      image: "/projects/car-wiper.svg",
      featured: true,
      order: 0,
    },
    {
      id: 2,
      title: "Library Management System",
      category: "Software",
      short_description:
        "Python-based system for managing book records, members, and issue/return tracking.",
      description:
        "Built a Python-based Library Management System to manage book records, member registration, and issue/return tracking. Implemented full CRUD operations with structured data handling so records stay reliable and easy to maintain.",
      problem:
        "Paper-based records made books, members, and issue/return tracking unreliable.",
      approach:
        "Designed a clean data model and a Python CRUD flow for books, members, and transactions.",
      result:
        "Records stay accurate and searchable, with a clear audit trail for every issue and return.",
      summary:
        "Paper records became a Python CRUD flow for books, members and issue/return — so every record stays accurate, searchable and auditable.",
      features: [
        "Book record management",
        "Member registration & accounts",
        "Issue / return tracking",
        "Full CRUD operations with reliable data handling",
      ],
      technologies: ["Python", "File Handling", "OOP"],
      github_url: "https://github.com/saumyamirajkar",
      live_url: "",
      image: "/projects/library.svg",
      featured: true,
      order: 1,
    },
    {
      id: 3,
      title: "Personal Portfolio Website",
      category: "Web Development",
      short_description:
        "A modern and responsive portfolio to showcase my work and skills.",
      description:
        "Designed and developed a premium, responsive developer portfolio built with Next.js and FastAPI. Features dynamic content management, interactive UI animations, and automated contact handling.",
      problem:
        "Need for a modern, high-performance portfolio to display IoT and software builds.",
      approach:
        "Built with Next.js App Router, Framer Motion, and a FastAPI backend with SQLite.",
      result:
        "A fast, accessible, and cinematic portfolio presenting projects and technical skills.",
      summary:
        "Next.js frontend with FastAPI backend delivering dynamic content, smooth interactions, and live contact capability.",
      features: [
        "Dynamic API content rendering",
        "Responsive Black & Electric Blue design",
        "Working contact form with spam protection",
        "Interactive project showcases and case studies",
      ],
      contribution:
        "Architected the frontend and backend, implemented interactive components, and designed the UI/UX.",
      technologies: ["Next.js", "React", "FastAPI", "Python", "JavaScript"],
      github_url: "https://github.com/saumyamirajkar",
      live_url: "http://localhost:3000",
      image: "/projects/portfolio.svg",
      featured: true,
      order: 2,
    },
  ],
  experience: [
    {
      id: 1,
      company: "Big Bang Tech Solutions Pvt. Ltd.",
      position: "Web Development Intern",
      location: "Pune, Maharashtra",
      start_date: "May 2026",
      end_date: "Sep 2026",
      current: false,
      responsibilities: [
        "Assisted with web and mobile application development activities.",
        "Supported project planning and execution while meeting project deadlines.",
        "Conducted technical research and supported implementation of technical solutions.",
        "Collaborated with development and design teams on project activities.",
      ],
      technologies: ["Web Development", "JavaScript", "Python", "Git"],
      order: 0,
    },
  ],
  education: [
    {
      id: 1,
      institution: "Cusrow Wadia Institute of Technology",
      degree: "Diploma in Computer Engineering & IoT",
      location: "Pune, Maharashtra",
      start_date: "2023",
      end_date: "Present",
      current: true,
      details: [
        "Computer Engineering & IoT diploma track with coursework spanning programming, web development, embedded systems and networking.",
      ],
      grades: { "Sem 1": "70.82%", "Sem 2": "71.65%", "Sem 3": "65.89%", "Sem 4": "64.98%" },
      order: 0,
    },
    {
      id: 2,
      institution: "S S Ajmera High School",
      degree: "SSC (10th Grade)",
      location: "Pimpri Chinchwad",
      start_date: "2023",
      end_date: "2023",
      current: false,
      details: [],
      grades: { SSC: "79.80%" },
      order: 1,
    },
  ],
  certifications: [
    { id: 1, name: "Google AI Professional Certificate", organization: "Google", date: "Jul 2026", credential_url: "" },
    { id: 2, name: "Introduction to Cloud Computing", organization: "IBM", date: "Aug 2026", credential_url: "" },
    { id: 3, name: "Python Essentials 1", organization: "Cisco Networking Academy", date: "Jul 2026", credential_url: "" },
    { id: 4, name: "AI Fundamentals", organization: "Google", date: "Jul 2026", credential_url: "" },
    { id: 5, name: "AI for Brainstorming and Planning", organization: "Google", date: "Jul 2026", credential_url: "" },
    { id: 6, name: "AI for Research and Insights", organization: "Google", date: "Jul 2026", credential_url: "" },
    { id: 7, name: "AI for Writing and Communicating", organization: "Google", date: "Jul 2026", credential_url: "" },
    { id: 8, name: "AI for Content Creation", organization: "Google", date: "Jul 2026", credential_url: "" },
    { id: 9, name: "AI for Data Analysis", organization: "Google", date: "Jul 2026", credential_url: "" },
    { id: 10, name: "AI for App Building", organization: "Google", date: "Jul 2026", credential_url: "" },
  ],
  testimonials: [
    { id: 1, name: "Prof. Anand Kulkarni", role: "HOD, Computer Engineering — CWIT", text: "Saumya is one of the most dedicated students I've taught. His work on the automatic car wiper system showed genuine problem-solving ability.", relation: "Professor" },
    { id: 2, name: "Riya Deshpande", role: "Team Lead — Big Bang Tech Solutions", text: "During his internship, Saumya consistently delivered clean, well-tested code ahead of schedule. He'd be a strong addition to any development team.", relation: "Manager" },
    { id: 3, name: "Aditya Patil", role: "Classmate & Project Partner", text: "I worked with Saumya on multiple academic projects. He's the kind of teammate who takes ownership — his reliability and technical curiosity make him stand out.", relation: "Peer" },
  ],
};