"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { contactHref, contactLabel, navLinks, siteName } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isCurrent = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav aria-label="Main" className="wrap flex h-(--header-height) items-center justify-between gap-4">
        <Link href="/" aria-label={siteName}><Logo width={30} height={30} showText /></Link>
        <div className="hidden items-center gap-7 lg:flex xl:gap-9">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              className="text-body-sm text-muted-foreground transition-colors duration-200 hover:text-foreground aria-[current=page]:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Button asChild size="sm" className="hidden lg:inline-flex">
          <a href={contactHref}>{contactLabel}<ArrowRight size={14} /></a>
        </Button>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger aria-label="Open menu" className="inline-flex size-11 items-center justify-center rounded-sm border border-border-strong lg:hidden">
            <Menu size={20} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
            <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-surface-1 p-7">
              <Dialog.Title className="mb-12 text-eyebrow text-muted-foreground">Menu</Dialog.Title>
              <Dialog.Close aria-label="Close menu" className="absolute top-5 right-5 flex size-11 items-center justify-center"><X size={22} /></Dialog.Close>
              <nav aria-label="Main" className="flex flex-col">
                {navLinks.map(link => (
                  <Dialog.Close asChild key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isCurrent(link.href) ? "page" : undefined}
                      className="border-b border-border py-5 text-title-lg text-muted-foreground aria-[current=page]:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </Dialog.Close>
                ))}
              </nav>
              <div className="mt-auto pt-12">
                <Dialog.Close asChild>
                  <Button asChild size="lg" className="w-full justify-between">
                    <a href={contactHref}>{contactLabel}<ArrowRight size={18} /></a>
                  </Button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </nav>
    </header>
  );
}
