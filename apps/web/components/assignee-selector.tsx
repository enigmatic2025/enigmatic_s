"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import useSWR from "swr";

export interface Assignee {
  id: string;
  type: "user" | "team";
  name: string;
  avatar?: string;
  info?: string;
}

interface AssigneeSelectorProps {
  selected: Assignee[];
  onSelect: (assignees: Assignee[]) => void;
  orgSlug: string;
  variant?: "default" | "avatar-group";
}

export function AssigneeSelector({ selected, onSelect, orgSlug, variant = "default" }: AssigneeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  
  // 1. Resolve Org ID
  const { data: org } = useSWR(
      orgSlug ? `/api/orgs/lookup?slug=${orgSlug}` : null, 
      (url) => apiClient.get(url).then(res => res.json())
  );

  // 2. Search Assignees
  const { data: searchResults, isLoading } = useSWR(
      org?.id && open ? `/api/orgs/${org.id}/assignees?query=${query}` : null,
      (url) => apiClient.get(url).then(res => res.json()),
      { keepPreviousData: true }
  );

  const handleSelect = (assignee: Assignee) => {
    // Check if already selected
    const exists = selected.find(s => s.id === assignee.id && s.type === assignee.type);
    let newSelected;
    if (exists) {
      newSelected = selected.filter(s => !(s.id === assignee.id && s.type === assignee.type));
    } else {
      newSelected = [...selected, assignee];
    }
    onSelect(newSelected);
    // Keep open for multi-select
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "avatar-group" ? (
             <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                {selected.length > 0 && (
                    <div className="flex -space-x-2 mr-2">
                        {selected.map((s, i) => (
                             <div key={`${s.type}-${s.id}`} className="w-6 h-6 rounded-full border border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-600 dark:text-zinc-300 overflow-hidden relative" title={s.name}>
                                 {s.avatar ? (
                                    <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                                 ) : (
                                    <span>{s.name ? s.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() : '?'}</span>
                                 )}
                             </div>
                        ))}
                    </div>
                )}
                
                <div className="w-6 h-6 rounded-full border border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                    <span className="mb-0.5">+</span>
                </div>
            </div>
        ) : (
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto py-2 px-3 text-left font-normal"
            >
              {selected.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {selected.map((s) => (
                        <div key={s.id} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-xs animate-in fade-in zoom-in slide-in-from-left-2 duration-200">
                            {s.type === 'team' ? <Users className="w-3 h-3 text-zinc-500" /> : <User className="w-3 h-3 text-zinc-500" />}
                            <span className="truncate max-w-[100px]">{s.name}</span>
                        </div>
                    ))}
                </div>
              ) : (
                <span className="text-zinc-500">Assign to...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search people or teams..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{isLoading ? "Searching..." : "No results found."}</CommandEmpty>
            <CommandGroup>
                {searchResults?.map((assignee: Assignee) => {
                     const isSelected = selected.some(s => s.id === assignee.id && s.type === assignee.type);
                     return (
                      <CommandItem
                        key={`${assignee.type}-${assignee.id}`}
                        value={assignee.name}
                        onSelect={() => handleSelect(assignee)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                            {assignee.type === 'team' ? (
                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-zinc-500" />
                                </div>
                            ) : (
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={assignee.avatar} />
                                    <AvatarFallback>{assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{assignee.name}</span>
                                {assignee.info && <span className="text-xs text-zinc-500">{assignee.info}</span>}
                            </div>
                        </div>
                        {isSelected && <Check className="ml-auto h-4 w-4 opacity-100" />}
                      </CommandItem>
                     );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
