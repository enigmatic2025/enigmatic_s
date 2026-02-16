import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "End-to-end operational consulting — from process discovery and workflow design to platform implementation and automation. We help you streamline logistics operations.",
  openGraph: {
    title: "Services | Enigmatic",
    description:
      "End-to-end operational consulting — from process discovery and workflow design to platform implementation and automation.",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
