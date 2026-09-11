import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { contactEmail, navLinks, siteName, siteTagline } from "@/lib/site";

export function Footer() {
  return (
    <footer className="dark band-inverse border-t border-border bg-none">
      <div className="wrap py-12 lg:py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <Link href="/" className="text-title-md">{siteName}</Link>
            <p className="mt-3 max-w-xs text-body-sm text-muted-foreground">{siteTagline}</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-4 text-body-sm">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors duration-200 hover:text-foreground">{link.label}</Link>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-border pt-6 text-caption text-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-foreground">
            {contactEmail}<ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}
