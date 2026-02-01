import {
  About,
  Designs,
  Home,
  Newsletter,
  Person,
  Social,
} from "@/types";
import { Line, Logo, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Houssam",
  lastName: "CHOUBIK",
  name: `CHOUBIK Houssam`,
  role: "Cybersecurity & Cloud Computing Engineering Student",
  avatar: "/images/avatar.jpg",
  email: "choubikhoussam@gmail.com",
  location: "Africa/Casablanca", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English", "French"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}&apos;s Newsletter</>,
  description: <>My weekly newsletter about creativity and engineering</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
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
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Hello World !</>,
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
    href: "/work",
  },
  featuredPosts: {
    display: true,
    title: "Featured",
    posts: [
      {
        name: "Capgemini Engineering Techathon 2025",
        image: "/images/featured/Techathon.jpg",
        link: "https://www.linkedin.com/posts/houssam-choubik_industry-smartfactory-energyefficiency-activity-7422402895360212994-B6vv?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFBEJZgBerSRa2n18t3JoY82ptFr-ncoRD41",
        description: "Smart Energy Guardian : a concrete approach to industrial energy optimization !",
      },
      // Add more posts here
    ],
  },
  subline: (
    <>
      I&apos;m Houssam, a Cybersecurity & Cloud Computing Engineering Student at
      ENSAM Casablanca. I merge my interests in cybersecurity, IoT, and AI into projects that push technical boundaries and explore
      innovative solutions.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
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
        company: "Ministère de la santé et de la Protection Sociale",
        logo: "/images/logo/logo-ministere-sante.png",
        timeframe: "July 2025 - August 2025",
        role: "Systèmes d'information Intern",
        type: "Internship",
        location: "Hybrid",
        featured: true,
        current: false,
        description:
          "Developed a fullstack web application for border vaccination management using Spring Boot and React.",
        achievements: [
          "Built a complete full-stack web application using React and Spring Boot",
          "Implemented secure API endpoints for health data",
        ],
        skills: ["Spring Boot", "React", "MySQL"],
        links: {},
      },
    ],
  },
  studies: {
    display: true, 
    title: "Studies",
    institutions: [
      {
        name: "ENSAM Casablanca",
        description: <>Cybersecurity and Cloud Computing Engineering.</>,
        logo: "/images/logo/logoENsam.png",
        timeframe: "2023 - Present",
        location: "Casablanca, Morocco",
      },
    ],
  },
  parascolaire: {
    display: false,
    title: "Extracurricular",
    activities: [
      {
        role: "Member / President",
        name: "Club Name",
        logo: "/images/club-logo.png",
        timeframe: "2023 - Present",
        description: "Description of your extracurricular activity.",
        achievements: [
          "Achievement 1",
          "Achievement 2",
        ],
      },
      // Add more activities here
    ],
  },
  technical: {
    display: true,
    title: "Technologies I enjoy",
    skills: [
      {
        title: "Technologies",
        description: <></>,
        tags: [
          {
            name: "Rust",
            icon: "rust",
          },
          {
            name: "Docker",
            icon: "docker",
          },
          {
            name: "Linux",
            icon: "linux",
          },
          {
            name: "Spring Boot",
            icon: "springboot",
          },
          {
            name: "TypeScript",
            icon: "typescript",
          },
          {
            name: "Next.js",
            icon: "nextjs",
          },
          {
            name: "C",
            icon: "c",
          },
          {
            name: "C++",
            icon: "cpp",
          },
          {
            name: "Python",
            icon: "python",
          },
          {
            name: "Git",
            icon: "git",
          },
          {
            name: "MySQL",
            icon: "mysql",
          },
          {
            name: "Java",
            icon: "java",
          },
        ],
        images: [],
      },
    ],
  },
};

const designs: Designs = {
  path: "/designs",
  label: "Designs",
  title: `Designs – ${person.name}`,
  description: `A photo collection by ${person.name} (loaded from Google Drive)`,
  images: [],
};

export { person, social, newsletter, home, about, designs };
