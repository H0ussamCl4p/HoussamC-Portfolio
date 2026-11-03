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
} from "@once-ui-system/core";
import { home, about, person, baseURL, social, projects, awards, sameAs } from "@/resources";
import { Mailchimp } from "@/components";
import { EmailButton } from "@/components/EmailButton";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import styles from "@/app/home-sections.module.scss";
import Image from "next/image";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  jobTitle: "Cybersecurity & Cloud Computing Engineering Student",
  url: baseURL,
  image: `${baseURL}${person.avatar}`,
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "ENSAM Casablanca",
    parentOrganization: { "@type": "CollegeOrUniversity", name: "Hassan II University of Casablanca" },
  },
  sameAs: Object.values(sameAs),
};

// Set at build time in next.config.mjs, so the button only shows once the PDF is in public/cv/.
const cvAvailable = process.env.CV_AVAILABLE === "1";

function SectionHeader({ title }: { title: React.ReactNode }) {
  return (
    <div className={styles.sectionHeader}>
      <Heading as="h2" variant="display-strong-s" className={styles.sectionTitle}>
        {title}
      </Heading>
      <div className={styles.headerDecor}>
        <span className={styles.headerLine} />
        <span className={styles.headerDot} />
        <span className={styles.headerLine} />
      </div>
    </div>
  );
}

