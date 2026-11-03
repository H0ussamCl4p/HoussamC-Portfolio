import {
  About,
  Awards,
  Designs,
  Home,
  Newsletter,
  Person,
  Projects,
  Social,
} from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

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

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}&apos;s Newsletter</>,
  description: <>My weekly newsletter about creativity and engineering</>,
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
  title: `${person.name} · Cloud Security & DevSecOps`,
  description:
    "Houssam Choubik, Cybersecurity & Cloud Computing engineering student at ENSAM Casablanca. Cloud security and DevSecOps, CTF player, Falling Walls Lab Morocco winner.",
  headline: <>Hello World !</>,
  subtitle: `${person.role} · Cloud Security & DevSecOps`,
  badges: [
    "Falling Walls Lab Morocco Winner",
    "OlympICTs CTF 1st worldwide",
    "GDG on Campus Lead",
  ],
  featured: {
    display: false,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Welcome</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured
        </Text>
      </Row>
    ),
    href: "/#projects",
  },
  featuredPosts: {
    display: true,
    title: "Highlights",
    // Newest first. Posts with an empty link are hidden until you paste the URL.
    posts: [
      {
        name: "Falling Walls Lab Morocco 2026",
        // TODO(houssam): paste the LinkedIn post URL (and optionally add an image in public/images/featured/).
        link: "",
        description: "Won the national Falling Walls Lab in Rabat with Smart Energy Guardian.",
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
      I&apos;m an engineering student in Cybersecurity and Cloud Computing at ENSAM Casablanca
      (Hassan II University), graduating in 2028. I work on cloud and software supply-chain
      security: this summer at Dataprotect I built a DevSecOps pipeline with signed, verifiable
      container images and an LLM-assisted vulnerability triage tool. Outside of that I play CTFs,
      build systems projects in Rust and C, and lead the Google Developer Group on Campus at my
      school.
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
        company: "Dataprotect, Cloud Security Business Unit",
        // TODO(houssam): add public/images/logo/dataprotect.png and set logo: "/images/logo/dataprotect.png"
        timeframe: "Jul 2026 – Sep 2026",
        role: "Cloud Security Intern (PFA)",
        type: "Internship",
        location: "Casablanca, Morocco · On-site",
        featured: true,
        current: false,
        description:
          "Built a DevSecOps CI/CD pipeline aligned with the EU Cyber Resilience Act, covering SBOM generation, image signing and provenance, and policy enforcement on Kubernetes.",
        achievements: [
          "Integrated Semgrep, Trivy, cosign and Kyverno into the pipeline, deploying to AWS EKS provisioned with Terraform.",
          "Cut container image components from 89 to 31 by hardening base images.",
          "Raised the cluster's Kubescape security score from 67.6 to 73.3.",
          "Built an LLM-assisted vulnerability triage tool to prioritise scanner findings.",
        ],
        skills: [
          "Kubernetes",
          "AWS EKS",
          "Terraform",
          "Sigstore",
          "Kyverno",
          "Trivy",
          "Semgrep",
          "LLMs",
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
          // TODO(houssam): confirm Spring Security/JWT before adding it to this line.
          "Implemented authenticated, role-based API endpoints for health data.",
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
          <>Engineering degree (Ingénieur d&apos;État), Cybersecurity &amp; Cloud Computing</>
        ),
        logo: "/images/logo/logoENsam.png",
        timeframe: "2025 – 2028 (expected)",
        location: "Casablanca, Morocco",
      },
      {
        name: "ENSAM Casablanca",
        description: <>Integrated preparatory cycle</>,
        logo: "/images/logo/logoENsam.png",
        timeframe: "2023 – 2025",
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
        name: "Google Developer Group on Campus ENSAM Casablanca",
        timeframe: "2026 – 2027",
        description: "Previously Outreach Manager, 2025 – 2026.",
      },
      {
        role: "Founder & President",
        name: "ENSAMIEN Parrainage",
        // TODO(houssam): add the start year, e.g. timeframe: "2025 – Present"
        description: "Student mentoring program at ENSAM Casablanca.",
      },
      {
        role: "Organizing committee",
        name: "Forum ENSAM Casablanca Entreprises 2025",
        timeframe: "2025",
      },
    ],
  },
  technical: {
    display: true,
    title: "Skills",
    spokenLanguages: person.languages,
    skills: [
      {
        title: "Cloud & DevSecOps",
        tags: [
          { name: "AWS", icon: "aws" },
          { name: "Azure", icon: "azure" },
          { name: "Docker", icon: "docker" },
          { name: "Kubernetes", icon: "kubernetes" },
          { name: "Terraform", icon: "terraform" },
          { name: "GitHub Actions", icon: "githubactions" },
          { name: "Kyverno" },
          { name: "cosign/Sigstore" },
          { name: "Trivy", icon: "trivy" },
          { name: "Semgrep" },
          { name: "Kubescape" },
        ],
      },
      {
        title: "Security",
        tags: [
          { name: "Burp Suite", icon: "burpsuite" },
          { name: "Nmap" },
          { name: "Metasploit", icon: "metasploit" },
          { name: "Wireshark", icon: "wireshark" },
          { name: "Ghidra" },
          { name: "x64dbg" },
          { name: "FLARE-VM" },
          { name: "Fortinet (FortiGate/FortiAnalyzer)", icon: "fortinet" },
        ],
      },
      {
        title: "Languages",
        tags: [
          { name: "Python", icon: "python" },
          { name: "Rust", icon: "rust" },
          { name: "Go", icon: "go" },
          { name: "C", icon: "c" },
          { name: "C++", icon: "cpp" },
          { name: "Java", icon: "java" },
          { name: "TypeScript", icon: "typescript" },
        ],
      },
      {
        title: "Web & data",
        tags: [
          { name: "Spring Boot", icon: "springboot" },
          { name: "React", icon: "react" },
          { name: "Next.js", icon: "nextjs" },
          { name: "MySQL", icon: "mysql" },
          { name: "PostgreSQL", icon: "postgresql" },
        ],
      },
      {
        title: "Systems",
        tags: [
          { name: "Linux", icon: "linux" },
          { name: "Git", icon: "git" },
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
        "AI and IoT predictive maintenance and energy optimisation for industrial sites. Reduced energy consumption by 20% in an industrial simulation.",
      highlight:
        "Won Falling Walls Lab Morocco 2026 and AGIOS v2. 3rd at ENSEM Hackathon. Finalist at JNITI 2026, Ramadan AI and Capgemini Engineering Techathon 2025.",
      tags: ["AI", "IoT", "Predictive maintenance", "Energy optimisation"],
      image: "/images/featured/Techathon.jpg",
      imageAlt: "Smart Energy Guardian team at the Capgemini Engineering Techathon 2025",
      // TODO(houssam): the SEG-S repo is private. Add a public GitHub or demo URL if you have one.
      links: {},
    },
    {
      title: "DevSecOps supply-chain pipeline (Dataprotect)",
      description:
        "CI/CD pipeline aligned with the EU Cyber Resilience Act: SBOMs, signed images with provenance, and policy enforcement on AWS EKS. Internal work, so no public code.",
      tags: ["Kubernetes", "AWS EKS", "Terraform", "Sigstore", "Kyverno", "Trivy", "Semgrep"],
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
  title: "Honors & Awards",
  items: [
    // Update this single entry with the Berlin result after the Global Finale.
    <>
      <strong>Falling Walls Lab 2026, Global Finalist for Morocco.</strong> Won the national Lab in
      Rabat; pitching &quot;Breaking the Wall of Industrial Energy Waste&quot; at the Global Finale
      in Berlin, November 2026.
    </>,
    <>
      <strong>OlympICTs CTF 2026 (MWCapital), 1st place worldwide</strong> in the qualifier (1,500
      points); qualified for the Barcelona final.
    </>,
    <>
      <strong>HackerRank Orchestrate Hackathon 2026, 1st in Morocco</strong>, 106th of 1,983
      worldwide.
    </>,
    <>
      <strong>AGIOS v2 2026, 1st prize</strong> with Smart Energy Guardian.
    </>,
    <>
      <strong>Award of Excellence in Extracurricular Activities 2025/2026</strong>, Hassan II
      University of Casablanca, for the Falling Walls and AGIOS wins.
    </>,
    <>
      <strong>ENSEM Hackathon, 3rd prize</strong> with Smart Energy Guardian.
    </>,
  ],
  footnote: (
    <>
      Also competed in: AKASEC CTF 2025, Cipher Challenge (UM6P), MCPC 2025 (UM6P), ECPC (ENSAM).
    </>
  ),
};

const designs: Designs = {
  path: "/designs",
  label: "Designs",
  title: `Designs – ${person.name}`,
  description: `Posters, stickers and event visuals designed by ${person.name} for student clubs and events.`,
  images: [],
};

export { person, social, newsletter, home, about, projects, awards, designs };
