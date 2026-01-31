import {
  About,
  Designs,
  Home,
  Newsletter,
  Person,
  Social,
  Work,
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
    display: true,
    title: "Introduction",
    description: (
      <>
        Hey! I&apos;m Houssam, an engineering student at ENSAM Casablanca with a
        passion for informatics, AI, mechanics, electronics, and aeronautics. I
        thrive on exploring innovative technologies and designing creative
        solutions that bridge these dynamic fields.
      </>
    ),
  },
  work: {
    display: true,
    title: "Experience",
    experiences: [
      {
        company: "Ministry of Health and Social Protection",
        logo: "/images/ministry-logo.png",
        timeframe: "July 2025 - August 2025",
        role: "Fullstack Intern",
        type: "Internship",
        location: "Hybrid",
        featured: true,
        current: false,
        description:
          "Developed a fullstack web application for border vaccination management using Spring Boot and React.",
        achievements: [
          "Built end-to-end vaccination tracking system",
          "Implemented secure API endpoints for health data",
        ],
        skills: ["Spring Boot", "React", "PostgreSQL", "Docker"],
        links: {},
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
      {
        name: "ENSAM Casablanca",
        description: <>Cybersecurity and Cloud Computing Engineering.</>,
      },
    ],
  },
  technical: {
    display: false, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "Frontend Development",
        description: <>Building frontend apps using :</>,
        tags: [
          {
            name: "JavaScript",
            icon: "javascript",
          },
          {
            name: "Next.js",
            icon: "nextjs",
          },
          {
            name: "React",
            icon: "reactjs",
          },
          {
            name: "HTML",
            icon: "html5",
          },
          {
            name: "CSS",
            icon: "css3",
          },
        ],
        // optional: leave the array empty if you don't want to display images
        images: [],
      },
    ],
  },
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name} (loaded from Google Drive)`,
};

const designs: Designs = {
  path: "/designs",
  label: "Designs",
  title: `Designs – ${person.name}`,
  description: `A photo collection by ${person.name} (loaded from Google Drive)`,
  images: [],
};

export { person, social, newsletter, home, about, work, designs };
