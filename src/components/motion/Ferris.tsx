"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Ferris.module.scss";

// Ferris, the Rust crab, drawn in ASCII as on the banner. It scuttles left and
// right, snaps its claws, blinks, watches the cursor, and waves when clicked.

type Look = -1 | 0 | 1;

const TICK_MS = 160;
const CYCLE = 44; // ticks per loop, about 7 seconds
const STEP_PX = 3;

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

export function Ferris() {
  const ref = useRef<HTMLButtonElement>(null);
  const [{ tick, x, stride }, setWalk] = useState({ tick: 0, x: 0, stride: false });
  const [look, setLook] = useState<Look>(0);
  const [waving, setWaving] = useState(0);

  // Main loop. Runs only while the crab is on screen and motion is allowed.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        setWalk((state) => {
          const next = (state.tick + 1) % CYCLE;
          const { walk } = phase(next);
          return walk === 0
            ? { ...state, tick: next }
            : { tick: next, x: state.x + walk * STEP_PX, stride: !state.stride };
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
  }, []);

  // Eyes follow the pointer horizontally.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect();
        const centre = box.left + box.width / 2;
        const dx = event.clientX - centre;
        setLook(dx < -60 ? -1 : dx > 60 ? 1 : 0);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const { snap: phaseSnap, blink } = phase(tick);
  const snap = waving > 0 ? waving % 2 === 0 : phaseSnap;
  const happy = waving > 0;

  const clawL = snap ? "\\/" : "\\)";
  const clawR = snap ? "\\/" : "(/";
  const mouth = happy ? "  '_   v   _'" : snap ? "  '_   o   _'" : "  '_   -   _'";
  const legs = stride ? "  \\ '-----' /" : "  / '-----' \\";

  return (
    <figure className={styles.ferris}>
      <button
        ref={ref}
        type="button"
        className={styles.crab}
        style={{ transform: `translateX(${x}px)` }}
        onClick={() => {
          setWaving(10);
          // Also ends the wave when the loop isn't running (reduced motion).
          window.setTimeout(() => setWaving(0), TICK_MS * 11);
        }}
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
