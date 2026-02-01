"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type React from "react";

// Cursor states for different interactions
type CursorState = "default" | "hover" | "active" | "text" | "hidden";

interface CursorStyles {
  size: number;
  background: string;
  border: string;
  mixBlendMode: string;
  opacity: number;
}

const cursorStateStyles: Record<CursorState, CursorStyles> = {
  default: {
    size: 24,
    background: "rgba(59, 130, 246, 0.3)",
    border: "2px solid rgba(59, 130, 246, 0.8)",
    mixBlendMode: "normal",
    opacity: 1,
  },
  hover: {
    size: 48,
    background: "rgba(59, 130, 246, 0.15)",
    border: "2px solid rgba(59, 130, 246, 1)",
    mixBlendMode: "normal",
    opacity: 1,
  },
  active: {
    size: 20,
    background: "rgba(59, 130, 246, 0.5)",
    border: "2px solid rgba(59, 130, 246, 1)",
    mixBlendMode: "normal",
    opacity: 1,
  },
  text: {
    size: 4,
    background: "rgba(59, 130, 246, 1)",
    border: "none",
    mixBlendMode: "difference",
    opacity: 1,
  },
  hidden: {
    size: 0,
    background: "transparent",
    border: "none",
    mixBlendMode: "normal",
    opacity: 0,
  },
};

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

/**
 * Detect if the device has touch capabilities
 */
function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  const hasTouchEvents = "ontouchstart" in window;
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  return (hasTouchEvents && hasCoarsePointer) || !canHover;
}

/**
 * Check if reduced motion is preferred
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Selectors for interactive elements that trigger hover state
 */
const HOVER_SELECTORS = [
  "a",
  "button",
  '[role="button"]',
  '[class*="Button"]',
  '[class*="Card"]',
  '[class*="skillRow"]',
  '[class*="socialBtn"]',
  '[class*="primaryCta"]',
  '[class*="secondaryCta"]',
  '[class*="expBtn"]',
  '[class*="IconButton"]',
  ".interactive",
  "[data-hover]",
].join(", ");

/**
 * Selectors for text input elements
 */
const TEXT_SELECTORS = [
  'input[type="text"]',
  'input[type="email"]',
  'input[type="password"]',
  'input[type="search"]',
  "textarea",
  '[contenteditable="true"]',
].join(", ");

const MouseFollower = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);
  const currentState = useRef<CursorState>("default");
  const targetSize = useRef(cursorStateStyles.default.size);

  const [shouldRender, setShouldRender] = useState(false);

  const updateCursorStyle = useCallback((state: CursorState) => {
    if (currentState.current === state) return;
    currentState.current = state;
    const styles = cursorStateStyles[state];
    targetSize.current = styles.size;

    if (cursorRef.current) {
      cursorRef.current.style.width = `${styles.size}px`;
      cursorRef.current.style.height = `${styles.size}px`;
      cursorRef.current.style.background = styles.background;
      cursorRef.current.style.border = styles.border;
      cursorRef.current.style.mixBlendMode = styles.mixBlendMode;
      cursorRef.current.style.opacity = String(styles.opacity);
    }
  }, []);

  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) {
      setShouldRender(false);
      return;
    }

    setShouldRender(true);

    // Add class to hide default cursor on desktop
    document.documentElement.classList.add("custom-cursor-active");

    // Initialize positions
    mouse.current.x = window.innerWidth / 2;
    mouse.current.y = window.innerHeight / 2;
    pos.current = { ...mouse.current };
    dotPos.current = { ...mouse.current };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // Check what element we're hovering
      const target = e.target as HTMLElement;
      
      if (target.closest(TEXT_SELECTORS)) {
        updateCursorStyle("text");
      } else if (target.closest(HOVER_SELECTORS)) {
        updateCursorStyle("hover");
      } else {
        updateCursorStyle("default");
      }
    };

    const handleMouseDown = () => {
      if (currentState.current !== "text") {
        updateCursorStyle("active");
      }
    };

    const handleMouseUp = () => {
      // Reset to appropriate state based on current target
      const target = document.elementFromPoint(mouse.current.x, mouse.current.y) as HTMLElement;
      if (target?.closest(HOVER_SELECTORS)) {
        updateCursorStyle("hover");
      } else {
        updateCursorStyle("default");
      }
    };

    const handleMouseLeave = () => {
      updateCursorStyle("hidden");
    };

    const handleMouseEnter = () => {
      updateCursorStyle("default");
    };

    const animate = () => {
      // Smooth follow for main cursor (slower)
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.12);
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.12);

      // Fast follow for dot (snappier)
      dotPos.current.x = lerp(dotPos.current.x, mouse.current.x, 0.35);
      dotPos.current.y = lerp(dotPos.current.y, mouse.current.y, 0.35);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${dotPos.current.x}px, ${dotPos.current.y}px) translate(-50%, -50%)`;
      }

      animFrame.current = requestAnimationFrame(animate);
    };

    const pointerMediaQuery = window.matchMedia("(pointer: coarse)");
    const motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMediaChange = () => {
      if (isTouchDevice() || prefersReducedMotion()) {
        setShouldRender(false);
        document.documentElement.classList.remove("custom-cursor-active");
        if (animFrame.current) {
          cancelAnimationFrame(animFrame.current);
          animFrame.current = null;
        }
      }
    };

    pointerMediaQuery.addEventListener("change", handleMediaChange);
    motionMediaQuery.addEventListener("change", handleMediaChange);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      pointerMediaQuery.removeEventListener("change", handleMediaChange);
      motionMediaQuery.removeEventListener("change", handleMediaChange);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [updateCursorStyle]);

  if (!shouldRender) {
    return null;
  }

  const baseCursorStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 2147483647,
    willChange: "transform, width, height, background, border, opacity",
    transition: "width 0.2s ease, height 0.2s ease, background 0.2s ease, border 0.2s ease, opacity 0.2s ease",
  };

  const dotStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 1)",
    pointerEvents: "none",
    zIndex: 2147483647,
    willChange: "transform",
  };

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        style={{
          ...baseCursorStyle,
          width: `${cursorStateStyles.default.size}px`,
          height: `${cursorStateStyles.default.size}px`,
          background: cursorStateStyles.default.background,
          border: cursorStateStyles.default.border,
        }}
        className="mouse-follower"
        aria-hidden="true"
      />
      {/* Center dot */}
      <div
        ref={cursorDotRef}
        style={dotStyle}
        className="mouse-follower-dot"
        aria-hidden="true"
      />
    </>
  );
};

export default MouseFollower;
