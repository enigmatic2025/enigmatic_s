"use client";

import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Navigation");
  const home = useTranslations("HomeRefresh");
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500";

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-[calc(100%-40px)] max-w-[1200px] py-12 sm:w-[calc(100%-64px)] lg:w-[calc(100%-96px)]">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div><Link href="/" className={`text-xl tracking-tight ${focus}`}>Enigmatic Partners</Link><p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{home("footerTagline")}</p></div>
          <nav aria-label={home("menu")} className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
            {[{key:"services",href:"/services"},{key:"items.useCases",href:"/product/use-cases"},{key:"items.about",href:"/company/about-us"},{key:"insights",href:"/insights"}].map(link => <Link key={link.key} href={link.href} className={`text-muted-foreground hover:text-foreground ${focus}`}>{nav(link.key)}</Link>)}
          </nav>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <a className={`inline-flex items-center gap-2 ${focus}`} href="mailto:collaborate@enigmatic.works">collaborate@enigmatic.works<ArrowUpRight size={13} /></a>
        </div>
      </div>
    </footer>
  );
}
