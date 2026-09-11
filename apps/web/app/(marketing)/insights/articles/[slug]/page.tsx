import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { getInsightPosts } from "@/lib/insights-data";
import { Media } from "@/components/ui/media";
import { Prose } from "@/components/ui/prose";
import { Heading } from "@/components/ui/typography";
import { ContactBand } from "@/components/marketing/contact-band";

export function generateStaticParams() {
  return getInsightPosts().map(post => ({ slug: post.slug }));
}

export default async function InsightPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getInsightPosts().find(p => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <article>
        <header className="wrap pt-28 sm:pt-32 lg:pt-38">
          <Link href="/insights" className="group mb-10 inline-flex items-center gap-2.5 text-body-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
            <ArrowLeft size={16} aria-hidden className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
            All insights
          </Link>
          <div className="max-w-[900px]">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-caption text-muted-foreground">
              <span className="text-brand-violet">{post.category}</span>
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>
            <Heading as="h1" size="cta" className="mt-6">{post.title}</Heading>
            <div className="mt-8 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full border border-border-strong bg-surface-1"><User size={18} aria-hidden /></div>
              <div className="flex flex-col">
                <span className="text-body-sm font-medium">{post.author}</span>
                <span className="text-caption text-subtle">Author</span>
              </div>
            </div>
          </div>
          {post.image && <Media src={post.image} alt="" priority scrim className="mt-12 aspect-[16/9] sm:aspect-[21/9]" />}
        </header>
        <div className="wrap">
          <Prose html={post.content} className="mx-auto max-w-[720px] py-14 lg:py-20" />
        </div>
      </article>
      <ContactBand />
    </>
  );
}
