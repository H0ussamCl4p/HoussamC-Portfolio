import {
  About,
  Blog,
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
      ENSAM Casablanca. I merge my interests in cybersecurity, IoT,
      <br /> and AI into projects that push technical boundaries and explore
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
    display: false, // set to false to hide this section
    title: "Experience",
    experiences: [
      {
        company: "Ministry of Health and Social Protection",
        timeframe: "July 2025 - August 2025",
        role: "Fullstack Intern",
        achievements: [
          "Coded a fullstack web application about vaccination in the border using spring boot and react.",
        ],
        images: [],
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

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const designs: Designs = {
  path: "/designs",
  label: "Designs",
  title: `Designs – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  images: [],
};

export { person, social, newsletter, home, about, blog, work, designs };
