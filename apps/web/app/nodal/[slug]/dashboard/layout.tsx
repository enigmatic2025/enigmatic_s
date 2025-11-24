"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Settings,
  Workflow,
  Menu,
  Search,
  Book,
  PanelLeftClose,
  PanelLeftOpen,
  Code2,
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentOrg, setCurrentOrg] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Fetch user's organizations
      const { data: memberships, error: memError } = await supabase
        .from("memberships")
        .select("org_id, role, organizations(id, name, slug)");

      if (memError) {
        console.error("Error fetching orgs:", memError);
        return;
      }

      if (memberships && memberships.length > 0) {
        const organizations = memberships.map((m: any) => m.organizations);
        setCurrentOrg(organizations[0]); // Default to first org
      } else {
        router.push("/onboarding");
      }
    };

    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const getPageTitle = () => {
    if (pathname.endsWith("/dashboard")) return "Dashboard";
    if (pathname.includes("/action-flows")) return "Action Flows";
    if (pathname.includes("/flow-studio")) return "Flow Studio";
    if (pathname.includes("/natalie")) return "Natalie";
    return "Dashboard";
  };

  const NavItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: any;
    label: string;
  }) => {
    // Exact match for dashboard root, includes check for others
    const isActive = href.endsWith("/dashboard")
      ? pathname === href
      : pathname.includes(href);

    if (!sidebarOpen) {
      return (
        <div className="h-8 w-full flex items-center justify-center">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 flex items-center justify-center ${
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                      : "text-muted-foreground"
                  }`}
                  asChild
                >
                  <Link href={href}>
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }

    return (
      <Button
        variant="ghost"
        className={`w-full justify-start h-8 px-2 ${
          isActive
            ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
            : "text-muted-foreground"
        }`}
        asChild
      >
        <Link href={href}>
          <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="text-sm">{label}</span>
        </Link>
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-zinc-50 dark:bg-zinc-900 border-r border-border transition-all duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? "w-64" : "w-16"}
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div
          className={`h-14 flex items-center ${
            sidebarOpen ? "justify-between px-3" : "justify-center w-full"
          }`}
        >
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
                  <img
                    src="/images/brand/nodal-logo.svg"
                    alt="Nodal"
                    className="h-6 w-6"
                  />
                </div>
                <span className="font-light tracking-widest text-lg whitespace-nowrap">
                  NODAL
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={toggleSidebar}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground flex items-center justify-center"
              onClick={toggleSidebar}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div
          className={sidebarOpen ? "p-3" : "w-full flex justify-center py-3"}
        >
          {sidebarOpen ? (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-8 bg-muted/50 border-transparent shadow-none focus:bg-background text-sm"
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex items-center justify-center"
              onClick={toggleSidebar}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <div
            className={`space-y-4 ${
              sidebarOpen ? "px-3" : "w-full flex flex-col items-center"
            }`}
          >
            {/* Workspace Group */}
            <div
              className={
                !sidebarOpen ? "w-full flex flex-col items-center" : ""
              }
            >
              {sidebarOpen && (
                <h4 className="px-2 text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  Workspace
                </h4>
              )}
              <nav
                className={`space-y-1 ${
                  !sidebarOpen ? "w-full flex flex-col items-center" : ""
                }`}
              >
                <NavItem
                  href={`/nodal/${currentOrg?.slug}/dashboard`}
                  icon={LayoutDashboard}
                  label="Overview"
                />
                <NavItem
                  href={`/nodal/${currentOrg?.slug}/dashboard/natalie`}
                  icon={MessageSquare}
                  label="Natalie"
                />
                <NavItem
                  href={`/nodal/${currentOrg?.slug}/dashboard/action-flows`}
                  icon={Workflow}
                  label="Action Flows"
                />
              </nav>
            </div>

            {/* Development Group */}
            <div
              className={
                !sidebarOpen ? "w-full flex flex-col items-center" : ""
              }
            >
              {sidebarOpen && (
                <h4 className="px-2 text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  Development
                </h4>
              )}
              <nav
                className={`space-y-1 ${
                  !sidebarOpen ? "w-full flex flex-col items-center" : ""
                }`}
              >
                <NavItem
                  href={`/nodal/${currentOrg?.slug}/dashboard/flow-studio`}
                  icon={Code2}
                  label="Flow Studio"
                />
              </nav>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 space-y-2">
          <div className={!sidebarOpen ? "flex justify-center" : ""}>
            <NavItem href="/docs" icon={Book} label="Docs" />
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        {/* Top Bar */}
        <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Page Title */}
            <h1 className="text-xl font-light tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            {/* Notification Icon */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </Button>

            {/* Settings Icon */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>

            {/* Theme Switcher */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <div className="h-6 w-[1px] bg-border/50 mx-2" />

            {/* User Card */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-500 focus:text-red-500 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
