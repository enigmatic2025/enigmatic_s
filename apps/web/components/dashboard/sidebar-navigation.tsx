"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code2,
  LayoutDashboard,
  MessageSquare,
  Blocks,
  Library,
  Workflow,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItemProps {
  href: string;
  icon: any;
  label: string;
  sidebarOpen: boolean;
  active?: boolean;
}

function NavItem({
  href,
  icon: Icon,
  label,
  sidebarOpen,
  active,
}: NavItemProps) {
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
                  active
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
        active
          ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
          : "text-muted-foreground"
      }`}
      asChild
    >
      <Link href={href}>
        <Icon className="h-4 w-4 mr-3 shrink-0" />
        <span className="text-sm">{label}</span>
      </Link>
    </Button>
  );
}

interface SidebarNavigationProps {
  sidebarOpen: boolean;
  currentOrg: any;
}

export function SidebarNavigation({ sidebarOpen, currentOrg }: SidebarNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return href.endsWith("/dashboard")
      ? pathname === href
      : pathname.includes(href);
  };

  return (
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
            sidebarOpen={sidebarOpen}
            active={isActive(`/nodal/${currentOrg?.slug}/dashboard`)}
          />
          <NavItem
            href={`/nodal/${currentOrg?.slug}/dashboard/natalie`}
            icon={MessageSquare}
            label="Natalie"
            sidebarOpen={sidebarOpen}
            active={isActive(`/nodal/${currentOrg?.slug}/dashboard/natalie`)}
          />
          <NavItem
            href={`/nodal/${currentOrg?.slug}/dashboard/action-flows`}
            icon={Workflow}
            label="Action Flows"
            sidebarOpen={sidebarOpen}
            active={isActive(`/nodal/${currentOrg?.slug}/dashboard/action-flows`)}
          />
          <NavItem
            href={`/nodal/${currentOrg?.slug}/dashboard/organization`}
            icon={Users}
            label="Organization"
            sidebarOpen={sidebarOpen}
            active={isActive(`/nodal/${currentOrg?.slug}/dashboard/organization`)}
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
            sidebarOpen={sidebarOpen}
            active={isActive(`/nodal/${currentOrg?.slug}/dashboard/flow-studio`)}
          />
          <NavItem
            href={`/nodal/${currentOrg?.slug}/dashboard/integration`}
            icon={Blocks}
            label="Integration"
            sidebarOpen={sidebarOpen}
            active={isActive(`/nodal/${currentOrg?.slug}/dashboard/integration`)}
          />
          <NavItem
            href={`/nodal/${currentOrg?.slug}/dashboard/knowledge-base`}
            icon={Library}
            label="Knowledge Base"
            sidebarOpen={sidebarOpen}
            active={isActive(`/nodal/${currentOrg?.slug}/dashboard/knowledge-base`)}
          />
        </nav>
      </div>
    </div>
  );
}
