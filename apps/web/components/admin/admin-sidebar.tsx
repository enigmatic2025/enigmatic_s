'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { 
  LayoutGrid, 
  Users, 
  Building2, 
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AdminSidebarProps {
    sidebarOpen: boolean
    toggleSidebar: () => void
}

function NavItem({ href, icon: Icon, label, sidebarOpen, active }: {
    href: string
    icon: any
    label: string
    sidebarOpen: boolean
    active: boolean
}) {
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
        )
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
    )
}

export function AdminSidebar({ sidebarOpen, toggleSidebar }: AdminSidebarProps) {
    const pathname = usePathname()
    const params = useParams()
    const locale = (params?.locale as string) || 'en'
    const base = `/${locale}/nodal/admin`

    const isActive = (href: string) => {
        return href === base
            ? pathname === href
            : pathname?.startsWith(href)
    }

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 bg-zinc-50 dark:bg-zinc-900 border-r border-border flex flex-col transition-all duration-300 ${
                sidebarOpen ? "w-64" : "w-16"
            }`}
        >
            {/* Header */}
            <div className={`h-14 flex items-center ${sidebarOpen ? "justify-between px-3" : "justify-center w-full"}`}>
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
            <div className={sidebarOpen ? "p-3" : "w-full flex justify-center py-3"}>
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
            <div className={`flex-1 py-2 space-y-4 ${sidebarOpen ? "px-3" : "w-full flex flex-col items-center"}`}>
                {/* Platform Group */}
                <div className={!sidebarOpen ? "w-full flex flex-col items-center" : ""}>
                    {sidebarOpen && (
                        <h4 className="px-2 text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                            Platform
                        </h4>
                    )}
                    <nav className={`space-y-1 ${!sidebarOpen ? "w-full flex flex-col items-center" : ""}`}>
                        <NavItem 
                            href={base} 
                            icon={LayoutGrid} 
                            label="Overview" 
                            sidebarOpen={sidebarOpen} 
                            active={isActive(base) && !pathname?.includes('/organizations') && !pathname?.includes('/users') && !pathname?.includes('/ai')} 
                        />
                        <NavItem 
                            href={`${base}/organizations`} 
                            icon={Building2} 
                            label="Organizations" 
                            sidebarOpen={sidebarOpen} 
                            active={isActive(`${base}/organizations`)} 
                        />
                        <NavItem 
                            href={`${base}/users`} 
                            icon={Users} 
                            label="Users" 
                            sidebarOpen={sidebarOpen} 
                            active={isActive(`${base}/users`)} 
                        />
                    </nav>
                </div>

                {/* Intelligence Group */}
                <div className={!sidebarOpen ? "w-full flex flex-col items-center" : ""}>
                    {sidebarOpen && (
                        <h4 className="px-2 text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                            Intelligence
                        </h4>
                    )}
                    <nav className={`space-y-1 ${!sidebarOpen ? "w-full flex flex-col items-center" : ""}`}>
                        <NavItem 
                            href={`${base}/ai`} 
                            icon={Bot} 
                            label="AI Configuration" 
                            sidebarOpen={sidebarOpen} 
                            active={isActive(`${base}/ai`)} 
                        />
                    </nav>
                </div>
            </div>
        </aside>
    )
}
