import type { IconName } from "@/resources/icons";
import type { zones } from "tzdata";

/**
 * IANA time zone string (e.g., 'Asia/Calcutta', 'Europe/Vienna').
 * See: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 */
export type IANATimeZone = Extract<keyof typeof zones, string>; // Narrow to string keys for React usage

/**
 * Represents a person featured in the portfolio.
 */
export type Person = {
  /** First name of the person */
  firstName: string;
  /** Last name of the person */
  lastName: string;
  /** The name you want to display, allows variations like nicknames */
  name: string;
  /** Role or job title */
  role: string;
  /** Path to avatar image */
  avatar: string;
  /** Email address, split so it isn't in the HTML as a plain string. Joined on click. */
  email: {
    user: string;
    domain: string;
  };
  /** Path to a downloadable CV in /public (optional) */
  cv?: string;
  /** IANA time zone location */
  location: IANATimeZone;
  /** Languages spoken */
  languages?: string[];
};

/**
 * Social link configuration.
 */
export type Social = Array<{
  /** Name of the social platform */
  name: string;
  /** Icon for the social platform
   * The icons are a part of "src/resources/icons.ts" file.
   * If you need a different icon, import it there and reference it everywhere else
   */
  icon: IconName;
  /**
   * The link to the social platform
   *
   * The link is not validated by code, make sure it's correct
   */
  link: string;
}>;

/**
 * Base interface for page configuration with common properties.
 */
export interface BasePageConfig {
  /** Path to the page
   *
   * The path should be relative to the public directory
   */
  path: `/${string}` | string;
  /** Label for navigation or display */
  label: string;
  /** Title of the page */
  title: string;
  /** Description for SEO and metadata */
  description: string;
  /** OG Image should be put inside `public/images` folder */
  image?: `/images/${string}` | string;
}

/**
 * Featured LinkedIn post item.
 */
export type FeaturedPost = {
  /** Display name for the featured post */
  name: string;
  /** Path to the image from the LinkedIn post (optional, a placeholder is shown otherwise) */
  image?: string;
  /** Link to the LinkedIn post. Posts with an empty link are not displayed. */
  link?: string;
  /** Optional description */
  description?: string;
};

/**
 * Home page configuration.
 */
export interface Home extends BasePageConfig {
  /** The image to be displayed in metadata
   *
   * The image needs to be put inside `/public/images/` directory
   */
  image?: `/images/${string}` | string;
  /** The headline of the home page */
  headline: React.ReactNode;
  /** Short subtitle shown under the headline in the hero */
  subtitle: string;
  /** Small mono label, top-left of the hero (e.g. "~/casablanca") */
  eyebrow?: string;
  /** Small mono label, top-right of the hero (e.g. coordinates) */
  coordinates?: string;
  /** Mono credentials line under the divider, joined with "·" */
  credentials?: string[];
  /** "Open to opportunities" line shown in the hero and contact section */
  openTo?: React.ReactNode;
  /** Featured LinkedIn posts section */
  featuredPosts?: {
    display: boolean;
    title: string;
    posts: FeaturedPost[];
  };
  /** The sub text which appears below the headline */
  subline: React.ReactNode;
}

/**
 * About page configuration.
 * @description Configuration for the About page, including sections for table of contents, avatar, calendar, introduction, work experience, studies, and technical skills.
 */
