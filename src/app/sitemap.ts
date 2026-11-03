import type { MetadataRoute } from "next";
import { baseURL, routes as routesConfig } from "@/resources";

export default function sitemap(): MetadataRoute.Sitemap {
  const activeRoutes = Object.keys(routesConfig).filter(
    (route) => routesConfig[route as keyof typeof routesConfig],
  );

  return activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));
}
