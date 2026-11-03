"use client";

import { Button, IconButton } from "@once-ui-system/core";
import { person } from "@/resources";

// The address is only assembled when someone clicks, so it never appears in the
// server-rendered HTML or as a mailto: href that simple scrapers pick up.
function openMail() {
  window.location.href = `mailto:${person.email.user}@${person.email.domain}`;
}

type EmailButtonProps = {
  label?: string;
  className?: string;
  /** "button" renders a labelled button, "icon" an icon-only button */
  variant?: "button" | "icon";
  style?: React.CSSProperties;
};

export function EmailButton({ label = "Email Me", className, variant = "button", style }: EmailButtonProps) {
  if (variant === "icon") {
    return (
      <IconButton
        size="l"
        icon="email"
        variant="secondary"
        className={className}
        onClick={openMail}
        aria-label="Send me an email"
        tooltip="Email"
      />
    );
  }

  return (
    <Button prefixIcon="email" size="m" weight="default" className={className} style={style} onClick={openMail}>
      {label}
    </Button>
  );
}
