import {
  Heading,
  Text,
  Button,
  RevealFx,
  Column,
  Badge,
  Row,
  IconButton,
  Icon,
  Schema,
  Meta,
  Line,
} from "@once-ui-system/core";
import { home, about, person, baseURL, social } from "@/resources";
import { Mailchimp } from "@/components";
import styles from "@/app/home-sections.module.scss";
import Image from "next/image";

// Drive content is cached via fetch() revalidate.
// Keep the page itself SSR/streamable, but ensure ISR-friendly caching.
export const revalidate = 3600;

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function Home() {
  // Get unique skills with their icons
  const techStack = about.technical.skills
    .flatMap((skill) => skill.tags || [])
    .filter((tag): tag is { name: string; icon: string } => Boolean(tag.name && tag.icon))
    .reduce((acc, tag) => {
      if (!acc.find((t) => t.name === tag.name)) {
        acc.push({ name: tag.name, icon: tag.icon });
      }
      return acc;
    }, [] as { name: string; icon: string }[]);

  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <section id="hero" className={`onepage-section ${styles.hero}`}>
        <div className={styles.stars} />
        <div className={styles.heroInner}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatarRing}>
              <div className={styles.avatarInner}>
                <Image
                  src={person.avatar}
                  alt={person.name}
                  fill
                  priority
                  sizes="(max-width: 767px) 72vw, 320px"
                  className={styles.avatarImg}
                />
              </div>
            </div>
          </div>

          <Column gap="16">
            {home.featured.display && (
              <RevealFx fillWidth horizontal="start" paddingBottom="12">
                <Badge
                  background="brand-alpha-weak"
                  paddingX="12"
                  paddingY="4"
                  onBackground="neutral-strong"
                  textVariant="label-default-s"
                  arrow={false}
                  href={home.featured.href}
                >
                  <Row paddingY="2">{home.featured.title}</Row>
                </Badge>
              </RevealFx>
            )}

            <RevealFx translateY={6} fillWidth>
              <Heading wrap="balance" variant="display-strong-l" className={styles.heroTitle}>
                Hello, I&apos;m <span className={styles.nameAccent}>{person.firstName}</span>
              </Heading>
            </RevealFx>

            <RevealFx translateY={8} delay={0.1} fillWidth>
              <Text
                className={styles.heroSubtitle}
                onBackground="neutral-weak"
                variant="heading-default-xl"
              >
                {person.role} |
              </Text>
            </RevealFx>

            <RevealFx delay={0.2}>
              <div className={styles.ctaRow}>
                <Button
                  href={`mailto:${person.email}`}
                  prefixIcon="email"
                  size="m"
                  weight="default"
                  className={styles.primaryCta}
                >
                  Get In Touch
                </Button>
              </div>
            </RevealFx>

            <div className={styles.socialRow}>
              {socialButtons()}
            </div>
          </Column>
        </div>
      </section>

      <section id="about" className={`onepage-section ${styles.about}`}>
        <div className={styles.sectionHeader}>
          <Heading as="h2" variant="display-strong-s" className={styles.sectionTitle}>
            About Me
          </Heading>
          <div className={styles.headerDecor}>
            <span className={styles.headerLine} />
            <span className={styles.headerDot} />
            <span className={styles.headerLine} />
          </div>
        </div>

        <div className={styles.aboutGrid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>ABOUT ME</div>
            <Heading as="h3" variant="display-strong-xs" wrap="balance">
              Hey! I&apos;m <span className={styles.nameAccent}>{person.firstName}</span>.
            </Heading>
            <Text onBackground="neutral-weak" variant="body-default-l" style={{ marginTop: 10 }}>
              {about.intro.description}
            </Text>
            <Text onBackground="neutral-weak" variant="body-default-m" style={{ marginTop: 10 }}>
              {home.subline}
            </Text>
          </div>
        </div>

        {/* Tech Stack as skill rows with icons */}
        <div className={styles.skillsSection}>
          <div className={styles.cardTitle}>TECH STACK</div>
          <div className={styles.skillsGrid}>
            {(techStack.length
              ? techStack
              : [
                  { name: "JavaScript", icon: "javascript" },
                  { name: "Next.js", icon: "nextjs" },
                  { name: "React", icon: "react" },
                ]
            ).map((skill) => (
              <div key={skill.name} className={styles.skillRow}>
                <Icon name={skill.icon} size="m" onBackground="brand-weak" />
                <Text variant="body-default-m" onBackground="neutral-strong">
                  {skill.name}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      {about.work.display && (
        <section id="experience" className={`onepage-section ${styles.experience}`}>
          <div className={styles.sectionHeader}>
            <Heading as="h2" variant="display-strong-s" className={styles.sectionTitle}>
              Experience
            </Heading>
            <div className={styles.headerDecor}>
              <span className={styles.headerLine} />
              <span className={styles.headerDot} />
              <span className={styles.headerLine} />
            </div>
          </div>

          <div className={styles.experienceList}>
            {about.work.experiences.map((exp, idx) => (
              <div key={idx} className={styles.experienceItem}>
                {/* Left: Company Card */}
                <div className={styles.companyCard}>
                  <div className={styles.companyHeader}>
                    <div className={styles.companyLogo}>
                      {exp.logo ? (
                        <Image src={exp.logo} alt={exp.company} width={48} height={48} />
                      ) : (
                        <Icon name="grid" size="l" />
                      )}
                    </div>
                    {exp.current && <span className={styles.currentDot} />}
                  </div>
                  <Heading as="h4" variant="heading-strong-m">{exp.company}</Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">{exp.type}</Text>
                  
                  <div className={styles.companyMeta}>
                    <Row gap="8" vertical="center">
                      <Icon name="calendar" size="xs" onBackground="neutral-weak" />
                      <Text variant="label-default-s" onBackground="neutral-weak">{exp.timeframe}</Text>
                    </Row>
                    <Row gap="8" vertical="center">
                      <Icon name="globe" size="xs" onBackground="neutral-weak" />
                      <Text variant="label-default-s" onBackground="neutral-weak">{exp.location}</Text>
                    </Row>
                  </div>

                  {exp.skills && exp.skills.length > 0 && (
                    <div className={styles.companySkills}>
                      {exp.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className={styles.skillPill}>{skill}</span>
                      ))}
                      {exp.skills.length > 3 && (
                        <span className={styles.skillMore}>+{exp.skills.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className={styles.experienceDetails}>
                  <div className={styles.expBadges}>
                    {exp.featured && (
                      <Badge background="brand-alpha-weak" paddingX="12" paddingY="4">
                        Featured Experience
                      </Badge>
                    )}
                    {exp.current && (
                      <Badge background="brand-alpha-weak" paddingX="12" paddingY="4">
                        <Row gap="8" vertical="center">
                          <span className={styles.currentDotSmall} />
                          Current
                        </Row>
                      </Badge>
                    )}
                  </div>

                  <Heading as="h3" variant="display-strong-xs" style={{ marginTop: 12 }}>
                    {exp.role}
                  </Heading>

                  <Text
                    variant="body-default-m"
                    onBackground="neutral-weak"
                    style={{ marginTop: 12 }}
                  >
                    {exp.description}
                  </Text>

                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className={styles.achievements}>
                      <Row gap="8" vertical="center" style={{ marginBottom: 8 }}>
                        <Icon name="rocket" size="s" onBackground="brand-medium" />
                        <Text variant="label-strong-s">Key Achievements</Text>
                      </Row>
                      <ul>
                        {exp.achievements.map((achievement, i) => (
                          <li key={i}>
                            <Text variant="body-default-s" onBackground="neutral-weak">
                              {achievement}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(exp.links?.details || exp.links?.connect) && (
                    <div className={styles.expActions}>
                      {exp.links.details && (
                        <Button
                          href={exp.links.details}
                          prefixIcon="arrowUpRightFromSquare"
                          size="s"
                          className={styles.expBtn}
                        >
                          View Details
                        </Button>
                      )}
                      {exp.links.connect && (
                        <Button
                          href={exp.links.connect}
                          prefixIcon="linkedin"
                          size="s"
                          variant="secondary"
                          className={styles.expBtnSecondary}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Mailchimp />
    </Column>
  );
}

function socialButtons() {
  // Small, icon-only buttons like the screenshot
  // Uses the existing social config.
  const items = social
    .filter((s) => typeof s.link === "string" && s.link.length > 0)
    .map((s) => ({ name: s.name, icon: s.icon, link: s.link }));

  return items.map((item) => (
    <IconButton
      key={item.name}
      size="l"
      href={item.link}
      icon={item.icon}
      variant="secondary"
    />
  ));
}
