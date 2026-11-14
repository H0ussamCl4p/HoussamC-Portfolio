import { About, Awards, Designs, Home, Person, Projects, Social } from "@/types";

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
  openTo: (
    <>
      Summer 2027 internships (industry or research) and part-time remote roles during my studies,
      in Germany, Australia or Japan.
    </>
  ),
  featuredPosts: {
    display: true,
    title: "Highlights",
    // Newest first. Posts with an empty link are hidden until you paste the URL.
    posts: [
      {
        name: "Falling Walls Lab Global Finale, Berlin 2026",
        // TODO(houssam): add the photo at public/images/featured/FWL-Berlin-2026.jpg and set image.
        // TODO(houssam): paste the LinkedIn post URL below; the card stays hidden until then.
        link: "",
        description:
          "Pitched “Breaking the Wall of Industrial Energy Waste” for Morocco at the Global Finale.",
      },
      {
        name: "OlympICTs CTF 2026",
        // TODO(houssam): paste the LinkedIn post URL (and optionally add an image in public/images/featured/).
        link: "",
        description: "1st place worldwide in the qualifier, on to the Barcelona final.",
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
        description: "Smart Energy Guardian: a concrete approach to industrial energy optimisation.",
      },
      {
        name: "MCPC 2025",
        image: "/images/featured/MCPC.jpg",
        link: "https://www.linkedin.com/posts/houssam-choubik_mcpc-ensamcasablanca-competitiveprogramming-activity-7415365095494492160-OFEu",
        description:
          "Competed at the Moroccan Collegiate Programming Contest, 19 to 21 September 2025 at UM6P College of Computing, Rabat.",
      },
      {
        name: "Forum ENSAM Casablanca Entreprises 2025",
        image: "/images/featured/FEE-2025.jpg",
        link: "https://www.linkedin.com/posts/houssam-choubik_ensamcasablanca-forumensamcasa-organizingcommittee-activity-7395544213725093888-3NEx",
        description: "On the organizing committee of the school's 2025 company forum.",
      },
    ],
  },
  subline: (
    <>
      Cybersecurity &amp; Cloud Computing engineering student at ENSAM Casablanca (Hassan II
      University, class of 2028) and Falling Walls Lab 2026 Global Finalist representing Morocco in
      Berlin. I build secure cloud and Industrial IoT systems, from DevSecOps pipelines to Smart
      Energy Guardian, an AI platform that cuts industrial energy waste.
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
        description:
          "Software supply-chain security: provenance with SBOMs and artifact signatures, and LLM-assisted vulnerability triage.",
        achievements: [
          "Built a CI/CD pipeline for a Kubernetes microservices app with the EU Cyber Resilience Act in mind: Semgrep and Trivy scans block critical issues, every image gets an SBOM and a keyless cosign signature, and Kyverno refuses unsigned images.",
          "Wrote a Python tool that uses an LLM to help triage vulnerabilities (SSVC, EPSS, CISA KEV). The final decision stays in a fixed rule table, inputs are cleaned against prompt injection and sensitive cases go to a human. It handled 25 real findings with no failures and is covered by 78 unit tests.",
          "Cut the container image from 89 to 31 components (190 MB to 83 MB) and raised the cluster's Kubescape NSA score from 67.6 to 73.3.",
          "Automated a test run on AWS EKS with Terraform and Prowler, and wrote a cost study for a security-as-a-service offer.",
        ],
        skills: [
          "DevSecOps",
          "SBOM",
          "Supply-chain security",
          "LLMs",
          "Docker",
          "Kubernetes",
          "AWS EKS",
          "Terraform",
          "cosign",
          "Kyverno",
          "Trivy",
          "Semgrep",
        ],
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
        description:
          "Built a full-stack web application to manage vaccination at border points, with Spring Boot, React and MySQL.",
        achievements: [
          "Built secure REST API endpoints for health data on a Spring Boot back-end, with a React front-end.",
          "Designed the MySQL database and looked after its data model and day-to-day management.",
        ],
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
        description: (
          <>
            Engineering degree (Ingénieur d&apos;État), Cybersecurity &amp; Cloud Computing.
            Integrated preparatory cycle 2023 – 2025, engineering cycle 2025 – 2028.
          </>
        ),
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
      {
        role: "Organizer (Lead)",
        name: "GDG on Campus ENSAM Casablanca",
        timeframe: "2026 – 2027",
        description: "Previously Outreach Manager, 2025 – 2026.",
      },
      {
        role: "Founder",
        name: "Smart Energy Guardian",
        timeframe: "2025 – present",
        description:
          "AI and Industrial IoT platform for predictive maintenance and energy optimisation in manufacturing SMEs.",
      },
      {
        role: "Founder & President",
        name: "ENSAMIEN Parrainage",
        timeframe: "2025 – present",
        description: "Student mentoring program at ENSAM Casablanca.",
      },
      {
        role: "Extracurricular Activities Manager",
        name: "Students' Association, ENSAM Casablanca",
        timeframe: "2024 – 2026",
      },
      {
        role: "Organizing committee",
        name: "Forum ENSAM Casablanca Entreprises 2025",
        timeframe: "2025",
      },
      {
        role: "Dinghy Sailing Instructor",
        name: "Yacht Club of Mohammedia",
        timeframe: "2018 – 2025",
      },
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
          { name: "Nmap" },
          { name: "Metasploit" },
          { name: "Burp Suite" },
          { name: "Threat modeling (STRIDE)" },
          { name: "Vulnerability triage (SSVC, EPSS, KEV)" },
          { name: "SBOM & supply-chain security" },
          { name: "OSINT" },
          { name: "CTFs" },
          { name: "Fortinet NSE 4" },
        ],
      },
      {
        title: "Cloud & DevOps",
        tags: [
          { name: "AWS (EKS, IAM, ECR, S3)" },
          { name: "Azure" },
          { name: "Kubernetes" },
          { name: "Docker" },
          { name: "Terraform" },
          { name: "GitHub Actions" },
          { name: "Trivy" },
          { name: "Semgrep" },
          { name: "cosign" },
          { name: "Kyverno" },
          { name: "Prowler" },
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
          { name: "Bash" },
          { name: "Next.js" },
          { name: "React" },
          { name: "Spring Boot" },
          { name: "FastAPI" },
          { name: "PostgreSQL" },
          { name: "MySQL" },
          { name: "Git" },
          { name: "LLMs & RAG" },
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
        "AI and Industrial IoT platform for predictive maintenance and energy optimisation in manufacturing SMEs. Sensors feed unsupervised anomaly detection (Isolation Forest, LOF, One-Class SVM) that estimates time to failure with 90% accuracy, with a RAG assistant that suggests fixes. Reduced energy use by 20% in an industrial simulation.",
      highlight:
        "1st place Falling Walls Lab Morocco and AGIOS v2 (2026). 3rd at ENSEM Hackathon. Finalist at JNITI 2026, Ramadan AI and Capgemini Engineering Techathon 2025.",
      tags: [
        "Next.js",
        "FastAPI",
        "Docker",
        "MQTT",
        "InfluxDB",
        "PostgreSQL",
        "JWT/RBAC",
        "Anomaly detection",
      ],
      image: "/images/featured/Techathon.jpg",
      imageAlt: "Smart Energy Guardian team at the Capgemini Engineering Techathon 2025",
      // TODO(houssam): the SEG-S repo is private. Add a public GitHub or demo URL if you have one.
      links: {},
    },
    {
      title: "DevSecOps supply-chain pipeline (Dataprotect)",
      description:
        "CI/CD pipeline aligned with the EU Cyber Resilience Act: SBOMs, keyless-signed images with provenance, and policy enforcement on Kubernetes. Internal work, so no public code.",
      tags: ["Kubernetes", "AWS EKS", "Terraform", "cosign", "Kyverno", "Trivy", "Semgrep"],
      links: {
        details: "#experience-dataprotect",
      },
    },
    {
      title: "Orchestrate AI agent",
      description:
        "Solo 24-hour AI message-routing agent for the HackerRank Orchestrate Hackathon 2026. Replacing an LLM citation step with a deterministic rule-based scorer raised accuracy from 39% to 54% at zero API cost.",
      tags: ["Python", "AI agents", "LLMs"],
      links: {
        github: "https://github.com/H0ussamCl4p/Orch26Hack-MssgNotifRouter",
      },
    },
    {
      title: "HCShell",
      description: "Unix-like shell in Rust: process management, pipelines, parsing, history.",
      tags: ["Rust", "Unix", "Systems"],
      links: {
        github: "https://github.com/H0ussamCl4p/HCShell",
      },
    },
    {
      title: "MyDistro",
      description:
        "Minimal Linux distribution built from scratch: custom kernel, BusyBox, root filesystem, init.",
      tags: ["Linux", "Kernel", "BusyBox", "Shell"],
      links: {
        github: "https://github.com/H0ussamCl4p/MyDistro",
      },
    },
    {
      title: "ATLAS",
      description:
        "AI football tactical analysis from raw match video, built in 48 hours at the RNSport Hackathon 2026.",
      tags: ["Python", "TypeScript", "Computer vision"],
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
    // Update this single entry with the Berlin result after the Global Finale.
    <>
      <strong>Falling Walls Lab 2026, Global Finalist for Morocco.</strong> 1st place at Falling
      Walls Lab Morocco, then the Global Finale in Berlin (November 2026) with the pitch
      &ldquo;Breaking the Wall of Industrial Energy Waste&rdquo;. Recognised at the Hassan II
      University Forum of Excellence (July 2026).
    </>,
    <>
      <strong>OlympICTs CTF 2026 (MWCapital), 1st place worldwide</strong> in the qualifier with
      1,500 points; qualified for the Barcelona final.
    </>,
    <>
      <strong>Smart Energy Guardian:</strong> 1st prize AGIOS v2 2026, 3rd place ENSEM Hackathon,
      finalist at Capgemini Engineering Techathon 2025, JNITI 2026 and Ramadan AI.
    </>,
    <>
      <strong>HackerRank Orchestrate Hackathon 2026, 1st in Morocco</strong>, 106th of 1,983
      worldwide.
    </>,
    <>
      <strong>Award of Excellence in Extracurricular Activities 2025/2026</strong>, Hassan II
      University of Casablanca.
    </>,
  ],
  footnote: (
    <>
      Also competed in: MCPC 2025 (UM6P), AKASEC CTF 2025, Cipher Challenge (UM6P), ECPC (ENSAM).
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
