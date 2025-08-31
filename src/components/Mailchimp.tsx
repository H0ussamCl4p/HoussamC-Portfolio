"use client";

import { mailchimp } from "@/resources";
import {
  Button,
  Heading,
  Input,
  Text,
  Background,
  Column,
  Row,
} from "@once-ui-system/core";
import type { opacity, SpacingToken } from "@once-ui-system/core";
import { useState } from "react";

export const Mailchimp: React.FC<React.ComponentProps<typeof Column>> = ({
  ...flex
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const maxMessageChars = 1200;

  const validateEmail = (value: string) => {
    if (!value) return false;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value);
  };

  const canSend =
    validateEmail(email) &&
    subject.trim().length > 0 &&
    message.trim().length >= 8 &&
    !sending;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSend) {
      if (!validateEmail(email)) setError("Please enter a valid email.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      setSending(false);
      if (res.ok) {
        // success: clear form
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        return;
      }
      // fallback to mailto if server can't send
    } catch (err) {
      setSending(false);
      // ignore, fallback to mailto
    }

    // Fallback mailto to portfolio owner
    const fallbackSubject = encodeURIComponent(
      subject || "Contact from website"
    );
    const fallbackBody = encodeURIComponent(
      `Name: ${name}\nReply-to: ${email}\n\n${message}`
    );
    window.location.href = `mailto:choubikhoussam@gmail.com?subject=${fallbackSubject}&body=${fallbackBody}`;
  };

  return (
    <Column
      overflow="hidden"
      fillWidth
      padding="xl"
      radius="l"
      marginBottom="m"
      horizontal="center"
      align="center"
      background="surface"
      border="neutral-alpha-weak"
      {...flex}
    >
      <Background
        top="0"
        position="absolute"
        mask={{
          x: mailchimp.effects.mask.x,
          y: mailchimp.effects.mask.y,
          radius: mailchimp.effects.mask.radius,
          cursor: mailchimp.effects.mask.cursor,
        }}
        gradient={{
          display: mailchimp.effects.gradient.display,
          opacity: mailchimp.effects.gradient.opacity as opacity,
          x: mailchimp.effects.gradient.x,
          y: mailchimp.effects.gradient.y,
          width: mailchimp.effects.gradient.width,
          height: mailchimp.effects.gradient.height,
          tilt: mailchimp.effects.gradient.tilt,
          colorStart: mailchimp.effects.gradient.colorStart,
          colorEnd: mailchimp.effects.gradient.colorEnd,
        }}
        dots={{
          display: mailchimp.effects.dots.display,
          opacity: mailchimp.effects.dots.opacity as opacity,
          size: mailchimp.effects.dots.size as SpacingToken,
          color: mailchimp.effects.dots.color,
        }}
        grid={{
          display: mailchimp.effects.grid.display,
          opacity: mailchimp.effects.grid.opacity as opacity,
          color: mailchimp.effects.grid.color,
          width: mailchimp.effects.grid.width,
          height: mailchimp.effects.grid.height,
        }}
        lines={{
          display: mailchimp.effects.lines.display,
          opacity: mailchimp.effects.lines.opacity as opacity,
          size: mailchimp.effects.lines.size as SpacingToken,
          thickness: mailchimp.effects.lines.thickness,
          angle: mailchimp.effects.lines.angle,
          color: mailchimp.effects.lines.color,
        }}
      />

      <Column maxWidth="xs" horizontal="center">
        <Heading marginBottom="s" variant="display-strong-xs">
          Send me a message
        </Heading>
        <Text
          wrap="balance"
          marginBottom="l"
          variant="body-default-l"
          onBackground="neutral-weak"
        >
          I'll get back to you within 24 hours
        </Text>
      </Column>

      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
        aria-label="Contact form"
      >
        <Column
          maxWidth={36}
          fillWidth
          style={{
            width: "100%",
            maxWidth: 520,
            padding: 18,
            boxSizing: "border-box",
          }}
        >
          <Row
            s={{ direction: "row", wrap: "nowrap" }}
            gap="12"
            style={{ width: "100%" }}
          >
            <Column style={{ flex: 1 }}>
              <Text
                variant="body-strong-s"
                onBackground="neutral-weak"
                style={{ marginBottom: 8 }}
              >
                Name *
              </Text>
              <Input
                id="contact-name"
                name="NAME"
                type="text"
                placeholder="Your full name"
                aria-label="Your full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ borderRadius: 10 }}
              />
            </Column>

            <Column style={{ flex: 1 }}>
              <Text
                variant="body-strong-s"
                onBackground="neutral-weak"
                style={{ marginBottom: 8 }}
              >
                Email *
              </Text>
              <Input
                id="contact-email"
                name="EMAIL"
                type="email"
                placeholder="your.email@example.com"
                aria-label="Your email address"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                errorMessage={error}
                style={{ borderRadius: 10 }}
              />
            </Column>
          </Row>

          <Column style={{ width: "100%", marginTop: 12 }}>
            <Text
              variant="body-strong-s"
              onBackground="neutral-weak"
              style={{ marginBottom: 8 }}
            >
              Subject *
            </Text>
            <Input
              id="contact-subject"
              name="SUBJECT"
              type="text"
              placeholder="What's this about?"
              aria-label="Subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ borderRadius: 10 }}
            />
          </Column>

          <Column style={{ width: "100%", marginTop: 12 }}>
            <Text
              variant="body-strong-s"
              onBackground="neutral-weak"
              style={{ marginBottom: 8 }}
            >
              Message *
            </Text>
            <textarea
              id="contact-message"
              aria-label="Message"
              placeholder="Tell me about your project or just say hello..."
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={maxMessageChars}
              style={{
                width: "100%",
                minHeight: 140,
                borderRadius: 10,
                padding: 14,
                border: "1px solid rgba(0,0,0,0.08)",
                resize: "vertical",
                fontSize: 14,
                lineHeight: "20px",
                background: "white",
              }}
            />
          </Column>

          <div style={{ marginTop: 18 }}>
            <Button
              type="submit"
              size="m"
              fillWidth
              disabled={!canSend}
              style={{
                height: 52,
                borderRadius: 999,
                background: canSend ? "#4aa3ff" : "#cfe6ff",
                color: "white",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                boxShadow: canSend
                  ? "0 10px 30px rgba(74,163,255,0.16)"
                  : "none",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden="false"
              >
                <title>Send message</title>
                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="white" />
              </svg>
              Send Message
            </Button>
          </div>
        </Column>
      </form>
    </Column>
  );
};
