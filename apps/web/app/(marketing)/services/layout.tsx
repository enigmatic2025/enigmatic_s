import type { Metadata } from "next";
import { siteName } from "@/lib/site";

const title = "Services";
const description = "AI strategy, intelligent automation, applied AI and machine learning, and managed services — one partner from the first assessment to results that last.";

export const metadata: Metadata = {
  title, description,
  openGraph: { title: `${title} | ${siteName}`, description, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title: `${title} | ${siteName}`, description, images: ["/images/brand/brand-image.jpg"] },
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
