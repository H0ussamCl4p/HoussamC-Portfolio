"use client";

import { useEffect, useMemo, useState } from "react";
import { useActiveSection } from "@/hooks/useActiveSection";
import styles from "./motion.module.scss";

type RailSection = { id: string; label: string };

// Fixed column of dots on wide screens: shows how far down the page you are
// and which section you're in. Each dot jumps to its section.
export function SectionRail({ sections }: { sections: RailSection[] }) {
  const ids = useMemo(() => ["hero", ...sections.map((section) => section.id)], [sections]);
  const active = useActiveSection(ids, { defaultSectionId: "hero" });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <nav aria-label="Page sections" className={styles.rail}>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} style={{ transform: `scaleY(${progress})` }} />
      </div>
      <ol className={styles.dots}>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={styles.dot}
              aria-current={active === section.id ? "location" : undefined}
            >
              <span className={styles.tip}>{section.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
