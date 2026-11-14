import { person, social } from "@/resources";
import styles from "./Footer.module.scss";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>
          © {currentYear} {person.name}
        </span>
        <ul className={styles.links}>
          {social
            .filter((item) => item.link)
            .map((item) => (
              <li key={item.name}>
                <a href={item.link} rel="noopener noreferrer" target="_blank">
                  {item.name.toLowerCase()}
                </a>
              </li>
            ))}
        </ul>
      </div>
    </footer>
  );
};
