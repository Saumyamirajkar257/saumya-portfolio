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
      { value: "1", label: "Certification Earned" },
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
      title: "LifeTrackr — Personal Life OS",
      category: "Full-Stack Web App",
      short_description:
        "A personal Life OS unifying tasks, habits, finance tracking, daily journaling, and analytics.",
      description:
        "Architected and built LifeTrackr, a personal operating system designed to streamline daily productivity, track financial habits, manage personal tasks, log daily reflections, and deliver actionable productivity analytics in one cohesive dashboard.",
      problem:
        "Personal productivity tools are often fragmented across multiple disconnected apps, making it hard to maintain consistent habits, track finances, and analyze progress.",
      approach:
        "Unified tasks, habit streaks, expense/income tracking, daily journaling, and performance analytics into a single responsive web interface with dark theme customization and state persistence.",
      result:
        "A unified personal productivity dashboard delivering real-time progress tracking, habit streaks, financial clarity, and daily logging.",
      summary:
        "Unified tasks, habit loops, expense tracking, daily journaling, and performance analytics into a single responsive personal dashboard.",
      features: [
        "Task Management with priority lists and status workflows",
        "Habit Tracker with streak calculations and daily completion logs",
        "Personal Finance Tracker for income, expenses, and savings goals",
        "Daily Journaling and reflection log",
        "Productivity Analytics with visual progress trends",
        "User Profile and authentication flow",
        "Custom Themes and application settings",
      ],
      learned:
        "Mastered state management patterns for multi-domain dashboards, persistent user settings, responsive layout composition, and custom SVG analytics visualization.",
      contribution:
        "Designed the UI/UX, implemented state management, built dashboard widgets, and engineered analytics visualizations.",
      technologies: ["Next.js", "React", "JavaScript", "Tailwind CSS", "Framer Motion"],
      github_url: "https://github.com/saumyamirajkar",
      live_url: "",
      image: "/projects/lifetrackr.svg",
      featured: true,
      order: 0,
    },
    {
      id: 2,
      title: "Automatic Car Wiper System",
      category: "Hardware + IoT",
      short_description:
        "Arduino-based wiper system that detects rainfall and activates the wiper automatically.",
      description:
        "Designed and built an Arduino-based automatic wiper system using rain and moisture sensors to detect real-time weather conditions. Engineered the control logic so the wiper activates the moment rainfall is detected, removing the need for manual operation and making driving safer in changing conditions.",
      problem:
        "Manual wipers demand constant driver attention the moment rain starts, causing distraction in adverse weather conditions.",
      approach:
        "Detected rain with moisture and rain sensors wired to an Arduino microcontroller, then automated the motor drive logic.",
      result:
        "The wiper engages automatically the instant rain is sensed, removing driver distraction.",
      summary:
        "Rain and moisture sensors feed an Arduino microcontroller that fires the wiper motor the moment rain is detected.",
      features: [
        "Automatic wiper activation on rainfall detection",
        "Rain & moisture sensor signal processing",
        "Real-time weather condition sensing",
        "Removes manual wiper stalk operation",
      ],
      learned:
        "Gained deep hands-on experience with analog-to-digital sensor signal interpretation, relay control circuits, and embedded C/C++ control logic.",
      contribution:
        "Designed the circuit schematics, engineered the Arduino control logic, and integrated physical sensors with the wiper motor mechanism.",
      technologies: ["Arduino", "C", "C++", "Sensor Integration", "Embedded Control"],
      github_url: "",
      live_url: "",
      image: "/projects/car-wiper.svg",
      featured: true,
      order: 1,
    },
    {
      id: 3,
      title: "Personal Portfolio Website",
      category: "Web Development",
      short_description:
        "A modern, interactive portfolio showcase built with Next.js, Framer Motion, and 3D WebGL.",
      description:
        "Designed and developed a premium, responsive developer portfolio featuring an interactive 3D MacBook Pro model, fluid micro-interactions, dark dark-navy engineering aesthetics, and lightweight case study presentations.",
      problem:
        "Need for a high-performance, modern platform to present hardware and software engineering builds to recruiters and collaborators.",
      approach:
        "Built with Next.js App Router, Three.js GLTF WebGL rendering, Framer Motion springs, and accessible CSS design tokens.",
      result:
        "A fast, responsive, and cinematic developer portfolio highlighting technical projects and engineering foundation.",
      summary:
        "Next.js frontend with Three.js 3D WebGL model, Framer Motion micro-interactions, and responsive dark aesthetics.",
      features: [
        "Interactive 3D WebGL MacBook Pro M5 model with subtle mouse parallax",
        "Fluid section reveals and subtle top scroll progress line",
        "Lightweight interactive case study modal experience",
        "Responsive across all viewports from 320px to 1400px",
      ],
      learned:
        "Optimized WebGL render loops, capped device pixel ratios, integrated spring motion physics, and refined typography systems.",
      contribution:
        "Architected frontend layout, integrated Three.js model, engineered motion physics, and styled design system.",
      technologies: ["Next.js", "React", "Three.js", "Framer Motion", "JavaScript"],
      github_url: "https://github.com/saumyamirajkar",
      live_url: "https://saumya-portfolio-acv.pages.dev",
      image: "/projects/portfolio.svg",
      featured: true,
      order: 2,
    },
    {
      id: 4,
      title: "Library Management System",
      category: "Python Software",
      short_description:
        "Python-based system for managing book records, member registrations, and transaction tracking.",
      description:
        "Built a Python-based Library Management System to manage book records, member registrations, and issue/return tracking. Implemented full CRUD operations with structured data handling so records stay reliable and easy to maintain.",
      problem:
        "Paper-based records made books, members, and issue/return tracking error-prone and difficult to search.",
      approach:
        "Designed a clean data model and a Python CRUD workflow for book inventories, member accounts, and transactions.",
      result:
        "Library records stay accurate and searchable, with a clear audit trail for every issue and return.",
      summary:
        "Paper records replaced with a Python CRUD workflow for books, members, and issue/return tracking.",
      features: [
        "Book record management and inventory tracking",
        "Member registration & account profiles",
        "Issue / return tracking with transaction history",
        "Full CRUD operations with structured error handling",
      ],
      learned:
        "Strengthened object-oriented programming principles, structured file handling, and modular code architecture in Python.",
      contribution:
        "Designed data schemas, implemented CRUD business logic, and built the command-line/file-persistence engine.",
      technologies: ["Python", "OOP", "File Handling", "Data Management"],
      github_url: "https://github.com/saumyamirajkar",
      live_url: "",
      image: "/projects/library.svg",
      featured: false,
      order: 3,
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
    { id: 1, name: "Introduction to Software Engineering", organization: "IBM / Coursera", date: "2026", credential_url: "" },
  ],
  testimonials: [
    { id: 1, name: "Prof. Anand Kulkarni", role: "HOD, Computer Engineering — CWIT", text: "Saumya is one of the most dedicated students I've taught. His work on the automatic car wiper system showed genuine problem-solving ability.", relation: "Professor" },
    { id: 2, name: "Riya Deshpande", role: "Team Lead — Big Bang Tech Solutions", text: "During his internship, Saumya consistently delivered clean, well-tested code ahead of schedule. He'd be a strong addition to any development team.", relation: "Manager" },
    { id: 3, name: "Aditya Patil", role: "Classmate & Project Partner", text: "I worked with Saumya on multiple academic projects. He's the kind of teammate who takes ownership — his reliability and technical curiosity make him stand out.", relation: "Peer" },
  ],
};