export default function Home() {
  const highlights = (home.featuredPosts?.posts ?? []).filter((post) => Boolean(post.link));

  return (
    <Column maxWidth="m" gap="xl" paddingY="24" paddingX="16" horizontal="center"
      s={{ paddingX: "12", paddingY: "16", gap: "l" }}
      m={{ paddingX: "20", paddingY: "20", gap: "xl" }}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: baseURL,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <script
        type="application/ld+json"
        // Static data from content files; "<" is escaped so it can't close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
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
                  alt={`Portrait of ${person.name}`}
                  fill
                  priority
                  sizes="(max-width: 479px) 200px, (max-width: 767px) 240px, 320px"
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

            {/* CSS-only reveal so the hero paints before hydration (LCP) */}
            <div className={styles.heroReveal}>
              <Heading as="h1" wrap="balance" variant="display-strong-l" className={styles.heroTitle}>
                Hello, I&apos;m <span className={styles.nameAccent}>{person.firstName}</span>
              </Heading>
            </div>

            <div className={styles.heroReveal} style={{ animationDelay: "0.1s" }}>
              <Text
                className={styles.heroSubtitle}
                onBackground="neutral-weak"
                variant="heading-default-xl"
              >
                {home.subtitle}
              </Text>
            </div>

            {home.badges && home.badges.length > 0 && (
              <div className={styles.heroReveal} style={{ animationDelay: "0.15s" }}>
                <ul className={`${styles.pills} ${styles.heroBadges}`} aria-label="Highlights">
                  {home.badges.map((badge) => (
                    <li key={badge} className={styles.pill}>
                      {badge}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.heroReveal} style={{ animationDelay: "0.2s" }}>
              <div className={styles.ctaRow}>
                <EmailButton label="Get In Touch" className={styles.primaryCta} />
                {cvAvailable && person.cv && (
                  <Button
                    href={person.cv}
                    prefixIcon="download"
                    size="m"
                    weight="default"
                    variant="secondary"
                    className={styles.secondaryCta}
                    download
                  >
                    Download CV
                  </Button>
                )}
              </div>
            </div>

            <div className={styles.socialRow}>
              {socialButtons()}
              <EmailButton variant="icon" className={styles.socialBtn} />
            </div>
          </Column>
        </div>
      </section>

      <section id="about" className={`onepage-section ${styles.about}`}>
        <SectionHeader title="About Me" />

        <div className={styles.aboutGrid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>ABOUT ME</div>
            <Heading as="h3" variant="display-strong-xs" wrap="balance">
              Hey! I&apos;m <span className={styles.nameAccent}>{person.firstName}</span>.
            </Heading>
            <Text onBackground="neutral-weak" variant="body-default-m" style={{ marginTop: 10 }}>
              {home.subline}
            </Text>
          </div>
        </div>

        {about.technical.display && (
          <div className={styles.skillsSection}>
            <Heading as="h3" className={styles.cardTitle}>
              {about.technical.title}
            </Heading>
            {about.technical.skills.map((group) => (
              <div key={group.title} className={styles.skillGroup}>
                <Text as="h4" variant="label-strong-s" onBackground="neutral-strong">
                  {group.title}
                </Text>
                <ul className={styles.skillsGrid}>
                  {(group.tags ?? []).map((tag) => (
                    <li key={tag.name} className={styles.skillRow}>
                      {tag.icon && <Icon name={tag.icon} size="m" onBackground="brand-weak" />}
                      <Text variant="body-default-m" onBackground="neutral-strong">
                        {tag.name}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {about.technical.spokenLanguages && about.technical.spokenLanguages.length > 0 && (
              <div className={styles.skillGroup}>
                <Text as="h4" variant="label-strong-s" onBackground="neutral-strong">
                  Languages spoken
                </Text>
                <ul className={styles.pills}>
                  {about.technical.spokenLanguages.map((language) => (
                    <li key={language} className={styles.pill}>
                      {language}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Experience Section */}
      {about.work.display && (
        <section id="experience" className={`onepage-section ${styles.experience}`}>
          <SectionHeader title={about.work.title} />

          <div className={styles.experienceList}>
            {about.work.experiences.map((exp) => (
              <div key={exp.company} id={exp.id} className={styles.experienceItem}>
                {/* Left: Company Card */}
                <div className={styles.companyCard}>
                  <div className={styles.companyHeader}>
                    <div className={styles.companyLogo}>
                      {exp.logo ? (
                        <Image src={exp.logo} alt={`${exp.company} logo`} width={48} height={48} />
                      ) : (
                        <Icon name="shield" size="l" />
                      )}
                    </div>
                    {exp.current && <span className={styles.currentDot} />}
                  </div>
                  <Heading as="h3" variant="heading-strong-m">{exp.company}</Heading>
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

                  <Heading as="h4" variant="display-strong-xs" style={{ marginTop: 12 }}>
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
                          <li key={`${exp.company}-achievement-${i}`}>
                            <Text variant="body-default-s" onBackground="neutral-weak">
                              {achievement}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exp.skills && exp.skills.length > 3 && (
                    <ul className={styles.pills} style={{ marginTop: 16 }} aria-label="Tools used">
                      {exp.skills.map((skill) => (
                        <li key={skill} className={styles.pill}>{skill}</li>
                      ))}
                    </ul>
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

      {/* Projects Section */}
      {projects.display && projects.items.length > 0 && (
        <section id="projects" className={`onepage-section ${styles.parascolaire}`}>
          <SectionHeader title={projects.title} />

          <div className={styles.projectsGrid}>
            {projects.items.map((project) => (
              <article key={project.title} className={`${styles.parascolaireCard} ${styles.projectCard}`}>
                {project.image && (
                  <div className={styles.projectImageWrap}>
                    <Image
                      src={project.image}
                      alt={project.imageAlt ?? project.title}
                      fill
                      sizes="(max-width: 559px) 100vw, 50vw"
                      className={styles.featuredImage}
                    />
                  </div>
                )}
                <Heading as="h3" variant="heading-strong-m">{project.title}</Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {project.description}
                </Text>
                {project.highlight && (
                  <Row gap="8" vertical="start">
                    <Icon name="trophy" size="xs" onBackground="brand-medium" />
                    <Text variant="body-default-s" onBackground="neutral-strong">
                      {project.highlight}
                    </Text>
                  </Row>
                )}
                <ul className={styles.pills} aria-label={`${project.title} stack`}>
                  {project.tags.map((tag) => (
                    <li key={tag} className={styles.pill}>{tag}</li>
                  ))}
                </ul>
                {(project.links?.github || project.links?.demo || project.links?.details) && (
                  <div className={styles.projectLinks}>
                    {project.links.github && (
                      <Button
                        href={project.links.github}
                        prefixIcon="github"
                        size="s"
                        variant="secondary"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} source code on GitHub`}
                      >
                        GitHub
                      </Button>
                    )}
                    {project.links.demo && (
                      <Button
                        href={project.links.demo}
                        prefixIcon="arrowUpRightFromSquare"
                        size="s"
                        variant="secondary"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} live demo`}
                      >
                        Demo
                      </Button>
                    )}
                    {project.links.details && (
                      <Button
                        href={project.links.details}
                        prefixIcon="arrowRight"
                        size="s"
                        variant="secondary"
                        aria-label={`${project.title}: see the experience entry`}
                      >
                        Details
                      </Button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Honors & Awards Section */}
      {awards.display && awards.items.length > 0 && (
        <section id="awards" className={`onepage-section ${styles.parascolaire}`}>
          <SectionHeader title={awards.title} />

          <div className={styles.card}>
            <ul className={styles.awardsList}>
              {awards.items.map((item, i) => (
                <li key={`award-${i}`} className={styles.awardItem}>
                  <Icon name="trophy" size="s" onBackground="brand-medium" />
                  <Text variant="body-default-m" onBackground="neutral-weak">
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
            {awards.footnote && (
              <Text as="p" variant="body-default-s" onBackground="neutral-weak" className={styles.awardsFootnote}>
                {awards.footnote}
              </Text>
            )}
          </div>
        </section>
      )}

      {/* Leadership Section */}
      {about.parascolaire?.display && about.parascolaire.activities.length > 0 && (
        <section id="leadership" className={`onepage-section ${styles.parascolaire}`}>
          <SectionHeader title={about.parascolaire.title} />

          <div className={styles.parascolaireGrid}>
            {about.parascolaire.activities.map((activity) => (
              <div key={activity.name} className={styles.parascolaireCard}>
                <div className={styles.parascolaireHeader}>
                  <div className={styles.parascolaireLogo}>
                    {activity.logo ? (
                      <Image src={activity.logo} alt={`${activity.name} logo`} width={48} height={48} />
                    ) : (
                      <Icon name="users" size="l" />
                    )}
                  </div>
                  <div className={styles.parascolaireInfo}>
                    <Heading as="h3" variant="heading-strong-m">{activity.role}</Heading>
                    <Text variant="body-default-s" onBackground="brand-medium">{activity.name}</Text>
                  </div>
                </div>
                {activity.timeframe && (
                  <div className={styles.parascolaireMeta}>
                    <Row gap="8" vertical="center">
                      <Icon name="calendar" size="xs" onBackground="neutral-weak" />
                      <Text variant="label-default-s" onBackground="neutral-weak">{activity.timeframe}</Text>
                    </Row>
                  </div>
                )}
                {activity.description && (
                  <Text variant="body-default-s" onBackground="neutral-weak" style={{ marginTop: 12 }}>
                    {activity.description}
                  </Text>
                )}
                {activity.achievements && activity.achievements.length > 0 && (
                  <div className={styles.parascolaireAchievements}>
                    <ul>
                      {activity.achievements.map((achievement, i) => (
                        <li key={`${activity.name}-achievement-${i}`}>
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            {achievement}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {about.studies.display && about.studies.institutions.length > 0 && (
        <section id="education" className={`onepage-section ${styles.education}`}>
          <SectionHeader title={about.studies.title} />

          <div className={styles.educationGrid}>
            {about.studies.institutions.map((institution) => (
              <div key={institution.name} className={styles.educationCard}>
                <div className={styles.educationHeader}>
                  <div className={styles.educationLogo}>
                    {institution.logo ? (
                      <Image src={institution.logo} alt="ENSAM Casablanca logo" width={56} height={56} />
                    ) : (
                      <Icon name="grid" size="l" />
                    )}
                  </div>
                  <div className={styles.educationInfo}>
                    <Heading as="h3" variant="heading-strong-m">{institution.name}</Heading>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {institution.description}
                    </Text>
                  </div>
                </div>
                {(institution.timeframe || institution.location) && (
                  <div className={styles.educationMeta}>
                    {institution.timeframe && (
                      <Row gap="8" vertical="center">
                        <Icon name="calendar" size="xs" onBackground="neutral-weak" />
                        <Text variant="label-default-s" onBackground="neutral-weak">{institution.timeframe}</Text>
                      </Row>
                    )}
                    {institution.location && (
                      <Row gap="8" vertical="center">
                        <Icon name="globe" size="xs" onBackground="neutral-weak" />
                        <Text variant="label-default-s" onBackground="neutral-weak">{institution.location}</Text>
                      </Row>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Highlights (LinkedIn posts) Section */}
      {home.featuredPosts?.display && highlights.length > 0 && (
        <section id="highlights" className={`onepage-section ${styles.featured}`}>
          <SectionHeader title={home.featuredPosts.title} />

          <FeaturedCarousel posts={highlights} />
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
      className={styles.socialBtn}
      rel="noopener noreferrer"
      aria-label={`${person.name} on ${item.name}`}
      tooltip={item.name}
    />
  ));
}
