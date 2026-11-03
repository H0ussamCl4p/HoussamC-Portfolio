import { Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";
import { notFound } from "next/navigation";
import DesignsView from "@/components/designs/DesignsView";
import { getDesigns } from "@/lib/drive-designs";
import { baseURL, designs, person, routes } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: designs.title,
    description: designs.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(designs.title)}`,
    path: designs.path,
  });
}

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth horizontal="center" paddingY="64">
      <Text onBackground="neutral-weak" align="center">
        {children}
      </Text>
    </Column>
  );
}

export default async function Designs() {
  if (!routes["/designs"]) notFound();

  const result = await getDesigns();

  return (
    <Column maxWidth="l" fillWidth gap="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={designs.title}
        description={designs.description}
        path={designs.path}
        image={`/api/og/generate?title=${encodeURIComponent(designs.title)}`}
        author={{
          name: person.name,
          url: baseURL,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Designs
        </Heading>
        <Text onBackground="neutral-weak">{designs.description}</Text>
      </Column>

      {result.status === "ok" && result.categories.length > 0 && (
        <DesignsView categories={result.categories} />
      )}
      {result.status === "ok" && result.categories.length === 0 && (
        <StatusMessage>No designs to show yet.</StatusMessage>
      )}
      {result.status === "not-configured" && (
        <StatusMessage>The design gallery isn&apos;t available right now.</StatusMessage>
      )}
      {result.status === "error" && (
        <StatusMessage>The designs couldn&apos;t be loaded. Please try again later.</StatusMessage>
      )}
    </Column>
  );
}
