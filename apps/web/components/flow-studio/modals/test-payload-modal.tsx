"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Play } from 'lucide-react';

interface SchemaField {
  key: string;
  type: string;
  required: boolean;
}

interface TestPayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRun: (payload: any) => void;
  schema: SchemaField[];
}

export function TestPayloadModal({ isOpen, onClose, onRun, schema }: TestPayloadModalProps) {
  const [mode, setMode] = useState<'form' | 'json'>('form');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [jsonInput, setJsonInput] = useState<string>("{\n  \n}");

  // Initialize form data when schema changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (schema && schema.length > 0) {
        setMode('form');
        const initialData: Record<string, any> = {};
        schema.forEach(field => {
          // Set sensible defaults based on type
          if (field.type === 'string') initialData[field.key] = "";
          if (field.type === 'number') initialData[field.key] = 0;
          if (field.type === 'boolean') initialData[field.key] = false;
          if (field.type === 'array') initialData[field.key] = [];
          if (field.type === 'object') initialData[field.key] = {};
        });
        setFormData(initialData);
        setJsonInput(JSON.stringify(initialData, null, 2));
      } else {
        setMode('json');
        setJsonInput("{\n  \n}");
      }
    }
  }, [isOpen, schema]);

  // Sync Form -> JSON
  const handleFormChange = (key: string, value: any) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    setJsonInput(JSON.stringify(newData, null, 2));
  };

  // Sync JSON -> Form (best effort)
  const handleJsonChange = (str: string) => {
    setJsonInput(str);
    try {
      const parsed = JSON.parse(str);
      setFormData(parsed);
    } catch (e) {
      // Invalid JSON, don't sync form yet
    }
  };

  const handleRun = () => {
    if (mode === 'json') {
      try {
        const payload = JSON.parse(jsonInput);
        onRun(payload);
      } catch (e) {
        toast.error("Invalid JSON format");
        return;
      }
    } else {
      // Form mode
      onRun(formData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Test Payload</DialogTitle>
          <DialogDescription>
            This flow has an API Trigger. Provide input data to simulate a real request.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end space-x-2 py-2">
            <Label htmlFor="mode-switch" className="text-xs text-muted-foreground mr-2">Raw JSON</Label>
            <Switch 
                id="mode-switch"
                checked={mode === 'json'}
                onCheckedChange={(checked: boolean) => setMode(checked ? 'json' : 'form')}
            />
        </div>

        <div className="py-2 space-y-4 max-h-[60vh] overflow-y-auto px-1">
          {mode === 'form' && schema.length > 0 ? (
            <div className="space-y-4">
              {schema.map((field) => (
                <div key={field.key} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={field.key} className="text-right text-xs font-mono truncate" title={field.key}>
                    {field.key}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </Label>
                  
                  <div className="col-span-3">
                    {field.type === 'boolean' ? (
                        <Switch 
                            id={field.key}
                            checked={!!formData[field.key]}
                            onCheckedChange={(checked: boolean) => handleFormChange(field.key, checked)}
                        />
                    ) : field.type === 'number' ? (
                        <Input
                            id={field.key}
                            type="number"
                            value={formData[field.key] || 0}
                            onChange={(e) => handleFormChange(field.key, parseFloat(e.target.value))}
                            className="h-8"
                        />
                    ) : field.type === 'object' || field.type === 'array' ? (
                         <div className="text-xs text-muted-foreground italic border px-2 py-1.5 rounded bg-muted/20">
                            Complex type: Switch to JSON mode to edit
                         </div>
                    ) : (
                        <Input
                            id={field.key}
                            value={formData[field.key] || ''}
                            onChange={(e) => handleFormChange(field.key, e.target.value)}
                            className="h-8"
                            placeholder="String value"
                        />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
                <Textarea
                    value={jsonInput}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="font-mono text-xs min-h-[200px]"
                    placeholder='{ "key": "value" }'
                />
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleRun} className="gap-2">
            <Play className="w-3.5 h-3.5" />
            Run Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
