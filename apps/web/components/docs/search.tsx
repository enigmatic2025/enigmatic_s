"use client";

import * as React from "react";
import { Search, FileText, Hash } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Fuse from "fuse.js";
import { DocSection } from "@/data/docs/types";
import { flattenDocs, SearchRecord } from "@/lib/search";

interface DocsSearchProps {
  onNavigate: (id: string) => void;
  docs: DocSection[];
}

export function DocsSearch({ onNavigate, docs }: DocsSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const t = useTranslations("DocsSearch");

  // Create Fuse index
  const fuse = React.useMemo(() => {
    const records = flattenDocs(docs);
    return new Fuse(records, {
      keys: [
        { name: "title", weight: 2 },
        { name: "content", weight: 1 },
        { name: "sectionTitle", weight: 0.5 },
      ],
      threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
      ignoreLocation: true,
      includeMatches: true,
    });
  }, [docs]);

  // Derive results
  const results = React.useMemo(() => {
    if (!query) return [];
    return fuse.search(query).slice(0, 10).map((result) => result.item);
  }, [fuse, query]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        className={cn(
          "relative flex items-center justify-between w-full h-10 rounded-lg border border-border/40 bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 mb-6 group"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
          <span className="text-muted-foreground/70 group-hover:text-foreground transition-colors">{t("button")}</span>
        </span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput 
            placeholder={t("placeholder")} 
            value={query}
            onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>{t("noResults")}</CommandEmpty>
          
          {results.length > 0 && (
             <CommandGroup heading="Matches">
               {results.map((item) => (
                 <CommandItem
                   key={item.id}
                   value={item.id} // Unique value for cmdk
                   onSelect={() => runCommand(() => onNavigate(item.url))}
                   className="flex flex-col items-start gap-1 py-3"
                 >
                   <div className="flex items-center gap-2 w-full">
                     {item.type === 'section' ? (
                       <FileText className="h-4 w-4 text-primary shrink-0" />
                     ) : (
                       <Hash className="h-3 w-3 text-muted-foreground shrink-0" />
                     )}
                     <div className="flex flex-col overflow-hidden">
                        <span className="font-medium truncate text-foreground">
                            {item.title}
                        </span>
                        {item.type === 'block' && (
                             <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                In: {item.sectionTitle}
                             </span>
                        )}
                     </div>
                   </div>
                   
                   {item.content && (
                     <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                        {item.content}
                     </p>
                   )}
                 </CommandItem>
               ))}
             </CommandGroup>
          )}

          {!query && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type to search documentation...
              </div>
          )}

        </CommandList>
      </CommandDialog>
    </>
  );
}
