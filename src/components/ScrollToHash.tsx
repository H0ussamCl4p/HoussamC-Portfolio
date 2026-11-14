"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ScrollToHash() {
  const router = useRouter();

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run after client navigations
  useEffect(() => {
    // Get the hash from the URL
    const hash = window.location.hash;
    if (hash) {
      // Remove the '#' symbol
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [router]);

  return null;
}
