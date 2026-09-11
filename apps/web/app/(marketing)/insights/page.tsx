import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getInsightPosts } from "@/lib/insights-data";
import { PageHero, ContactBand, halfImageSizes, styles } from "@/components/marketing/editorial";

export default function InsightsPage() {
  const [featured, ...remaining] = getInsightPosts();
  return <div className={styles.page}>
    <PageHero title="Ideas for better work." accent="A practical perspective." description="Thoughts on AI, automation, and the people behind business processes. What to question, where to start, and how to build with purpose." />
    <section className={`${styles.wrap} ${styles.section}`} style={{ paddingTop: 0 }}>
      {featured ? <>
        <p className={styles.eyebrow}>Featured perspective</p>
        <Link href={`/insights/articles/${featured.slug}`} className={styles.feature}>
          <div className={styles.featureImage}>{featured.image && <Image src={featured.image} alt="" fill sizes={halfImageSizes} className={styles.cover} />}</div>
          <div><div className={styles.articleMeta}><span>{featured.category}</span><span>{featured.readTime}</span></div><h2>{featured.title}</h2><p className={styles.bodyCopy}>{featured.excerpt}</p><div className={styles.articleMeta} style={{ marginTop: 24 }}><span>{featured.author}</span><span>{featured.date}</span></div><span className={styles.textLink}>Read the article<ArrowRight size={17} /></span></div>
        </Link>
      </> : <p className={styles.bodyCopy}>New perspectives are on the way.</p>}
    </section>
    {remaining.length > 0 && <section className={`${styles.wrap} ${styles.section}`} style={{ paddingTop: 0 }}><div className={styles.sectionHeading}><h2>More perspectives</h2></div>{remaining.map(post => <Link href={`/insights/articles/${post.slug}`} key={post.slug} className={styles.articleRow}><span>{post.date}</span><div><div className={styles.articleMeta}><span>{post.category}</span></div><h3>{post.title}</h3></div><ArrowRight size={20} /></Link>)}</section>}
    <ContactBand />
  </div>;
}
