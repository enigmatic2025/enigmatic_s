"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"; // Assuming you have these UI components, otherwise I'll need to check or create them.
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocsSidebar } from "./sidebar";

interface MobileNavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function MobileNav({ activeSection, onNavigate }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden">
          <PanelLeft className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
            <SheetTitle className="text-left px-2">Documentation</SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <DocsSidebar activeSection={activeSection} onNavigate={handleNavigate} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
