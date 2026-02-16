"use client";

import React, { useState } from "react";

import { DocsSidebar } from "./sidebar";
import { MobileNav } from "@/components/docs/mobile-nav";

interface DocsLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function DocsLayout({ children, activeSection, onNavigate }: DocsLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background pt-16">
      <div className="flex-1 items-start lg:flex">
        
        {/* Mobile Header / Nav */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b w-full sticky top-14 bg-background z-20">
           <span className="font-bold">Documentation</span>
           <MobileNav activeSection={activeSection} onNavigate={onNavigate} />
        </div>

        {/* Desktop Sidebar - Fixed */}
        <aside className="hidden fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-[320px] border-r border-border shrink-0 lg:block bg-background">
          <div className="h-full overflow-y-auto py-6 pr-6 pl-8">
            <DocsSidebar activeSection={activeSection} onNavigate={onNavigate} />
          </div>
        </aside>

        {/* Main Content - Offset by Sidebar Width */}
        <main className="relative py-6 lg:pl-[320px] flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
