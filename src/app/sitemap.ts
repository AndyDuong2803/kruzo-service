import type { MetadataRoute } from "next";

import { absoluteUrl, seoRoutes } from "@/lib/seo";

const routes = Object.values(seoRoutes);

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.priority,
  }));
}
