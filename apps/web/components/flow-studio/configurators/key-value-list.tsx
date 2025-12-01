"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface KeyValuePair {
  id: string; // unique id for react key
  key: string;
  value: string;
}

interface KeyValueListProps {
  initialData: Record<string, string> | undefined;
  onUpdate: (data: Record<string, string>) => void;
  title: string;
}

export function KeyValueList({ initialData, onUpdate, title }: KeyValueListProps) {
  // Initialize state once from props. We assume the parent remounts this component 
  // (via key) when the selected node changes.
  const [items, setItems] = useState<KeyValuePair[]>(() => {
    if (!initialData) return [];
    return Object.entries(initialData).map(([key, value]) => ({
      id: Math.random().toString(36).substr(2, 9),
      key,
      value: String(value),
    }));
  });

  // Remove the useEffect that syncs from initialData to avoid circular updates/focus loss.

  const updateParent = (newItems: KeyValuePair[]) => {
    const obj = newItems.reduce((acc, item) => {
      if (item.key) acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);
    onUpdate(obj);
  };

  const handleChange = (id: string, field: 'key' | 'value', newValue: string) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, [field]: newValue } : item
    );
    setItems(newItems);
    updateParent(newItems);
  };

  const handleDelete = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    updateParent(newItems);
  };

  const handleAdd = (field: 'key' | 'value', value: string) => {
    const newItem = { 
      id: Math.random().toString(36).substr(2, 9), 
      key: field === 'key' ? value : "", 
      value: field === 'value' ? value : "" 
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    updateParent(newItems);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      <div className="border rounded-md overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_40px] gap-px bg-muted/20 border-b">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Key</div>
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Value</div>
          <div className="px-3 py-2"></div>
        </div>
        
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_1fr_40px] gap-px group">
              <div className="p-1">
                <Input
                  value={item.key}
                  onChange={(e) => handleChange(item.id, 'key', e.target.value)}
                  className="h-8 border-0 shadow-none focus-visible:ring-0 px-2"
                  placeholder="Key"
                />
              </div>
              <div className="p-1">
                <Input
                  value={item.value}
                  onChange={(e) => handleChange(item.id, 'value', e.target.value)}
                  className="h-8 border-0 shadow-none focus-visible:ring-0 px-2"
                  placeholder="Value"
                />
              </div>
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {/* Empty Row for adding */}
          <div className="grid grid-cols-[1fr_1fr_40px] gap-px">
            <div className="p-1">
               <Input
                  value=""
                  onChange={(e) => handleAdd('key', e.target.value)}
                  className="h-8 border-0 shadow-none focus-visible:ring-0 px-2 text-muted-foreground"
                  placeholder="Add Key"
                />
            </div>
             <div className="p-1">
               <Input
                  value=""
                  onChange={(e) => handleAdd('value', e.target.value)}
                  className="h-8 border-0 shadow-none focus-visible:ring-0 px-2 text-muted-foreground"
                  placeholder="Add Value"
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
