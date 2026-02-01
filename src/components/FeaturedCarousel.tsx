"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Heading, Text, Button, Icon } from "@once-ui-system/core";
import styles from "@/app/home-sections.module.scss";

interface FeaturedPost {
  name: string;
  image: string;
  description?: string;
  link?: string;
}

interface FeaturedCarouselProps {
  posts: FeaturedPost[];
}

export const FeaturedCarousel = ({ posts }: FeaturedCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 560);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile || isHovered) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const cardWidth = 296; // 280px card + 16px gap
    const totalWidth = posts.length * cardWidth;

    const autoScroll = () => {
      if (!scrollContainer || isHovered) return;
      
      scrollPosition += 1;
      
      // Reset to start when reaching end
      if (scrollPosition >= totalWidth - scrollContainer.clientWidth) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
    };

    const interval = setInterval(autoScroll, 30);

    return () => clearInterval(interval);
  }, [isMobile, isHovered, posts.length]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleTouchStart = () => setIsHovered(true);
  const handleTouchEnd = () => {
    // Delay resuming auto-scroll after touch
    setTimeout(() => setIsHovered(false), 3000);
  };

  return (
    <div
      ref={scrollRef}
      className={styles.featuredGrid}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {posts.map((post) => (
        <div key={post.name} className={styles.featuredCard}>
          <div className={styles.featuredImageWrap}>
            <Image
              src={post.image}
              alt={post.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={styles.featuredImage}
            />
            <div className={styles.featuredOverlay}>
              <Icon name="linkedin" size="l" />
            </div>
          </div>
          <div className={styles.featuredContent}>
            <Heading as="h3" variant="heading-strong-s" className={styles.featuredName}>
              {post.name}
            </Heading>
            {post.description && (
              <Text variant="body-default-s" onBackground="neutral-weak" className={styles.featuredDesc}>
                {post.description}
              </Text>
            )}
            {post.link && (
              <Button
                href={post.link}
                target="_blank"
                size="s"
                variant="secondary"
                className={styles.featuredBtn}
              >
                Read More
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
