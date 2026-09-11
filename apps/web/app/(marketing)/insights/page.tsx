import { getInsightPosts } from "@/lib/insights-data";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/typography";
import { ArticleFeature, ArticleRow } from "@/components/marketing/articles";
import { ContactBand } from "@/components/marketing/contact-band";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeader } from "@/components/marketing/section-header";

export default function InsightsPage() {
  const [featured, ...remaining] = getInsightPosts();
  return (
    <>
      <PageHero
        title="Ideas for better work."
        accent="A practical perspective."
        description="Thoughts on automation, AI, and the people behind business processes. What to question, where to start, and how to build with purpose."
      />
      <Section className="pt-0 sm:pt-0 lg:pt-0" aria-label="Featured perspective">
        {featured
          ? <ArticleFeature post={featured} />
          : <Text>New perspectives are on the way.</Text>}
      </Section>
      {remaining.length > 0 && (
        <Section className="pt-0 sm:pt-0 lg:pt-0" aria-labelledby="more-title">
          <SectionHeader id="more-title" title="More perspectives" />
          {remaining.map(post => <ArticleRow key={post.slug} post={post} />)}
        </Section>
      )}
      <ContactBand />
    </>
  );
}
