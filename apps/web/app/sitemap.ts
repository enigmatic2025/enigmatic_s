import type { MetadataRoute } from "next";
import { insightPosts } from "@/lib/insights-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://enigmaticpartners.com";
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/insights", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/company/about-us", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/use-cases", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  for (const post of insightPosts) {
    entries.push({
      url: `${baseUrl}/insights/articles/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    });
  }

  return entries;
}
