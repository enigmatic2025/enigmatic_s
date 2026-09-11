import type { Metadata } from "next";

const title = "Services | Enigmatic Partners";
const description = "From the first process map to a working solution, we bring consulting, AI, and engineering together to make your operations run better.";

export const metadata: Metadata = {
  title: { absolute: title }, description,
  openGraph: { title, description, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title, description, images: ["/images/brand/brand-image.jpg"] },
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
