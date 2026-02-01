"use client";

import { person } from "@/resources";
import {
  Button,
  Heading,
  Text,
  Column,
} from "@once-ui-system/core";

export const Mailchimp: React.FC<React.ComponentProps<typeof Column>> = ({
  ...flex
}) => {
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
      <Column maxWidth="xs" horizontal="center" gap="16">
        <Heading variant="display-strong-xs">
          Contact Me
        </Heading>
        <Text
          wrap="balance"
          variant="body-default-l"
          onBackground="neutral-weak"
          style={{ textAlign: "center" }}
        >
          Have a question or want to work together? Feel free to reach out!
        </Text>
        <Button
          href={`mailto:${person.email}`}
          prefixIcon="email"
          size="m"
          style={{
            marginTop: 8,
            borderRadius: 999,
          }}
        >
          Email Me
        </Button>
      </Column>
    </Column>
  );
};
