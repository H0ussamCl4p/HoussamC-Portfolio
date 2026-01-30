"use client";

import dynamic from "next/dynamic";

/**
 * Client-side wrapper for MouseFollower with SSR disabled
 * This is required because `ssr: false` is not allowed in Server Components
 */
const MouseFollower = dynamic(() => import("@/components/MouseFollower"), {
  ssr: false,
  loading: () => null,
});

export default function MouseFollowerWrapper() {
  return <MouseFollower />;
}
