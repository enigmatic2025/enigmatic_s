import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Meet the team behind Enigmatic. We build operational orchestration tools that connect people, systems, and processes into automated flows.",
  openGraph: {
    title: "About Us | Enigmatic",
    description:
      "Meet the team behind Enigmatic. We build operational orchestration tools for modern supply chains.",
  },
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
