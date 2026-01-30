"use client";

import { Media, MasonryGrid } from "@once-ui-system/core";
import styles from "./DesignsView.module.scss";
import { useEffect, useState, useCallback } from "react";

interface DesignImage {
  id: string;
  name: string;
  url: string;       // Direct Drive download URL
  thumbnail: string; // Drive thumbnail URL
}

interface DesignCategory {
  name: string;
  slug: string;
  images: DesignImage[];
  thumbnail: string | null;
}

interface ApiResponse {
  categories: DesignCategory[];
}

export default function DesignsView() {
  const [categories, setCategories] = useState<DesignCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/drive-designs?ts=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load designs");
        return res.json() as Promise<ApiResponse>;
      })
      .then((data) => setCategories(data.categories))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Share handler
  const handleShare = useCallback((e: React.MouseEvent, imageUrl: string, imageName: string) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: `Check out this design: ${imageName}`,
        url: imageUrl,
      });
    } else {
      navigator.clipboard.writeText(imageUrl);
      alert("Image URL copied to clipboard!");
    }
  }, []);

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <span>Loading designs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200, color: "red" }}>
        Error: {error}
      </div>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        No designs found
      </div>
    );
  }

  return (
    <div>
      {sortedCategories.map((category) => {
        // Split category name for fancy display (if it contains /)
        const labelParts = category.name.split("/");
        return (
          <div key={category.slug} style={{ marginBottom: 32 }}>
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
              {labelParts.map((part, idx) => (
                <span
                  key={`${category.slug}-${part}`}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <span
                    style={{
                      fontWeight: idx === 0 ? 700 : 500,
                      color:
                        idx === 0
                          ? "#222"
                          : idx === labelParts.length - 1
                          ? "#0a7cff"
                          : "#222",
                      marginRight: idx < labelParts.length - 1 ? 8 : 0,
                      marginLeft: idx > 0 ? 8 : 0,
                    }}
                  >
                    {part}
                  </span>
                  {idx < labelParts.length - 1 && (
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
              {category.images.map((image, index) => {
                // Stagger animation delay for entry
                const animationDelay = `${index * 60}ms`;
                const hue = 180 + ((index * 13) % 120); // vary hue per item
                const inlineStyle: React.CSSProperties &
                  Record<string, string> = {
                  animationDelay,
                  "--hue": String(hue),
                };
                const displayName = image.name.replace(/[-_]/g, " ").replace(/\.[^.]+$/, "");
                return (
                  <div
                    key={image.id}
                    className={`${styles["design-hover"]} ${styles["design-fadein"]}`}
                    style={inlineStyle}
                  >
                    <div className={styles["design-overlay"]} />
                    <Media
                      enlarge
                      unoptimized
                      priority={index < 10}
                      sizes="(max-width: 560px) 100vw, 50vw"
                      radius="m"
                      src={image.thumbnail}
                      alt={displayName}
                    />
                    <div className={styles["design-title"]}>
                      {displayName}
                    </div>
                    <div className={styles["design-actions"]}>
                      <button
                        type="button"
                        onClick={(e) => handleShare(e, image.url, displayName)}
                        aria-label={`Share ${displayName}`}
                      >
                        Share
                      </button>
                      <a
                        href={image.url}
                        download={image.name}
                        aria-label={`Download ${displayName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </div>
                    <button
                      className={styles["share-btn"]}
                      title={`Share ${displayName}`}
                      type="button"
                      onClick={(e) => handleShare(e, image.url, displayName)}
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
                        <title>{`Share ${displayName}`}</title>
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
