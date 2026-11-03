import { Heading, Text, Column } from "@once-ui-system/core";
import { EmailButton } from "@/components/EmailButton";

export const Mailchimp: React.FC<React.ComponentProps<typeof Column>> = ({
  ...flex
}) => {
  return (
    <Column
      as="section"
      id="contact"
      className="onepage-section"
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
        <Heading as="h2" variant="display-strong-xs">
          Contact Me
        </Heading>
        <Text
          wrap="balance"
          variant="body-default-l"
          onBackground="neutral-weak"
          style={{ textAlign: "center" }}
        >
          Have a question or want to work together? Email me or reach out on LinkedIn.
        </Text>
        <EmailButton style={{ marginTop: 8, borderRadius: 999 }} />
      </Column>
    </Column>
  );
};
