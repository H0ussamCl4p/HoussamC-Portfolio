"use client";

import { Button, Column, Heading, Text } from "@once-ui-system/core";

// Generic error page: no error message, digest or stack trace is shown.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Column as="section" fill center paddingBottom="160" gap="16">
      <Text variant="display-strong-xl">Oops</Text>
      <Heading variant="display-default-xs">Something went wrong</Heading>
      <Text onBackground="neutral-weak">Please try again in a moment.</Text>
      <Button onClick={reset} size="m" variant="secondary">
        Try again
      </Button>
    </Column>
  );
}
