import type { Metadata } from "next";
import { siteName } from "@/lib/site";

const title = "Use Cases";
const description = "Examples of the workflows, data systems, and applications we build for logistics and operations teams.";

export const metadata: Metadata = {
  title, description,
  openGraph: { title: `${title} | ${siteName}`, description, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title: `${title} | ${siteName}`, description, images: ["/images/brand/brand-image.jpg"] },
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
