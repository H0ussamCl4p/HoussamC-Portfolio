"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./motion.module.scss";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/";
const DURATION_MS = 450;

// Short "decode" effect for headings: letters settle left to right, once,
// when the heading enters the viewport. Screen readers only get the real text.
export function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [output, setOutput] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION_MS);
        const settled = Math.floor(progress * text.length);
        let next = text.slice(0, settled);
        for (let i = settled; i < text.length; i++) {
          next += text[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setOutput(next);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    // Same trigger line as the section reveal, so the heading fades in already scrambling.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {output}
      </span>
      <span className={styles.visuallyHidden}>{text}</span>
    </>
  );
}
