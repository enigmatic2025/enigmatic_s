import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./editorial.module.css";

export { styles };
export const contactHref = "mailto:collaborate@enigmatic.works?subject=Automation%20inquiry";
export const wideImageSizes = "(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 64px), (max-width: 1296px) calc(100vw - 96px), 1200px";
export const halfImageSizes = "(max-width: 767px) calc(100vw - 40px), (max-width: 1296px) 45vw, 576px";

export function PageHero({ label, title, accent, description, children }: { label: string; title: string; accent: string; description: string; children?: React.ReactNode }) {
  return <section className={`${styles.wrap} ${styles.hero}`}>
    <p className={styles.eyebrow}><span />{label}</p>
    <h1>{title}<br /><span>{accent}</span></h1>
    <div className={styles.heroBottom}><p className={styles.lead}>{description}</p>{children}</div>
  </section>;
}

export function EditorialPhoto({ src, alt }: { src: string; alt: string }) {
  return <div className={`${styles.wrap} ${styles.widePhoto}`}><Image src={src} alt={alt} fill sizes={wideImageSizes} className={styles.cover} /></div>;
}

export function ContactBand() {
  const t = useTranslations("HomeRefresh");
  return <section className={styles.contact}><div className={styles.wrap}>
    <p className={styles.eyebrow}>{t("contactLabel")}</p><h2>{t("contactTitle")}</h2>
    <div className={styles.heroBottom}><p>{t("contactIntro")}</p><a href={contactHref} className={styles.primary}>{t("contact")}<ArrowRight size={17} /></a></div>
  </div></section>;
}
