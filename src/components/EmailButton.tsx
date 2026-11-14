"use client";

import { person } from "@/resources";

// The address is only assembled when someone clicks, so it never appears in the
// server-rendered HTML or as a mailto: href that simple scrapers pick up.
function openMail() {
  window.location.href = `mailto:${person.email.user}@${person.email.domain}`;
}

type EmailButtonProps = {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function EmailButton({ label = "Email me", className, style }: EmailButtonProps) {
  return (
    <button type="button" className={className} style={style} onClick={openMail}>
      {label}
    </button>
  );
}
