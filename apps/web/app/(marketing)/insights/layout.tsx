import type { Metadata } from "next";
import { siteName } from "@/lib/site";

const title = "Insights";
const description = "Perspectives on AI, automation, and the people behind business processes. What to question, where to start, and how to build with purpose.";

export const metadata: Metadata = {
  title, description,
  openGraph: { title: `${title} | ${siteName}`, description, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title: `${title} | ${siteName}`, description, images: ["/images/brand/brand-image.jpg"] },
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
