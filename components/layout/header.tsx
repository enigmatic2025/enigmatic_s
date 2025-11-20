"use client";
import {
  FileText,
  GlobeIcon,
  LayersIcon,
  type LucideIcon,
  Users,
} from "lucide-react";
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

type LinkItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export function Header({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [scrollDirection, setScrollDirection] = React.useState<"up" | "down">(
    "up"
  );
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const scrolled = useScroll(10);

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
          <div className="p-2">
            <Logo width={32} height={32} showText />
          </div>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent cursor-pointer">
                  Product
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-[400px] p-4">
                    {productLinks.map((item, i) => (
                      <li key={i}>
                        <a
                          href={item.href}
                          className="block px-4 py-3 rounded-md hover:bg-accent transition-colors group"
                        >
                          <div className="font-medium text-base mb-1">
                            {item.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent cursor-pointer">
                  Company
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-[400px] p-4">
                    {companyLinks.map((item, i) => (
                      <li key={i}>
                        <a
                          href={item.href}
                          className="block px-4 py-3 rounded-md hover:bg-accent transition-colors group"
                        >
                          <div className="font-medium text-base mb-1">
                            {item.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuLink asChild className="px-4">
                <a className="rounded-md p-2 text-sm hover:bg-accent" href="#">
                  Blog
                </a>
              </NavigationMenuLink>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline">Sign In</Button>
          <Button>Collaborate</Button>
          <ModeToggle />
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
            <span className="text-sm font-medium">Product</span>
            {productLinks.map((link) => (
              <a
                key={link.title}
                href={link.href}
                className="px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                {link.title}
              </a>
            ))}
            <span className="text-sm font-medium mt-2">Company</span>
            {companyLinks.map((link) => (
              <a
                key={link.title}
                href={link.href}
                className="px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                {link.title}
              </a>
            ))}
            <a
              href="#"
              className="px-3 py-2 text-sm rounded-md hover:bg-accent mt-2"
            >
              Blog
            </a>
          </div>
        </NavigationMenu>
        <div className="flex flex-col gap-2">
          <Button className="w-full bg-transparent" variant="outline">
            Sign In
          </Button>
          <Button className="w-full">Get Started</Button>
          <div className="flex justify-center">
            <ModeToggle />
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

function ListItem({
  title,
  description,
  icon: Icon,
  className,
  href,
  ...props
}: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
  return (
    <NavigationMenuLink
      className={cn("w-full flex-row gap-x-2", className)}
      {...props}
      asChild
    >
      <a href={href}>
        <div className="flex aspect-square size-12 items-center justify-center rounded-md border bg-background/40 shadow-sm">
          <Icon className="size-5 text-foreground" />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="font-medium">{title}</span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </div>
      </a>
    </NavigationMenuLink>
  );
}

const productLinks: LinkItem[] = [
  {
    title: "Nodal",
    href: "#",
    description: "Our flagship logistics platform for modern supply chains",
    icon: GlobeIcon,
  },
  {
    title: "Documentation",
    href: "#",
    description: "Comprehensive guides and API references",
    icon: FileText,
  },
  {
    title: "Use Cases",
    href: "/product/use-cases",
    description: "See how Enigmatic solves real-world problems",
    icon: LayersIcon,
  },
];

const companyLinks: LinkItem[] = [
  {
    title: "About Us",
    href: "#",
    description: "Learn about our mission and team",
    icon: Users,
  },
];
