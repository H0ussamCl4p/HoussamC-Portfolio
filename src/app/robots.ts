import type { MetadataRoute } from "next";
import { baseURL } from "@/resources";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: `${baseURL}/sitemap.xml`,
    host: baseURL,
  };
}
