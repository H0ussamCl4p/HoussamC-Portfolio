import { IconType } from "react-icons";

import {
  HiArrowUpRight,
  HiOutlineLink,
  HiArrowTopRightOnSquare,
  HiEnvelope,
  HiCalendarDays,
  HiArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineDocument,
  HiOutlineGlobeAsiaAustralia,
  HiOutlineRocketLaunch,
} from "react-icons/hi2";

import {
  PiHouseDuotone,
  PiUserCircleDuotone,
  PiGridFourDuotone,
  PiBookBookmarkDuotone,
  PiImageDuotone,
} from "react-icons/pi";

import {
  SiJavascript,
  SiNextdotjs,
  SiFigma,
  SiSupabase,
  SiReact,
  SiCss3,
  SiHtml5,
  SiTypescript,
  SiPython,
  SiDocker,
  SiKubernetes,
  SiAmazonwebservices,
  SiGooglecloud,
  SiLinux,
  SiGit,
  SiNodedotjs,
  SiTailwindcss,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiRust,
  SiGo,
  SiCplusplus,
  SiC,
  SiSpringboot,
  SiFlask,
  SiDjango,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
} from "react-icons/si";

import { FaJava } from "react-icons/fa";

import { FaDiscord, FaLinkedin, FaX, FaThreads, FaGithub } from "react-icons/fa6";

export const iconLibrary: Record<string, IconType> = {
  arrowUpRight: HiArrowUpRight,
  arrowRight: HiArrowRight,
  email: HiEnvelope,
  globe: HiOutlineGlobeAsiaAustralia,
  person: PiUserCircleDuotone,
  grid: PiGridFourDuotone,
  book: PiBookBookmarkDuotone,
  openLink: HiOutlineLink,
  calendar: HiCalendarDays,
  home: PiHouseDuotone,
  designs: PiImageDuotone,
  discord: FaDiscord,
  eye: HiOutlineEye,
  eyeOff: HiOutlineEyeSlash,
  linkedin: FaLinkedin,
  x: FaX,
  threads: FaThreads,
  arrowUpRightFromSquare: HiArrowTopRightOnSquare,
  document: HiOutlineDocument,
  rocket: HiOutlineRocketLaunch,
  github: FaGithub,
  
  // Tech stack icons
  javascript: SiJavascript,
  js: SiJavascript,
  typescript: SiTypescript,
  ts: SiTypescript,
  nextjs: SiNextdotjs,
  next: SiNextdotjs,
  react: SiReact,
  reactjs: SiReact,
  vue: SiVuedotjs,
  vuejs: SiVuedotjs,
  angular: SiAngular,
  svelte: SiSvelte,
  html5: SiHtml5,
  html: SiHtml5,
  css3: SiCss3,
  css: SiCss3,
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,
  
  // Backend & Languages
  nodejs: SiNodedotjs,
  node: SiNodedotjs,
  python: SiPython,
  rust: SiRust,
  go: SiGo,
  golang: SiGo,
  c: SiC,
  cpp: SiCplusplus,
  cplusplus: SiCplusplus,
  
  // Frameworks
  java: FaJava,
  spring: SiSpringboot,
  springboot: SiSpringboot,
  flask: SiFlask,
  django: SiDjango,
  
  // Cloud & DevOps
  docker: SiDocker,
  kubernetes: SiKubernetes,
  k8s: SiKubernetes,
  aws: SiAmazonwebservices,
  gcp: SiGooglecloud,
  googlecloud: SiGooglecloud,
  linux: SiLinux,
  git: SiGit,
  
  // Databases
  mongodb: SiMongodb,
  mongo: SiMongodb,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  mysql: SiMysql,
  
  // Design & Tools
  supabase: SiSupabase,
  figma: SiFigma,
};

export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;