export interface About extends BasePageConfig {
  /** Table of contents configuration */
  tableOfContent: {
    /** Whether to display the table of contents */
    display: boolean;
    /** Whether to show sub-items in the table of contents */
    subItems: boolean;
  };
  /** Avatar section configuration */
  avatar: {
    /** Whether to display the avatar */
    display: boolean;
  };
  /** Calendar section configuration */
  calendar: {
    /** Whether to display the calendar */
    display: boolean;
    /** Link to the calendar */
    link: string;
  };
  /** Introduction section */
  intro: {
    /** Whether to display the introduction */
    display: boolean;
    /** Title of the introduction section */
    title: string;
    /** Description of the introduction section */
    description: React.ReactNode;
  };
  /** Work experience section */
  work: {
    /** Whether to display work experience */
    display: boolean;
    /** Title for the work experience section */
    title: string;
    /** List of work experiences */
    experiences: Array<{
      /** Optional anchor id, so other sections can link to this entry */
      id?: string;
      /** Company name */
      company: string;
      /** Company logo path */
      logo?: string;
      /** Timeframe of employment */
      timeframe: string;
      /** Role or job title */
      role: string;
      /** Employment type (Full-time, Part-time, Internship, etc.) */
      type?: string;
      /** Work location (Remote, Hybrid, On-site) */
      location?: string;
      /** Whether this is a featured experience */
      featured?: boolean;
      /** Whether this is a current position */
      current?: boolean;
      /** Job description */
      description?: string;
      /** Achievements at the company */
      achievements: React.ReactNode[];
      /** Skills used or developed */
      skills?: string[];
      /** Related links */
      links?: {
        details?: string;
        connect?: string;
      };
      /** Images related to the experience */
      images?: Array<{
        /** Image source path */
        src: string;
        /** Image alt text */
        alt: string;
        /** Image width ratio */
        width: number;
        /** Image height ratio */
        height: number;
      }>;
    }>;
  };
  /** Studies/education section */
  studies: {
    /** Whether to display studies section */
    display: boolean;
    /** Title for the studies section */
    title: string;
    /** List of institutions attended */
    institutions: Array<{
      /** Institution name */
      name: string;
      /** Description of studies */
      description: React.ReactNode;
      /** Institution logo */
      logo?: string;
      /** Timeframe */
      timeframe?: string;
      /** Location */
      location?: string;
    }>;
  };
  /** Extracurricular activities section */
  parascolaire?: {
    /** Whether to display parascolaire section */
    display: boolean;
    /** Title for the parascolaire section */
    title: string;
    /** List of extracurricular activities */
    activities: Array<{
      /** Organization or club name */
      name: string;
      /** Logo path */
      logo?: string;
      /** Role in the organization */
      role: string;
      /** Timeframe */
      timeframe?: string;
      /** Description of activities */
      description?: string;
      /** Achievements */
      achievements?: React.ReactNode[];
    }>;
  };
  /** Technical skills section */
  technical: {
    /** Whether to display technical skills section */
    display: boolean;
    /** Title for the technical skills section */
    title: string;
    /** Languages spoken, shown as chips under the skills */
    spokenLanguages?: string[];
    /** List of technical skills */
    skills: Array<{
      /** Skill title */
      title: string;
      /** Skill description */
      description?: React.ReactNode;
      /** Skill tags */
      tags?: Array<{
        name: string;
        icon?: string;
      }>;
      /** Images related to the skill */
      images?: Array<{
        /** Image source path */
        src: string;
        /** Image alt text */
        alt: string;
        /** Image width ratio */
        width: number;
        /** Image height ratio */
        height: number;
      }>;
    }>;
  };
}

/**
 * Designs page configuration.
 * @description Configuration for the Designs page, including metadata, navigation label, and image list.
 */
export interface Designs extends BasePageConfig {
  /** List of images in the designs section */
  images: Array<{
    /** Image source path */
    src: string;
    /** Image alt text */
    alt: string;
    /** Image orientation (horizontal/vertical) */
    orientation: string;
  }>;
}

/**
 * Project card shown in the Projects section.
 */
export type Project = {
  title: string;
  /** One or two sentences */
  description: string;
  /** Optional line for awards or results */
  highlight?: string;
  /** Stack or topic tags */
  tags: string[];
  /** Optional cover image in /public */
  image?: string;
  /** Alt text for the cover image */
  imageAlt?: string;
  /** Links. Leave a link out (or empty) to hide its button. */
  links?: {
    github?: string;
    demo?: string;
    /** Internal anchor, e.g. "#experience-dataprotect" */
    details?: string;
  };
};

export interface Projects {
  display: boolean;
  title: string;
  items: Project[];
}

/**
 * Honors & Awards section.
 */
export interface Awards {
  display: boolean;
  title: string;
  /** Each entry: bold title, then a short detail */
  items: Array<{ title: string; detail: React.ReactNode }>;
  /** Small line under the list */
  footnote?: React.ReactNode;
  /** Certifications, shown as a short list */
  certifications?: string[];
}
