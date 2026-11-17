"use client";

import { useEffect } from "react";

// Reveals elements marked with data-reveal as they scroll into view.
// Nothing is hidden until this runs, so the page reads fine without JS,
// and it stays off entirely when the visitor asks for reduced motion.
export function MotionController() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    // Anything already on screen (or above it, e.g. after a #hash jump) is shown at once.
    const fold = window.innerHeight * 0.9;
    for (const el of elements) {
      if (el.getBoundingClientRect().top < fold) el.setAttribute("data-revealed", "");
      else observer.observe(el);
    }

    root.dataset.motion = "on";

    return () => {
      observer.disconnect();
      delete root.dataset.motion;
    };
  }, []);

  return null;
}
