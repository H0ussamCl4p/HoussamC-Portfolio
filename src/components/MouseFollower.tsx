"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";

const cursorStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  background: "#0096ff",
  pointerEvents: "none",
  transform: "translate(-50%, -50%)",
  zIndex: 2147483647,
  transition: "background 0.2s",
  willChange: "transform",
};

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

/**
 * Detect if the device has touch capabilities
 * This helps save battery/performance on mobile devices
 */
function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;

  // Check for touch events
  const hasTouchEvents = "ontouchstart" in window;

  // Check for coarse pointer (finger/stylus vs mouse)
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  // Check for hover capability (touch devices typically can't hover)
  const canHover = window.matchMedia("(hover: hover)").matches;

  // Consider it a touch device if:
  // - Has touch events AND coarse pointer, OR
  // - Cannot hover (mobile/tablet)
  return (hasTouchEvents && hasCoarsePointer) || !canHover;
}

/**
 * Check if reduced motion is preferred
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const MouseFollower = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);
  const scaleRef = useRef(1);

  // Track if we should render (disabled on touch devices)
  const [shouldRender, setShouldRender] = useState(false);
  const [enabledAfterHero, setEnabledAfterHero] = useState(false);

  useEffect(() => {
    // Early exit for touch devices or reduced motion preference
    // This saves battery and improves performance on mobile
    if (isTouchDevice() || prefersReducedMotion()) {
      setShouldRender(false);
      return;
    }

    setShouldRender(true);

    const updateEnabledAfterHero = () => {
      const hero = document.getElementById("hero");
      if (!hero) {
        setEnabledAfterHero(true);
        return;
      }

      const rect = hero.getBoundingClientRect();
      const isPastHero = rect.bottom <= 0;
      setEnabledAfterHero(isPastHero);
    };

    updateEnabledAfterHero();

    // Set initial position to center of window (client only)
    mouse.current.x = window.innerWidth / 2;
    mouse.current.y = window.innerHeight / 2;
    pos.current.x = window.innerWidth / 2;
    pos.current.y = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleMouseDown = () => {
      scaleRef.current = 0.7;
      if (cursorRef.current) {
        cursorRef.current.style.transition =
          "transform 0.1s cubic-bezier(.4,2,.6,1), background 0.2s, border 0.2s";
      }
    };

    const handleMouseUp = () => {
      scaleRef.current = 1;
      if (cursorRef.current) {
        cursorRef.current.style.transition =
          "transform 0.3s cubic-bezier(.22,1,.36,1), background 0.2s, border 0.2s";
      }
    };

    const animate = () => {
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.18);
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.18);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) scale(${scaleRef.current})`;
      }
      animFrame.current = requestAnimationFrame(animate);
    };

    // Listen for changes in pointer type (e.g., tablet with mouse attached)
    const pointerMediaQuery = window.matchMedia("(pointer: coarse)");
    const motionMediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const handleMediaChange = () => {
      if (isTouchDevice() || prefersReducedMotion()) {
        setShouldRender(false);
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
    window.addEventListener("scroll", updateEnabledAfterHero, { passive: true });
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("scroll", updateEnabledAfterHero);
      pointerMediaQuery.removeEventListener("change", handleMediaChange);
      motionMediaQuery.removeEventListener("change", handleMediaChange);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  // Don't render anything on touch devices
  if (!shouldRender || !enabledAfterHero) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      style={cursorStyle}
      className="mouse-follower"
      aria-hidden="true"
    />
  );
};

export default MouseFollower;
