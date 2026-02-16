import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Use Cases",
  description:
    "See how Nodal automates real operational workflows — driver onboarding, asset maintenance, billing claims, manufacturing coordination, and more.",
  openGraph: {
    title: "Use Cases | Enigmatic",
    description:
      "See how Nodal automates real operational workflows across logistics, manufacturing, and construction.",
  },
};

export default function UseCasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
