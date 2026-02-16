import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn how to build automated flows with Nodal. Guides on triggers, human tasks, data operations, expressions, and AI agent integration via MCP.",
  openGraph: {
    title: "Documentation | Enigmatic",
    description:
      "Learn how to build automated flows with Nodal — triggers, human tasks, data operations, and MCP agent integration.",
  },
};

export default function DocsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
