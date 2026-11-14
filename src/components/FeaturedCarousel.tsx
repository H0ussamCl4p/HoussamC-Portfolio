import Image from "next/image";
import type { FeaturedPost } from "@/types";
import styles from "./FeaturedCarousel.module.scss";

interface FeaturedCarouselProps {
  posts: FeaturedPost[];
}

// A plain horizontal scroller with snap points: swipe on mobile, scroll or tab on desktop.
export const FeaturedCarousel = ({ posts }: FeaturedCarouselProps) => {
  return (
    <ul className={styles.row} aria-label="LinkedIn highlights">
      {posts.map((post) => (
        <li key={post.name} className={styles.card}>
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label={`${post.name}: read the LinkedIn post`}
          >
            <div className={styles.imageWrap}>
              {post.image ? (
                <Image
                  src={post.image}
                  alt={`Photo from the LinkedIn post about ${post.name}`}
                  fill
                  sizes="(max-width: 640px) 80vw, 320px"
                  className={styles.image}
                />
              ) : (
                <span className={styles.placeholder} aria-hidden="true">
                  {"{ }"}
                </span>
              )}
            </div>
            <div className={styles.body}>
              <h3 className={styles.name}>{post.name}</h3>
              {post.description && <p className={styles.desc}>{post.description}</p>}
              <span className={styles.more}>linkedin ↗</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};
