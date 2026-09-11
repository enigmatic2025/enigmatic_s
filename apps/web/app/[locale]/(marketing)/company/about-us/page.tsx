import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageHero, ContactBand, halfImageSizes, styles } from "@/components/marketing/editorial";

const team = [
  { name: "Chris Schmitt", key: "chris", image: "/images/company/team/chris.jpg", linkedin: "https://www.linkedin.com/in/chris-schmitt-92086442/" },
  { name: "Phi Tran", key: "phi", image: "/images/company/team/phi.jpg", linkedin: "https://www.linkedin.com/in/phi-tran-m-s/" },
];

export default async function AboutUsPage() {
  const t = await getTranslations("AboutUs");
  const h = await getTranslations("HomeRefresh");
  const e = await getTranslations("Editorial");
  const nav = await getTranslations("Navigation");
  return <div className={styles.page}>
    <PageHero label={nav("items.about")} title={e("about.title")} accent={e("about.accent")} description={e("about.intro")} />
    <section className={`${styles.wrap} ${styles.section}`} style={{ paddingTop: 0 }}>
      <div className={styles.sectionHeading}><h2>{t("team.title")}</h2><p>{e("about.teamIntro")}</p></div>
      <div className={styles.team}>{team.map(member => <article key={member.key}>
        <div className={styles.portrait}><Image src={member.image} alt={member.name} fill sizes={halfImageSizes} /></div>
        <div className={styles.memberHeading}><h3>{member.name}</h3><a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} — LinkedIn`}><ArrowUpRight size={20} /></a></div>
        <p className={styles.memberRole}>{t(`team.${member.key}Role`)}</p><p className={styles.bodyCopy}>{t(`team.${member.key}Description`)}</p>
      </article>)}</div>
    </section>
    <section className={styles.tinted}><div className={`${styles.wrap} ${styles.section} ${styles.split}`}>
      <div><p className={styles.eyebrow}>{e("about.storyLabel")}</p><h2>{t("story.title")}</h2></div>
      <div><p className={styles.bodyCopy} style={{ marginTop: 0 }}>{t("story.description")}</p><p className={styles.bodyCopy}>{t("principle.description")}</p></div>
    </div></section>
    <section className={`${styles.wrap} ${styles.section}`}><div className={styles.sectionHeading}><h2>{e("about.principlesTitle")}</h2></div><div className={styles.principles}>
      {["fit","control","scale"].map((key,index) => <div key={key}><p className={styles.eyebrow}>0{index+1}</p><h3>{h(`principles.${key}.title`)}</h3><p>{h(`principles.${key}.description`)}</p></div>)}
    </div></section>
    <ContactBand />
  </div>;
}
