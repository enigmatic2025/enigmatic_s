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
  // Initialize state with data + one empty row
  const [items, setItems] = useState<KeyValuePair[]>(() => {
    const initialItems = initialData 
      ? Object.entries(initialData).map(([key, value]) => ({
          id: Math.random().toString(36).substr(2, 9),
          key,
          value: String(value),
        }))
      : [];
    
    // Always append an empty row for adding new items
    return [...initialItems, {
      id: Math.random().toString(36).substr(2, 9),
      key: "",
      value: ""
    }];
  });

  const updateParent = (currentItems: KeyValuePair[]) => {
    // Filter out empty items (no key AND no value) before sending to parent
    // But keep items that have at least one field filled
    const validItems = currentItems.filter(item => item.key.trim() !== "" || item.value.trim() !== "");
    
    const obj = validItems.reduce((acc, item) => {
      if (item.key) acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);
    onUpdate(obj);
  };

  const handleChange = (id: string, field: 'key' | 'value', newValue: string) => {
    setItems(prevItems => {
      const newItems = prevItems.map(item => 
        item.id === id ? { ...item, [field]: newValue } : item
      );

      // If we modified the last item, and it's no longer empty, append a new empty item
      const lastItem = newItems[newItems.length - 1];
      if (lastItem.key !== "" || lastItem.value !== "") {
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          key: "",
          value: ""
        });
      }

      // Defer the parent update to avoid "Cannot update during render" error
      // We can't call this directly inside the setState updater if it triggers a parent setState
      setTimeout(() => updateParent(newItems), 0);
      
      return newItems;
    });
  };

  const handleDelete = (id: string) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== id);
      
      // If we deleted everything (or the last empty row somehow), ensure there's always one empty row
      if (newItems.length === 0) {
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          key: "",
          value: ""
        });
      }
      
      setTimeout(() => updateParent(newItems), 0);
      return newItems;
    });
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
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <div key={item.id} className="grid grid-cols-[1fr_1fr_40px] gap-px group">
                <div className="p-1">
                  <Input
                    value={item.key}
                    onChange={(e) => handleChange(item.id, 'key', e.target.value)}
                    className={`h-8 border-0 shadow-none focus-visible:ring-0 px-2 ${isLast ? 'text-muted-foreground' : ''}`}
                    placeholder={isLast ? "Add Key" : "Key"}
                  />
                </div>
                <div className="p-1">
                  <Input
                    value={item.value}
                    onChange={(e) => handleChange(item.id, 'value', e.target.value)}
                    className={`h-8 border-0 shadow-none focus-visible:ring-0 px-2 ${isLast ? 'text-muted-foreground' : ''}`}
                    placeholder={isLast ? "Add Value" : "Value"}
                  />
                </div>
                <div className="flex items-center justify-center">
                  {!isLast && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
