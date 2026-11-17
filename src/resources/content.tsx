import type { About, Awards, Designs, Home, Person, Projects, Social } from "@/types";

const person: Person = {
  firstName: "Houssam",
  lastName: "Choubik",
  name: "Houssam Choubik",
  role: "Cybersecurity & Cloud Computing Engineering Student",
  avatar: "/images/avatar.jpg",
  email: {
    user: "choubikhoussam",
    domain: "gmail.com",
  },
  // TODO(houssam): drop your CV at public/cv/Houssam_Choubik_CV.pdf. The button is hidden until the file exists.
  cv: "/cv/Houssam_Choubik_CV.pdf",
  location: "Africa/Casablanca", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["Arabic (native)", "French (C1, DALF C1)", "English (C1)"],
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  // Email is rendered separately by <EmailButton /> so the address isn't in the HTML.
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/H0ussamCl4p",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/houssam-choubik-5b4ba3316/",
  },
];

const home: Home = {
  path: "/",
  label: "Home",
  title: `${person.name} · Cybersecurity & Cloud Engineering Student`,
  description:
    "Cybersecurity & Cloud Computing engineering student at ENSAM Casablanca and Falling Walls Lab 2026 Global Finalist. Secure cloud, DevSecOps and Industrial IoT.",
  image: `/api/og/generate?title=${encodeURIComponent(`${person.name} · Cybersecurity & Cloud Engineering Student`)}`,
  eyebrow: "~/casablanca",
  coordinates: "33.57° N · 7.59° W",
  headline: <>Securing the systems where AI, industry and health meet</>,
  subtitle: "Cybersecurity & Cloud Computing Engineering Student · ENSAM Casablanca",
  credentials: ["Falling Walls Lab Global Finalist 2026", "Fortinet NSE 4", "GDG on Campus Lead"],
  openTo: <>Summer 2027 internships (industry or research) and part-time remote roles.</>,
  featuredPosts: {
    display: true,
    title: "Highlights",
    // Newest first. Posts with an empty link are hidden until you paste the URL.
    posts: [
      {
        name: "Falling Walls Lab Global Finale, Berlin 2026",
        image: "/images/featured/FWL-Berlin-2026.jpg",
        link: "https://www.linkedin.com/posts/houssam-choubik_fallingwalls-fallingwallslab-sciencesummit26-ugcPost-7526710991519154176-brSD",
        description: "Represented Morocco among 100 finalists, 6 November 2026.",
      },
      {
        name: "OlympICTs CTF 2026",
        // TODO(houssam): paste the LinkedIn post URL (and optionally add an image in public/images/featured/).
        link: "",
        description: "1st worldwide in the qualifier.",
      },
      {
        name: "HackerRank Orchestrate Hackathon 2026",
        // TODO(houssam): paste the LinkedIn post URL (and optionally add an image in public/images/featured/).
        link: "",
        description: "1st in Morocco, 106th of 1,983 worldwide.",
      },
      {
        name: "Capgemini Engineering Techathon 2025",
        image: "/images/featured/Techathon.jpg",
        link: "https://www.linkedin.com/posts/houssam-choubik_industry-smartfactory-energyefficiency-activity-7422402895360212994-B6vv",
        description: "Finalist with Smart Energy Guardian.",
      },
      {
        name: "MCPC 2025",
        image: "/images/featured/MCPC.jpg",
        link: "https://www.linkedin.com/posts/houssam-choubik_mcpc-ensamcasablanca-competitiveprogramming-activity-7415365095494492160-OFEu",
        description: "Moroccan Collegiate Programming Contest, UM6P Rabat.",
      },
      {
        name: "Forum ENSAM Casablanca Entreprises 2025",
        image: "/images/featured/FEE-2025.jpg",
        link: "https://www.linkedin.com/posts/houssam-choubik_ensamcasablanca-forumensamcasa-organizingcommittee-activity-7395544213725093888-3NEx",
        description: "Organizing committee.",
      },
    ],
  },
  subline: (
    <>
      Engineering student at ENSAM Casablanca (Hassan II University, class of 2028). I build secure
      cloud and Industrial IoT systems, from DevSecOps pipelines to Smart Energy Guardian, an AI
      platform that cuts industrial energy waste.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} at ENSAM Casablanca`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "",
  },
  intro: {
    display: false,
    title: "",
    description: <></>,
  },
  work: {
    display: true,
    title: "Experience",
    experiences: [
      {
        id: "experience-dataprotect",
        company: "Dataprotect",
        // TODO(houssam): add public/images/logo/dataprotect.png and set logo: "/images/logo/dataprotect.png"
        timeframe: "Jul 2026 – Sep 2026",
        role: "Cloud Security Intern (DevSecOps)",
        type: "Internship (PFA) · Cloud Security Business Unit",
        location: "Casablanca, Morocco",
        featured: true,
        current: false,
        description: "Software supply-chain security and LLM-assisted vulnerability triage.",
        achievements: [
          "CI/CD pipeline aligned with the EU Cyber Resilience Act: Semgrep and Trivy gates, SBOMs, keyless cosign signing, Kyverno admission.",
          "LLM-assisted triage tool (SSVC, EPSS, CISA KEV): 25 real findings, no failures, 78 unit tests.",
          "Container image cut from 89 to 31 components; Kubescape NSA score 67.6 → 73.3.",
        ],
        skills: ["Kubernetes", "AWS EKS", "Terraform", "cosign", "Kyverno"],
        links: {},
      },
      {
        id: "experience-ministere-sante",
        company: "Ministère de la Santé et de la Protection Sociale",
        logo: "/images/logo/logo-ministere-sante.png",
        timeframe: "Jul 2025 – Aug 2025",
        role: "Information Systems Intern",
        type: "Internship",
        location: "Rabat, Morocco · Hybrid",
        featured: false,
        current: false,
        description: "Full-stack app to manage vaccination at border points.",
        achievements: ["Secure REST APIs for health data, React front-end, MySQL data model."],
        skills: ["Spring Boot", "React", "MySQL"],
        links: {},
      },
    ],
  },
  studies: {
    display: true,
    title: "Education",
    institutions: [
      {
        name: "ENSAM Casablanca, Hassan II University",
        description: <>Engineering degree, Cybersecurity &amp; Cloud Computing</>,
        logo: "/images/logo/logoENsam.png",
        timeframe: "2023 – 2028 (expected)",
        location: "Casablanca, Morocco",
      },
    ],
  },
  parascolaire: {
    display: true,
    title: "Leadership",
    activities: [
      { role: "Lead Organizer", name: "GDG on Campus ENSAM Casablanca", timeframe: "2026 – 2027" },
      { role: "Outreach Manager", name: "GDG on Campus ENSAM Casablanca", timeframe: "2025 – 2026" },
      { role: "Founder", name: "Smart Energy Guardian", timeframe: "2025 – present" },
      { role: "Founder & President", name: "ENSAMIEN Parrainage", timeframe: "2025 – present" },
      {
        role: "Extracurricular Activities Manager",
        name: "Students' Association",
        timeframe: "2024 – 2026",
      },
      { role: "Sailing Instructor", name: "Yacht Club of Mohammedia", timeframe: "2018 – 2025" },
    ],
  },
  technical: {
    display: true,
    title: "Skills",
    spokenLanguages: person.languages,
    skills: [
      {
        title: "Security",
        tags: [
          { name: "Penetration testing" },
          { name: "Burp Suite" },
          { name: "Nmap" },
          { name: "Metasploit" },
          { name: "Threat modeling" },
          { name: "Supply-chain security" },
          { name: "OSINT" },
          { name: "CTFs" },
        ],
      },
      {
        title: "Cloud & DevOps",
        tags: [
          { name: "AWS" },
          { name: "Azure" },
          { name: "Kubernetes" },
          { name: "Docker" },
          { name: "Terraform" },
          { name: "GitHub Actions" },
          { name: "Linux" },
        ],
      },
      {
        title: "Development",
        tags: [
          { name: "Python" },
          { name: "TypeScript" },
          { name: "Go" },
          { name: "Rust" },
          { name: "Java" },
          { name: "C/C++" },
          { name: "Next.js" },
          { name: "React" },
          { name: "Spring Boot" },
          { name: "FastAPI" },
          { name: "PostgreSQL" },
          { name: "MySQL" },
          { name: "Git" },
        ],
      },
    ],
  },
};

const projects: Projects = {
  display: true,
  title: "Projects",
  items: [
    {
      title: "Smart Energy Guardian",
      description:
        "AI and Industrial IoT platform for predictive maintenance in manufacturing SMEs. 90% time-to-failure accuracy and 20% less energy in an industrial simulation.",
      highlight: "1st Falling Walls Lab Morocco · 1st AGIOS v2 · Capgemini Techathon finalist",
      tags: ["Next.js", "FastAPI", "MQTT", "InfluxDB", "Anomaly detection"],
      image: "/images/featured/Techathon.jpg",
      imageAlt: "Presenting Smart Energy Guardian at the Capgemini Engineering Techathon 2025",
      // TODO(houssam): the SEG-S repo is private. Add a public GitHub or demo URL if you have one.
      links: {},
    },
    {
      title: "Orchestrate AI agent",
      description:
        "Solo 24-hour message-routing agent. A rule-based scorer in place of an LLM step took accuracy from 39% to 54%.",
      tags: ["Python", "AI agents", "LLMs"],
      links: {
        github: "https://github.com/H0ussamCl4p/Orch26Hack-MssgNotifRouter",
      },
    },
    {
      title: "HCShell",
      description: "Unix-like shell in Rust: processes, pipelines, parsing, history.",
      tags: ["Rust", "Unix"],
      links: {
        github: "https://github.com/H0ussamCl4p/HCShell",
      },
    },
    {
      title: "MyDistro",
      description: "Minimal Linux distribution from scratch: kernel, BusyBox, root filesystem, init.",
      tags: ["Linux", "BusyBox"],
      links: {
        github: "https://github.com/H0ussamCl4p/MyDistro",
      },
    },
    {
      title: "ATLAS",
      description: "Football tactical analysis from raw match video, built in 48 hours.",
      tags: ["Python", "Computer vision"],
      links: {
        github: "https://github.com/H0ussamCl4p/Atlas-RN-Sport",
      },
    },
  ],
};

const awards: Awards = {
  display: true,
  title: "Awards & Leadership",
  items: [
    { title: "Falling Walls Lab 2026", detail: "1st in Morocco, Global Finalist in Berlin (Nov 2026)" },
    { title: "OlympICTs CTF 2026", detail: "1st worldwide in the qualifier" },
    { title: "AGIOS v2 2026", detail: "1st prize with Smart Energy Guardian" },
    { title: "HackerRank Orchestrate 2026", detail: "1st in Morocco, 106th of 1,983" },
    { title: "Award of Excellence 2025/26", detail: "Hassan II University" },
  ],
  footnote: (
    <>
      Also: recognised at the Hassan II University Forum of Excellence (July 2026) · 3rd ENSEM
      Hackathon · finalist at JNITI 2026 and Ramadan AI
    </>
  ),
  certifications: ["Fortinet NSE 4", "Security Blue Team OSINT", "TryHackMe Pre Security"],
};

const designs: Designs = {
  path: "/designs",
  label: "Designs",
  title: `Designs – ${person.name}`,
  description: `Posters, stickers and event visuals designed by ${person.name} for student clubs and events.`,
  images: [],
};

export { person, social, home, about, projects, awards, designs };
