import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageHero, ContactBand, halfImageSizes, styles } from "@/components/marketing/editorial";

const copy = {
  team: {
    title: "Our Team",
    chris: { role: "Consulting", description: "Chris spearheads operations and strategic partnerships, focusing on scaling Enigmatic's market presence and delivering value to key industry stakeholders." },
    phi: { role: "Engineering", description: "Phi architects Enigmatic's technical foundation, leading research and development to deliver cutting-edge, robust solutions that push the boundaries of industrial technology." },
  },
  story: {
    title: "Founded by Efficiency Enthusiasts.",
    description: "We are a team of industrial operation professionals with decades of hands-on experience optimizing workflows. We combine this operational depth with serious engineering expertise to deliver strategic consulting and automation that standardizes and orchestrates business processes.",
  },
  principle: {
    description: "We believe the strongest solutions are quick to build, versatile enough to adapt, and scalable enough to grow. As technology keeps advancing and competition keeps intensifying, the key to staying ahead is creating solutions that can evolve with change while delivering value today.",
  },
  principles: {
    fit: { title: "Built around your business", description: "Bespoke, standalone solutions that fit how you operate." },
    control: { title: "Clarity at every step", description: "Documented workflows, visible exceptions, and human control." },
    scale: { title: "Room to grow", description: "Start with one process. Expand as your needs evolve." },
  } as Record<string, { title: string; description: string }>,
};

const team = [
  { name: "Chris Schmitt", role: "Consulting", description: "Chris spearheads operations and strategic partnerships, focusing on scaling Enigmatic's market presence and delivering value to key industry stakeholders.", image: "/images/company/team/chris.jpg", linkedin: "https://www.linkedin.com/in/chris-schmitt-92086442/" },
  { name: "Phi Tran", role: "Engineering", description: "Phi architects Enigmatic's technical foundation, leading research and development to deliver cutting-edge, robust solutions that push the boundaries of industrial technology.", image: "/images/company/team/phitran.jpg", linkedin: "https://www.linkedin.com/in/phi-tran-m-s/" },
];

export default function AboutUsPage() {
  const t = copy.team;
  const h = copy.principles;
  const e = copy;
  return <div className={styles.page}>
    <PageHero title="Operational experience." accent="Engineering curiosity." description="We bring the people who understand the work together with the people who build the technology. One team, focused on making your business work better." />
    <section className={`${styles.wrap} ${styles.section}`} style={{ paddingTop: 0 }}>
      <div className={styles.sectionHeading}><h2>{t.title}</h2><p>The people connecting business needs with technical possibilities.</p></div>
      <div className={styles.team}>{team.map(member => <article key={member.name}>
        <div className={styles.portrait}><Image src={member.image} alt={member.name} fill sizes={halfImageSizes} /></div>
        <div className={styles.memberHeading}><h3>{member.name}</h3><a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} — LinkedIn`}><ArrowUpRight size={20} /></a></div>
        <p className={styles.memberRole}>{member.role}</p><p className={styles.bodyCopy}>{member.description}</p>
      </article>)}</div>
    </section>
    <section className={styles.tinted}><div className={`${styles.wrap} ${styles.section} ${styles.split}`}>
      <div><p className={styles.eyebrow}>Why Enigmatic</p><h2>{e.story.title}</h2></div>
      <div><p className={styles.bodyCopy} style={{ marginTop: 0 }}>{e.story.description}</p><p className={styles.bodyCopy}>{e.principle.description}</p></div>
    </div></section>
    <section className={`${styles.wrap} ${styles.section}`}><div className={styles.sectionHeading}><h2>Practical by design.</h2></div><div className={styles.principles}>
      {(["fit","control","scale"] as const).map((key,index) => <div key={key}><p className={styles.eyebrow}>0{index+1}</p><h3>{h[key].title}</h3><p>{h[key].description}</p></div>)}
    </div></section>
    <ContactBand />
  </div>;
}
