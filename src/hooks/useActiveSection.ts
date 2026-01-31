"use client";

import { useEffect, useState } from "react";

type UseActiveSectionOptions = {
  rootMargin?: string;
  threshold?: number | number[];
  defaultSectionId?: string;
};

export function useActiveSection(
  sectionIds: string[],
  options: UseActiveSectionOptions = {},
) {
  const { rootMargin = "-20% 0px -60% 0px", threshold = 0.01, defaultSectionId } =
    options;

  const [activeSectionId, setActiveSectionId] = useState<string | undefined>(
    defaultSectionId,
  );

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) {
      setActiveSectionId(defaultSectionId);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

        const top = visible[0];
        if (top?.target && top.target instanceof HTMLElement) {
          setActiveSectionId(top.target.id);
        }
      },
      { root: null, rootMargin, threshold },
    );

    for (const el of elements) observer.observe(el);

    return () => observer.disconnect();
  }, [defaultSectionId, rootMargin, sectionIds, threshold]);

  return activeSectionId;
}
