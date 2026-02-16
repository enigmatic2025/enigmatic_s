import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Thoughts on logistics, technology, and the future of supply chain management. Articles on AI adoption, operational strategy, and workflow automation.",
  openGraph: {
    title: "Insights | Enigmatic",
    description:
      "Thoughts on logistics, technology, and the future of supply chain management.",
  },
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
