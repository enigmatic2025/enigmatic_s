"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const footerLinks = {
  product: [
    { label: "Nodal", href: "/product/login" },
    { label: "Documentation", href: "/documentation" },
    { label: "Use Cases", href: "/product/use-cases" },
  ],
  company: [
    { label: "About Us", href: "/company/about-us" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Navigation");

  const footerLinks = {
    product: [
      { label: tNav("items.nodal"), href: "/product/login" },
      { label: tNav("items.docs"), href: "/documentation" },
      { label: tNav("items.useCases"), href: "/product/use-cases" },
    ],
    company: [
      { label: tNav("items.about"), href: "/company/about-us" },
    ],
    legal: [
      { label: tNav("items.privacy"), href: "/privacy" },
      { label: tNav("items.terms"), href: "/terms" },
    ],
  };

  return (
    <footer className="bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/images/brand/enigmatic-logo.png"
                  alt="Enigmatic Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-medium tracking-tight">
                Enigmatic
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Product */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-medium text-foreground">{tNav("product")}</h4>
              <ul className="flex flex-col gap-3">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-medium text-foreground">{tNav("company")}</h4>
              <ul className="flex flex-col gap-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-medium text-foreground">{t("legal")}</h4>
              <ul className="flex flex-col gap-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-6">
            {/* Social Links could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
