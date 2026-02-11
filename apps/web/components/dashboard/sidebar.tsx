"use client";

import { Link, usePathname } from "@/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Book,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Split,
  ListFilter,
  Repeat,
  Braces,
  Table,
  ClipboardList,
  Workflow,
  Globe,
  CornerUpLeft,
  RadioTower,
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
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarVariables } from "./sidebar-variables";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

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
  const [humanInLoopOpen, setHumanInLoopOpen] = useState(true);
  const [automationOpen, setAutomationOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations("Sidebar");
  
  // Resizable Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const isDesignMode = pathname.includes("/flow-studio/design");

  // Prevent hydration mismatch for Radix UI components (Tabs)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); 
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
        const newWidth = mouseMoveEvent.clientX; 
        if (newWidth > 300 && newWidth < 800) {
            setSidebarWidth(newWidth);
        }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    }
    return () => {
        window.removeEventListener("mousemove", resize);
        window.removeEventListener("mouseup", stopResizing);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    };
  }, [isResizing, resize, stopResizing]);

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
          <Icon className="h-4 w-4 mr-3 shrink-0" />
          <span className="text-sm">{label}</span>
        </Link>
      </Button>
    );
  };

  return (
    <aside
      ref={sidebarRef}
      style={{ 
        width: sidebarOpen && isDesignMode ? sidebarWidth : undefined,
        transition: isResizing ? 'none' : 'width 300ms ease-in-out'
      }}
      className={`
        fixed inset-y-0 left-0 z-50 bg-zinc-50 dark:bg-zinc-900 border-r border-border flex flex-col
        ${sidebarOpen ? (isDesignMode ? "" : "w-64") : "w-16"}
        ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
    >
      {/* Resizer Handle */}
      {sidebarOpen && isDesignMode && (
          <div
            className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/20 transition-colors z-[60] ${isResizing ? 'bg-primary/20' : ''}`}
            onMouseDown={startResizing}
            title="Drag to resize"
          />
      )}
      {/* Header */}
      <div
        className={`h-14 flex items-center ${
          sidebarOpen ? "justify-between px-3" : "justify-center w-full"
        }`}
      >
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-8 w-8 shrink-0 flex items-center justify-center">
                <img
                  src="/images/brand/nodal-logo.svg"
                  alt="Nodal"
                  className="h-10 w-10"
                />
              </div>
              <span className="text-lg whitespace-nowrap">
                Nodal
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
              placeholder={t("searchPlaceholder")}
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
          {/* Navigation */}
          {!pathname.includes("/flow-studio/design") && (
            <SidebarNavigation sidebarOpen={sidebarOpen} currentOrg={currentOrg} />
          )}

          {/* Designer Mode - Draggable Nodes */}
          {isMounted && pathname.includes("/flow-studio/design") && sidebarOpen && (
            <Tabs defaultValue="nodes" className="w-full">
              <div className="px-3 mb-2">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="nodes">{t("nodes")}</TabsTrigger>
                    <TabsTrigger value="variables">{t("variables")}</TabsTrigger>
                  </TabsList>
              </div>

              <TabsContent value="nodes" className="mt-0">
                <div className="flex flex-col">
                  {/* Triggers Section */}
                  <SidebarSection
                    title={t("sections.triggers")}
                    isOpen={triggersOpen}
                    onToggle={() => setTriggersOpen(!triggersOpen)}
                  >
                    {(!searchQuery || "trigger create flow".includes(searchQuery.toLowerCase())) && (
                      <div className="grid grid-cols-1 gap-2">

                        <SidebarDraggableItem
                          label={t("draggable.triggerCreateFlow")}
                          icon={Zap}
                          iconColorClass="text-emerald-500"
                          bgColorClass="bg-emerald-500/10"
                          dataTransferType="api-trigger"
                        />
                      </div>
                    )}
                  </SidebarSection>

                  {/* Human in loop */}
                  <SidebarSection
                    title={t("sections.humanInLoop")}
                    isOpen={humanInLoopOpen}
                    onToggle={() => setHumanInLoopOpen(!humanInLoopOpen)}
                  >
                    {(!searchQuery || "human task approval form".includes(searchQuery.toLowerCase())) && (
                      <div className="grid grid-cols-1 gap-2">
                        <SidebarDraggableItem
                          label={t("draggable.humanTask")}
                          icon={ClipboardList}
                          iconColorClass="text-teal-500"
                          bgColorClass="bg-teal-500/10"
                          dataTransferType="human-task"
                        />
                      </div>
                    )}
                  </SidebarSection>

                  {/* Automation */}
                  <SidebarSection
                    title={t("sections.automation")}
                    isOpen={automationOpen}
                    onToggle={() => setAutomationOpen(!automationOpen)}
                  >
                    {(!searchQuery || "wait for event automation".includes(searchQuery.toLowerCase())) && (
                      <div className="grid grid-cols-1 gap-2">
                        <SidebarDraggableItem
                          label={t("draggable.automation")}
                          icon={RadioTower}
                          iconColorClass="text-pink-500"
                          bgColorClass="bg-pink-500/10"
                          dataTransferType="automation"
                        />
                      </div>
                    )}
                  </SidebarSection>

                  {/* Built-in tools */}
                  <SidebarSection
                    title={t("sections.builtInTools")}
                    isOpen={builtInToolsOpen}
                    onToggle={() => setBuiltInToolsOpen(!builtInToolsOpen)}
                  >
                    {/* Data Operation Group */}
                    {(!searchQuery || "filter data".includes(searchQuery.toLowerCase())) && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                          <ListFilter className="h-3 w-3" /> {t("groups.dataOperation")}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          <SidebarDraggableItem
                            label={t("draggable.filterData")}
                            icon={ListFilter}
                            iconColorClass="text-purple-500"
                            bgColorClass="bg-purple-500/10"
                            dataTransferType="action:filter"
                          />
                          <SidebarDraggableItem
                            label={t("draggable.setVariable")}
                            icon={Braces}
                            iconColorClass="text-teal-500"
                            bgColorClass="bg-teal-500/10"
                            dataTransferType="variable"
                          />
                          <SidebarDraggableItem
                            label={t("draggable.mapData")}
                            icon={Table}
                            iconColorClass="text-indigo-500"
                            bgColorClass="bg-indigo-500/10"
                            dataTransferType="action:map"
                          />
                        </div>
                      </div>
                    )}

                    {/* Logic Group */}
                    {(!searchQuery || "condition if else logic switch".includes(searchQuery.toLowerCase())) && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                           {t("groups.logic")}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          <SidebarDraggableItem
                            label={t("draggable.ifElse")}
                            icon={Workflow} // Using Workflow icon or Split if available
                            iconColorClass="text-slate-500"
                            bgColorClass="bg-slate-500/10"
                            dataTransferType="condition"
                          />
                          <SidebarDraggableItem
                            label={t("draggable.loop")}
                            icon={Repeat}
                            iconColorClass="text-blue-500"
                            bgColorClass="bg-blue-500/10"
                            dataTransferType="loop"
                          />
                          <SidebarDraggableItem
                            label={t("draggable.switch")}
                            icon={Split}
                            iconColorClass="text-amber-500"
                            bgColorClass="bg-amber-500/10"
                            dataTransferType="switch"
                          />
                          <SidebarDraggableItem
                            label={t("draggable.goto")}
                            icon={CornerUpLeft} // Using Repeat or CornerUpLeft if imported
                            iconColorClass="text-fuchsia-500"
                            bgColorClass="bg-fuchsia-500/10"
                            dataTransferType="goto"
                          />
                        </div>
                      </div>
                    )}

                    {/* Network Group */}
                    {(!searchQuery || "http request".includes(searchQuery.toLowerCase())) && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                          <Globe className="h-3 w-3" /> {t("groups.network")}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          <SidebarDraggableItem
                            label={t("draggable.httpRequest")}
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
                    title={t("sections.connectors")}
                    isOpen={connectorsOpen}
                    onToggle={() => setConnectorsOpen(!connectorsOpen)}
                  >
                    <div className="text-xs text-muted-foreground">
                      {t("messages.noConnectors")}
                    </div>
                  </SidebarSection>


                </div>
              </TabsContent>

              <TabsContent value="variables" className="mt-0 p-4">
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground mb-4">
                    {t("messages.dragVariables")}
                  </div>
                  
                  {/* We need to fetch nodes from the store, but Sidebar doesn't have direct access to the store hooks inside this component structure easily if not careful.
                      However, we are in a client component so we can use the hook.
                   */}
                  <SidebarVariables searchQuery={searchQuery} />
                </div>
              </TabsContent>

              </Tabs>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 space-y-2">
        <div className={!sidebarOpen ? "flex justify-center" : ""}>
          <NavItem href="/docs" icon={Book} label={t("docs")} />
        </div>
      </div>
    </aside>
  );
}
