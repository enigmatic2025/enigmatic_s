"use client";
import {
  FileText,
  GlobeIcon,
  LayersIcon,
  type LucideIcon,
  Users,
  Loader2,
} from "lucide-react";
import { Link } from "@/navigation";
import React from "react";
import { createPortal } from "react-dom";
import { Logo } from "@/components/ui/logo";
import { MenuToggleIcon } from "@/components/menu-toggle-icon";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { usePathname } from "@/navigation"; 
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

type LinkItem = {
  titleKey: string;
  href: string;
  icon: LucideIcon;
  descriptionKey: string;
};

export function Header({ transparent = false }: { transparent?: boolean }) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const isArticlePage = pathname?.startsWith("/insights/articles/");
  const { user, loading } = useAuth();
  const [dashboardUrl, setDashboardUrl] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [scrollDirection, setScrollDirection] = React.useState<"up" | "down">(
    "up"
  );
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const scrolled = useScroll(10);

  const productLinks: LinkItem[] = [
    {
      titleKey: "items.nodal",
      href: "/login",
      descriptionKey: "items.nodalDesc",
      icon: GlobeIcon,
    },
    {
      titleKey: "items.docs",
      href: "#",
      descriptionKey: "items.docsDesc",
      icon: FileText,
    },
    {
      titleKey: "items.useCases",
      href: "/product/use-cases",
      descriptionKey: "items.useCasesDesc",
      icon: LayersIcon,
    },
  ];

  const companyLinks: LinkItem[] = [
    {
      titleKey: "items.about",
      href: "/company/about-us",
      descriptionKey: "items.aboutDesc",
      icon: Users,
    },
  ];

  // Get user's dashboard URL
  React.useEffect(() => {
    const getDashboardUrl = async () => {
      if (!user) {
        setDashboardUrl(null);
        return;
      }

      try {
        // Use backend API instead of direct Supabase DB access
        const res = await fetch("/api/user/memberships", {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (!res.ok) {
          setDashboardUrl("/nodal/admin");
          return;
        }

        const memberships = await res.json();

        if (memberships && memberships.length > 0 && memberships[0].organizations) {
          const org = Array.isArray(memberships[0].organizations)
            ? memberships[0].organizations[0]
            : memberships[0].organizations;

          if (org && org.slug) {
            setDashboardUrl(`/nodal/${org.slug}/dashboard`);
          }
        } else {
          setDashboardUrl("/nodal/admin");
        }
      } catch {
        setDashboardUrl("/nodal/admin");
      }
    };

    getDashboardUrl();
  }, [user]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (isArticlePage) return null;

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full border-b transition-all duration-300",
        {
          "translate-y-0": scrollDirection === "up",
          "-translate-y-full": scrollDirection === "down",
          "border-border bg-background": scrolled || !transparent,
          "bg-transparent border-transparent": !scrolled && transparent,
        }
      )}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <Link href="/" className="p-2">
            <Logo width={32} height={32} showText />
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent cursor-pointer">
                  {t("product")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-[400px] p-4">
                    {productLinks.map((item, i) => (
                      <li key={i}>
                        <Link
                          href={item.href}
                          className="block px-4 py-3 rounded-md hover:bg-accent transition-colors group"
                        >
                          <div className="font-medium text-base mb-1">
                            {t(item.titleKey)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t(item.descriptionKey)}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent cursor-pointer">
                  {t("company")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-[400px] p-4">
                    {companyLinks.map((item, i) => (
                      <li key={i}>
                        <Link
                          href={item.href}
                          className="block px-4 py-3 rounded-md hover:bg-accent transition-colors group"
                        >
                          <div className="font-medium text-base mb-1">
                            {t(item.titleKey)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t(item.descriptionKey)}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuLink asChild className="px-4">
                <Link
                  className="rounded-md p-2 text-sm hover:bg-accent"
                  href="/insights"
                >
                  {t("insights")}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {loading || (user && !dashboardUrl) ? (
            <Button variant="ghost" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("loading")}
            </Button>
          ) : user && dashboardUrl ? (
            <Button variant="ghost" asChild>
              <Link href={dashboardUrl}>{t("dashboard")}</Link>
            </Button>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/login">{t("signIn")}</Link>
            </Button>
          )}
          <Button asChild>
            <Link href="mailto:collaborate@enigmatic.works?subject=Collaboration Inquiry">
              {t("collaborate")}
            </Link>
          </Button>
          <ModeToggle />
          <LanguageSwitcher />
        </div>
        <Button
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          size="icon"
          variant="outline"
        >
          <MenuToggleIcon className="size-5" duration={300} open={open} />
        </Button>
      </nav>
      <MobileMenu
        className="flex flex-col justify-between gap-2 overflow-y-auto"
        open={open}
      >
        <NavigationMenu className="max-w-full">
          <div className="flex w-full flex-col gap-y-2">
            <span className="text-sm font-medium">{t("product")}</span>
            {productLinks.map((link) => (
              <Link
                key={link.titleKey}
                href={link.href}
                className="px-3 py-2 text-sm rounded-md hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                {t(link.titleKey)}
              </Link>
            ))}
            <span className="text-sm font-medium mt-2">{t("company")}</span>
            {companyLinks.map((link) => (
              <Link
                key={link.titleKey}
                href={link.href}
                className="px-3 py-2 text-sm rounded-md hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                {t(link.titleKey)}
              </Link>
            ))}
            <Link
              href="/insights"
              className="px-3 py-2 text-sm rounded-md hover:bg-accent mt-2"
              onClick={() => setOpen(false)}
            >
              {t("insights")}
            </Link>
          </div>
        </NavigationMenu>
        <div className="flex flex-col gap-2">
          {loading || (user && !dashboardUrl) ? (
            <Button
              className="w-full bg-transparent"
              variant="outline"
              disabled
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("loading")}
            </Button>
          ) : user && dashboardUrl ? (
            <Button className="w-full bg-transparent" variant="outline" asChild>
              <Link href={dashboardUrl} onClick={() => setOpen(false)}>
                {t("dashboard")}
              </Link>
            </Button>
          ) : (
            <Button className="w-full bg-transparent" variant="outline" asChild>
              <Link href="/login" onClick={() => setOpen(false)}>
                {t("signIn")}
              </Link>
            </Button>
          )}
          <Button className="w-full" asChild>
            <Link
              href="mailto:collaborate@enigmatic.works?subject=Collaboration Inquiry"
              onClick={() => setOpen(false)}
            >
              {t("collaborate")}
            </Link>
          </Button>
          <div className="flex justify-center gap-4">
            <ModeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </MobileMenu>
    </header>
  );
}

type MobileMenuProps = React.ComponentProps<"div"> & {
  open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/50",
        "fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y md:hidden"
      )}
      id="mobile-menu"
    >
      <div
        className={cn(
          "data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
          "size-full p-4",
          className
        )}
        data-slot={open ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
