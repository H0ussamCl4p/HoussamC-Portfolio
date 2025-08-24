"use client";

import { Media, MasonryGrid } from "@once-ui-system/core";
import styles from "./DesignsView.module.scss";
import { useEffect, useState, useCallback } from "react";

type DesignImage = {
  path: string;
};

export default function DesignsView() {
  const [images, setImages] = useState<DesignImage[]>([]);

  useEffect(() => {
    fetch("/designs.json")
      .then((res) => res.json())
      .then((paths: string[]) => setImages(paths.map((path) => ({ path }))));
  }, []);

  // Share handler must be inside the component
  const handleShare = useCallback((e: React.MouseEvent, imageUrl: string) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: "Check out this design!",
        url: imageUrl,
      });
    } else {
      navigator.clipboard.writeText(imageUrl);
      alert("Image URL copied to clipboard!");
    }
  }, []);

  // Group images by [top-level]/[subfolder] (e.g., Canva/A&M Aeronautics/Club's Day)
  const grouped: Record<string, DesignImage[]> = {};
  for (const img of images) {
    const parts = img.path.split("/");
    // Group by first 3 levels: e.g., Canva/A&M Aeronautics/Club's Day
    const group = parts.slice(0, 3).join("/");
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(img);
  }

  // Sort groups alphabetically, but images from latest to oldest (descending by path)
  const sortedGroups = Object.keys(grouped).sort();
  for (const group of sortedGroups) {
    grouped[group].sort((a, b) => b.path.localeCompare(a.path)); // descending order
  }

  return (
    <div>
      {sortedGroups.map((group) => {
        const parts = group.split("/");
        return (
          <div key={group} style={{ marginBottom: 32 }}>
            {/* Group label as a pill/tab style */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#e6f6fd",
                borderRadius: 999,
                border: "1.5px solid #b6e0fe",
                padding: "4px 18px 4px 12px",
                fontSize: 17,
                fontWeight: 500,
                margin: "16px 0 8px",
                gap: 0,
                minHeight: 36,
              }}
            >
              {parts.map((part, idx) => (
                <span
                  key={`${group}-${part}`}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <span
                    style={{
                      fontWeight: idx === 0 ? 700 : 500,
                      color:
                        idx === 0
                          ? "#222"
                          : idx === parts.length - 1
                          ? "#0a7cff"
                          : "#222",
                      marginRight: idx < parts.length - 1 ? 8 : 0,
                      marginLeft: idx > 0 ? 8 : 0,
                    }}
                  >
                    {part}
                  </span>
                  {idx < parts.length - 1 && (
                    <span
                      style={{
                        color: "#b0b0b0",
                        fontWeight: 400,
                        fontSize: 18,
                        margin: "0 0px",
                        userSelect: "none",
                      }}
                    >
                      |
                    </span>
                  )}
                </span>
              ))}
              {/* Blinking cursor animation at the end of the label */}
              <span className={styles["cursor-blink"]} />
            </div>
            <MasonryGrid
              columns={3}
              m={{ columns: 2 }}
              s={{ columns: 1 }}
              style={{ gap: 18 }}
            >
              {grouped[group].map((image, index) => {
                // Stagger animation delay for entry
                const animationDelay = `${index * 60}ms`;
                const imageUrl = `${window.location.origin}/designs/${image.path}`;
                const fileName = image.path.split("/").pop() || "design";
                const hue = 180 + ((index * 13) % 120); // vary hue per item
                const inlineStyle: React.CSSProperties &
                  Record<string, string> = {
                  animationDelay,
                  "--hue": String(hue),
                };
                return (
                  <div
                    key={image.path}
                    className={`${styles["design-hover"]} ${styles["design-fadein"]}`}
                    style={inlineStyle}
                  >
                    <div className={styles["design-overlay"]} />
                    <Media
                      enlarge
                      priority={index < 10}
                      sizes="(max-width: 560px) 100vw, 50vw"
                      radius="m"
                      src={`/designs/${image.path}`}
                      alt={fileName}
                    />
                    <div className={styles["design-title"]}>
                      {fileName.replace(/[-_]/g, " ")}
                    </div>
                    <div className={styles["design-actions"]}>
                      <button
                        type="button"
                        onClick={(e) => handleShare(e, imageUrl)}
                        aria-label={`Share ${fileName}`}
                      >
                        Share
                      </button>
                      <a
                        href={`/designs/${image.path}`}
                        download={fileName}
                        aria-label={`Download ${fileName}`}
                      >
                        Download
                      </a>
                    </div>
                    <button
                      className={styles["share-btn"]}
                      title={`Share ${fileName}`}
                      type="button"
                      onClick={(e) => handleShare(e, imageUrl)}
                      tabIndex={0}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <title>{`Share ${fileName}`}</title>
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <path d="M8.59 13.51l6.83 3.98" />
                        <path d="M15.41 6.51l-6.82 3.98" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </MasonryGrid>
          </div>
        );
      })}
    </div>
  );
}
