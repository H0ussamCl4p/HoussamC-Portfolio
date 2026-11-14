import type { IconType } from "react-icons";

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
  SiCss,
  SiHtml5,
  SiTypescript,
  SiPython,
  SiDocker,
  SiKubernetes,
  SiTerraform,
  SiGithubactions,
  SiTrivy,
  SiBurpsuite,
  SiWireshark,
  SiMetasploit,
  SiFortinet,
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

import { FaJava, FaAws } from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";

import {
  FaDiscord,
  FaLinkedin,
  FaX,
  FaThreads,
  FaGithub,
  FaTrophy,
  FaUsers,
  FaFileArrowDown,
  FaCode,
  FaShieldHalved,
} from "react-icons/fa6";

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
  trophy: FaTrophy,
  users: FaUsers,
  download: FaFileArrowDown,
  code: FaCode,
  shield: FaShieldHalved,
  
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
  css3: SiCss,
  css: SiCss,
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
  aws: FaAws,
  azure: VscAzure,
  terraform: SiTerraform,
  githubactions: SiGithubactions,

  // Security tooling
  trivy: SiTrivy,
  burpsuite: SiBurpsuite,
  wireshark: SiWireshark,
  metasploit: SiMetasploit,
  fortinet: SiFortinet,
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
