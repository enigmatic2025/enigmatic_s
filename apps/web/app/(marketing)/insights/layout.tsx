import type { Metadata } from "next";

const title = "Insights | Enigmatic Partners";
const description = "Thoughts on AI, automation, and the people behind business processes. What to question, where to start, and how to build with purpose.";

export const metadata: Metadata = {
  title: { absolute: title }, description,
  openGraph: { title, description, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title, description, images: ["/images/brand/brand-image.jpg"] },
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
