import type { Metadata } from "next";
import { siteName } from "@/lib/site";

const title = "About Us";
const description = "Operations experience and AI engineering in one team. Meet the people behind Enigmatic Partners.";

export const metadata: Metadata = {
  title, description,
  openGraph: { title: `${title} | ${siteName}`, description, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title: `${title} | ${siteName}`, description, images: ["/images/brand/brand-image.jpg"] },
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
