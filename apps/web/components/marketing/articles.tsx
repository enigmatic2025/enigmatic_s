import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { getInsightPosts } from "@/lib/insights-data";
import { Media } from "@/components/ui/media";
import { Heading, Text } from "@/components/ui/typography";

type Post = ReturnType<typeof getInsightPosts>[number];

/** Small metadata row. With `accent`, the first item (the category) is violet. */
function Meta({ items, accent = true }: { items: string[]; accent?: boolean }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-caption text-muted-foreground">
      {items.map((item, i) => <span key={item} className={accent && i === 0 ? "text-brand-violet" : undefined}>{item}</span>)}
    </div>
  );
}

/** Large image + summary card for the lead article. */
export function ArticleFeature({ post }: { post: Post }) {
  return (
    <Link href={`/insights/articles/${post.slug}`} className="group grid items-center gap-8 border-t border-border pt-8 md:grid-cols-[1.15fr_1fr] lg:gap-12">
      {post.image
        ? <Media src={post.image} alt="" sizes="half" className="aspect-[4/3]" imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.02]" />
        : <div className="aspect-[4/3] rounded-md bg-surface-1" />}
      <div>
        <Meta items={[post.category, post.readTime]} />
        <Heading className="my-5 decoration-1 underline-offset-[6px] group-hover:underline">{post.title}</Heading>
        <Text>{post.excerpt}</Text>
        <div className="mt-6"><Meta items={[post.author, post.date]} accent={false} /></div>
        <span className="mt-7 inline-flex items-center gap-3 text-body-sm font-medium">
          Read the article
          <ArrowRight size={16} aria-hidden className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** Compact one-line entry for the article list. */
export function ArticleRow({ post }: { post: Post }) {
  return (
    <Link href={`/insights/articles/${post.slug}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-8 gap-y-3 border-t border-border py-7 sm:grid-cols-[150px_1fr_auto]">
      <span className="col-span-full text-caption text-subtle sm:col-span-1">{post.date}</span>
      <div>
        <Meta items={[post.category]} />
        <Heading as="h3" size="md" className="mt-1.5 decoration-1 underline-offset-[5px] group-hover:underline">{post.title}</Heading>
      </div>
      <ArrowRight size={20} aria-hidden className="text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
