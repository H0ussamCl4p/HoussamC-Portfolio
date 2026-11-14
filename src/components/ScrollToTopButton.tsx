"use client";
import React, { useEffect, useState } from "react";

const buttonBase: React.CSSProperties = {
  position: "fixed",
  right: "1rem",
  bottom: "1rem",
  zIndex: 20,
  background: "var(--bg)",
  color: "var(--ink)",
  border: "1px solid var(--line-strong)",
  borderRadius: "4px",
  width: "44px",
  height: "44px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "color 0.15s, border-color 0.15s",
};

const buttonHover: React.CSSProperties = {
  color: "var(--accent-text)",
  borderColor: "var(--accent)",
};

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      style={{ ...buttonBase, ...(hovered ? buttonHover : {}) }}
      onClick={handleClick}
      aria-label="Scroll to top"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 15 12 9 18 15" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
