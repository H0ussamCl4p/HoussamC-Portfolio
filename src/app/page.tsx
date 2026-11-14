import { Schema, Meta } from "@once-ui-system/core";
import Image from "next/image";
import { home, about, person, baseURL, social, projects, awards, sameAs } from "@/resources";
import { EmailButton } from "@/components/EmailButton";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
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
    parentOrganization: { "@type": "CollegeOrUniversity", name: "Hassan II University of Casablanca" },
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

function SectionHeader({ index, title, id }: { index: string; title: string; id: string }) {
  return (
    <div className={styles.sectionHead}>
      <span className={styles.sectionIndex} aria-hidden="true">
        {index}
      </span>
      <h2 id={`${id}-title`} className={styles.sectionTitle}>
        {title}
      </h2>
    </div>
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

  let sectionNumber = 0;
  const nextIndex = () => String(++sectionNumber).padStart(2, "0");

  return (
    <div className={styles.page}>
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
          <span>{home.eyebrow}</span>
          <span>{home.coordinates}</span>
        </div>

        <h1 id="hero-title" className={styles.headline}>
          {home.headline}
          <span className={styles.accentDot}>.</span>
        </h1>
        <p className={styles.subtitle}>{home.subtitle}</p>

        <hr className={styles.rule} />

        {home.credentials && <DotList items={home.credentials} label="Credentials" />}

        <div className={styles.heroBottom}>
          <div className={styles.openTo}>
            <p className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              Open to opportunities
            </p>
            {home.openTo && <p className={styles.openToText}>{home.openTo}</p>}
            <div className={styles.ctaRow}>
              <EmailButton label="Email me" className={styles.btnPrimary} />
              {linkedin && (
                <a
                  href={linkedin}
                  className={styles.btn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn ↗
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
      <section id="about" className={styles.section} aria-labelledby="about-title">
        <SectionHeader index={nextIndex()} title="About" id="about" />

        <div className={styles.aboutGrid}>
          <div className={styles.avatar}>
            <Image
              src={person.avatar}
              alt={`Portrait of ${person.name}`}
              fill
              sizes="(max-width: 719px) 120px, 200px"
              className={styles.avatarImg}
            />
          </div>
          <div className={styles.aboutText}>
            <p className={styles.lead}>{home.subline}</p>
            {home.openTo && (
              <p className={styles.body}>
                <strong>Open to:</strong> {home.openTo}
              </p>
            )}
          </div>
        </div>

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
        <section id="experience" className={styles.section} aria-labelledby="experience-title">
          <SectionHeader index={nextIndex()} title={about.work.title} id="experience" />

          <ol className={styles.timeline}>
            {about.work.experiences.map((exp) => (
              <li key={exp.company} id={exp.id} className={styles.entry}>
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
        <section id="projects" className={styles.section} aria-labelledby="projects-title">
          <SectionHeader index={nextIndex()} title={projects.title} id="projects" />

          <div className={styles.projectGrid}>
            {projects.items.map((project) => (
              <article
                key={project.title}
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
        <section id="awards" className={styles.section} aria-labelledby="awards-title">
          <SectionHeader index={nextIndex()} title={awards.title} id="awards" />

          <div className={styles.twoCol}>
            <div>
              <h3 className={styles.label}>Awards</h3>
              <ol className={styles.numbered}>
                {awards.items.map((item, i) => (
                  <li key={`award-${i}`}>{item}</li>
                ))}
              </ol>
              {awards.footnote && <p className={styles.footnote}>{awards.footnote}</p>}
            </div>

            <div>
              {leadership?.display && leadership.activities.length > 0 && (
                <>
                  <h3 className={styles.label}>Leadership</h3>
                  <ul className={styles.plainList}>
                    {leadership.activities.map((activity) => (
                      <li key={activity.name}>
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
        <section id="education" className={styles.section} aria-labelledby="education-title">
          <SectionHeader index={nextIndex()} title={about.studies.title} id="education" />

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
        <section id="highlights" className={styles.section} aria-labelledby="highlights-title">
          <SectionHeader index={nextIndex()} title={home.featuredPosts.title} id="highlights" />
          <FeaturedCarousel posts={highlights} />
        </section>
      )}

      {/* ---------- Contact ---------- */}
      <section id="contact" className={styles.section} aria-labelledby="contact-title">
        <SectionHeader index={nextIndex()} title="Contact" id="contact" />
        <div className={styles.contact}>
          <p className={styles.contactLead}>
            Working on cloud, industrial or health security? Let&apos;s talk
            <span className={styles.accentDot}>.</span>
          </p>
          {home.openTo && (
            <p className={styles.body}>
              <strong>Open to:</strong> {home.openTo}
            </p>
          )}
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
          </div>
        </div>
      </section>
    </div>
  );
}
