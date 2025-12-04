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
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarDraggableItem, SidebarSection } from "./sidebar-items";

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
  const [triggersOpen, setTriggersOpen] = useState(true);
  const [builtInToolsOpen, setBuiltInToolsOpen] = useState(true);
  const [connectorsOpen, setConnectorsOpen] = useState(false);
  const [humanInLoopOpen, setHumanInLoopOpen] = useState(false);

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
        ${sidebarOpen ? (pathname.includes("/flow-studio/design") ? "w-[400px]" : "w-64") : "w-16"}
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
            <Tabs defaultValue="nodes" className="w-full">
              <div className="px-3 mb-2">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="nodes">Nodes</TabsTrigger>
                  <TabsTrigger value="variables">Variables</TabsTrigger>
                  <TabsTrigger value="console">Console</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="nodes" className="mt-0">
                <div className="flex flex-col">
                  {/* Triggers Section */}
                  <SidebarSection
                    title="Triggers"
                    isOpen={triggersOpen}
                    onToggle={() => setTriggersOpen(!triggersOpen)}
                  >
                    {(!searchQuery || "schedule".includes(searchQuery.toLowerCase())) && (
                      <div className="grid grid-cols-2 gap-2">
                        <SidebarDraggableItem
                          label="Schedule"
                          icon={Workflow}
                          iconColorClass="text-blue-500"
                          bgColorClass="bg-blue-500/10"
                          dataTransferType="schedule"
                        />
                      </div>
                    )}
                  </SidebarSection>

                  {/* Built-in tools */}
                  <SidebarSection
                    title="Built-in tools"
                    isOpen={builtInToolsOpen}
                    onToggle={() => setBuiltInToolsOpen(!builtInToolsOpen)}
                  >
                    {/* Data Operation Group */}
                    {(!searchQuery || "parse data map data".includes(searchQuery.toLowerCase())) && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                          <Code2 className="h-3 w-3" /> Data Operation
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {(!searchQuery || "parse data".includes(searchQuery.toLowerCase())) && (
                            <SidebarDraggableItem
                              label="Parse Data"
                              icon={Code2}
                              iconColorClass="text-purple-500"
                              bgColorClass="bg-purple-500/10"
                              dataTransferType="action:parse"
                            />
                          )}

                          {(!searchQuery || "map data".includes(searchQuery.toLowerCase())) && (
                            <SidebarDraggableItem
                              label="Map Data"
                              icon={Workflow}
                              iconColorClass="text-indigo-500"
                              bgColorClass="bg-indigo-500/10"
                              dataTransferType="action:map"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Network Group */}
                    {(!searchQuery || "http request".includes(searchQuery.toLowerCase())) && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                          <Globe className="h-3 w-3" /> Network
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <SidebarDraggableItem
                            label="HTTP Request"
                            icon={Globe}
                            iconColorClass="text-orange-500"
                            bgColorClass="bg-orange-500/10"
                            dataTransferType="action:http"
                          />
                        </div>
                      </div>
                    )}
                  </SidebarSection>

                  {/* Connectors */}
                  <SidebarSection
                    title="Connectors"
                    isOpen={connectorsOpen}
                    onToggle={() => setConnectorsOpen(!connectorsOpen)}
                  >
                    <div className="text-xs text-muted-foreground">
                      No connectors configured.
                    </div>
                  </SidebarSection>

                  {/* Human in loop */}
                  <SidebarSection
                    title="Human in loop"
                    isOpen={humanInLoopOpen}
                    onToggle={() => setHumanInLoopOpen(!humanInLoopOpen)}
                  >
                    <div className="text-xs text-muted-foreground">
                      Approval steps coming soon.
                    </div>
                  </SidebarSection>
                </div>
              </TabsContent>

              <TabsContent value="variables" className="mt-0 p-4">
                <div className="text-sm text-muted-foreground text-center py-8">
                  Variables will appear here
                </div>
              </TabsContent>

              <TabsContent value="console" className="mt-0 p-4">
                <div className="text-sm text-muted-foreground text-center py-8">
                  Console output will appear here
                </div>
              </TabsContent>
            </Tabs>
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
