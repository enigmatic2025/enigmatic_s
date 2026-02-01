import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Loader2, CheckCircle2 } from "lucide-react";

interface SchemaField {
  key: string;
  type: 'text' | 'long-text' | 'number' | 'rating' | 'boolean' | 'date' | 'time' | 'datetime' | 'file' | 'multi-choice' | 'checkboxes' | 'signature';
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
}

interface HumanTaskFormProps {
  actionId: string;
  schema: SchemaField[];
  status: string;
  initialData?: Record<string, any>;
  onComplete?: () => void;
}

export function HumanTaskForm({ 
  actionId, 
  schema = [], 
  status, 
  initialData = {}, 
  onComplete 
}: HumanTaskFormProps) {
  const isCompleted = status === 'COMPLETED';
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // Basic Validation
    const missingFields = schema.filter(field => field.required && (formData[field.key] === undefined || formData[field.key] === ''));
    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.patch(`/tasks/${actionId}`, {
        status: 'COMPLETED',
        output: formData
      });
      toast.success("Task completed successfully");
      if (onComplete) onComplete();
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete task");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schema || schema.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500">
        No form fields configured for this task.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
      <div className="space-y-1 pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Task Submission</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Please provide the required information to complete this task.</p>
      </div>

      <div className="space-y-5">
        {schema.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            
            {field.description && (
              <p className="text-xs text-zinc-500 mb-1.5">{field.description}</p>
            )}

            {/* Field Rendering Logic */}
            <div className={isCompleted ? "opacity-70 pointer-events-none" : ""}>
              {(() => {
                switch (field.type) {
                  case 'text':
                    return (
                      <Input
                        value={formData[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder="Enter text..."
                        disabled={isCompleted}
                      />
                    );
                  case 'long-text':
                    return (
                      <Textarea
                        value={formData[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder="Enter detailed text..."
                        className="min-h-[100px]"
                        disabled={isCompleted}
                      />
                    );
                  case 'number':
                    return (
                      <Input
                        type="number"
                        value={formData[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder="0"
                        disabled={isCompleted}
                      />
                    );
                  case 'date':
                    return (
                      <Input
                        type="date"
                        value={formData[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        disabled={isCompleted}
                      />
                    );
                   case 'time':
                    return (
                      <Input
                        type="time"
                        value={formData[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        disabled={isCompleted}
                      />
                    );
                  case 'boolean':
                    return (
                       <div className="flex items-center gap-2">
                          <Checkbox 
                            id={`check-${field.key}`}
                            checked={!!formData[field.key]}
                            onCheckedChange={(checked) => handleChange(field.key, checked)}
                            disabled={isCompleted}
                          />
                          <Label htmlFor={`check-${field.key}`} className="font-normal cursor-pointer">Yes, confirm</Label>
                       </div>
                    );
                  case 'multi-choice': // Select One
                    return (
                       <Select 
                          value={formData[field.key] || ''} 
                          onValueChange={(val: string) => handleChange(field.key, val)}
                          disabled={isCompleted}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt, i) => (
                              <SelectItem key={i} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    );
                   case 'checkboxes': // Select Many
                    return (
                      <div className="space-y-2">
                        {field.options?.map((opt, i) => {
                           const currentVals = (formData[field.key] as string[]) || [];
                           const isChecked = currentVals.includes(opt);
                           return (
                             <div key={i} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`c-${field.key}-${i}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                      let newVals = [...currentVals];
                                      if (checked) newVals.push(opt);
                                      else newVals = newVals.filter(v => v !== opt);
                                      handleChange(field.key, newVals);
                                  }}
                                  disabled={isCompleted}
                                />
                                <Label htmlFor={`c-${field.key}-${i}`} className="font-normal cursor-pointer">{opt}</Label>
                             </div>
                           )
                        })}
                      </div>
                    );
                  case 'rating':
                     return (
                        <Select 
                          value={String(formData[field.key] || '')} 
                          onValueChange={(val: string) => handleChange(field.key, Number(val))}
                          disabled={isCompleted}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5].map(n => (
                              <SelectItem key={n} value={String(n)}>{n} Stars</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                     );
                  default:
                    return (
                      <Input
                        value={formData[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder="Enter value..."
                        disabled={isCompleted}
                      />
                    );
                }
              })()}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
        {isCompleted ? (
          <Button variant="outline" className="gap-2 bg-green-50 text-green-700 hover:bg-green-100 border-green-200 hover:border-green-300 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900" disabled>
             <CheckCircle2 className="w-4 h-4" />
             Task Completed
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Complete Task
          </Button>
        )}
      </div>
    </div>
  );
}
