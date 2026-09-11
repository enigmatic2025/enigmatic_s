"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Use Cases", href: "/product/use-cases" },
  { label: "About Us", href: "/company/about-us" },
  { label: "Insights", href: "/insights" },
];

export function Footer() {
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500";

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-[calc(100%-40px)] max-w-[1200px] py-12 sm:w-[calc(100%-64px)] lg:w-[calc(100%-96px)]">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div><Link href="/" className={`text-xl tracking-tight ${focus}`}>Enigmatic Partners</Link><p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">AI and automation, built around your business.</p></div>
          <nav aria-label="Menu" className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
            {navLinks.map(link => <Link key={link.href} href={link.href} className={`text-muted-foreground hover:text-foreground ${focus}`}>{link.label}</Link>)}
          </nav>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Enigmatic Technologies. All rights reserved.</p>
          <a className={`inline-flex items-center gap-2 ${focus}`} href="mailto:collaborate@enigmatic.works">collaborate@enigmatic.works<ArrowUpRight size={13} /></a>
        </div>
      </div>
    </footer>
  );
}
