import type { Metadata } from "next";
import { getInsightPosts } from "@/lib/insights-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getInsightPosts().find((p) => p.slug === slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : ["/images/brand/brand-image.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : ["/images/brand/brand-image.jpg"],
    },
  };
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
