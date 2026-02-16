import type { MetadataRoute } from "next";
import { insightPosts } from "@/lib/insights-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://enigmatic.works";
  const locales = ["en", "vi", "zh-TW"];
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/insights", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/company/about-us", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/product/use-cases", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/docs", priority: 0.9, changeFrequency: "weekly" as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  // Dynamic article pages
  for (const post of insightPosts) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/insights/articles/${post.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      });
    }
  }

  return entries;
}
