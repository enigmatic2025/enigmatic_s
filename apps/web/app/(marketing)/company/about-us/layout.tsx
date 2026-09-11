import type { Metadata } from "next";

const title = "About Us | Enigmatic Partners";
const description = "We bring the people who understand the work together with the people who build the technology. One team, focused on making your business work better.";

export const metadata: Metadata = {
  title: { absolute: title }, description,
  openGraph: { title, description, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title, description, images: ["/images/brand/brand-image.jpg"] },
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
