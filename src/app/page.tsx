import { Schema, Meta } from "@once-ui-system/core";
import Image from "next/image";
import { home, about, person, baseURL, social, projects, awards, sameAs } from "@/resources";
import { EmailButton } from "@/components/EmailButton";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { MotionController } from "@/components/motion/MotionController";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { SectionRail } from "@/components/motion/SectionRail";
import styles from "@/app/home-sections.module.scss";

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
  jobTitle: person.role,
  url: baseURL,
  image: `${baseURL}${person.avatar}`,
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "ENSAM Casablanca",
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Hassan II University of Casablanca",
    },
  },
  sameAs: Object.values(sameAs),
};

// Set at build time in next.config.mjs, so the button only shows once the PDF is in public/cv/.
const cvAvailable = process.env.CV_AVAILABLE === "1";

const linkedin = social.find((item) => item.name === "LinkedIn")?.link;
const github = social.find((item) => item.name === "GitHub")?.link;

// Ferris, as on the banner. Claws are wrapped so they can be drawn in the accent colour.
function Ferris() {
  return (
    <figure className={styles.ferris}>
      <pre aria-hidden="true">
        {"    _~^~^~_\n"}
        <span className={styles.claw}>{"\\)"}</span>
        {" /  o o  \\ "}
        <span className={styles.claw}>{"(/"}</span>
        {"\n  '_   -   _'\n  / '-----' \\"}
      </pre>
      <figcaption>
        <span className={styles.visuallyHidden}>ASCII drawing of Ferris, the Rust crab. </span>
        {"// cargo run --release"}
      </figcaption>
    </figure>
  );
}

function SectionHeader({ title, id }: { title: string; id: string }) {
  return (
    <h2 id={`${id}-title`} className={styles.sectionTitle}>
      <ScrambleText text={title} />
    </h2>
  );
}

