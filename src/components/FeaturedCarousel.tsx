"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Heading, Text, Button, Icon } from "@once-ui-system/core";
import styles from "@/app/home-sections.module.scss";

interface FeaturedPost {
  name: string;
  image?: string;
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

  const [isVisible, setIsVisible] = useState(false);

  // Only animate while the carousel is on screen.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobile || isHovered || !isVisible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let frame = 0;
    let scrollPosition = scrollContainer.scrollLeft;

    const autoScroll = () => {
      scrollPosition += 0.5;

      // Reset to start when reaching end
      if (scrollPosition >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollPosition = 0;
      }

      scrollContainer.scrollLeft = scrollPosition;
      frame = requestAnimationFrame(autoScroll);
    };

    frame = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(frame);
  }, [isMobile, isHovered, isVisible]);

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
            {post.image ? (
              <Image
                src={post.image}
                alt={`Photo from the LinkedIn post about ${post.name}`}
                fill
                sizes="(max-width: 640px) 280px, 33vw"
                className={styles.featuredImage}
              />
            ) : (
              <div className={styles.featuredPlaceholder} aria-hidden="true">
                <Icon name="trophy" size="xl" />
              </div>
            )}
            <div className={styles.featuredOverlay}>
              <Icon name="linkedin" size="l" />
            </div>
          </div>
          <div className={styles.featuredContent}>
            <Heading as="h3" variant="heading-strong-s" className={styles.featuredName}>
              {post.name}
            </Heading>
            {post.description && (
              <Text variant="body-default-s" onBackground="neutral-medium" className={styles.featuredDesc}>
                {post.description}
              </Text>
            )}
            {post.link && (
              <Button
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Read the LinkedIn post about ${post.name}`}
                size="s"
                variant="secondary"
                className={styles.featuredBtn}
              >
                View on LinkedIn
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
