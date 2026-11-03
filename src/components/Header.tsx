"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Fade, Flex, Line, Row, ToggleButton } from "@once-ui-system/core";

import { routes, display, person, designs } from "@/resources";
import { useActiveSection } from "@/hooks/useActiveSection";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.scss";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string; // Optionally allow locale, defaulting to 'en-GB'
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  timeZone,
  locale = "en-GB",
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timeString = new Intl.DateTimeFormat(locale, options).format(now);
      setCurrentTime(timeString);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, [timeZone, locale]);

  return <>{currentTime}</>;
};

export default TimeDisplay;

// One-page sections linked from the header. Order matches the page.
const sections: Array<{ id: string; label: string; icon: string; hideOnPhone?: boolean }> = [
  { id: "about", label: "About", icon: "person" },
  { id: "experience", label: "Experience", icon: "rocket", hideOnPhone: true },
  { id: "projects", label: "Projects", icon: "code" },
  { id: "awards", label: "Awards", icon: "trophy" },
  { id: "leadership", label: "Leadership", icon: "users", hideOnPhone: true },
  { id: "contact", label: "Contact", icon: "email" },
];

export const Header = () => {
  const pathname = usePathname() ?? "";
  const activeSectionId = useActiveSection(
    ["hero", ...sections.map((section) => section.id)],
    { defaultSectionId: "hero" },
  );
  const isHome = pathname === "/";

  return (
    <>
      <Fade
        s={{ hide: true }}
        fillWidth
        position="fixed"
        height="80"
        zIndex={9}
      />
      <Fade
        hide
        s={{ hide: false }}
        fillWidth
        position="fixed"
        bottom="0"
        to="top"
        height="80"
        zIndex={9}
      />
      <Row
        fitHeight
        className={styles.position}
        position="sticky"
        as="header"
        zIndex={9}
        fillWidth
        padding="8"
        horizontal="center"
        data-border="rounded"
        s={{
          position: "fixed",
        }}
      >
        <Row
          paddingLeft="12"
          fillWidth
          vertical="center"
          textVariant="body-default-s"
        >
          {display.location && <Row s={{ hide: true }}>{person.location}</Row>}
        </Row>
        <Row fillWidth horizontal="center">
          <Row
            background="page"
            border="neutral-alpha-weak"
            radius="m-4"
            shadow="l"
            padding="4"
            horizontal="center"
            zIndex={1}
          >
            <Row
              gap="4"
              vertical="center"
              textVariant="body-default-s"
              suppressHydrationWarning
            >
              {routes["/"] && (
                <ToggleButton
                  prefixIcon="home"
                  size="s"
                  href="/#hero"
                  selected={isHome && activeSectionId === "hero"}
                  aria-label="Home"
                />
              )}
              <Line background="neutral-alpha-medium" vert maxHeight="24" />
              {/* Section links: labels on wide screens, icons below 1024px */}
              <Row as="nav" aria-label="Sections" gap="4" vertical="center" m={{ hide: true }}>
                {sections.map((section) => (
                  <ToggleButton
                    key={section.id}
                    href={`/#${section.id}`}
                    label={section.label}
                    selected={isHome && activeSectionId === section.id}
                  />
                ))}
              </Row>
              <Row as="nav" aria-label="Sections" gap="2" vertical="center" hide m={{ hide: false }}>
                {sections.map((section) => (
                  <Row key={section.id} s={section.hideOnPhone ? { hide: true } : undefined}>
                    <ToggleButton
                      size="s"
                      href={`/#${section.id}`}
                      prefixIcon={section.icon}
                      aria-label={section.label}
                      selected={isHome && activeSectionId === section.id}
                    />
                  </Row>
                ))}
              </Row>
              <Line background="neutral-alpha-medium" vert maxHeight="24" />
              {routes["/designs"] && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="designs"
                      href="/designs"
                      label={designs.label}
                      selected={pathname.startsWith("/designs")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      size="s"
                      prefixIcon="designs"
                      href="/designs"
                      aria-label={designs.label}
                      selected={pathname.startsWith("/designs")}
                    />
                  </Row>
                </>
              )}
              {display.themeSwitcher && (
                <>
                  <Line background="neutral-alpha-medium" vert maxHeight="24" />
                  <ThemeToggle />
                </>
              )}
            </Row>
          </Row>
        </Row>
        <Flex fillWidth horizontal="end" vertical="center">
          <Flex
            paddingRight="12"
            horizontal="end"
            vertical="center"
            textVariant="body-default-s"
            gap="20"
          >
            <Flex s={{ hide: true }}>
              {display.time && <TimeDisplay timeZone={person.location} />}
            </Flex>
          </Flex>
        </Flex>
      </Row>
    </>
  );
};