function DotList({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul className={styles.dotList} aria-label={label}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function Home() {
  const highlights = (home.featuredPosts?.posts ?? []).filter((post) => Boolean(post.link));
  const leadership = about.parascolaire;

  // Order matches the page; sections that are switched off are left out.
  const railSections = [
    { id: "about", label: "About", show: true },
    { id: "experience", label: about.work.title, show: about.work.display },
    { id: "projects", label: projects.title, show: projects.display && projects.items.length > 0 },
    { id: "awards", label: awards.title, show: awards.display },
    {
      id: "education",
      label: about.studies.title,
      show: about.studies.display && about.studies.institutions.length > 0,
    },
    {
      id: "highlights",
      label: home.featuredPosts?.title ?? "Highlights",
      show: Boolean(home.featuredPosts?.display && highlights.length > 0),
    },
    { id: "contact", label: "Contact", show: true },
  ]
    .filter((section) => section.show)
    .map(({ id, label }) => ({ id, label }));

  return (
    <div className={styles.page}>
      <MotionController />
      <SectionRail sections={railSections} />
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={home.image}
        author={{
          name: person.name,
          url: baseURL,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <script
        type="application/ld+json"
        // Static data from content files; "<" is escaped so it can't close the tag.
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD from content files
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ---------- Hero ---------- */}
      <section id="hero" className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroMeta}>
          <span className={styles.typed}>
            <span
              className={styles.typedText}
              style={{ "--n": home.eyebrow?.length ?? 0 } as React.CSSProperties}
            >
              {home.eyebrow}
            </span>
            <span className={styles.caret} aria-hidden="true" />
          </span>
          <span>{home.coordinates}</span>
        </div>

        <div className={styles.heroMain}>
          <div className={styles.avatar}>
            <Image
              src={person.avatar}
              alt={`${person.name} pitching at the Falling Walls Lab Global Finale in Berlin`}
              fill
              priority
              sizes="(max-width: 719px) 200px, 280px"
              className={styles.avatarImg}
            />
          </div>

          <div className={styles.heroText}>
            <h1 id="hero-title" className={styles.headline}>
              {home.headline}
              <span className={styles.accentDot}>.</span>
            </h1>
            <p className={styles.subtitle}>{home.subtitle}</p>

            <hr className={styles.rule} />

            {home.credentials && <DotList items={home.credentials} label="Credentials" />}
          </div>
        </div>

        <div className={styles.heroBottom}>
          <div className={styles.openTo}>
            <p className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              Open to opportunities · summer 2027
            </p>
            <div className={styles.ctaRow}>
              <EmailButton label="Email me" className={styles.btnPrimary} />
              {linkedin && (
                <a href={linkedin} className={styles.btn} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
              )}
              {github && (
                <a href={github} className={styles.btn} target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
              )}
              {cvAvailable && person.cv && (
                <a href={person.cv} className={styles.btn} download>
                  Download CV
                </a>
              )}
            </div>
          </div>
          <Ferris />
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className={styles.section} data-reveal aria-labelledby="about-title">
        <SectionHeader title="About" id="about" />

        <p className={styles.lead}>{home.subline}</p>

        {about.technical.display && (
          <dl className={styles.skills}>
            {about.technical.skills.map((group) => (
              <div key={group.title} className={styles.skillRow}>
                <dt className={styles.label}>{group.title}</dt>
                <dd>
                  <DotList items={(group.tags ?? []).map((tag) => tag.name)} />
                </dd>
              </div>
            ))}
            {about.technical.spokenLanguages && about.technical.spokenLanguages.length > 0 && (
              <div className={styles.skillRow}>
                <dt className={styles.label}>Languages</dt>
                <dd>
                  <DotList items={about.technical.spokenLanguages} />
                </dd>
              </div>
            )}
          </dl>
        )}
      </section>

      {/* ---------- Experience ---------- */}
      {about.work.display && (
        <section
          id="experience"
          className={styles.section}
          data-reveal
          aria-labelledby="experience-title"
        >
          <SectionHeader title={about.work.title} id="experience" />

          <ol className={styles.timeline}>
            {about.work.experiences.map((exp, i) => (
              <li
                key={exp.company}
                id={exp.id}
                className={styles.entry}
                data-reveal
                style={{ "--reveal-i": i % 3 } as React.CSSProperties}
              >
                <div className={styles.entryMeta}>
                  <span>{exp.timeframe}</span>
                  {exp.location && <span>{exp.location}</span>}
                </div>
                <div className={styles.entryBody}>
                  <h3 className={styles.entryTitle}>{exp.role}</h3>
                  <p className={styles.entryOrg}>
                    {exp.logo && (
                      <Image
                        src={exp.logo}
                        alt=""
                        width={20}
                        height={20}
                        className={styles.orgLogo}
                      />
                    )}
                    <span>
                      {exp.company}
                      {exp.type && <span className={styles.muted}> · {exp.type}</span>}
                    </span>
                  </p>
                  {exp.description && <p className={styles.body}>{exp.description}</p>}
                  {exp.achievements.length > 0 && (
                    <ul className={styles.bullets}>
                      {exp.achievements.map((achievement, i) => (
                        <li key={`${exp.company}-achievement-${i}`}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                  {exp.skills && exp.skills.length > 0 && (
                    <DotList items={exp.skills} label="Skills" />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ---------- Projects ---------- */}
      {projects.display && projects.items.length > 0 && (
        <section
          id="projects"
          className={styles.section}
          data-reveal
          aria-labelledby="projects-title"
        >
          <SectionHeader title={projects.title} id="projects" />

          <div className={styles.projectGrid}>
            {projects.items.map((project, i) => (
              <article
                key={project.title}
                data-reveal
                style={{ "--reveal-i": i % 3 } as React.CSSProperties}
                className={`${styles.project} ${project.image ? styles.projectFeatured : ""}`}
              >
                {project.image && (
                  <div className={styles.projectImage}>
                    <Image
                      src={project.image}
                      alt={project.imageAlt ?? project.title}
                      fill
                      sizes="(max-width: 719px) 100vw, 480px"
                    />
                  </div>
                )}
                <div className={styles.projectBody}>
                  <h3 className={styles.entryTitle}>{project.title}</h3>
                  <p className={styles.body}>{project.description}</p>
                  {project.highlight && <p className={styles.highlight}>{project.highlight}</p>}
                  <DotList items={project.tags} label={`${project.title} stack`} />
                  {(project.links?.github || project.links?.demo || project.links?.details) && (
                    <div className={styles.textLinks}>
                      {project.links.github && (
                        <a
                          href={project.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source code on GitHub`}
                        >
                          github ↗
                        </a>
                      )}
                      {project.links.demo && (
                        <a
                          href={project.links.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live demo`}
                        >
                          demo ↗
                        </a>
                      )}
                      {project.links.details && (
                        <a
                          href={project.links.details}
                          aria-label={`${project.title}: see the experience entry`}
                        >
                          details →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Awards & Leadership ---------- */}
      {awards.display && (
        <section id="awards" className={styles.section} data-reveal aria-labelledby="awards-title">
          <SectionHeader title={awards.title} id="awards" />

          <div className={styles.twoCol}>
            <div>
              <h3 className={styles.label}>Awards</h3>
              <ul className={styles.plainList}>
                {awards.items.map((item) => (
                  <li key={item.title} className={styles.awardItem}>
                    <strong>{item.title}</strong> · {item.detail}
                  </li>
                ))}
              </ul>
              {awards.footnote && <p className={styles.footnote}>{awards.footnote}</p>}
            </div>

            <div>
              {leadership?.display && leadership.activities.length > 0 && (
                <>
                  <h3 className={styles.label}>Leadership</h3>
                  <ul className={styles.plainList}>
                    {leadership.activities.map((activity) => (
                      <li key={`${activity.role}-${activity.name}`}>
                        <p className={styles.itemTitle}>
                          {activity.role}, {activity.name}
                        </p>
                        {activity.timeframe && (
                          <p className={styles.itemMeta}>{activity.timeframe}</p>
                        )}
                        {activity.description && (
                          <p className={styles.itemDesc}>{activity.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {awards.certifications && awards.certifications.length > 0 && (
                <>
                  <h3 className={`${styles.label} ${styles.labelSpaced}`}>Certifications</h3>
                  <DotList items={awards.certifications} />
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Education ---------- */}
      {about.studies.display && about.studies.institutions.length > 0 && (
        <section
          id="education"
          className={styles.section}
          data-reveal
          aria-labelledby="education-title"
        >
          <SectionHeader title={about.studies.title} id="education" />

          <ol className={styles.timeline}>
            {about.studies.institutions.map((institution) => (
              <li key={institution.name} className={styles.entry}>
                <div className={styles.entryMeta}>
                  {institution.timeframe && <span>{institution.timeframe}</span>}
                  {institution.location && <span>{institution.location}</span>}
                </div>
                <div className={styles.entryBody}>
                  <h3 className={styles.entryTitle}>{institution.name}</h3>
                  <p className={styles.body}>{institution.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ---------- Highlights (LinkedIn posts) ---------- */}
      {home.featuredPosts?.display && highlights.length > 0 && (
        <section
          id="highlights"
          className={styles.section}
          data-reveal
          aria-labelledby="highlights-title"
        >
          <SectionHeader title={home.featuredPosts.title} id="highlights" />
          <FeaturedCarousel posts={highlights} />
        </section>
      )}

      {/* ---------- Contact ---------- */}
      <section id="contact" className={styles.section} data-reveal aria-labelledby="contact-title">
        <SectionHeader title="Contact" id="contact" />
        <div className={styles.contact}>
          <p className={styles.contactHeadline}>
            Let&apos;s build something secure together
            <span className={styles.accentDot}>.</span>
          </p>
          {home.openTo && (
            <p className={styles.body}>
              <strong>Open to:</strong> {home.openTo}
            </p>
          )}
          <ul className={styles.contactLinks}>
            <li>
              <EmailButton
                label="Email"
                className={`${styles.contactLink} ${styles.contactMail}`}
              />
            </li>
            {linkedin && (
              <li>
                <a
                  href={linkedin}
                  className={styles.contactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            )}
            {github && (
              <li>
                <a
                  href={github}
                  className={styles.contactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
            )}
            {cvAvailable && person.cv && (
              <li>
                <a
                  href={person.cv}
                  className={`${styles.contactLink} ${styles.contactMail}`}
                  download
                >
                  CV (PDF)
                </a>
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
