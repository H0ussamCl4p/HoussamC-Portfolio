import {
  DataStyleConfig,
  DisplayConfig,
  FontsConfig,
  RoutesConfig,
  SameAsConfig,
  SchemaConfig,
  StyleConfig,
} from "@/types";
import { home } from "./content";

// Used for canonical URLs, Open Graph tags, JSON-LD, robots.txt and sitemap.xml.
// Must be a domain you control (see SECURITY_AUDIT.md F-02).
const baseURL: string = "https://houssamc-portfolio.vercel.app";

const routes: RoutesConfig = {
  "/": true,
  "/about": false,
  "/designs": true,
};

const display: DisplayConfig = {
  location: true,
  time: true,
  themeSwitcher: true,
};

// Fonts match the LinkedIn banner: geometric sans for text, monospace for labels.
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const fonts: FontsConfig = {
  heading: sans,
  body: sans,
  label: mono,
  code: mono,
};

// default customization applied to the HTML in the main layout.tsx
const style: StyleConfig = {
  theme: "system", // dark | light | system
  neutral: "sand", // sand | gray | slate | custom
  brand: "red", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan | custom
  accent: "red", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan | custom
  solid: "contrast", // color | contrast
  solidStyle: "flat", // flat | plastic
  border: "conservative", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "all", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
};

const dataStyle: DataStyleConfig = {
  variant: "flat", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 24, // default chart height
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

// default schema data
const schema: SchemaConfig = {
  logo: "",
  type: "Person",
  name: "Houssam Choubik",
  description: home.description,
  email: "",
};

// social links, used for JSON-LD sameAs
const sameAs: SameAsConfig = {
  github: "https://github.com/H0ussamCl4p",
  linkedin: "https://www.linkedin.com/in/houssam-choubik-5b4ba3316/",
};

export {
  display,
  routes,
  baseURL,
  fonts,
  style,
  schema,
  sameAs,
  dataStyle,
};
