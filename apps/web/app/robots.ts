import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://enigmatic.works";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/nodal/", "/login", "/account/"],
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "Bytespider", "ChatGPT-User"],
        allow: ["/llms.txt", "/llms-full.txt", "/docs/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
