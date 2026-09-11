import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { getInsightPosts } from "@/lib/insights-data";
import { PageHero, ContactBand, halfImageSizes, styles } from "@/components/marketing/editorial";

export default async function InsightsPage() {
  const locale = await getLocale();
  const e = await getTranslations("Editorial");
  const [featured, ...remaining] = getInsightPosts(locale);
  return <div className={styles.page}>
    <PageHero title={e("insights.title")} accent={e("insights.accent")} description={e("insights.intro")} />
    <section className={`${styles.wrap} ${styles.section}`} style={{ paddingTop: 0 }}>
      {featured ? <>
        <p className={styles.eyebrow}>{e("insights.featured")}</p>
        <Link href={`/insights/articles/${featured.slug}`} className={styles.feature}>
          <div className={styles.featureImage}>{featured.image && <Image src={featured.image} alt="" fill sizes={halfImageSizes} className={styles.cover} />}</div>
          <div><div className={styles.articleMeta}><span>{featured.category}</span><span>{featured.readTime}</span></div><h2>{featured.title}</h2><p className={styles.bodyCopy}>{featured.excerpt}</p><div className={styles.articleMeta} style={{ marginTop: 24 }}><span>{featured.author}</span><span>{featured.date}</span></div><span className={styles.textLink}>{e("insights.read")}<ArrowRight size={17} /></span></div>
        </Link>
      </> : <p className={styles.bodyCopy}>{e("insights.empty")}</p>}
    </section>
    {remaining.length > 0 && <section className={`${styles.wrap} ${styles.section}`} style={{ paddingTop: 0 }}><div className={styles.sectionHeading}><h2>{e("insights.more")}</h2></div>{remaining.map(post => <Link href={`/insights/articles/${post.slug}`} key={post.slug} className={styles.articleRow}><span>{post.date}</span><div><div className={styles.articleMeta}><span>{post.category}</span></div><h3>{post.title}</h3></div><ArrowRight size={20} /></Link>)}</section>}
    <ContactBand />
  </div>;
}
