import type { Metadata } from "next";

const title = "Use Cases | Enigmatic Partners";
const description = "Explore how connected workflows and custom applications can simplify the work between your people, documents, and systems.";

export const metadata: Metadata = {
  title: { absolute: title }, description,
  openGraph: { title, description, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title, description, images: ["/images/brand/brand-image.jpg"] },
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
