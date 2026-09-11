"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link, usePathname } from "@/navigation";
import { Logo } from "@/components/ui/logo";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "next-intl";

const contact = "mailto:collaborate@enigmatic.works?subject=Automation%20inquiry";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500";

export function Header() {
  const t = useTranslations("Navigation");
  const home = useTranslations("HomeRefresh");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { key: "services", href: "/services" },
    { key: "items.useCases", href: "/product/use-cases" },
    { key: "items.about", href: "/company/about-us" },
    { key: "insights", href: "/insights" },
  ];

  if (pathname?.startsWith("/insights/articles/")) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <nav aria-label={home("menu")} className="mx-auto flex h-20 w-[calc(100%-40px)] max-w-[1200px] items-center justify-between gap-4 sm:w-[calc(100%-64px)] lg:w-[calc(100%-96px)]">
        <Link href="/" aria-label="Enigmatic Partners" className={focus}><Logo width={30} height={30} showText /></Link>
        <div className="hidden items-center gap-6 xl:gap-8 lg:flex">
          {links.map(link => <Link key={link.key} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground ${focus}`}>{t(link.key)}</Link>)}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <ModeToggle /><LanguageSwitcher />
          <a href={contact} className={`ml-3 inline-flex items-center gap-3 rounded-md bg-foreground px-4 py-2.5 text-sm text-background ${focus}`}>{home("contactNav")}<ArrowRight size={14} /></a>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className={`inline-flex size-11 items-center justify-center rounded-md border border-border lg:hidden ${focus}`} aria-label={home("menu")}><Menu size={21} /></Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
            <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto bg-background p-7 shadow-xl">
              <Dialog.Title className="mb-12 text-lg">{home("menu")}</Dialog.Title>
              <Dialog.Close aria-label={home("closeMenu")} className={`absolute right-5 top-5 flex size-11 items-center justify-center ${focus}`}><X size={22} /></Dialog.Close>
              <nav aria-label={home("menu")} className="flex flex-col gap-1">
                {links.map(link => <Dialog.Close asChild key={link.key}><Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`border-b border-border py-5 text-xl ${focus}`}>{t(link.key)}</Link></Dialog.Close>)}
              </nav>
              <div className="mt-auto pt-12">
                <Dialog.Close asChild><a href={contact} className={`flex items-center justify-between rounded-md bg-foreground p-4 text-background ${focus}`}>{home("contactNav")}<ArrowRight size={18} /></a></Dialog.Close>
                <div className="mt-6 flex items-center gap-3"><ModeToggle /><LanguageSwitcher /></div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </nav>
    </header>
  );
}
