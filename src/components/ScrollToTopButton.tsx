"use client";
import React, { useEffect, useState } from "react";


const buttonBase: React.CSSProperties = {
  position: "fixed",
  right: "2rem",
  bottom: "2rem",
  zIndex: 2147483647,
  background: "#0096ff",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: "56px",
  height: "56px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
  cursor: "pointer",
  transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s, background 0.2s, opacity 0.2s",
  opacity: 0.85,
  outline: "none",
};

const buttonHover: React.CSSProperties = {
  transform: "scale(1.12)",
  boxShadow: "0 8px 24px rgba(0,150,255,0.25)",
  background: "#0070c9",
  opacity: 1,
};


const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      style={{ ...buttonBase, ...(hovered ? buttonHover : {}) }}
      onClick={handleClick}
      aria-label="Scroll to top"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 15 12 9 18 15" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
