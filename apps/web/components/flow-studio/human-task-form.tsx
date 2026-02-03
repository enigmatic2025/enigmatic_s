import React, { useState, useRef } from 'react';
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
import { Loader2, CheckCircle2, Star, Upload, X, FileText, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

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

// --- Helper Components ---

function StarRating({ value, onChange, disabled }: { value: number; onChange: (val: number) => void; disabled?: boolean }) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
          className={cn(
            "p-1 rounded-full transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50",
            disabled ? "cursor-default opacity-50" : "cursor-pointer"
          )}
        >
          <Star 
            className={cn(
              "w-6 h-6 transition-all",
              (hoverValue ?? value) >= star 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-muted-foreground/40"
            )} 
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground tabular-nums">
        {value ? `${value}/5` : ''}
      </span>
    </div>
  );
}

function FileUpload({ value, onChange, disabled }: { value: any; onChange: (val: any) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>(value?.name || (typeof value === 'string' ? value : ''));

  // Logic to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file); 
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName('');
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (fileName) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium truncate">{fileName}</span>
        </div>
        {!disabled && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleClear}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 transition-all hover:bg-muted/10 cursor-pointer hover:border-primary/50",
        disabled && "opacity-50 cursor-default hover:bg-transparent hover:border-dashed"
      )}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        onChange={handleFileChange}
        disabled={disabled}
      />
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-1">
        <Upload className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Click to upload or drag and drop</p>
        <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
      </div>
    </div>
  );
}

function DateTimePicker({ 
  value, 
  onChange, 
  includeTime, 
  disabled 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  includeTime?: boolean;
  disabled?: boolean;
}) {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setDate(undefined);
      onChange('');
      return;
    }

    // Preserve time if modifying date
    if (date && includeTime) {
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
    }

    setDate(newDate);
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    if (!timeStr || !date) return;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    
    setDate(newDate);
    onChange(newDate.toISOString());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            includeTime ? format(date, "PPP p") : format(date, "PPP")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 [&_button[aria-label='Close']]:hidden [&_button:has(svg.lucide-x)]:hidden" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
        {includeTime && (
          <div className="p-3 border-t border-border bg-muted/10">
             <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</Label>
                <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-muted-foreground" />
                   <Input 
                      type="time" 
                      className="h-8 flex-1 bg-background" 
                      value={date ? format(date, "HH:mm") : ""}
                      onChange={handleTimeChange}
                   />
                </div>
             </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
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

      <div className="space-y-6">
        {schema.map((field) => (
          <div key={field.key} className="space-y-3">
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
                      <DateTimePicker
                        value={formData[field.key]}
                        onChange={(val) => handleChange(field.key, val)}
                        disabled={isCompleted}
                        includeTime={false}
                      />
                    );
                  case 'datetime':
                    return (
                      <DateTimePicker
                        value={formData[field.key]}
                        onChange={(val) => handleChange(field.key, val)}
                        disabled={isCompleted}
                        includeTime={true}
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
                       <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/10">
                          <Checkbox 
                            id={`check-${field.key}`}
                            checked={!!formData[field.key]}
                            onCheckedChange={(checked) => handleChange(field.key, checked)}
                            disabled={isCompleted}
                          />
                          <Label htmlFor={`check-${field.key}`} className="font-normal cursor-pointer text-sm">Yes, confirm</Label>
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
                      <div className="space-y-2 p-3 border rounded-md">
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
                        <StarRating 
                          value={Number(formData[field.key] || 0)} 
                          onChange={(val) => handleChange(field.key, val)}
                          disabled={isCompleted}
                        />
                     );
                  case 'file':
                    return (
                      <FileUpload
                        value={formData[field.key]}
                        onChange={(val) => handleChange(field.key, val)}
                        disabled={isCompleted}
                      />
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

      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
        {isCompleted ? (
          <Button variant="outline" className="gap-2 bg-green-50 text-green-700 hover:bg-green-100 border-green-200 hover:border-green-300 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900" disabled>
             <CheckCircle2 className="w-4 h-4" />
             Task Completed
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[140px]">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Complete Task
          </Button>
        )}
      </div>
    </div>
  );
}
