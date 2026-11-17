"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Ferris.module.scss";

// Ferris, the Rust crab, drawn in ASCII as on the banner. It scuttles left and
// right, snaps its claws, blinks, watches the cursor, and waves when clicked.
//
// "hero" sits in the hero on smaller screens. "side" is the bigger companion
// pinned to the left edge on wide screens: it lags behind when you scroll,
// scuttles to catch up, and waves when you reach the contact section.

type Look = -1 | 0 | 1;
type Variant = "hero" | "side";

const TICK_MS = 160;
const CYCLE = 44; // ticks per loop, about 7 seconds
const STEP_PX = 3;
const MAX_LAG_PX = 120;

// One loop: rest, walk left, snap, walk back, rest. Blinks sit in the rests.
function phase(t: number) {
  if (t >= 8 && t < 16) return { walk: -1, snap: false, blink: false };
  if (t >= 16 && t < 22) return { walk: 0, snap: t % 2 === 0, blink: false };
  if (t >= 22 && t < 30) return { walk: 1, snap: false, blink: false };
  return { walk: 0, snap: false, blink: t === 5 || t === 37 };
}

function eyes(look: Look, blink: boolean) {
  const e = blink ? "-" : "o";
  if (look === -1) return ` ${e} ${e}   `;
  if (look === 1) return `   ${e} ${e} `;
  return `  ${e} ${e}  `;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Ferris({ variant = "hero" }: { variant?: Variant }) {
  const ref = useRef<HTMLButtonElement>(null);
  const scrollingRef = useRef(false);
  const [{ tick, x, stride }, setWalk] = useState({ tick: 0, x: 0, stride: false });
  const [look, setLook] = useState<Look>(0);
  const [waving, setWaving] = useState(0);
  const [lag, setLag] = useState(0);

  const wave = useCallback(() => {
    setWaving(10);
    // Also ends the wave when the loop isn't running (reduced motion).
    window.setTimeout(() => setWaving(0), TICK_MS * 11);
  }, []);

  // Main loop. Runs only while the crab is visible and motion is allowed.
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;

    // The side crab sits against the left edge, so it paces right first.
    const dir = variant === "side" ? -1 : 1;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        const scrolling = scrollingRef.current;
        setWalk((state) => {
          const next = (state.tick + 1) % CYCLE;
          if (scrolling) return { ...state, tick: next, stride: !state.stride };
          const { walk } = phase(next);
          return walk === 0
            ? { ...state, tick: next }
            : { tick: next, x: state.x + walk * dir * STEP_PX, stride: !state.stride };
        });
        setWaving((w) => Math.max(0, w - 1));
      }, TICK_MS);
    };
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };

    const observer = new IntersectionObserver(([entry]) =>
      entry?.isIntersecting ? start() : stop(),
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [variant]);

  // Eyes follow the pointer horizontally.
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        setLook(dx < -60 ? -1 : dx > 60 ? 1 : 0);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // Side crab: gets left behind when the page scrolls, then scuttles back.
  useEffect(() => {
    if (variant !== "side" || reducedMotion()) return;

    let last = window.scrollY;
    let offset = 0;
    let frame = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;

    const settle = () => {
      offset *= 0.9;
      if (Math.abs(offset) < 0.5) {
        offset = 0;
        frame = 0;
        setLag(0);
        return;
      }
      setLag(offset);
      frame = requestAnimationFrame(settle);
    };

    const onScroll = () => {
      const dy = window.scrollY - last;
      last = window.scrollY;
      offset = Math.max(-MAX_LAG_PX, Math.min(MAX_LAG_PX, offset - dy * 0.4));
      scrollingRef.current = true;
      clearTimeout(idle);
      idle = setTimeout(() => {
        scrollingRef.current = false;
      }, 220);
      if (!frame) frame = requestAnimationFrame(settle);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      clearTimeout(idle);
    };
  }, [variant]);

  // Side crab: waves hello each time the contact section comes into view.
  useEffect(() => {
    if (variant !== "side") return;
    const contact = document.getElementById("contact");
    if (!contact) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) wave();
      },
      { threshold: 0.4 },
    );
    observer.observe(contact);
    return () => observer.disconnect();
  }, [variant, wave]);

  const { snap: phaseSnap, blink } = phase(tick);
  const snap = waving > 0 ? waving % 2 === 0 : phaseSnap;
  const happy = waving > 0;

  const clawL = snap ? "\\/" : "\\)";
  const clawR = snap ? "\\/" : "(/";
  const mouth = happy ? "  '_   v   _'" : snap ? "  '_   o   _'" : "  '_   -   _'";
  const legs = stride ? "  \\ '-----' /" : "  / '-----' \\";

  return (
    <figure className={variant === "side" ? styles.side : styles.ferris}>
      <button
        ref={ref}
        type="button"
        className={styles.crab}
        style={{ transform: `translate(${x}px, ${lag}px)` }}
        onClick={wave}
        aria-label="Ferris the Rust crab. Click to make it wave."
      >
        <pre aria-hidden="true">
          {"    _~^~^~_\n"}
          <span className={styles.claw}>{clawL}</span>
          {` /${eyes(look, blink && !happy)}\\ `}
          <span className={styles.claw}>{clawR}</span>
          {`\n${mouth}\n${legs}`}
        </pre>
      </button>
      <figcaption>{happy ? "// hello, world!" : "// cargo run --release"}</figcaption>
    </figure>
  );
}
