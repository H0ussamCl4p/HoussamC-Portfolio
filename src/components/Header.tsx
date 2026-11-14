"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { routes, display, person, designs } from "@/resources";
import { useActiveSection } from "@/hooks/useActiveSection";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.scss";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string;
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale = "en-GB" }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const format = new Intl.DateTimeFormat(locale, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const updateTime = () => setCurrentTime(format.format(new Date()));

    updateTime();
    const intervalId = setInterval(updateTime, 10_000);
    return () => clearInterval(intervalId);
  }, [timeZone, locale]);

  return <>{currentTime}</>;
};

// One-page sections linked from the header. Order matches the page.
const sections: Array<{ id: string; label: string }> = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "awards", label: "Awards" },
  { id: "contact", label: "Contact" },
];

const sectionIds = ["hero", ...sections.map((section) => section.id)];

export const Header = () => {
  const pathname = usePathname() ?? "";
  const activeSectionId = useActiveSection(sectionIds, { defaultSectionId: "hero" });
  const isHome = pathname === "/";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/#hero" className={styles.brand} aria-label={`${person.name}, home`}>
          houssam<span className={styles.dot}>.</span>
        </Link>

        <nav aria-label="Sections" className={styles.nav}>
          <ul className={styles.navList}>
            {sections.map((section) => {
              const active = isHome && activeSectionId === section.id;
              return (
                <li key={section.id}>
                  <Link
                    href={`/#${section.id}`}
                    className={styles.navLink}
                    aria-current={active ? "location" : undefined}
                  >
                    {section.label}
                  </Link>
                </li>
              );
            })}
            {routes["/designs"] && (
              <li>
                <Link
                  href="/designs"
                  className={styles.navLink}
                  aria-current={pathname.startsWith("/designs") ? "page" : undefined}
                >
                  {designs.label}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className={styles.meta}>
          {display.time && (
            <span className={styles.time} suppressHydrationWarning>
              CAS <TimeDisplay timeZone={person.location} />
            </span>
          )}
          {display.themeSwitcher && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
};
