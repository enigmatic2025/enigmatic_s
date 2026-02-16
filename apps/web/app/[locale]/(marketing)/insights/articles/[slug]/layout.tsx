import type { Metadata } from "next";
import { getInsightPosts } from "@/lib/insights-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getInsightPosts(locale).find((p) => p.slug === slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Enigmatic`,
      description: post.excerpt,
      type: "article",
      locale: locale.replace('-', '_'),
      publishedTime: post.date,
      authors: [post.author],
      ...(post.image && {
        images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      ...(post.image && { images: [post.image] }),
    },
  };
}

export async function generateStaticParams() {
  return getInsightPosts('en').map((post) => ({ slug: post.slug }));
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
