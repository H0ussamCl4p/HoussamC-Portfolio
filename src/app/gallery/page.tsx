import { Flex, Meta, Schema } from "@once-ui-system/core";
import DesignsView from "@/components/designs/DesignsView";
import { baseURL, designs, person } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: designs.title,
    description: designs.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(designs.title)}`,
    path: designs.path,
  });
}

export default function Gallery() {
  return (
    <Flex maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={designs.title}
        description={designs.description}
        path={designs.path}
        image={`/api/og/generate?title=${encodeURIComponent(designs.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${designs.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <DesignsView />
    </Flex>
  );
}
