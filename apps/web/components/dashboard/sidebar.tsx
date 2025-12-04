"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Book,
  PanelLeftClose,
  PanelLeftOpen,
  Code2,
  LayoutDashboard,
  MessageSquare,
  Blocks,
  Library,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  currentOrg: any;
}

export function Sidebar({
  sidebarOpen,
  toggleSidebar,
  mobileMenuOpen,
  currentOrg,
}: SidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

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
              placeholder="Search nodes..."
              className="pl-8 h-8 bg-muted/50 border-transparent shadow-none focus:bg-background text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          {!pathname.includes("/flow-studio/design") && (
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
          )}

          {/* Development Group */}
          {!pathname.includes("/flow-studio/design") && (
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
                <NavItem
                  href={`/nodal/${currentOrg?.slug}/dashboard/integration`}
                  icon={Blocks}
                  label="Integration"
                />
                <NavItem
                  href={`/nodal/${currentOrg?.slug}/dashboard/knowledge-base`}
                  icon={Library}
                  label="Knowledge Base"
                />
              </nav>
            </div>
          )}

          {/* Designer Mode - Draggable Nodes */}
          {pathname.includes("/flow-studio/design") && sidebarOpen && (
            <div className="px-3 space-y-6">
              {(!searchQuery || "schedule".includes(searchQuery.toLowerCase())) && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Triggers
                  </h4>
                  <div className="grid gap-2">
                    <div
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow', 'schedule');
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      className="flex items-center gap-3 p-2 rounded-md border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors"
                    >
                      <div className="p-1.5 bg-blue-500/10 rounded">
                        <Workflow className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-sm font-medium">Schedule</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  Actions
                </h4>
                <div className="grid gap-2">
                  {(!searchQuery || "http request".includes(searchQuery.toLowerCase())) && (
                    <div
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow', 'action:http');
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      className="flex items-center gap-3 p-2 rounded-md border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors"
                    >
                      <div className="p-1.5 bg-orange-500/10 rounded">
                        <Blocks className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="text-sm font-medium">HTTP Request</div>
                    </div>
                  )}

                  {(!searchQuery || "parse data".includes(searchQuery.toLowerCase())) && (
                    <div
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow', 'action:parse');
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      className="flex items-center gap-3 p-2 rounded-md border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors"
                    >
                      <div className="p-1.5 bg-purple-500/10 rounded">
                        <Code2 className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="text-sm font-medium">Parse Data</div>
                    </div>
                  )}

                  {(!searchQuery || "map data".includes(searchQuery.toLowerCase())) && (
                    <div
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow', 'action:map');
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      className="flex items-center gap-3 p-2 rounded-md border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors"
                    >
                      <div className="p-1.5 bg-indigo-500/10 rounded">
                        <Workflow className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div className="text-sm font-medium">Map Data</div>
                    </div>
                  )}


                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 space-y-2">
        <div className={!sidebarOpen ? "flex justify-center" : ""}>
          <NavItem href="/docs" icon={Book} label="Docs" />
        </div>
      </div>
    </aside>
  );
}
